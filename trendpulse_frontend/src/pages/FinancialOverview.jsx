import React, { useEffect, useState } from "react";
import { useSymbol } from "../contexts/SymbolContext";
import { fetchCompanyProfile, fetchPriceHistory } from "../api/fetchStockData";
import StockSummaryCard from "../components/StockSummaryCard";
import PriceChart from "../components/PriceChart";
import PeriodSelector from "../components/PeriodSelector";

export default function FinancialOverview() {
  const { symbol, refreshKey } = useSymbol();
  const [profile, setProfile] = useState(null);
  const [priceHistory, setPriceHistory] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("1M");

  // Fetch profile when symbol changes
  useEffect(() => {
    if (!symbol) return;

    setLoadingProfile(true);
    setProfile(null);

    const fetchProfile = async () => {
      try {
        const profileData = await fetchCompanyProfile(symbol);
        setProfile(profileData);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();

    // Reset selected period when a new symbol is entered
    setSelectedPeriod("1M");
  }, [symbol]);

  // Fetch price history when symbol or period changes
  useEffect(() => {
    if (!symbol) return;

    setLoadingPrices(true);
    setPriceHistory(null);

    const fetchPrices = async () => {
      try {
        const priceData = await fetchPriceHistory(symbol, selectedPeriod);
        setPriceHistory(priceData);
      } catch (error) {
        console.error("Error fetching price history:", error);
      } finally {
        setLoadingPrices(false);
      }
    };

    fetchPrices();
  }, [symbol, selectedPeriod, refreshKey]);

  if (!symbol) return <p>Please enter a stock symbol to begin.</p>;
  if (loadingProfile) return <p>Loading company profile for {symbol}...</p>;
  if (!profile) return <p>No company profile found for symbol: {symbol}</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{symbol} Overview</h2>

      <PeriodSelector selected={selectedPeriod} onSelect={setSelectedPeriod} />

      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/3">
          <StockSummaryCard profile={profile} />
        </div>
        <div className="md:w-2/3 h-[300px]">
          {loadingPrices && <p>Loading price history...</p>}
          {!loadingPrices && priceHistory ? (
            <PriceChart data={priceHistory.data} period={selectedPeriod} />
          ) : (
            !loadingPrices && <p>No price data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
