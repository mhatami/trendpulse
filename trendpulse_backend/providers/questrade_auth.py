import os
import json
import time
import httpx

CONFIG_FILE = os.path.join(os.path.dirname(__file__), "questrade_config.json")

# Internal singleton-style cache
_auth_cache = {
    "access_token": None,
    "api_server": None,
    "token_timestamp": 0,
    "expires_in": 0,
    "refresh_token": None,
}


def _load_config():
    if not os.path.exists(CONFIG_FILE):
        raise FileNotFoundError(f"{CONFIG_FILE} does not exist. Create it with your initial refresh_token.")
    with open(CONFIG_FILE, "r") as f:
        config = json.load(f)
        _auth_cache.update({
            "access_token": config.get("access_token"),
            "refresh_token": config.get("refresh_token"),
            "api_server": config.get("api_server"),
            "expires_in": config.get("expires_in", 0),
            "token_timestamp": config.get("token_timestamp", 0),
        })


def _save_config():
    with open(CONFIG_FILE, "w") as f:
        json.dump({
            "access_token": _auth_cache["access_token"],
            "refresh_token": _auth_cache["refresh_token"],
            "api_server": _auth_cache["api_server"],
            "expires_in": _auth_cache["expires_in"],
            "token_timestamp": _auth_cache["token_timestamp"],
        }, f, indent=4)


async def get_access_token():
    # Load config once if needed
    if _auth_cache["refresh_token"] is None:
        _load_config()

    now = time.time()
    expires_at = _auth_cache["token_timestamp"] + _auth_cache["expires_in"] - 60  # 60s early
    if _auth_cache["access_token"] and now < expires_at:
        return _auth_cache["access_token"], _auth_cache["api_server"]

    # Refresh token
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://login.questrade.com/oauth2/token",
            params={
                "grant_type": "refresh_token",
                "refresh_token": _auth_cache["refresh_token"]
            }
        )
    response.raise_for_status()
    data = response.json()

    _auth_cache.update({
        "access_token": data["access_token"],
        "refresh_token": data["refresh_token"],
        "api_server": data["api_server"],
        "expires_in": data["expires_in"],
        "token_timestamp": time.time(),
    })
    _save_config()
    return _auth_cache["access_token"], _auth_cache["api_server"]


async def get_symbol_id(symbol: str, api_server: str, headers: dict) -> int:
    url = f"{api_server}v1/symbols?names={symbol}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
    response.raise_for_status()
    data = response.json()
    for sym in data.get("symbols", []):
        if sym["symbol"].upper() == symbol.upper():
            return sym["symbolId"]
    raise ValueError(f"Symbol not found: {symbol}")
