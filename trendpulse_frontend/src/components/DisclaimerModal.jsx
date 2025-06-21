import React, { useState } from "react";

export default function DisclaimerModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs text-blue-600 underline hover:text-blue-800"
      >
        Legal Notice & Disclaimer
      </button>

      {isOpen && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-white border-2 border-gray-600 shadow-xl rounded-md p-6 w-[90%] max-w-md">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold">Disclaimer</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-black text-xl font-bold"
              aria-label="Close disclaimer"
            >
              ×
            </button>
          </div>
          <div className="mt-4 text-sm text-gray-700">
            <p>
              This tool is for informational and educational use only. It does not provide financial advice.
              All stock data is sourced from Yahoo Finance via the yfinance API and may not be accurate or current.
              You should not make investment decisions based solely on this app.
            </p>
            <p className="text-xs text-gray-500 mt-4">
              © {new Date().getFullYear()} Sequence Inc.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
