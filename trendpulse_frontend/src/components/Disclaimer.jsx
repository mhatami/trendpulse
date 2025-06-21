// components/Disclaimer.jsx
export default function Disclaimer() {
  return (
    <div className="text-xs text-gray-500 mt-6 space-y-2">
      <p>
        <strong>Disclaimer:</strong> This tool is for informational and educational use only. It does not provide financial advice. Financial data is sourced from Yahoo Finance via yfinance and is for demonstration purposes only.
      </p>
      <p>
        &copy; {new Date().getFullYear()} Sequence Inc. All rights reserved.
      </p>
    </div>
  );
}
