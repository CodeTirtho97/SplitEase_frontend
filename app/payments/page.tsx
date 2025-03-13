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
  faExclamationCircle,
  faCreditCard,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import {
  faGooglePay,
  faPaypal,
  faStripe,
} from "@fortawesome/free-brands-svg-icons";
import transactionApi from "@/utils/api/transaction"; // Use the updated transaction API
import { useTransactionContext } from "@/context/transactionContext";
import { motion } from "framer-motion"; // Add framer-motion for animations

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

// Animation variants for empty states
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

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
    return (
      <div className="flex min-h-screen bg-gray-100 pt-20">
        <Sidebar activePage="payments" />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 font-medium">
              Loading transactions...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-100 pt-20">
        <Sidebar activePage="payments" />
        <div className="flex-1 p-8 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <FontAwesomeIcon
                  icon={faExclamationCircle}
                  className="text-4xl text-red-500"
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button
                text="Try Again"
                onClick={fetchPayments}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md transition duration-300"
              />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 pt-20">
      {/* Sidebar */}
      <Sidebar activePage="payments" />

      <div className="flex-1 p-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <FontAwesomeIcon
                icon={faWallet}
                className="text-white text-2xl"
              />
            </div>
            <h1 className="text-5xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text font-bold">
              Payments
            </h1>
          </div>
        </motion.div>

        {/* 🔻 PENDING PAYMENTS TABLE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white shadow-lg rounded-lg p-6 mt-6"
        >
          <div className="flex items-center mb-4">
            <FontAwesomeIcon
              icon={faMoneyBillWave}
              className="text-orange-600 mr-2"
            />
            <h2 className="text-lg font-semibold text-orange-700">
              Pending Payments
            </h2>
          </div>

          {pendingPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-orange-50 to-orange-100">
                    <th className="py-3 px-4 text-left text-gray-600 font-semibold rounded-tl-md">
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
                    <th className="py-3 px-4 text-center text-gray-600 font-semibold rounded-tr-md">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPayments.map((payment, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
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
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm transition-all duration-300 transform hover:scale-105"
                        />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="py-16 flex flex-col items-center justify-center"
            >
              <motion.div
                variants={itemVariants}
                className="w-32 h-32 bg-orange-50 rounded-full flex items-center justify-center mb-6"
              >
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-6xl text-green-500"
                />
              </motion.div>
              <motion.h3
                variants={itemVariants}
                className="text-2xl font-bold text-gray-800 mb-2"
              >
                All Payments Settled!
              </motion.h3>
              <motion.p
                variants={itemVariants}
                className="text-gray-500 text-center max-w-md mb-6"
              >
                Great job! You don't have any pending payments to settle. Check
                back later or create a new expense to split with friends.
              </motion.p>
              <motion.div variants={itemVariants}>
                <Button
                  text="Create New Expense"
                  onClick={() => (window.location.href = "/expenses/create")}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                />
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* 🔻 TRANSACTION HISTORY TABLE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white shadow-lg rounded-lg p-6 mt-6"
        >
          <div className="flex items-center mb-4">
            <FontAwesomeIcon
              icon={faHistory}
              className="text-violet-600 mr-2"
            />
            <h2 className="text-lg font-semibold text-violet-700">
              Transaction History
            </h2>
          </div>

          {transactionHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-violet-50 to-violet-100">
                    <th className="py-3 px-4 text-left text-gray-600 font-semibold rounded-tl-md">
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
                    <th className="py-3 px-4 text-left text-gray-600 font-semibold rounded-tr-md">
                      Payment Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactionHistory.map((payment, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {payment.transactionId.substring(0, 15)}...
                      </td>
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
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                            <FontAwesomeIcon icon={faCheckCircle} />
                            Success
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                            <FontAwesomeIcon icon={faTimesCircle} />
                            Failed
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="py-16 flex flex-col items-center justify-center"
            >
              <motion.div
                variants={itemVariants}
                className="w-32 h-32 bg-violet-50 rounded-full flex items-center justify-center mb-6"
              >
                <FontAwesomeIcon
                  icon={faHistory}
                  className="text-6xl text-violet-400"
                />
              </motion.div>
              <motion.h3
                variants={itemVariants}
                className="text-2xl font-bold text-gray-800 mb-2"
              >
                No Transaction History Yet
              </motion.h3>
              <motion.p
                variants={itemVariants}
                className="text-gray-500 text-center max-w-md mb-4"
              >
                You haven't completed any transactions yet. Once you settle
                payments, they will appear here.
              </motion.p>
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-lg mt-6"
              >
                <div className="flex flex-col items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                    <FontAwesomeIcon
                      icon={faMoneyBillWave}
                      className="text-purple-500"
                    />
                  </div>
                  <p className="text-gray-600 text-sm text-center">
                    Settle pending payments
                  </p>
                </div>
                <div className="flex flex-col items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <FontAwesomeIcon
                      icon={faCreditCard}
                      className="text-blue-500"
                    />
                  </div>
                  <p className="text-gray-600 text-sm text-center">
                    Choose payment method
                  </p>
                </div>
                <div className="flex flex-col items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <FontAwesomeIcon
                      icon={faShieldAlt}
                      className="text-green-500"
                    />
                  </div>
                  <p className="text-gray-600 text-sm text-center">
                    Safe & secure transactions
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* Payment Options Modal */}
        {isModalOpen && selectedTransaction && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-2xl shadow-2xl p-6 w-[500px] max-w-[90%]"
            >
              {/* Header with Gradient and Icon */}
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md mb-4">
                  <FontAwesomeIcon
                    icon={faWallet}
                    className="text-white text-3xl"
                  />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Settle Payment
              </h2>

              {/* Payment Details */}
              <div className="mb-6 bg-gray-50 p-4 rounded-xl">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Paying:</span>
                  <span className="font-semibold text-indigo-700">
                    {selectedTransaction.owedFrom}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Amount:</span>
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
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expense:</span>
                  <span className="font-medium">
                    {selectedTransaction.expenseName}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 text-center mb-4">
                Select a payment method:
              </p>

              {/* Payment Options (Modern Buttons) */}
              <div className="grid gap-4 mb-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectMode("UPI")}
                  className="w-full py-3 rounded-xl text-lg font-medium shadow-md transition-all duration-200 ease-in-out hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500 flex items-center justify-center gap-3"
                >
                  <FontAwesomeIcon icon={faGooglePay} className="text-xl" />
                  UPI
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectMode("PayPal")}
                  className="w-full py-3 rounded-xl text-lg font-medium shadow-md transition-all duration-200 ease-in-out hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 flex items-center justify-center gap-3"
                >
                  <FontAwesomeIcon icon={faPaypal} className="text-xl" />
                  PayPal
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectMode("Stripe")}
                  className="w-full py-3 rounded-xl text-lg font-medium shadow-md transition-all duration-200 ease-in-out hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500 flex items-center justify-center gap-3"
                >
                  <FontAwesomeIcon icon={faStripe} className="text-xl" />
                  Stripe
                </motion.button>
              </div>

              {/* Cancel Button (Modern) */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCancel}
                className="w-full py-2 text-red-500 hover:text-red-700 text-lg font-medium rounded-xl border border-red-500 hover:border-red-700 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                ❌ Cancel
              </motion.button>
            </motion.div>
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
