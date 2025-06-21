import React from "react";

function formatCurrency(value) {
  return typeof value === "number" ? `$${value.toFixed(2)}` : "—";
}

function formatPercent(value) {
  return typeof value === "number" ? `${value.toFixed(2)}%` : "—";
}

function formatNumber(value) {
  return typeof value === "number" ? value.toLocaleString() : "—";
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

export default function StockSummaryCard({ profile }) {
  if (!profile) return null;

  return (
    <div className="border rounded p-4 mb-6 shadow-sm bg-white">
      <h2 className="text-2xl font-bold mb-2">
        {profile.name} ({profile.symbol})
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Exchange: {profile.listingExchange} | Sector: {profile.sector} | Type: {profile.securityType} | Currency: {profile.currency}
      </p>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p><strong>Last Price:</strong> {formatCurrency(profile.lastTradePrice)}</p>
          <p><strong>Open:</strong> {formatCurrency(profile.open)}</p>
          <p><strong>High:</strong> {formatCurrency(profile.high)}</p>
          <p><strong>Low:</strong> {formatCurrency(profile.low)}</p>
          <p><strong>Volume:</strong> {formatNumber(profile.volume)}</p>
        </div>

        <div>
          <p><strong>Market Cap:</strong> {profile.marketCap ? `$${(profile.marketCap / 1e9).toFixed(2)}B` : "—"}</p>
          <p><strong>PE Ratio:</strong> {profile.peRatio ?? "—"}</p>
          <p><strong>EPS:</strong> {formatCurrency(profile.eps)}</p>
          <p><strong>Dividend:</strong> {formatCurrency(profile.dividend)}</p>
          <p><strong>Dividend Yield:</strong> {formatPercent(profile.dividendYield)}</p>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-700">
        <p><strong>Outstanding Shares:</strong> {formatNumber(profile.outstandingShares)}</p>
        <p><strong>Ex-Dividend Date:</strong> {formatDate(profile.exDividendDate)}</p>
        <p><strong>52-Week High:</strong> {formatCurrency(profile.high52w)}</p>
        <p><strong>52-Week Low:</strong> {formatCurrency(profile.low52w)}</p>
      </div>
    </div>
  );
}
