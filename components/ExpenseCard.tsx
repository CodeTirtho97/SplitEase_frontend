import React, { useState, useEffect } from "react";
import expenseApi from "@/utils/api/expense";

// Define a type for currencies
type Currency = "INR" | "USD" | "EUR" | "GBP" | "JPY";

// Define the summary structure for a single currency
interface Summary {
  totalExpenses: number;
  totalPending: number;
  totalSettled: number;
}

interface DashboardCardsProps {
  expenses: any[]; // Adjust to match Expense interface if needed
  summary: { [key in Currency]?: Summary } | null;
  fetchSummary: () => Promise<void>;
  error: string | null;
  selectedCurrency: Currency;
  setSelectedCurrency: (currency: Currency) => void; // Ensure this is defined
}

export default function DashboardCards({
  expenses,
  summary,
  fetchSummary,
  error,
  selectedCurrency,
  setSelectedCurrency,
}: DashboardCardsProps) {
  const [loadingSummary, setLoadingSummary] = useState(false);

  const currencySymbols: Record<Currency, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };

  // Fetch summary only on mount (no real-time updates on expenses change)
  useEffect(() => {
    const loadSummary = async () => {
      setLoadingSummary(true);
      try {
        await fetchSummary();
      } catch (err) {
        console.error("Error fetching summary on mount:", err);
      } finally {
        setLoadingSummary(false);
      }
    };
    loadSummary();

    // Cleanup function (optional, but included for consistency)
    return () => {};
  }, []); // Empty dependency array ensures one-time fetch on mount only

  const updateExchangeRates = async () => {
    try {
      await expenseApi.updateExchangeRates(); // Assuming you add this to expenseApi
      await fetchSummary(); // Refresh summary with updated rates
    } catch (error) {
      console.error("Error updating exchange rates:", error);
    }
  };

  if (loadingSummary) {
    return <div>Loading summary...</div>;
  }

  // if (error) {
  //   return (
  //     <div className="text-red-500 text-center">
  //       {error}
  //       <button
  //         onClick={updateExchangeRates}
  //         className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
  //       >
  //         Update Exchange Rates
  //       </button>
  //     </div>
  //   );
  // }

  // Ensure summary is not null with a type guard
  if (!summary) {
    return (
      <div className="text-red-500 text-center">No summary data available</div>
    );
  }

  const currentSummary: Summary = summary[selectedCurrency] || {
    totalExpenses: 0,
    totalPending: 0,
    totalSettled: 0,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Currency Dropdown and Update Button */}
      <div className="col-span-1 md:col-span-3 flex justify-between mt-4">
        <select
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value as Currency)}
          className="border p-2 rounded-md shadow-md"
        >
          <option value="INR">INR (₹)</option>
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
          <option value="JPY">JPY (¥)</option>
        </select>
        {/* <button
          onClick={updateExchangeRates}
          className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Update Exchange Rates
        </button> */}
      </div>
      <div className="bg-white shadow-lg rounded-lg p-6 text-center">
        <h2 className="text-lg font-semibold text-gray-700">Total Expenses</h2>
        <p className="text-2xl font-bold text-red-500">
          {currencySymbols[selectedCurrency]}
          {currentSummary.totalExpenses.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>
      <div className="bg-white shadow-lg rounded-lg p-6 text-center">
        <h2 className="text-lg font-semibold text-gray-700">
          Pending Payments
        </h2>
        <p className="text-2xl font-bold text-yellow-500">
          {currencySymbols[selectedCurrency]}
          {currentSummary.totalPending.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>
      <div className="bg-white shadow-lg rounded-lg p-6 text-center">
        <h2 className="text-lg font-semibold text-gray-700">
          Settled Payments
        </h2>
        <p className="text-2xl font-bold text-green-500">
          {currencySymbols[selectedCurrency]}
          {currentSummary.totalSettled.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>
    </div>
  );
}
