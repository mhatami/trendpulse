import React, { useState } from "react";

export default function SymbolSearch({ onSubmit }) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim()) {
        onSubmit(inputValue.trim().toUpperCase());
      }
    }
  };

  const handleClick = () => {
    if (inputValue.trim()) {
      onSubmit(inputValue.trim().toUpperCase());
    }
  };

  return (
    <div className="flex">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value.toUpperCase())}
        onKeyDown={handleKeyDown}
        className="border p-2 rounded w-64"
        placeholder="Enter stock symbol (e.g., AAPL)"
      />
      <button
        onClick={handleClick}
        className="ml-2 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Search
      </button>
    </div>
  );
}
