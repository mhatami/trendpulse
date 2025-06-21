import pandas_market_calendars as mcal
from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo

# Maps suffix to market calendar
MARKET_MAPPING = {
    '.TO': 'TSX',
    '.V': 'TSXV',
    '.CN': 'CSE',
    '.N': 'NYSE',
    '.O': 'NASDAQ',
}

# Default to NYSE if not matched
def get_market_from_symbol(symbol: str) -> str:
    symbol_upper = symbol.upper()
    for suffix, market in MARKET_MAPPING.items():
        if symbol_upper.endswith(suffix):
            return market
    return 'NYSE'

def get_trading_calendar(market: str):
    try:
        return mcal.get_calendar(market)
    except Exception:
        raise ValueError(f"Unsupported market: {market}")

def get_latest_market_close_date(symbol: str) -> datetime.date:
    market = get_market_from_symbol(symbol)
    cal = get_trading_calendar(market)

    eastern = ZoneInfo("America/New_York") if market in ["NYSE", "NASDAQ"] else ZoneInfo("America/Toronto")
    now = datetime.now(tz=eastern)

    # Search the past 10 calendar days for the last valid market close
    schedule = cal.schedule(start_date=now.date() - timedelta(days=10), end_date=now.date())
    for date in reversed(schedule.index):
        close_dt = schedule.loc[date]['market_close'].tz_convert(eastern)
        if close_dt <= now:
            return date

    raise RuntimeError(f"Could not determine last market close date for market: {market}")

def get_market_hours_for_date(symbol: str, date: datetime.date):
    market = get_market_from_symbol(symbol)
    cal = get_trading_calendar(market)
    schedule = cal.schedule(start_date=date, end_date=date)
    if schedule.empty:
        raise ValueError(f"{date} is not a trading day for {market}")
    start = schedule.iloc[0]['market_open'].tz_convert("UTC")
    end = schedule.iloc[0]['market_close'].tz_convert("UTC")
    return start, end

def get_hourly_range_for_last_open_day(symbol: str):
    date = get_latest_market_close_date(symbol)
    return get_market_hours_for_date(symbol, date)

from datetime import datetime, timedelta

def get_daily_range_for_period(symbol: str, period: str):
    """
    Returns UTC start and end datetimes covering the requested period ending at the latest market close date.
    Supported periods: "5d", "1mo", "3mo", "6mo", "1y", "2y" (internal), "5y", "ytd", "max"
    """
    market = get_market_from_symbol(symbol)
    cal = get_trading_calendar(market)
    latest_close_date = get_latest_market_close_date(symbol)

    if period == "5d":
        approx_start_date = latest_close_date - timedelta(days=7)  # buffer for trading days
    elif period == "1mo":
        approx_start_date = latest_close_date - timedelta(days=30)
    elif period == "3mo":
        approx_start_date = latest_close_date - timedelta(days=90)
    elif period == "6mo":
        approx_start_date = latest_close_date - timedelta(days=182)
    elif period == "1y":
        approx_start_date = latest_close_date - timedelta(days=365)
    elif period == "2y":
        approx_start_date = latest_close_date - timedelta(days=730)
    elif period == "5y":
        approx_start_date = latest_close_date - timedelta(days=5 * 365)
    elif period == "ytd":
        approx_start_date = latest_close_date.replace(month=1, day=1)
    elif period == "max":
        approx_start_date = datetime(2000, 1, 1)
    else:
        raise ValueError(f"Unsupported period: {period}")

    # Fetch schedule for all periods (including "max")
    schedule = cal.schedule(start_date=approx_start_date, end_date=latest_close_date)

    if schedule.empty:
        raise ValueError(f"No trading days found in period {period} for market {market}")

    actual_start_date = schedule.index[0]
    start_utc = schedule.loc[actual_start_date]['market_open'].tz_convert("UTC")
    end_utc = schedule.loc[latest_close_date]['market_close'].tz_convert("UTC")

    return start_utc, end_utc

