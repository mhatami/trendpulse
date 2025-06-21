import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SymbolProvider } from "./contexts/SymbolContext";
import Layout from "./Layout";
import FinancialOverview from "./pages/FinancialOverview";
import FinancialAnalysis from "./pages/FinancialAnalysis";
import Home from "./pages/Home";

export default function App() {
  return (
    <SymbolProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} /> {/* 👈 default page */}
            <Route path="/overview" element={<FinancialOverview />} />
            <Route path="/analysis" element={<FinancialAnalysis />} />
            <Route
              path="*"
              element={
                <p className="text-gray-500">
                  Please enter a stock symbol to begin.
                </p>
              }
            />
          </Route>
        </Routes>
      </Router>
    </SymbolProvider>
  );
}
