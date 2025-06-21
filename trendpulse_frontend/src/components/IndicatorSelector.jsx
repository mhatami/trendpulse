import React from "react";

const ALL_INDICATORS = [
  { name: "SMA", label: "Simple MA" },
  { name: "EMA", label: "Exponential MA" },
  { name: "MACD", label: "MACD" },
  { name: "RSI", label: "RSI" },
  { name: "BB", label: "Bollinger Bands" },
  { name: "ATR", label: "ATR" },
];

export default function IndicatorSelector({ selectedIndicators, onChange }) {
  const isSelected = (name) =>
    selectedIndicators.some((ind) => ind.name === name);

  const toggleIndicator = (name) => {
    if (isSelected(name)) {
      onChange(selectedIndicators.filter((ind) => ind.name !== name));
    } else {
      const defaultLengths = {
        SMA: 20,
        EMA: 20,
        RSI: 14,
        MACD: { fast: 12, slow: 26, signal: 9 },
        BB: 20,
        ATR: 14,
      };

      const newIndicator =
        name === "MACD"
          ? { name, lengths: defaultLengths.MACD }
          : { name, length: defaultLengths[name] };

      onChange([...selectedIndicators, newIndicator]);
    }
  };

  return (
    <div className="flex flex-wrap gap-4 mb-4">
      {ALL_INDICATORS.map(({ name, label }) => (
        <label key={name} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isSelected(name)}
            onChange={() => toggleIndicator(name)}
          />
          {label}
        </label>
      ))}
    </div>
  );
}
