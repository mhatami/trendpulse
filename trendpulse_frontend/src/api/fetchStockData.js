import axios from "axios";

// Set your FastAPI backend base URL
const BASE_URL = "https://trendpulseapi.sequencecorp.com"; // or your deployed backend

//converting to period defined in backend API's
const PERIOD_MAP = {
    "1D": "1d",
    "5D": "5d",
    "1M": "1mo",
    "6M": "6mo",
    "YTD": "ytd",
    "1Y": "1y",
    "5Y": "5y",
    "MAX": "max",
};

export const PERIOD_OPTIONS = Object.keys(PERIOD_MAP);

export function getPeriodSettings(period) {
    return PERIOD_MAP[period] || "1d";
}


// Fetch company profile from GET /{symbol}
export async function fetchCompanyProfile(symbol) {
    try {
        const response = await axios.get(`${BASE_URL}/${symbol}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching profile for ${symbol}:`, error);
        throw error;
    }
}

// Fetch price history from POST /prices
export async function fetchPriceHistory(symbol, period) {
    const apiPeriod = getPeriodSettings(period);
    console.log("apiPeriod:", apiPeriod);
    try {
        const response = await axios.post(`${BASE_URL}/prices`, {
            symbol:symbol,
            period:apiPeriod,
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching price history for ${symbol}:`, error);
        throw error;
    }
}


// Fetch indicators (MACD, RSI, etc.)
export async function fetchIndicators(symbol, indicators) {
    const response = await axios.post(`${BASE_URL}/indicators`, {
        symbol,
        indicators, // indicators should have { name, length } or { name, lengths } already
    });

    return {
        symbol: response.data.symbol,
        data: response.data.data.map(item => ({
            ...item,
            Date: new Date(item.Date).toISOString(),
        })),
    };
}

// Clear backend cache (optional utility)
export async function clearCache() {
    const response = await axios.post(`${BASE_URL}/clear_cache`);
    return response.data;
}
