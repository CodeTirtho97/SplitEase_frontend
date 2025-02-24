"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Button from "@/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import {
  faGooglePay,
  faPaypal,
  faStripe,
} from "@fortawesome/free-brands-svg-icons";
import transactionApi from "@/utils/api/transaction"; // Use the new transaction API
import { useTransactionContext } from "@/context/transactionContext";

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
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // New modal for payment confirmation
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [selectedMode, setSelectedMode] = useState<
    "UPI" | "PayPal" | "Stripe" | null
  >(null);
  const [pin, setPin] = useState<string>(""); // Add state for PIN input
  const [userPin, setUserPin] = useState<string | null>(null); // Store the user's actual PIN (fetched or dummy)
  const { refreshExpenses } = useTransactionContext(); // Use context to trigger refresh

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
      setUserPin(dummyUserPin); // Set a hardcoded PIN for testing; replace with API call if needed
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
    setIsConfirmModalOpen(true); // Open confirmation modal
  };

  const handleSettle = async () => {
    if (!selectedTransaction || !selectedMode || !pin) {
      setError("No transaction, payment mode, or PIN selected");
      return;
    }

    // Client-side PIN validation (simulate or match with fetched/dummy PIN)
    if (!userPin || pin !== userPin) {
      setError("Invalid PIN");
      return;
    }

    try {
      // Simulate payment gateway call without PIN in request
      console.log("Settling transaction with:", {
        transactionId: selectedTransaction.transactionId,
        mode: selectedMode,
      }); // Debug the request payload
      const response = await transactionApi.settleTransaction(
        selectedTransaction.transactionId, // Hashed string, now encoded
        {
          status: "Success", // Default to Success; you can add logic for Failed
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
      refreshExpenses(); // Trigger refresh of Expenses data
      setIsConfirmModalOpen(false);
      setSelectedTransaction(null);
      setSelectedMode(null);
      setPin(""); // Reset PIN
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
    setPin(""); // Reset PIN
    setError(null);
  };

  useEffect(() => {
    fetchPayments();
  }, []); // Fetch on mount only (no real-time updates, per your request)

  if (loading) {
    return <div>Loading payments...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 pt-20">
      {/* Sidebar */}
      <Sidebar activePage="payments" />

      <div className="flex-1 p-8">
        {/* Page Header */}
        <div className="flex items-center mb-6">
          <h1 className="text-5xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            Payments
          </h1>
        </div>
        {/* 🔻 PENDING PAYMENTS TABLE */}
        <div className="bg-white shadow-lg rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-orange-700 mb-4">
            Pending Payments
          </h2>

          {pendingPayments.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">
                    Creation Date
                  </th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">
                    Expense Name
                  </th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">
                    Group Name
                  </th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">
                    Owed From
                  </th>
                  <th className="py-3 px-4 text-right text-gray-600 font-semibold">
                    Amount Owed
                  </th>
                  <th className="py-3 px-4 text-center text-gray-600 font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingPayments.map((payment, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4">{payment.date}</td>
                    <td className="py-3 px-4 font-semibold">
                      {payment.expenseName}
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      {payment.groupName}
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      {payment.owedFrom}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-red-600">
                      {payment.currency === "INR"
                        ? "₹"
                        : payment.currency === "EUR"
                        ? "€"
                        : payment.currency === "USD"
                        ? "$"
                        : payment.currency === "GBP"
                        ? "£"
                        : "¥"}
                      {payment.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        text="Pay Now"
                        onClick={() => handlePayNow(payment)}
                        className="border text-blue-600 border-blue-500 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-md"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 italic text-center">
              ✅ No pending payments!
            </p>
          )}
        </div>

        {/* 🔻 TRANSACTION HISTORY TABLE */}
        <div className="bg-white shadow-lg rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-violet-700 mb-4">
            Transaction History
          </h2>

          {transactionHistory.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">
                    Transaction ID
                  </th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">
                    Payment Date
                  </th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">
                    Paid To
                  </th>
                  <th className="py-3 px-4 text-right text-gray-600 font-semibold">
                    Amount
                  </th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">
                    Payment Mode
                  </th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">
                    Payment Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactionHistory.map((payment, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4">{payment.transactionId}</td>
                    <td className="py-3 px-4">{payment.paymentDate}</td>
                    <td className="py-3 px-4 font-semibold">
                      {payment.paidTo}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-green-600">
                      {payment.currency === "INR"
                        ? "₹"
                        : payment.currency === "EUR"
                        ? "€"
                        : payment.currency === "USD"
                        ? "$"
                        : payment.currency === "GBP"
                        ? "£"
                        : "¥"}
                      {payment.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={
                          payment.mode === "UPI"
                            ? faGooglePay
                            : payment.mode === "PayPal"
                            ? faPaypal
                            : faStripe
                        }
                        className="text-gray-500"
                      />
                      {payment.mode || "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      {payment.status === "Success" ? (
                        <span className="text-green-600 font-semibold flex items-center gap-2">
                          <FontAwesomeIcon icon={faCheckCircle} />
                          Success
                        </span>
                      ) : (
                        <span className="text-red-600 font-semibold flex items-center gap-2">
                          <FontAwesomeIcon icon={faTimesCircle} />
                          Failed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 italic text-center">
              📌 No past transactions found.
            </p>
          )}
        </div>

        {/* Payment Options Modal */}
        {isModalOpen && selectedTransaction && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-60">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-[500px] max-w-[90%] transform transition-all duration-300 ease-in-out hover:shadow-3xl animate-slideIn">
              {/* Header with Gradient and Icon */}
              <div className="flex items-center justify-center mb-4">
                <span className="inline-block p-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full text-white">
                  💸
                </span>
                <h2 className="text-2xl font-bold text-gray-900 ml-2">
                  Settle Payment
                </h2>
              </div>

              {/* Payment Details */}
              <p className="text-lg text-gray-700 mb-6 text-center">
                Paying{" "}
                <span className="font-semibold text-indigo-700">
                  {selectedTransaction.owedFrom}
                </span>{" "}
                an amount of{" "}
                <span className="text-green-600 font-bold">
                  {selectedTransaction.currency === "INR"
                    ? "₹"
                    : selectedTransaction.currency === "EUR"
                    ? "€"
                    : selectedTransaction.currency === "USD"
                    ? "$"
                    : selectedTransaction.currency === "GBP"
                    ? "£"
                    : "¥"}
                  {selectedTransaction.amount.toLocaleString()}
                </span>
              </p>

              {/* Payment Options (Modern Buttons) */}
              <div className="grid gap-4 mb-6">
                {["UPI", "PayPal", "Stripe"].map((method) => (
                  <button
                    key={method}
                    onClick={() =>
                      handleSelectMode(method as "UPI" | "PayPal" | "Stripe")
                    }
                    className={`w-full py-3 rounded-xl text-lg font-medium shadow-md transition-all duration-200 ease-in-out hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      method === "UPI"
                        ? "bg-orange-600 text-white hover:bg-orange-700"
                        : method === "PayPal"
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    } flex items-center justify-center gap-3`}
                  >
                    <FontAwesomeIcon
                      icon={
                        method === "UPI"
                          ? faGooglePay
                          : method === "PayPal"
                          ? faPaypal
                          : faStripe
                      }
                      className="text-xl"
                    />
                    {method}
                  </button>
                ))}
              </div>

              {/* Cancel Button (Modern) */}
              <button
                onClick={handleCancel}
                className="w-full py-2 text-red-500 hover:text-red-700 text-lg font-medium rounded-xl border border-red-500 hover:border-red-700 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        )}

        {/* Payment Confirmation Modal (Dummy Gateway with PIN Check in Frontend) */}
        {isConfirmModalOpen && selectedTransaction && selectedMode && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-60">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-[400px] max-w-[90%] transform transition-all duration-300 ease-in-out hover:shadow-3xl animate-slideIn">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                Confirm Payment
              </h2>
              <p className="text-lg text-gray-700 mb-4 text-center">
                Pay {selectedTransaction.owedFrom} an amount of{" "}
                {selectedTransaction.currency === "INR"
                  ? "₹"
                  : selectedTransaction.currency === "EUR"
                  ? "€"
                  : selectedTransaction.currency === "USD"
                  ? "$"
                  : selectedTransaction.currency === "GBP"
                  ? "£"
                  : "¥"}
                {selectedTransaction.amount.toLocaleString()} using{" "}
                {selectedMode}?
              </p>
              <input
                type="password"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full border p-2 rounded-md mb-4"
              />
              {error && (
                <p className="text-red-500 text-center mb-4">{error}</p>
              )}
              <div className="flex justify-between">
                <Button
                  text="Cancel"
                  onClick={handleCancel}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl"
                />
                <Button
                  text="Confirm"
                  onClick={handleSettle}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl"
                  disabled={!pin}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
