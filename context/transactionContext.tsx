"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import transactionApi from "@/utils/api/transaction";

interface Transaction {
  transactionId: string;
  date: string;
  expenseName: string;
  groupName: string;
  owedFrom: string;
  amount: number;
  currency: string;
  action?: "Pay Now";
  mode?: "UPI" | "PayPal" | "Stripe";
  status?: "Pending" | "Success" | "Failed";
  paidTo?: string;
  paymentDate?: string;
}

interface TransactionContextType {
  pendingTransactions: Transaction[];
  transactionHistory: Transaction[];
  isLoading: boolean;
  refreshTransactions: () => Promise<void>;
  settleTransaction: (
    transactionId: string,
    data: { status: "Success" | "Failed"; mode: "UPI" | "PayPal" | "Stripe" }
  ) => Promise<void>;
  /** @deprecated use refreshTransactions */
  refreshExpenses: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined
);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pendingRes, historyRes] = await Promise.all([
        transactionApi.getPendingTransactions(),
        transactionApi.getTransactionHistory(),
      ]);
      setPendingTransactions(pendingRes.data.transactions ?? []);
      setTransactionHistory(historyRes.data.transactions ?? []);
    } catch (err) {
      console.error("Failed to refresh transactions:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const settleTransaction = useCallback(
    async (
      transactionId: string,
      data: { status: "Success" | "Failed"; mode: "UPI" | "PayPal" | "Stripe" }
    ) => {
      await transactionApi.settleTransaction(transactionId, data);
      await refreshTransactions();
    },
    [refreshTransactions]
  );

  const value: TransactionContextType = {
    pendingTransactions,
    transactionHistory,
    isLoading,
    refreshTransactions,
    settleTransaction,
    refreshExpenses: refreshTransactions,
  };

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
