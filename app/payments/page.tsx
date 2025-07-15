"use client";

import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
import Sidebar from "@/components/Sidebar";
import Button from "@/components/Button";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
  faWallet,
  faHistory,
  faMoneyBillWave,
  faShieldAlt,
  faLock,
  faChevronRight,
  faExclamationTriangle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import {
  faGooglePay,
  faPaypal,
  faStripe,
  faCcVisa,
  faCcMastercard,
} from "@fortawesome/free-brands-svg-icons";
import transactionApi from "@/utils/api/transaction"; // Updated transaction API with cookies
import UnifiedLoadingScreen from "@/components/UnifiedLoadingScreen";
import { useTransactionContext } from "@/context/transactionContext";
import { useSocket } from "@/context/socketContext";
import NotificationPanel from "@/components/NotificationPanel";
import ConnectionStatus from "@/components/ConnectionStatus";
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

// Full-page loader component
const LoadingScreen = () => {
  return (
    <UnifiedLoadingScreen
      message="Loading Your Payments"
      section="payments"
      showTips={true}
    />
  );
};

// Error state component
const ErrorScreen = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
      <Sidebar activePage="payments" />
      <div className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-2xl p-10 max-w-lg w-full border border-red-100 overflow-hidden"
        >
          <div className="flex flex-col items-center text-center relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-50 rounded-full -ml-16 -mb-16"></div>

            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 relative z-10 border-4 border-red-100">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-4xl text-red-500"
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-3 relative z-10">
              Unable to Load Payment Data
            </h2>
            <p className="text-gray-600 mb-8 relative z-10">{error}</p>

            <Button
              text="Try Again"
              onClick={onRetry}
              className="relative z-10 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default function PaymentsPage() {
  const { addEventListener, removeEventListener } = useSocket();
  const router = useRouter();
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
  const [processingPayment, setProcessingPayment] = useState(false);
  const { refreshExpenses } = useTransactionContext();

  useEffect(() => {
    console.log("Socket context:", { addEventListener, removeEventListener });
  }, [addEventListener, removeEventListener]);

  // Use useCallback to memoize the fetchPayments function
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pendingResponse, historyResponse] = await Promise.all([
        transactionApi.getPendingTransactions(),
        transactionApi.getTransactionHistory(),
      ]);
      setPendingPayments(pendingResponse.data.transactions || []);
      setTransactionHistory(historyResponse.data.transactions || []);

      console.log("API responses:", { pendingResponse, historyResponse });

      // Fetch user's PIN
      const dummyUserPin = "1234";
      setUserPin(dummyUserPin);
    } catch (err: any) {
      console.error("Error fetching payments:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load payment data. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since it doesn't depend on any props or state

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
      setError("Required payment information is missing.");
      return;
    }

    // Client-side PIN validation
    if (!userPin || pin !== userPin) {
      setError("Invalid security PIN. Please try again.");
      return;
    }

    try {
      setProcessingPayment(true);
      setError(null);

      // Add a small delay to simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const response = await transactionApi.settleTransaction(
        selectedTransaction.transactionId,
        {
          status: "Success",
          mode: selectedMode,
        }
      );

      // No need to manually update state here as WebSocket events will trigger update
      // The data will be refreshed when we receive the transaction_settled event
      // Just close the modals and reset state
      setIsConfirmModalOpen(false);
      setSelectedTransaction(null);
      setSelectedMode(null);
      setPin("");
      setError(null);

      // We still call refreshExpenses since it might not be automatically triggered
      refreshExpenses();

      // Add an explicit fetch call to update the UI immediately
      fetchPayments();
    } catch (err: any) {
      console.error("Error settling transaction:", err.response?.data || err);
      setError(
        err.response?.data?.message ||
          "Payment processing failed. Please try again later."
      );
    } finally {
      setProcessingPayment(false);
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

  // Use a separate effect for initial data loading
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Add real-time transaction updates in a separate effect
  useEffect(() => {
    if (!addEventListener || !removeEventListener) return;

    // Handler for transaction updates
    const handleTransactionUpdate = (data: any) => {
      console.log("Transaction update received:", data);

      if (
        data.event === "transaction_settled" ||
        data.event === "transaction_failed"
      ) {
        // Refresh transactions
        fetchPayments();
      }
    };

    // Handler for expense updates that might affect transactions
    const handleExpenseUpdate = (data: any) => {
      console.log("Expense update received:", data);

      if (
        data.event === "expense_created" ||
        data.event === "expense_deleted"
      ) {
        // Refresh transactions
        fetchPayments();
      }
    };

    // Register event listeners
    addEventListener("transaction_update", handleTransactionUpdate);
    addEventListener("expense_update", handleExpenseUpdate);

    // Cleanup on unmount
    return () => {
      removeEventListener("transaction_update", handleTransactionUpdate);
      removeEventListener("expense_update", handleExpenseUpdate);
    };
  }, [addEventListener, removeEventListener, fetchPayments]);

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

  // Full page loading screen
  if (loading) {
    return <LoadingScreen />;
  }

  // Error state
  if (error && !isModalOpen && !isConfirmModalOpen) {
    return <ErrorScreen error={error} onRetry={fetchPayments} />;
  }

  // Add real-time transaction updates
  // useEffect(() => {
  //   // Handler for transaction updates
  //   const handleTransactionUpdate = (data: any) => {
  //     console.log("Transaction update received:", data);

  //     if (
  //       data.event === "transaction_settled" ||
  //       data.event === "transaction_failed"
  //     ) {
  //       // Refresh transactions
  //       fetchPayments();
  //     }
  //   };

  //   // Handler for expense updates that might affect transactions
  //   const handleExpenseUpdate = (data: any) => {
  //     console.log("Expense update received:", data);

  //     if (
  //       data.event === "expense_created" ||
  //       data.event === "expense_deleted"
  //     ) {
  //       // Refresh transactions
  //       fetchPayments();
  //     }
  //   };

  //   // Register event listeners
  //   addEventListener("transaction_update", handleTransactionUpdate);
  //   addEventListener("expense_update", handleExpenseUpdate);

  //   // Cleanup on unmount
  //   return () => {
  //     removeEventListener("transaction_update", handleTransactionUpdate);
  //     removeEventListener("expense_update", handleExpenseUpdate);
  //   };
  // }, [addEventListener, removeEventListener, fetchPayments]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-100 to-pink-200 pt-20">
      <Sidebar activePage="payments" />

      <div className="fixed top-5 right-5 z-50 hidden lg:block">
        <NotificationPanel />
      </div>
      <ConnectionStatus />

      <div className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
          {/* Page Header with Background Gradient */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text font-bold">
            Payments
          </h1>
          <div className="hidden md:block">
            <div className="bg-purple-300 text-purple-700 px-4 py-2 rounded-lg flex items-center">
              <FontAwesomeIcon icon={faShieldAlt} className="mr-2" />
              <span className="font-medium">Secured by TrustPay™</span>
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-gradient-to-r from-red-600 via-red-400 to-red-600 rounded-xl overflow-hidden mb-8">
          <div className="p-4 sm:p-6 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3">
                <FontAwesomeIcon
                  icon={faMoneyBillWave}
                  className="text-orange-500"
                />
              </div>
              <h2 className="text-xl font-bold text-white">Pending Payments</h2>
            </div>
            <div className="bg-white text-orange-500 text-sm font-medium px-4 py-1.5 rounded-full">
              {pendingPayments.length}{" "}
              {pendingPayments.length === 1 ? "payment" : "payments"} pending
            </div>
          </div>

          {pendingPayments.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <div className="overflow-x-auto bg-white">
                  {/* Your existing table code from line 333-406 */}
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden bg-white p-4">
                <div className="space-y-4">
                  {pendingPayments.map((payment, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {payment.expenseName}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {payment.date}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600 text-lg">
                            {formatCurrency(payment.currency, payment.amount)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center text-gray-600">
                          <span className="inline-flex items-center">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                            {payment.groupName}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                              <span className="text-xs font-medium text-indigo-600">
                                {payment.owedFrom
                                  .split(" ")
                                  .map((name) => name[0])
                                  .join("")}
                              </span>
                            </div>
                            {payment.owedFrom}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handlePayNow(payment)}
                        className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-sm font-medium rounded-md hover:from-blue-600 hover:to-cyan-700 shadow-md hover:shadow-lg transition-colors"
                      >
                        Pay Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-center px-4 bg-white">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-2xl text-green-500"
                />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                All Payments Settled!
              </h3>
              <p className="text-gray-500 max-w-md mb-6">
                You don't have any pending payments to settle. Check back later
                or create a new expense to split with friends.
              </p>
              <Button
                text="Create New Expense"
                onClick={() => router.push("/expenses")}
                variant="ghost"
                size="md"
              />
            </div>
          )}
        </div>

        {/* Transaction History */}
        <div className="bg-gradient-to-r from-green-600 via-green-300 to-green-600 rounded-xl overflow-hidden">
          <div className="p-4 sm:p-6 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3">
                <FontAwesomeIcon icon={faHistory} className="text-purple-500" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Transaction History
              </h2>
            </div>
            <div className="bg-white text-purple-600 text-sm font-medium px-4 py-1.5 rounded-full">
              {transactionHistory.length}{" "}
              {transactionHistory.length === 1 ? "transaction" : "transactions"}{" "}
              completed
            </div>
          </div>

          {transactionHistory.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <div className="overflow-x-auto bg-white">
                  {/* Your existing table code from line 452-524 */}
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden bg-white p-4">
                <div className="space-y-4">
                  {transactionHistory.map((payment, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {payment.paidTo}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            ID: {payment.transactionId.substring(0, 10)}...
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600 text-lg">
                            {formatCurrency(payment.currency, payment.amount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {payment.mode}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          {payment.paymentDate}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === "Success"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {payment.status === "Success"
                            ? "Successful"
                            : "Failed"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-center px-4 bg-white">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <FontAwesomeIcon
                  icon={faHistory}
                  className="text-2xl text-purple-500"
                />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Transaction History Yet
              </h3>
              <p className="text-gray-500 max-w-md mb-6">
                You haven't completed any transactions yet. Once you settle
                payments, they will appear here.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mt-2">
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center text-center border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mb-2 text-indigo-500">
                    <FontAwesomeIcon icon={faWallet} className="text-sm" />
                  </div>
                  <h4 className="font-medium text-gray-800 text-sm mb-1">
                    Pay Friends
                  </h4>
                  <p className="text-gray-500 text-xs">
                    Settle expenses securely
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center text-center border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2 text-green-500">
                    <FontAwesomeIcon icon={faShieldAlt} className="text-sm" />
                  </div>
                  <h4 className="font-medium text-gray-800 text-sm mb-1">
                    Secure Transactions
                  </h4>
                  <p className="text-gray-500 text-xs">
                    Protected and encrypted
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center text-center border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2 text-blue-500">
                    <FontAwesomeIcon
                      icon={faMoneyBillWave}
                      className="text-sm"
                    />
                  </div>
                  <h4 className="font-medium text-gray-800 text-sm mb-1">
                    Multiple Methods
                  </h4>
                  <p className="text-gray-500 text-xs">
                    Various payment options
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Options Modal */}
        {typeof window !== "undefined" && (
          <>
            <AnimatePresence>
              {isModalOpen && selectedTransaction && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                    onClick={handleCancel}
                  ></motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-white rounded-2xl shadow-2xl p-0 w-[500px] max-w-[95%] sm:max-w-[90%] z-50 overflow-hidden mx-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header with Gradient */}
                    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">
                          Choose Payment Method
                        </h2>
                        <div className="flex items-center">
                          <FontAwesomeIcon
                            icon={faShieldAlt}
                            className="mr-2"
                          />
                          <span className="text-sm">Secure Payment</span>
                        </div>
                      </div>

                      <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl p-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="text-white/80">Recipient:</div>
                          <div className="font-medium text-right">
                            {selectedTransaction.owedFrom}
                          </div>

                          <div className="text-white/80">Amount:</div>
                          <div className="font-bold text-right text-white">
                            {formatCurrency(
                              selectedTransaction.currency,
                              selectedTransaction.amount
                            )}
                          </div>

                          <div className="text-white/80">For:</div>
                          <div className="text-right">
                            {selectedTransaction.expenseName}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="p-6">
                      <p className="text-gray-600 mb-5 text-center">
                        Select your preferred payment method
                      </p>

                      <div className="space-y-3">
                        {/* UPI Button */}
                        <button
                          onClick={() => handleSelectMode("UPI")}
                          className="w-full p-4 rounded-xl border-2 border-transparent hover:border-orange-200 bg-orange-50 text-gray-800 font-medium transition-all duration-200 flex items-center justify-between group hover:shadow-md"
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-orange-400 text-white flex items-center justify-center mr-4">
                              <FontAwesomeIcon icon={faGooglePay} />
                            </div>
                            <div>
                              <div className="font-semibold">UPI Payment</div>
                              <div className="text-sm text-gray-500">
                                Google Pay, PhonePe, etc.
                              </div>
                            </div>
                          </div>
                          <FontAwesomeIcon
                            icon={faChevronRight}
                            className="text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </button>

                        {/* PayPal Button */}
                        <button
                          onClick={() => handleSelectMode("PayPal")}
                          className="w-full p-4 rounded-xl border-2 border-transparent hover:border-blue-200 bg-blue-50 text-gray-800 font-medium transition-all duration-200 flex items-center justify-between group hover:shadow-md"
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center mr-4">
                              <FontAwesomeIcon icon={faPaypal} />
                            </div>
                            <div>
                              <div className="font-semibold">PayPal</div>
                              <div className="text-sm text-gray-500">
                                Fast and secure online payments
                              </div>
                            </div>
                          </div>
                          <FontAwesomeIcon
                            icon={faChevronRight}
                            className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </button>

                        {/* Stripe Button */}
                        <button
                          onClick={() => handleSelectMode("Stripe")}
                          className="w-full p-4 rounded-xl border-2 border-transparent hover:border-purple-200 bg-purple-50 text-gray-800 font-medium transition-all duration-200 flex items-center justify-between group hover:shadow-md"
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center mr-4">
                              <FontAwesomeIcon icon={faStripe} />
                            </div>
                            <div>
                              <div className="font-semibold">Stripe</div>
                              <div className="text-sm text-gray-500">
                                Credit/Debit cards accepted
                              </div>
                            </div>
                          </div>
                          <FontAwesomeIcon
                            icon={faChevronRight}
                            className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </button>
                      </div>

                      <div className="pt-6 mt-6 border-t border-gray-100">
                        {/* <div className="flex items-center justify-center mb-6">
                      <div className="flex space-x-2">
                        <FontAwesomeIcon
                          icon={faCcVisa}
                          className="text-2xl text-blue-700"
                        />
                        <FontAwesomeIcon
                          icon={faCcMastercard}
                          className="text-2xl text-red-500"
                        />
                        <div className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 font-medium">
                          +3 more
                        </div>
                      </div>
                    </div> */}

                        <button
                          onClick={handleCancel}
                          className="w-full py-3 px-4 rounded-xl border border-red-500 text-gray-800 hover:bg-red-500 hover:text-white font-medium transition-colors duration-200 flex items-center justify-center"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
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
                    className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                    onClick={handleCancel}
                  ></motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-white rounded-2xl shadow-2xl p-0 w-[450px] max-w-[95%] sm:max-w-[90%] z-50 overflow-hidden mx-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      className={`py-8 px-6 text-white ${
                        selectedMode === "UPI"
                          ? "bg-gradient-to-r from-orange-500 to-orange-600"
                          : selectedMode === "PayPal"
                          ? "bg-gradient-to-r from-blue-500 to-blue-600"
                          : "bg-gradient-to-r from-purple-600 to-indigo-600"
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-4">
                          <FontAwesomeIcon
                            icon={
                              selectedMode === "UPI"
                                ? faGooglePay
                                : selectedMode === "PayPal"
                                ? faPaypal
                                : faStripe
                            }
                            className="text-white text-3xl"
                          />
                        </div>
                        <h2 className="text-2xl font-bold mb-1">
                          Confirm Payment
                        </h2>
                        <div className="text-white/80 text-sm">
                          Transaction ID:{" "}
                          {selectedTransaction.transactionId.substring(0, 8)}...
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <div className="grid grid-cols-2 gap-y-3">
                          <div className="text-gray-500">Payment Method:</div>
                          <div className="text-right font-medium">
                            <div className="flex items-center justify-end">
                              <FontAwesomeIcon
                                icon={
                                  selectedMode === "UPI"
                                    ? faGooglePay
                                    : selectedMode === "PayPal"
                                    ? faPaypal
                                    : faStripe
                                }
                                className="mr-2 text-gray-700"
                              />
                              <span className="text-gray-900">
                                {selectedMode}
                              </span>
                            </div>
                          </div>

                          <div className="text-gray-500">Amount:</div>
                          <div className="text-right font-bold text-green-600">
                            {formatCurrency(
                              selectedTransaction.currency,
                              selectedTransaction.amount
                            )}
                          </div>

                          <div className="text-gray-500">Recipient:</div>
                          <div className="text-right text-gray-800">
                            {selectedTransaction.owedFrom}
                          </div>

                          <div className="text-gray-500">Date:</div>
                          <div className="text-right text-gray-800">
                            {new Date().toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-3">
                          Enter your 4-digit secure PIN:
                        </label>
                        <div className="flex justify-center space-x-3 mb-2">
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

                                if (e.target.value && i < 3) {
                                  const nextInput = document.getElementById(
                                    `pin-${i + 1}`
                                  );
                                  if (nextInput) nextInput.focus();
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Backspace" && !pin[i] && i > 0) {
                                  const prevInput = document.getElementById(
                                    `pin-${i - 1}`
                                  );
                                  if (prevInput) prevInput.focus();
                                }
                              }}
                              id={`pin-${i}`}
                              className="w-14 h-14 border-2 border-gray-300 rounded-xl text-center text-xl font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm transition-all"
                            />
                          ))}
                        </div>

                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-center text-sm mt-2 bg-red-50 p-2 rounded-lg"
                          >
                            <FontAwesomeIcon
                              icon={faExclamationTriangle}
                              className="mr-1"
                            />
                            {error}
                          </motion.div>
                        )}

                        <div className="flex items-center justify-center mt-2">
                          <FontAwesomeIcon
                            icon={faLock}
                            className="text-gray-400 mr-2 text-xs"
                          />
                          <span className="text-gray-400 text-xs">
                            Your PIN is never stored or shared
                          </span>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={handleCancel}
                          className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors duration-200"
                          disabled={processingPayment}
                        >
                          Cancel
                        </button>

                        <button
                          onClick={handleSettle}
                          disabled={!pin || pin.length < 4 || processingPayment}
                          className={`flex-1 py-3 px-4 rounded-xl text-white font-medium transition-colors duration-200 flex items-center justify-center ${
                            !pin || pin.length < 4 || processingPayment
                              ? "bg-gray-400 cursor-not-allowed"
                              : selectedMode === "UPI"
                              ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                              : selectedMode === "PayPal"
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                              : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                          }`}
                        >
                          {processingPayment ? (
                            <>
                              <FontAwesomeIcon
                                icon={faSpinner}
                                className="animate-spin mr-2"
                              />
                              Processing...
                            </>
                          ) : !pin || pin.length < 4 ? (
                            "Enter PIN"
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faLock} className="mr-2" />
                              Confirm Payment
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
