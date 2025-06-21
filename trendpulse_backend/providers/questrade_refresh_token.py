import os
import json
import time
import httpx
from threading import Lock

# Automatically points to providers/questrade_config.json
CONFIG_FILE = os.path.join(os.path.dirname(__file__), "questrade_config.json")


class QuestradeAuth:
    _instance = None
    _lock = Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(QuestradeAuth, cls).__new__(cls)
                    cls._instance._load_config()
        return cls._instance

    def _load_config(self):
        if not os.path.exists(CONFIG_FILE):
            raise FileNotFoundError(f"{CONFIG_FILE} does not exist. Create it with your initial refresh_token.")
        with open(CONFIG_FILE, 'r') as f:
            self.config = json.load(f)

    def _save_config(self):
        with open(CONFIG_FILE, 'w') as f:
            json.dump(self.config, f, indent=4)

    async def get_access_token(self):
        token_expiry = self.config.get("token_timestamp", 0) + self.config.get("expires_in", 0) - 60
        if time.time() < token_expiry and self.config.get("access_token"):
            return self.config["access_token"], self.config["api_server"]

        # Refresh required
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://login.questrade.com/oauth2/token",
                params={
                    "grant_type": "refresh_token",
                    "refresh_token": self.config["refresh_token"]
                }
            )
        response.raise_for_status()
        data = response.json()

        self.config.update({
            "access_token": data["access_token"],
            "refresh_token": data["refresh_token"],
            "api_server": data["api_server"],
            "token_type": data.get("token_type"),
            "expires_in": data.get("expires_in"),
            "token_timestamp": time.time()
        })

        self._save_config()
        return self.config["access_token"], self.config["api_server"]

    def manual_refresh(self):
        # Used for CLI: python questrade_auth.py
        import requests
        refresh_token = self.config.get('refresh_token')
        if not refresh_token:
            raise Exception("refresh_token not found in questrade_config.json.")

        url = "https://login.questrade.com/oauth2/token"
        params = {
            'grant_type': 'refresh_token',
            'refresh_token': refresh_token
        }

        response = requests.get(url, params=params)
        if response.status_code != 200:
            raise Exception(f"Failed to refresh token: {response.text}")

        data = response.json()

        self.config.update({
            'access_token': data['access_token'],
            'refresh_token': data['refresh_token'],
            'api_server': data['api_server'],
            'token_type': data.get('token_type'),
            'expires_in': data.get('expires_in'),
            'token_timestamp': time.time()
        })

        self._save_config()

            # Reload config to sync the singleton instance with updated file
        self._load_config()

        print("✅ Token manually refreshed and saved.")

# For CLI usage
if __name__ == "__main__":
    QuestradeAuth().manual_refresh()
