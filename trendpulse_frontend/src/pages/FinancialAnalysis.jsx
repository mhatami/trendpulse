import React, { useEffect, useState } from "react";
import { useSymbol } from "../contexts/SymbolContext";
import { fetchIndicators } from "../api/fetchStockData";
import IndicatorSelector from "../components/IndicatorSelector";
import IndicatorChart from "../components/IndicatorChart";
import { generateRecommendations, generateFinalRating } from "../utils/recommendationUtils";
import RecommendationCard from "../components/RecommendationCard";

// Define all indicators here to keep consistent
  const allIndicators = [
  { name: "SMA", length: 20 },
  { name: "RSI", length: 14 },
  { name: "MACD", lengths: { fast: 12, slow: 26, signal: 9 } },
  { name: "ATR", length: 14 },
  { name: "BB", length: 20 },
  { name: "EMA", length: 20 },
];

export default function FinancialAnalysis() {
  const { symbol, refreshKey } = useSymbol();

  // Define default indicators here to keep consistent
  const defaultLengths = {
    SMA: 20,
    RSI: 14,
    MACD: { fast: 12, slow: 26, signal: 9 },
  };

  // Initialize with period data
  const [selectedIndicators, setSelectedIndicators] = useState([
    { name: "SMA", length: defaultLengths.SMA },
    { name: "RSI", length: defaultLengths.RSI },
    { name: "MACD", lengths: defaultLengths.MACD },
  ]);
  const [indicatorData, setIndicatorData] = useState(null);
  const [loading, setLoading] = useState(false);

useEffect(() => {
  if (!symbol) return;

  console.log("🧠 useEffect triggered for symbol:", symbol);
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await fetchIndicators(symbol, allIndicators); // <-- fetch all
      setIndicatorData(data);
    } catch (error) {
      console.error("Error fetching indicators:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [symbol, refreshKey]);


  if (!symbol) return <p>Please enter a stock symbol to begin.</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{symbol} Analysis</h2>

      <IndicatorSelector
        selectedIndicators={selectedIndicators}
        onChange={setSelectedIndicators}
      />

      {loading && <p>Loading indicator data for {symbol}...</p>}

      {!loading && indicatorData && (
        <>
          <IndicatorChart
            indicatorData={indicatorData}
            selectedIndicators={selectedIndicators}
          />
          <RecommendationCard
            recommendations={generateRecommendations(indicatorData?.data, selectedIndicators)}
            finalRating={generateFinalRating(generateRecommendations(indicatorData?.data, selectedIndicators))}
          />
        </>

      )}
    </div>
  );
}
