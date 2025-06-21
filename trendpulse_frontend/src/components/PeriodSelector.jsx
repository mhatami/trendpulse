import React from "react";

const PERIOD_OPTIONS = ["1D", "5D", "1M", "6M", "YTD", "1Y", "5Y", "MAX"];

export default function PeriodSelector({ selected, onSelect }) {
    console.log("PeriodSelector rendered with selected:", selected);
    console.log(PERIOD_OPTIONS)
  return (
    <div className="flex gap-2 mb-4 overflow-x-auto">
      {PERIOD_OPTIONS.map((period) => (
        <button
          key={period}
          onClick={() => onSelect(period)}
          className={`px-3 py-1 rounded-full text-sm border whitespace-nowrap ${
            selected === period
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
          }`}
        >
          {period}
        </button>
      ))}
    </div>
  );
}
