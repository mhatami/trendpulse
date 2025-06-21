import httpx
import pandas as pd
from utils.market_utils import (
    get_market_from_symbol,
    get_daily_range_for_period,
    get_hourly_range_for_last_open_day,
)
from providers.questrade_auth import get_access_token, get_symbol_id


async def fetch_stock_prices(symbol: str, period: str):
    access_token, api_server = await get_access_token()
    headers = {"Authorization": f"Bearer {access_token}"}

    market = get_market_from_symbol(symbol)

    # Determine interval and time range
    if period == "1d":
        start_time, end_time = get_hourly_range_for_last_open_day(market)
        interval = "OneMinute"

    elif period == "5d":
        start_time, end_time = get_daily_range_for_period(market, "5d")
        interval = "OneHour"

    elif period in ["1mo", "3mo", "6mo", "1y", "ytd"]:
        start_time, end_time = get_daily_range_for_period(market, period)
        interval = "OneDay"

    elif period == "5y":
        start_time, end_time = get_daily_range_for_period(market, "5y")
        interval = "OneWeek"

    elif period == "max":
        start_time, end_time = get_daily_range_for_period(market, "max")
        interval = "OneMonth"

    else:
        raise ValueError(f"Unsupported period: {period}")

    symbol_id = await get_symbol_id(symbol, api_server, headers)

    url = f"{api_server}v1/markets/candles/{symbol_id}"
    params = {
        "startTime": start_time.isoformat(),
        "endTime": end_time.isoformat(),
        "interval": interval,
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers, params=params)
    response.raise_for_status()
    candle_data = response.json()

    if "candles" not in candle_data or not candle_data["candles"]:
        raise ValueError(f"No data found for {symbol} between {start_time} and {end_time}")

    results = []
    for candle in candle_data["candles"]:
        results.append({
            "Date": candle["start"],
            "Open": candle["open"],
            "High": candle["high"],
            "Low": candle["low"],
            "Close": candle["close"],
            "Volume": candle["volume"],
        })

    df = pd.DataFrame(results)
    return df

async def fetch_stock_details(symbol: str) -> dict:
    access_token, api_server = await get_access_token()
    headers = {'Authorization': f'Bearer {access_token}'}
    
    try:
        symbol_id = await get_symbol_id(symbol, api_server, headers)
    except Exception as e:
        raise ValueError(f"Failed to fetch symbol ID for {symbol}: {e}")

    async with httpx.AsyncClient() as client:
        # Fetch details
        details_resp = await client.get(f"{api_server}v1/symbols/{symbol_id}", headers=headers)
        details_resp.raise_for_status()
        symbols_data = details_resp.json().get("symbols", [])
        if not symbols_data:
            raise ValueError(f"No symbol details returned for {symbol}")
        details = symbols_data[0]

        # Fetch quote
        quotes_resp = await client.get(f"{api_server}v1/markets/quotes/{symbol_id}", headers=headers)
        quotes_resp.raise_for_status()
        quotes_data = quotes_resp.json().get("quotes", [])
        if not quotes_data:
            raise ValueError(f"No quote data returned for {symbol}")
        quotes = quotes_data[0]

    return {
        "symbol": details.get("symbol"),
        "name": details.get("description"),
        "sector": details.get("industrySector"),
        "listingExchange": details.get("listingExchange"),
        "securityType": details.get("securityType"),
        "currency": details.get("currency"),
        "dividend": details.get("dividend"),
        "dividendYield": details.get("yield"),
        "peRatio": details.get("pe"),
        "eps": details.get("eps"),
        "marketCap": details.get("marketCap"),
        "outstandingShares": details.get("outstandingShares"),
        "exDividendDate": details.get("exDate"),
        "open": quotes.get("openPrice"),
        "high": quotes.get("highPrice"),
        "low": quotes.get("lowPrice"),
        "lastTradePrice": quotes.get("lastTradePrice"),
        "volume": quotes.get("volume"),
        "high52w": details.get("highPrice52"),
        "low52w": details.get("lowPrice52"),
    }

