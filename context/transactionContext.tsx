"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface TransactionContextType {
  refreshExpenses: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined
);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshExpenses = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const value = { refreshExpenses };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactionContext() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error(
      "useTransactionContext must be used within a TransactionProvider"
    );
  }
  return context;
}
