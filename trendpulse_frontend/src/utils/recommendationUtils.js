export function generateRecommendations(data, selectedIndicators) {
  if (!data || data.length === 0) return [];

  const latest = data.at(-1);
  const recs = [];

  for (const indicator of selectedIndicators) {
    const { name } = indicator;
    switch (name) {
      case "SMA": {
        const diff = latest.Close - latest.SMA;
        if (diff > latest.SMA * 0.02) { // >2% above SMA
          recs.push({ indicator: "SMA", message: "Price is well above SMA — strong bullish trend." });
        } else if (diff > 0) {
          recs.push({ indicator: "SMA", message: "Price is slightly above SMA — mild bullish trend." });
        } else if (diff < -latest.SMA * 0.02) {
          recs.push({ indicator: "SMA", message: "Price is well below SMA — strong bearish trend." });
        } else {
          recs.push({ indicator: "SMA", message: "Price is slightly below SMA — mild bearish trend." });
        }
        break;
      }
      case "EMA": {
        const diff = latest.Close - latest.EMA;
        if (diff > latest.EMA * 0.02) {
          recs.push({ indicator: "EMA", message: "Price well above EMA — strong upward momentum." });
        } else if (diff > 0) {
          recs.push({ indicator: "EMA", message: "Price slightly above EMA — upward momentum." });
        } else if (diff < -latest.EMA * 0.02) {
          recs.push({ indicator: "EMA", message: "Price well below EMA — strong downward momentum." });
        } else {
          recs.push({ indicator: "EMA", message: "Price slightly below EMA — downward momentum." });
        }
        break;
      }
      case "RSI": {
        if (latest.RSI >= 80) {
          recs.push({ indicator: "RSI", message: "RSI above 80 — very overbought, potential reversal." });
        } else if (latest.RSI >= 70) {
          recs.push({ indicator: "RSI", message: "RSI above 70 — overbought conditions." });
        } else if (latest.RSI >= 60) {
          recs.push({ indicator: "RSI", message: "RSI moderately high — slight bullish momentum." });
        } else if (latest.RSI > 40 && latest.RSI < 60) {
          recs.push({ indicator: "RSI", message: "RSI neutral — balanced momentum." });
        } else if (latest.RSI <= 40 && latest.RSI > 30) {
          recs.push({ indicator: "RSI", message: "RSI moderately low — slight bearish momentum." });
        } else if (latest.RSI <= 30) {
          recs.push({ indicator: "RSI", message: "RSI below 30 — oversold, possible rebound." });
        } else {
          recs.push({ indicator: "RSI", message: "RSI very low — strong oversold, watch for bounce." });
        }
        break;
      }
      case "MACD": {
        const macdDiff = latest.MACD - latest.MACD_Signal;
        if (macdDiff > 0 && macdDiff > 0.01) {
          recs.push({ indicator: "MACD", message: "MACD strongly above signal — bullish momentum." });
        } else if (macdDiff > 0) {
          recs.push({ indicator: "MACD", message: "MACD slightly above signal — mild bullish." });
        } else if (macdDiff < 0 && macdDiff < -0.01) {
          recs.push({ indicator: "MACD", message: "MACD strongly below signal — bearish momentum." });
        } else {
          recs.push({ indicator: "MACD", message: "MACD slightly below signal — mild bearish." });
        }
        break;
      }
      case "BB": {
        if (latest.Close < latest.BB_LBand) {
          recs.push({ indicator: "Bollinger Bands", message: "Price below lower band — potential bullish bounce." });
        } else if (latest.Close > latest.BB_UBand) {
          recs.push({ indicator: "Bollinger Bands", message: "Price above upper band — overbought, possible correction." });
        } else {
          recs.push({ indicator: "Bollinger Bands", message: "Price within bands — normal volatility." });
        }
        break;
      }
      case "ATR": {
        // ATR alone doesn’t say buy or sell, just volatility
        if (latest.ATR > 5) {
          recs.push({ indicator: "ATR", message: "High ATR — expect increased volatility, caution advised." });
        } else {
          recs.push({ indicator: "ATR", message: "Low ATR — stable price action." });
        }
        break;
      }
      default:
        break;
    }
  }

  return recs;
}

export function generateFinalRating(recommendations) {
  if (!recommendations || recommendations.length === 0) return "Hold";

  let score = 0;

  // Keywords tuned with weightings for more nuanced scoring
  const strongBuyWords = ["strong bullish", "strong upward momentum", "oversold", "bounce", "rebound"];
  const buyWords = ["bullish", "upward momentum", "mild bullish", "slight bullish", "potential bounce"];
  const holdWords = ["neutral", "normal", "balanced", "stable"];
  const sellWords = ["bearish", "downward momentum", "mild bearish", "slight bearish", "overbought", "correction"];
  const strongSellWords = ["strong bearish", "very overbought", "reversal", "caution"];

  for (const rec of recommendations) {
    const msg = rec.message.toLowerCase();
    if (strongBuyWords.some(w => msg.includes(w))) score += 3;
    else if (buyWords.some(w => msg.includes(w))) score += 2;
    else if (holdWords.some(w => msg.includes(w))) score += 0;
    else if (sellWords.some(w => msg.includes(w))) score -= 2;
    else if (strongSellWords.some(w => msg.includes(w))) score -= 3;
  }

  if (score >= 6) return "Strong Buy";
  if (score >= 3) return "Buy";
  if (score >= 1) return "Moderate Buy";
  if (score === 0) return "Hold";
  if (score >= -2) return "Moderate Sell";
  if (score <= -3) return "Sell";

  return "Hold";
}
