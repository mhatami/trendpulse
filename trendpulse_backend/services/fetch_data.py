import importlib
from fastapi import HTTPException

# Supported providers
VALID_PROVIDERS = [ "yfinance", "alphavantage", "questrade", "twelvedata"]

# Default provider can be set here
DEFAULT_PROVIDER = "yfinance"  # Change this to your preferred default provider

class FetchData:
    def __init__(self, provider=DEFAULT_PROVIDER):
        if provider not in VALID_PROVIDERS:
            raise HTTPException(status_code=400, detail=f"Invalid provider '{provider}'")
        self.provider = provider
        self.module = importlib.import_module(f"providers.{provider}_api")

    async def fetch_stock_prices(self, symbol: str, period: str = "6mo"):
        return await self.module.fetch_stock_prices(symbol, period)

    async def fetch_stock_details(self, symbol: str):
        return await self.module.fetch_stock_details(symbol)

# Create a singleton instance if you want default usage
fetcher = FetchData()
