"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTimesCircle, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { faPaypal, faStripe, faGooglePay } from "@fortawesome/free-brands-svg-icons";

// Define Type for Transactions
interface Transaction {
  payer: string;
  receiver: string;
  amount: number;
  date: string;
  mode: string;
  status: "Pending" | "Settled";
}

// Dummy Data (Replace with Backend API Calls)
export default function RecentTransactions() {
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const expenseTransactions: Transaction[] = [
      { payer: "Alice", receiver: "Trip Group", amount: 1500, date: "2024-03-10", mode: "UPI", status: "Settled" },
      { payer: "Bob", receiver: "Trip Group", amount: 1200, date: "2024-03-08", mode: "PayPal", status: "Settled" }
    ];

    const paymentTransactions: Transaction[] = [
      { payer: "You", receiver: "David", amount: 500, date: "2024-03-09", mode: "Stripe", status: "Pending" },
      { payer: "You", receiver: "Alice", amount: 1200, date: "2024-02-15", mode: "NetBanking", status: "Settled" }
    ];

    // Merge & Sort by Date
    const mergedTransactions = [...expenseTransactions, ...paymentTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setRecentTransactions(mergedTransactions);
  }, []);

  // Mapping Payment Modes to Icons
  const modeIcons: { [key: string]: any } = {
    UPI: faGooglePay,
    PayPal: faPaypal,
    Stripe: faStripe,
    NetBanking: faGlobe
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mt-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Transactions</h3>

      {recentTransactions.length === 0 ? (
        <p className="text-gray-500 text-center">No transactions found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm">
                <th className="px-6 py-3 text-left">Payer</th>
                <th className="px-6 py-3 text-left">Receiver</th>
                <th className="px-6 py-3 text-center">Amount</th>
                <th className="px-6 py-3 text-center">Mode</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((txn, index) => (
                <tr key={index} className="border-t hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">{txn.payer}</td>
                  <td className="px-6 py-4 text-gray-700">{txn.receiver}</td>
                  <td className="px-6 py-4 text-center font-bold text-blue-500">
                    ₹{txn.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <FontAwesomeIcon icon={modeIcons[txn.mode]} className="text-gray-500" />
                      {txn.mode}
                    </div>
                  </td>
                  <td
                    className={`px-6 py-4 text-center font-semibold flex items-center justify-center gap-2 ${
                      txn.status === "Pending" ? "text-red-500" : "text-green-600"
                    }`}
                  >
                    {txn.status === "Pending" ? (
                      <>
                        <FontAwesomeIcon icon={faTimesCircle} />
                        <span>Pending</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheckCircle} />
                        <span>Settled</span>
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">{txn.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}