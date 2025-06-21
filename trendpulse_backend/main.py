from fastapi import FastAPI, HTTPException, Body, Request
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import re
import logging
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import diskcache # type: ignore
import time
from starlette.middleware.base import BaseHTTPMiddleware

from services.fetch_data import fetcher
from services.indicators import (
    calculate_rsi, calculate_sma, calculate_ema,
    calculate_bollinger_bands, calculate_macd, calculate_atr
)

# Load environment variables
load_dotenv()

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Caching
CACHE_TTL_MINUTES = 10
cache = diskcache.Cache("./trendpulse_cache")

# Rate limiting config
RATE_LIMIT = 30  # max requests
RATE_LIMIT_WINDOW = 60  # seconds

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.clients = {}  # {ip: [timestamp1, timestamp2, ...]}

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host

        now = time.time()
        request_times = self.clients.get(client_ip, [])

        # Remove timestamps older than RATE_LIMIT_WINDOW
        request_times = [t for t in request_times if now - t < RATE_LIMIT_WINDOW]

        if len(request_times) >= RATE_LIMIT:
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded. Try again later."},
            )

        request_times.append(now)
        self.clients[client_ip] = request_times

        response = await call_next(request)
        return response


# FastAPI app
app = FastAPI()

# Add rate limiting middleware before other middleware
app.add_middleware(RateLimitMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Default indicator lengths
default_lengths = {
    "SMA": 20,
    "EMA": 20,
    "RSI": 14,
    "MACD": {"fast": 12, "slow": 26, "signal": 9},
    "BB": 20,
    "ATR": 14,
}

# Models
class PriceRequest(BaseModel):
    symbol: str
    period: str = "1y"

class IndicatorItem(BaseModel):
    name: str
    length: Optional[int] = None
    fast: Optional[int] = None
    slow: Optional[int] = None
    signal: Optional[int] = None

class IndicatorRequest(BaseModel):
    symbol: str
    indicators: List[IndicatorItem]

# Helper functions
def validate_symbol(symbol: str) -> str:
    symbol = symbol.strip().upper()
    if not symbol or not re.match(r"^[A-Za-z0-9.\-]+$", symbol):
        raise HTTPException(status_code=400, detail="Invalid stock symbol")
    return symbol

def format_dates_for_json(df: pd.DataFrame) -> pd.Series:
    if df.empty or "Date" not in df.columns:
        return df["Date"] if "Date" in df.columns else pd.Series(dtype=str)

    df["Date"] = pd.to_datetime(df["Date"], utc=True, errors='coerce')
    if not pd.api.types.is_datetime64_any_dtype(df["Date"]) or df["Date"].isna().all():
        return df["Date"].astype(str)

    has_time = (df["Date"].dt.hour != 0) | (df["Date"].dt.minute != 0) | (df["Date"].dt.second != 0)
    if has_time.any():
        return df["Date"].dt.strftime('%Y-%m-%dT%H:%M:%S')
    else:
        return df["Date"].dt.strftime('%Y-%m-%d')

def make_cache_key(symbol: str, period: str, interval: str, data_type: str) -> str:
    return f"{symbol}-{period}-{interval}-{data_type}"

def get_from_cache(key: str):
    entry = cache.get(key)
    if entry:
        timestamp, df = entry
        if datetime.now(timezone.utc) - timestamp < timedelta(minutes=CACHE_TTL_MINUTES):
            logger.info(f"Using cached data for {key}")
            return df.copy()
    return None

def set_to_cache(key: str, df: pd.DataFrame):
    cache.set(key, (datetime.now(timezone.utc), df.copy()))

# Routes
@app.get("/favicon.ico")
async def favicon():
    return {}

@app.get("/")
def read_root():
    return {"message": "Welcome to TrendPulse API"}

@app.get("/{symbol}")
async def get_stock_details(symbol: str):
    symbol = validate_symbol(symbol)
    try:
        stock_data = await fetcher.fetch_stock_details(symbol)
        if not stock_data:
            raise HTTPException(status_code=404, detail=f"No data found for symbol: {symbol}")
        return jsonable_encoder(stock_data)
    except Exception as e:
        logger.error(f"Error fetching details for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch stock details")

@app.post("/prices")
async def get_prices(request: PriceRequest):
    symbol = validate_symbol(request.symbol)
    period = request.period

    if period == "1d":
        interval = "1d"
    elif period == "5d":
        interval = "1d"
    elif period in ["1mo", "3mo", "6mo", "1y", "ytd"]:
        interval = "1d"
    elif period == "5y":
        interval = "1wk"
    elif period == "max":
        interval = "1mo"
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported period: {period}")

    cache_key = make_cache_key(symbol, period, interval, "price")
    stock_data = get_from_cache(cache_key)

    if stock_data is None:
        try:
            logger.info(f"Fetching fresh price data for {cache_key}")
            stock_data = await fetcher.fetch_stock_prices(symbol, period)
            if stock_data.empty:
                raise HTTPException(status_code=404, detail="No data found for the given symbol")
            stock_data = stock_data.sort_values("Date")
            set_to_cache(cache_key, stock_data)
        except Exception as e:
            logger.error(f"Error fetching prices for {symbol}: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to fetch prices")

    stock_data["Date"] = format_dates_for_json(stock_data)

    return {
        "symbol": symbol,
        "data": jsonable_encoder(stock_data.to_dict(orient="records"))
    }

@app.post("/indicators")
async def get_indicators(request: IndicatorRequest):
    symbol = validate_symbol(request.symbol)
    indicators = request.indicators

    # Fixed to 1y and 1d interval for indicators
    period = "1y"
    interval = "1d"
    cache_key = make_cache_key(symbol, period, interval, "price")

    stock_data = get_from_cache(cache_key)

    if stock_data is None:
        try:
            logger.info(f"Fetching base data for indicators: {cache_key}")
            stock_data = await fetcher.fetch_stock_prices(symbol, period)
            if stock_data.empty:
                raise HTTPException(status_code=404, detail="No data found for indicators")
            stock_data = stock_data.sort_values("Date")
            set_to_cache(cache_key, stock_data)
        except Exception as e:
            logger.error(f"Error fetching prices for indicators {symbol}: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to fetch indicator data")

    stock_data["Date"] = pd.to_datetime(stock_data["Date"], utc=True)
    results = stock_data.copy()

    for indicator in indicators:
        name = indicator.name.upper()
        try:
            if name == "MACD":
                fast = indicator.fast or 12
                slow = indicator.slow or 26
                signal = indicator.signal or 9
                logger.info(f"Calculating MACD for {symbol} with fast={fast}, slow={slow}, signal={signal}")
                df_ind = calculate_macd(stock_data, fast, slow, signal)
            else:
                length_val = indicator.length or default_lengths.get(name, 14)
                logger.info(f"Calculating {name} for {symbol} with length={length_val}")
                if name == "RSI":
                    df_ind = calculate_rsi(stock_data, length_val)
                elif name == "SMA":
                    df_ind = calculate_sma(stock_data, length_val)
                elif name == "EMA":
                    df_ind = calculate_ema(stock_data, length_val)
                elif name == "BB":
                    df_ind = calculate_bollinger_bands(stock_data, length_val)
                elif name == "ATR":
                    df_ind = calculate_atr(stock_data, length_val)
                else:
                    raise HTTPException(status_code=400, detail=f"Unsupported indicator: {name}")

            results = results.merge(df_ind, on="Date", how="left")
        except Exception as e:
            logger.error(f"Error calculating indicator {name}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to calculate indicator: {name}")

    results["Date"] = format_dates_for_json(results)
    json_data = results.to_dict(orient="records")
    for record in json_data:
        for key, value in record.items():
            if pd.isna(value):
                record[key] = None

    return {"symbol": symbol, "data": json_data}

@app.post("/clear_cache")
def clear_cache():
    cache.clear()
    logger.info("Disk cache cleared")
    return {"message": "Cache cleared"}
