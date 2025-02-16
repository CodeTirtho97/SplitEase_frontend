"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Button from "@/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTimesCircle, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { faPaypal, faStripe, faGooglePay } from "@fortawesome/free-brands-svg-icons";

// ✅ TypeScript Interface for Payment Data
interface Payment {
  id: number;
  from: string;
  to: string;
  amount: number;
  date: string;
  status: "Pending" | "Settled" | "Failed";
  method?: "UPI" | "PayPal" | "Stripe" | "NetBanking";
}

// ✅ Dummy Pending Payments (Replace with Backend API Data)
const mockPayments: Payment[] = [
  { id: 1, from: "You", to: "David", amount: 500, date: "2024-03-10", status: "Pending" },
  { id: 2, from: "You", to: "Bob", amount: 800, date: "2024-02-10", status: "Pending" },
];

// ✅ Dummy Transaction History (Successful Past Payments)
const mockTransactionHistory: Payment[] = [
  { id: 3, from: "You", to: "Alice", amount: 1200, date: "2024-02-15", status: "Settled", method: "UPI" },
  { id: 4, from: "You", to: "John", amount: 1500, date: "2024-02-12", status: "Settled", method: "Stripe" },
  { id: 5, from: "You", to: "Emma", amount: 1000, date: "2024-02-05", status: "Failed", method: "NetBanking" },
];

// ✅ Payment Mode Icons Mapping
const modeIcons = {
  UPI: faGooglePay,
  PayPal: faPaypal,
  Stripe: faStripe,
  NetBanking: faGlobe,
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [transactionHistory, setTransactionHistory] = useState<Payment[]>(mockTransactionHistory);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // ✅ Open Payment Modal
  const handleSettlePayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  // ✅ Simulate Payment Settlement
  const confirmPayment = (method: "UPI" | "PayPal" | "Stripe" | "NetBanking") => {
    if (selectedPayment) {
      // ✅ Update Transaction History
      setTransactionHistory((prev) => [
        { ...selectedPayment, status: "Settled", method, id: prev.length + 1 },
        ...prev,
      ]);

      // ✅ Remove from Pending Payments
      setPayments((prev) => prev.filter((p) => p.id !== selectedPayment.id));

      setIsModalOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 pt-20">
      {/* Sidebar */}
      <Sidebar activePage="payments" />

      <div className="flex-1 p-8">
        {/* Page Header */}
        <div className="flex items-center mb-6">
          <h1 className="text-5xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">Payments</h1>
        </div>
        {/* 🔻 PENDING PAYMENTS TABLE */}
        <div className="bg-white shadow-lg rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Pending Payments</h2>

          {payments.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">Date</th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">Paid To</th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">Amount</th>
                  <th className="py-3 px-4 text-center text-gray-600 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50 transition">
                    <td className="py-3 px-4">{payment.date}</td>
                    <td className="py-3 px-4 font-semibold">{payment.to}</td>
                    <td className="py-3 px-4 font-bold text-green-600">₹{payment.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        text="Settle"
                        onClick={() => handleSettlePayment(payment)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 italic text-center">✅ No pending payments!</p>
          )}
        </div>

        {/* 🔻 TRANSACTION HISTORY TABLE */}
        <div className="bg-white shadow-lg rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Transaction History</h2>

          {transactionHistory.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">Date</th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">Paid To</th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">Amount</th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">Mode</th>
                  <th className="py-3 px-4 text-left text-gray-600 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactionHistory.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50 transition">
                    <td className="py-3 px-4">{payment.date}</td>
                    <td className="py-3 px-4 font-semibold">{payment.to}</td>
                    <td className="py-3 px-4 font-bold text-green-600">₹{payment.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 flex items-center gap-2">
                      <FontAwesomeIcon icon={modeIcons[payment.method as keyof typeof modeIcons]} className="text-gray-500" />
                      {payment.method}
                    </td>
                    <td className="py-3 px-4">
                      {payment.status === "Settled" ? (
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
            <p className="text-gray-500 italic text-center">📌 No past transactions found.</p>
          )}
        </div>

        {/* ✅ Settle Payment Modal */}
        {isModalOpen && selectedPayment && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-[500px] max-w-[90%] text-center animate-fadeIn">
            {/* Modal Header */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3">💸 Settle Payment</h2>
            <p className="text-lg text-gray-700">
                Paying <span className="font-semibold text-indigo-700">{selectedPayment.to}</span> an amount of 
                <span className="text-green-600 font-bold"> ₹{selectedPayment.amount}</span>
            </p>

            {/* Payment Options */}
            <div className="grid grid-cols-2 gap-4 mt-6">
                {/* 🏦 UPI (Google Pay) */}
                <button
                onClick={() => confirmPayment("UPI")}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center gap-3 justify-center shadow-md transition-transform transform hover:scale-105"
                >
                <FontAwesomeIcon icon={faGooglePay} className="text-2xl" />
                <span className="text-lg font-medium">UPI</span>
                </button>

                {/* 💳 PayPal */}
                <button
                onClick={() => confirmPayment("PayPal")}
                className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-3 rounded-lg flex items-center gap-3 justify-center shadow-md transition-transform transform hover:scale-105"
                >
                <FontAwesomeIcon icon={faPaypal} className="text-xl" />
                <span className="text-lg font-medium">PayPal</span>
                </button>

                {/* 🏦 Stripe */}
                <button
                onClick={() => confirmPayment("Stripe")}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg flex items-center gap-3 justify-center shadow-md transition-transform transform hover:scale-105"
                >
                <FontAwesomeIcon icon={faStripe} className="text-xl" />
                <span className="text-lg font-medium">Stripe</span>
                </button>

                {/* 🏦 NetBanking */}
                <button
                onClick={() => confirmPayment("NetBanking")}
                className="bg-green-700 hover:bg-green-800 text-white px-4 py-3 rounded-lg flex items-center gap-3 justify-center shadow-md transition-transform transform hover:scale-105"
                >
                <FontAwesomeIcon icon={faGlobe} className="text-xl" />
                <span className="text-lg font-medium">NetBanking</span>
                </button>
            </div>

            {/* ❌ Cancel Button */}
            <button
                onClick={() => setIsModalOpen(false)}
                className="mt-5 text-gray-500 hover:text-gray-700 text-lg font-medium transition duration-200"
            >
                ❌ Cancel
            </button>
            </div>
        </div>
        )}
      </div>
    </div>
  );
}