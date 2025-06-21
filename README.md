
---

## 🚀 Features

- Symbol search with live stock data
- Technical indicators: SMA, EMA, RSI, MACD, ATR, Bollinger Bands
- AI-style recommendation system with final rating
- Dynamic chart visualizations (Price + Indicators)
- Transparent legal disclaimer modal
- Clean, fast UI with persistent caching

---

## 📦 Technologies

### Backend (`trendpulse_backend`)
- Python 3.11+
- [FastAPI](https://fastapi.tiangolo.com/)
- [yfinance](https://pypi.org/project/yfinance/)
- DiskCache for persistent local caching

### Frontend (`trendpulse_frontend`)
- React + Vite
- TailwindCSS
- Recharts (charts)
- Axios (API calls)
- React Router DOM

---

## 🛠️ Getting Started

### Backend

```bash
cd trendpulse_backend
python -m venv venv
source venv/bin/activate   # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload
