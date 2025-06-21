import pandas as pd
import numpy as np

def calculate_rsi(stock_data: pd.DataFrame, length: int = 14):
    """Calculate RSI for a given length and return a DataFrame with Date and RSI."""
    close = stock_data["Close"]
    delta = close.diff()

    gain = delta.where(delta > 0, 0.0)
    loss = -delta.where(delta < 0, 0.0)

    avg_gain = gain.rolling(window=length).mean()
    avg_loss = loss.rolling(window=length).mean()

    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))

    rsi_df = stock_data[["Date"]].copy()
    rsi_df["RSI"] = rsi
    rsi_df = rsi_df.replace([np.nan, np.inf, -np.inf], None)

    return rsi_df

def calculate_sma(stock_data: pd.DataFrame, length: int = 20):
    """Simple Moving Average (SMA)""" 
    close_prices = stock_data["Close"]
    sma = close_prices.rolling(window=length).mean()

    sma_df = stock_data[["Date"]].copy()
    sma_df["SMA"] = sma
    sma_df = sma_df.replace([np.nan, np.inf, -np.inf], None)

    return sma_df

def calculate_ema(stock_data: pd.DataFrame, length: int = 20):
    """Exponential Moving Average (EMA)"""
    ema = stock_data["Close"].ewm(span=length, adjust=False).mean()

    ema_df = stock_data[["Date"]].copy()
    ema_df["EMA"] = ema
    ema_df = ema_df.replace([np.nan, np.inf, -np.inf], None)

    return ema_df

def calculate_bollinger_bands(stock_data: pd.DataFrame, length: int = 20):
    """Bollinger Bands calculation"""
    close_prices = stock_data["Close"]
    sma = close_prices.rolling(window=length).mean()
    std = close_prices.rolling(window=length).std()
    upper_band = sma + (std * 2)
    lower_band = sma - (std * 2)

    bb_df = stock_data[["Date"]].copy()
    bb_df["BB_UBand"] = upper_band
    bb_df["BB_LBand"] = lower_band
    bb_df = bb_df.replace([np.nan, np.inf, -np.inf], None)

    return bb_df

def calculate_macd(stock_data: pd.DataFrame, fast=12, slow=26, signal=9):
    short_ema = stock_data["Close"].ewm(span=fast, adjust=False).mean()
    long_ema = stock_data["Close"].ewm(span=slow, adjust=False).mean()
    macd = short_ema - long_ema
    signal_line = macd.ewm(span=signal, adjust=False).mean()
    histogram = macd - signal_line

    macd_df = stock_data[["Date"]].copy()
    macd_df["MACD"] = macd
    macd_df["MACD_Signal"] = signal_line
    macd_df["MACD_Histogram"] = histogram

    valid_start = slow + signal  # Conservative choice to drop early unstable values
    macd_df.loc[:valid_start-1, ["MACD", "MACD_Signal", "MACD_Histogram"]] = None

    macd_df = macd_df.replace([np.nan, np.inf, -np.inf], None)

    return macd_df

def calculate_atr(stock_data: pd.DataFrame, length: int = 14):
    """Calculate Average True Range (ATR)."""
    stock_data = stock_data.copy()
    stock_data["High-Low"] = stock_data["High"] - stock_data["Low"]
    stock_data["High-Close"] = abs(stock_data["High"] - stock_data["Close"].shift(1))
    stock_data["Low-Close"] = abs(stock_data["Low"] - stock_data["Close"].shift(1))

    stock_data["TrueRange"] = stock_data[["High-Low", "High-Close", "Low-Close"]].max(axis=1)
    stock_data["ATR"] = stock_data["TrueRange"].rolling(window=length).mean()

    atr_df = stock_data[["Date"]].copy()
    atr_df["ATR"] = stock_data["ATR"]
    atr_df = atr_df.replace([np.nan, np.inf, -np.inf], None)

    return atr_df
