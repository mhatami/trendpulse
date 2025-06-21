import yfinance as yf
import pandas as pd
import asyncio


async def fetch_stock_prices(symbol: str, period: str) -> pd.DataFrame:
    """
    Asynchronously fetch historical stock price data using yfinance.
    """

    interval_map = {
        "1d": "1d",
        "5d": "1d",
        "1mo": "1d",
        "3mo": "1d",
        "6mo": "1d",
        "1y": "1d",
        "ytd": "1d",
        "5y": "1wk",
        "max": "1mo",
    }

    if period not in interval_map:
        raise ValueError(f"Unsupported period: {period}")

    interval = interval_map[period]

    def _get_history():
        ticker = yf.Ticker(symbol)
        df = ticker.history(period=period, interval=interval)
        if df.empty:
            raise ValueError(f"No price data found for {symbol} with period {period}")
        df.reset_index(inplace=True)
        df = df[["Date", "Open", "High", "Low", "Close", "Volume"]]
        return df

    return await asyncio.to_thread(_get_history)


async def fetch_stock_details(symbol: str) -> dict:
    """
    Asynchronously fetch stock details using yfinance.
    """

    def _get_info():
        ticker = yf.Ticker(symbol)
        info = ticker.info
        if not info:
            raise ValueError(f"No data found for symbol {symbol}")

        return {
            "symbol": info.get("symbol"),
            "name": info.get("longName") or info.get("shortName"),
            "sector": info.get("sector"),
            "listingExchange": info.get("exchange"),
            "securityType": info.get("quoteType"),
            "currency": info.get("currency"),
            "dividend": info.get("dividendRate"),
            "dividendYield": info.get("dividendYield"),
            "peRatio": info.get("trailingPE"),
            "eps": info.get("trailingEps"),
            "marketCap": info.get("marketCap"),
            "outstandingShares": info.get("sharesOutstanding"),
            "exDividendDate": pd.to_datetime(info.get("exDividendDate"), unit='s') if info.get("exDividendDate") else None,
            "open": info.get("open"),
            "high": info.get("dayHigh"),
            "low": info.get("dayLow"),
            "lastTradePrice": info.get("regularMarketPrice"),
            "volume": info.get("volume"),
            "high52w": info.get("fiftyTwoWeekHigh"),
            "low52w": info.get("fiftyTwoWeekLow"),
        }

    return await asyncio.to_thread(_get_info)
