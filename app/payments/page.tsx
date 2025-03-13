"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Button from "@/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
  faWallet,
  faHistory,
  faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons";
import {
  faGooglePay,
  faPaypal,
  faStripe,
} from "@fortawesome/free-brands-svg-icons";
import transactionApi from "@/utils/api/transaction"; // Use the updated transaction API with cookies
import { useTransactionContext } from "@/context/transactionContext";
import { motion, AnimatePresence } from "framer-motion"; // For animations

// Updated TypeScript Interface for Transaction Data
interface Transaction {
  transactionId: string; // Hashed transaction ID
  date: string; // Creation date for pending, payment date for history
  expenseName: string;
  groupName: string;
  owedFrom: string; // For pending payments (receiver name)
  amount: number;
  currency: string;
  action?: "Pay Now"; // Only for pending payments
  mode?: "UPI" | "PayPal" | "Stripe"; // Restrict to valid payment modes
  status?: "Pending" | "Success" | "Failed";
  paidTo?: string; // For transaction history (receiver name)
  paymentDate?: string; // For transaction history (updatedAt formatted)
}

export default function PaymentsPage() {
  const [pendingPayments, setPendingPayments] = useState<Transaction[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [selectedMode, setSelectedMode] = useState<
    "UPI" | "PayPal" | "Stripe" | null
  >(null);
  const [pin, setPin] = useState<string>("");
  const [userPin, setUserPin] = useState<string | null>(null);
  const { refreshExpenses } = useTransactionContext();

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const [pendingResponse, historyResponse] = await Promise.all([
        transactionApi.getPendingTransactions(),
        transactionApi.getTransactionHistory(),
      ]);
      setPendingPayments(pendingResponse.data.transactions || []);
      setTransactionHistory(historyResponse.data.transactions || []);

      // Fetch user's PIN (dummy or API call, since schema isn't modified)
      const dummyUserPin = "1234"; // Use a dummy PIN for testing
      setUserPin(dummyUserPin);
    } catch (err: any) {
      console.error("Error fetching payments:", err);
      setError(err.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleSelectMode = (mode: "UPI" | "PayPal" | "Stripe") => {
    setSelectedMode(mode);
    setIsModalOpen(false);
    setIsConfirmModalOpen(true);
  };

  const handleSettle = async () => {
    if (!selectedTransaction || !selectedMode || !pin) {
      setError("No transaction, payment mode, or PIN selected");
      return;
    }

    // Client-side PIN validation
    if (!userPin || pin !== userPin) {
      setError("Invalid PIN");
      return;
    }

    try {
      const response = await transactionApi.settleTransaction(
        selectedTransaction.transactionId,
        {
          status: "Success",
          mode: selectedMode,
        }
      );

      // Update state after settlement
      setPendingPayments((prev) =>
        prev.filter(
          (t) => t.transactionId !== selectedTransaction.transactionId
        )
      );
      setTransactionHistory((prev) => [
        ...prev,
        response.data.transaction as Transaction,
      ]);
      refreshExpenses();
      setIsConfirmModalOpen(false);
      setSelectedTransaction(null);
      setSelectedMode(null);
      setPin("");
      setError(null);
    } catch (err: any) {
      console.error("Error settling transaction:", err.response?.data || err);
      setError(err.response?.data?.message || "Failed to settle transaction");
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsConfirmModalOpen(false);
    setSelectedTransaction(null);
    setSelectedMode(null);
    setPin("");
    setError(null);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Modern loading state
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100 pt-20">
        <Sidebar activePage="payments" />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="flex flex-col items-center">
            {/* Pulse animation for loading indicator */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-purple-200 absolute animate-ping opacity-75"></div>
              <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center relative z-10">
                <svg
                  className="w-10 h-10 text-purple-500"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  ></path>
                </svg>
              </div>
            </div>
            <p className="mt-6 text-gray-600 font-medium text-center">
              Loading payments<span className="animate-pulse">...</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-100 pt-20">
        <Sidebar activePage="payments" />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full border border-red-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4 border-4 border-red-100">
                <svg
                  className="w-10 h-10 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  ></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Unable to Load Payments
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button
                text="Try Again"
                onClick={fetchPayments}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Format currency display
  const formatCurrency = (currency: string, amount: number) => {
    const symbol =
      currency === "INR"
        ? "₹"
        : currency === "EUR"
        ? "€"
        : currency === "USD"
        ? "$"
        : currency === "GBP"
        ? "£"
        : "¥";

    return `${symbol}${amount.toLocaleString()}`;
  };

  return (
    <div className="flex min-h-screen bg-gray-100 pt-20">
      <Sidebar activePage="payments" />

      <div className="flex-1 p-8">
        {/* Page Header */}
        <div className="flex items-center mb-8">
          <div className="bg-purple-500 w-12 h-12 rounded-full flex items-center justify-center shadow-lg mr-4">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              ></path>
            </svg>
          </div>
          <h1 className="text-5xl text-purple-500 font-bold">Payments</h1>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="flex items-center justify-between border-b p-5">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-orange-500 mr-2"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8v16m-7-8h14"
                ></path>
              </svg>
              <h2 className="text-lg font-semibold text-orange-500">
                Pending Payments
              </h2>
            </div>
          </div>

          {pendingPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-orange-50 text-left">
                    <th className="py-3 px-4 font-medium text-gray-600">
                      Creation Date
                    </th>
                    <th className="py-3 px-4 font-medium text-gray-600">
                      Expense Name
                    </th>
                    <th className="py-3 px-4 font-medium text-gray-600">
                      Group Name
                    </th>
                    <th className="py-3 px-4 font-medium text-gray-600">
                      Owed From
                    </th>
                    <th className="py-3 px-4 font-medium text-gray-600 text-right">
                      Amount Owed
                    </th>
                    <th className="py-3 px-4 font-medium text-gray-600 text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPayments.map((payment, index) => (
                    <tr
                      key={index}
                      className={`border-b hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="py-4 px-4">{payment.date}</td>
                      <td className="py-4 px-4 font-medium">
                        {payment.expenseName}
                      </td>
                      <td className="py-4 px-4">{payment.groupName}</td>
                      <td className="py-4 px-4 font-medium">
                        {payment.owedFrom}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-red-500">
                        {formatCurrency(payment.currency, payment.amount)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handlePayNow(payment)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-md transition-colors duration-200 font-medium"
                        >
                          Pay Now
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-center px-4">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 border-4 border-green-100">
                <svg
                  className="w-12 h-12 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                All Payments Settled!
              </h3>
              <p className="text-gray-500 max-w-md mb-6">
                Great job! You don't have any pending payments to settle. Check
                back later or create a new expense to split with friends.
              </p>
              <Button
                text="Create New Expense"
                onClick={() => (window.location.href = "/expenses/create")}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
              />
            </div>
          )}
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex items-center justify-between border-b p-5">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-purple-500 mr-2"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <h2 className="text-lg font-semibold text-purple-500">
                Transaction History
              </h2>
            </div>
          </div>

          {transactionHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-purple-50 text-left">
                    <th className="py-3 px-4 font-medium text-gray-600">
                      Transaction ID
                    </th>
                    <th className="py-3 px-4 font-medium text-gray-600">
                      Payment Date
                    </th>
                    <th className="py-3 px-4 font-medium text-gray-600">
                      Paid To
                    </th>
                    <th className="py-3 px-4 font-medium text-gray-600 text-right">
                      Amount
                    </th>
                    <th className="py-3 px-4 font-medium text-gray-600">
                      Payment Mode
                    </th>
                    <th className="py-3 px-4 font-medium text-gray-600">
                      Payment Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactionHistory.map((payment, index) => (
                    <tr
                      key={index}
                      className={`border-b hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="py-4 px-4 text-sm text-gray-500">
                        {payment.transactionId.substring(0, 12)}...
                      </td>
                      <td className="py-4 px-4">{payment.paymentDate}</td>
                      <td className="py-4 px-4 font-medium">
                        {payment.paidTo}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-green-500">
                        {formatCurrency(payment.currency, payment.amount)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <FontAwesomeIcon
                            icon={
                              payment.mode === "UPI"
                                ? faGooglePay
                                : payment.mode === "PayPal"
                                ? faPaypal
                                : faStripe
                            }
                            className="text-gray-600 mr-2"
                          />
                          <span>{payment.mode || "N/A"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {payment.status === "Success" ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              ></path>
                            </svg>
                            Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                              ></path>
                            </svg>
                            Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-center px-4">
              <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mb-6 border-4 border-purple-100">
                <svg
                  className="w-12 h-12 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No Transaction History Yet
              </h3>
              <p className="text-gray-500 max-w-md">
                You haven't completed any transactions yet. Once you settle
                payments, they will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Payment Options Modal */}
        <AnimatePresence>
          {isModalOpen && selectedTransaction && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50"
                onClick={handleCancel}
              ></motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="bg-white rounded-lg shadow-xl p-6 w-[500px] max-w-[90%] z-50"
              >
                {/* Header with Icon */}
                <div className="flex flex-col items-center mb-6">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      ></path>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Settle Payment
                  </h2>
                </div>

                {/* Payment Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-gray-600">Paying:</p>
                    <p className="text-right font-medium text-purple-700">
                      {selectedTransaction.owedFrom}
                    </p>

                    <p className="text-gray-600">Amount:</p>
                    <p className="text-right font-bold text-green-600">
                      {formatCurrency(
                        selectedTransaction.currency,
                        selectedTransaction.amount
                      )}
                    </p>

                    <p className="text-gray-600">Expense:</p>
                    <p className="text-right">
                      {selectedTransaction.expenseName}
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 text-center mb-4">
                  Select a payment method:
                </p>

                {/* Payment Options */}
                <div className="space-y-3 mb-6">
                  {/* UPI Button */}
                  <button
                    onClick={() => handleSelectMode("UPI")}
                    className="w-full py-3 px-4 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors duration-200 flex items-center justify-center"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                        fill="#FF6B00"
                        stroke="#FF6B00"
                        strokeWidth="2"
                      />
                      <path
                        d="M7.5 12.5L10.5 15.5L16.5 9.5"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    UPI
                  </button>

                  {/* PayPal Button */}
                  <button
                    onClick={() => handleSelectMode("PayPal")}
                    className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200 flex items-center justify-center"
                  >
                    <FontAwesomeIcon icon={faPaypal} className="mr-2" />
                    PayPal
                  </button>

                  {/* Stripe Button */}
                  <button
                    onClick={() => handleSelectMode("Stripe")}
                    className="w-full py-3 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors duration-200 flex items-center justify-center"
                  >
                    <FontAwesomeIcon icon={faStripe} className="mr-2" />
                    Stripe
                  </button>
                </div>

                {/* Cancel Button */}
                <button
                  onClick={handleCancel}
                  className="w-full py-2.5 px-4 rounded-lg border border-red-500 text-red-500 hover:bg-red-50 font-medium transition-colors duration-200 flex items-center justify-center"
                >
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                  Cancel
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Payment Confirmation Modal */}
        <AnimatePresence>
          {isConfirmModalOpen && selectedTransaction && selectedMode && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50"
                onClick={handleCancel}
              ></motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="bg-white rounded-lg shadow-xl p-6 w-[400px] max-w-[90%] z-50"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  Confirm Payment
                </h2>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-gray-600">Method:</p>
                    <p className="text-right font-medium flex items-center justify-end">
                      {selectedMode === "UPI" ? (
                        <svg
                          className="w-4 h-4 mr-1.5"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                            fill="#FF6B00"
                          />
                          <path
                            d="M7.5 12.5L10.5 15.5L16.5 9.5"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <FontAwesomeIcon
                          icon={selectedMode === "PayPal" ? faPaypal : faStripe}
                          className="mr-1.5"
                        />
                      )}
                      {selectedMode}
                    </p>

                    <p className="text-gray-600">Amount:</p>
                    <p className="text-right font-bold text-green-600">
                      {formatCurrency(
                        selectedTransaction.currency,
                        selectedTransaction.amount
                      )}
                    </p>

                    <p className="text-gray-600">To:</p>
                    <p className="text-right">{selectedTransaction.owedFrom}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter your 4-digit PIN to confirm:
                  </label>
                  <div className="flex gap-2 justify-center">
                    {[...Array(4)].map((_, i) => (
                      <input
                        key={i}
                        type="password"
                        maxLength={1}
                        value={pin[i] || ""}
                        onChange={(e) => {
                          const newPin = pin.split("");
                          newPin[i] = e.target.value;
                          setPin(newPin.join(""));
                          // Auto-focus next input
                          if (e.target.value && i < 3) {
                            const nextInput = document.getElementById(
                              `pin-${i + 1}`
                            );
                            if (nextInput) nextInput.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          // Handle backspace to go to previous input
                          if (e.key === "Backspace" && !pin[i] && i > 0) {
                            const prevInput = document.getElementById(
                              `pin-${i - 1}`
                            );
                            if (prevInput) prevInput.focus();
                          }
                        }}
                        id={`pin-${i}`}
                        className="w-12 h-12 border-2 border-gray-300 rounded-md text-center text-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    ))}
                  </div>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-center text-sm mt-2"
                    >
                      {error}
                    </motion.p>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleCancel}
                    className="flex-1 py-2.5 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSettle}
                    disabled={!pin || pin.length < 4}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-white font-medium transition-colors duration-200 flex items-center justify-center ${
                      !pin || pin.length < 4
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {!pin || pin.length < 4 ? (
                      "Enter PIN"
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4 mr-1.5"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path>
                        </svg>
                        Confirm
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
