import React, { useState, useEffect } from "react";
import expenseApi from "@/utils/api/expense";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBillWave,
  faHourglassHalf,
  faCheckCircle,
  faSync,
} from "@fortawesome/free-solid-svg-icons";

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
  setSelectedCurrency: (currency: Currency) => void;
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
  const [isUpdatingRates, setIsUpdatingRates] = useState(false);

  const currencySymbols: Record<Currency, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };

  // Log summary data for debugging
  useEffect(() => {
    console.log("Summary data in ExpenseCard:", summary);
  }, [summary]);

  // Fetch summary on mount
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
  }, [fetchSummary]);

  // Update exchange rates function
  const updateExchangeRates = async () => {
    setIsUpdatingRates(true);
    try {
      await expenseApi.updateExchangeRates();
      await fetchSummary();
    } catch (error) {
      console.error("Error updating exchange rates:", error);
    } finally {
      setIsUpdatingRates(false);
    }
  };

  // Ensure summary is not null with a type guard
  if (!summary) {
    return (
      <div className="text-center p-8">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-300 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 w-32 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  // Get current summary or provide default values
  const currentSummary: Summary = summary[selectedCurrency] || {
    totalExpenses: 0,
    totalPending: 0,
    totalSettled: 0,
  };

  // Calculate the settled amount directly from summary data
  // This ensures consistency with backend calculations
  const settledAmount = currentSummary.totalSettled;

  return (
    <div className="mb-8">
      {/* Currency selector */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <label
            htmlFor="currency-select"
            className="text-gray-700 font-medium"
          >
            Display Currency:
          </label>
          <select
            id="currency-select"
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value as Currency)}
            className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="JPY">JPY (¥)</option>
          </select>
        </div>
        {/* <button
          onClick={updateExchangeRates}
          disabled={isUpdatingRates}
          className="flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors duration-300 disabled:opacity-70"
        >
          <FontAwesomeIcon
            icon={faSync}
            className={isUpdatingRates ? "animate-spin" : ""}
          />
          <span>{isUpdatingRates ? "Updating..." : "Update Rates"}</span>
        </button> */}
      </div>

      {/* Expense Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Expenses Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 border border-gray-200">
          <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-pink-500"></div>
          <div className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Total Expenses
              </h2>
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faMoneyBillWave}
                  className="text-red-500 text-lg"
                />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {currencySymbols[selectedCurrency]}
              {currentSummary.totalExpenses.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              All transactions where you're involved
            </p>
          </div>
        </div>

        {/* Pending Payments Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 border border-gray-200">
          <div className="h-1.5 w-full bg-gradient-to-r from-yellow-400 to-orange-500"></div>
          <div className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Pending Payments
              </h2>
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faHourglassHalf}
                  className="text-yellow-500 text-lg"
                />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {currencySymbols[selectedCurrency]}
              {currentSummary.totalPending.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Your net pending balance
            </p>
          </div>
        </div>

        {/* Settled Payments Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 border border-gray-200">
          <div className="h-1.5 w-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
          <div className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Settled Payments
              </h2>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-green-500 text-lg"
                />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {currencySymbols[selectedCurrency]}
              {settledAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-sm text-gray-500 mt-2">Completed transactions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
