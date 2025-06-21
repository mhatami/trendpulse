import React, { createContext, useContext, useState } from "react";

const SymbolContext = createContext();

export const SymbolProvider = ({ children }) => {
  const [symbol, setSymbol] = useState("");
  const [refreshKey, setRefreshKey] = useState(0); // Add this

  const updateSymbol = (newSymbol) => {
    if (newSymbol === symbol) {
      // Force refresh
      setRefreshKey(prev => prev + 1);
    } else {
      setSymbol(newSymbol);
      setRefreshKey(prev => prev + 1); // Also refresh on new symbol
    }
  };

  return (
    <SymbolContext.Provider value={{ symbol, setSymbol: updateSymbol, refreshKey }}>
      {children}
    </SymbolContext.Provider>
  );
};

export const useSymbol = () => useContext(SymbolContext);
