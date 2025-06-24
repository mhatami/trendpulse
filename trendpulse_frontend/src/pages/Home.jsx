// pages/Home.jsx
import React from "react";
import Disclaimer from "../components/Disclaimer";

export default function Home() {
  return (
    <div className="text-gray-700 text-center">
      <img
        src="/trendpulselogo.png"
        alt="TrendPulse Logo"
        className="mx-auto mb-6 w-48 h-auto"
      />
      <h2 className="text-2xl font-bold mb-4">Welcome to TrendPulse</h2>
      <p className="mb-3">
        TrendPulse is your intelligent stock trend analysis tool. Enter a stock symbol above to get started.
      </p>
      <p className="mb-1">
        The <strong>Overview</strong> tab shows company details and recent stock price charts.
      </p>
      <p className="mb-4">
        The <strong>Analysis</strong> tab applies technical indicators and AI-generated recommendations.
      </p>
      <Disclaimer />
    </div>
  );
}
