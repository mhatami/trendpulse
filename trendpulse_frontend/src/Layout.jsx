import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import SymbolSearch from "./components/SymbolSearch";
import { useSymbol } from "./contexts/SymbolContext";
import DisclaimerModal from "./components/DisclaimerModal"; // ✅ Import modal

export default function Layout() {
  const { setSymbol } = useSymbol();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = (input) => {
    if (!input.trim()) return;
    setSymbol(input.toUpperCase());

    if (location.pathname === "/") {
      navigate("/overview");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top section with search and tabs */}
      <div className="p-6 max-w-5xl mx-auto w-full">
        <div className="mb-4">
          <SymbolSearch onSubmit={handleSearch} />
        </div>

        <div className="mb-6 border-b flex gap-4">
          <Link
            to="/overview"
            className={`pb-2 px-4 border-b-2 font-medium ${
              location.pathname === "/overview"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600"
            }`}
          >
            Overview
          </Link>
          <Link
            to="/analysis"
            className={`pb-2 px-4 border-b-2 font-medium ${
              location.pathname === "/analysis"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600"
            }`}
          >
            Analysis
          </Link>
        </div>

        <Outlet />
      </div>

      {/* Footer with modal link */}
      <footer className="text-center text-xs text-gray-500 py-4 border-t">
        <DisclaimerModal />
      </footer>
    </div>
  );
}
