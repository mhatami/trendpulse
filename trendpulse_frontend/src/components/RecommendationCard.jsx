import React from "react";

export default function RecommendationCard({ recommendations, finalRating }) {
  if (!recommendations?.length) return null;

  const getColor = (rating) => {
    switch (rating) {
      case "Strong Buy":
        return "text-green-600";
      case "Buy":
      case "Moderate Buy":
        return "text-green-500";
      case "Hold":
        return "text-gray-600";
      case "Moderate Sell":
      case "Sell":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="mt-6 p-4 bg-white shadow rounded-md border border-gray-200">
      <h3 className="text-md font-semibold mb-2">Recommendation Summary</h3>

      <ul className="mb-4 list-disc pl-5 text-sm text-gray-800">
        {recommendations.map((rec, index) => (
          <li key={index}>
            <strong>{rec.indicator}:</strong> {rec.message}
          </li>
        ))}
      </ul>

      <div className="text-sm">
        <span className="font-semibold">Overall Recommendation: </span>
        <span className={`font-bold ${getColor(finalRating)}`}>
          {finalRating || "N/A"}
        </span>
      </div>
    </div>
  );
}
