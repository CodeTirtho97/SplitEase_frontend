"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Button from "@/components/Button";

// ✅ Define TypeScript Interfaces
interface Transaction {
    payer: string;
    recipient: string;
    category: string;
    amount: number;
    date: string;
  }
  
  interface OwesEntry {
    from: string;
    to: string;
    amount: number;
  }
  
  interface Group {
    id: number;
    name: string;
    description: string;
    totalExpense: number;
    transactions: Transaction[];
    owes: OwesEntry[];
  }
  
  // ✅ Mock Data for Groups
  const mockGroups: Group[] = [
    {
      id: 1,
      name: "Weekend Getaway",
      description: "Entertainment Group",
      totalExpense: 12000,
      transactions: [
        { payer: "Alice", recipient: "Group", category: "Food", amount: 1500, date: "2024-02-12" },
        { payer: "Bob", recipient: "David", category: "Transport", amount: 1200, date: "2024-02-10" },
      ],
      owes: [],
    },
    {
      id: 2,
      name: "Trip to Goa",
      description: "Transport Group",
      totalExpense: 25000,
      transactions: [
        { payer: "David", recipient: "Eve", category: "Accommodation", amount: 2000, date: "2024-03-05" },
        { payer: "Eve", recipient: "Bob", category: "Drinks", amount: 1000, date: "2024-03-08" },
      ],
      owes: [{ from: "Eve", to: "David", amount: 500 }],
    },
  ];

export default function SplitExpensesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const groupId = searchParams.get("groupId");

  const [group, setGroup] = useState<Group | null>(null);

  useEffect(() => {
    if (groupId) {
      const foundGroup = mockGroups.find((g) => g.id === parseInt(groupId));
      if (foundGroup) setGroup(foundGroup);
    }
  }, [groupId]);

  if (!group) {
    return <p className="text-center text-gray-500 text-lg">Group not found!</p>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 pt-20">
      {/* Sidebar */}
      <Sidebar activePage="groups" />

      {/* Main Content */}
      <div className="flex-1 p-8"> {/* ✅ Fixed Navbar Overlap */}
        {/* Page Header */}
        <h1 className="text-4xl font-extrabold text-gray-800 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
          Split Expenses
        </h1>
        <p className="text-gray-600 text-lg mt-1">Detailed breakdown of shared expenses.</p>

        {/* Group Info Card */}
        <div className="bg-white shadow-lg rounded-lg p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-800">{group.name}</h2>
          <p className="text-gray-500">{group.description}</p>
          <p className="text-xl font-semibold text-indigo-600 mt-2">
            Total Expense: ₹{group.totalExpense.toLocaleString()}
          </p>
        </div>

        {/* Transactions Table */}
        <div className="bg-white shadow-lg rounded-lg p-6 mt-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Transactions</h3>
          <table className="w-full border-collapse border border-gray-200 rounded-md">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-left">
                <th className="px-4 py-3">Who Paid</th>
                <th className="px-4 py-3">To Whom</th>
                <th className="px-4 py-3">For What</th>
                <th className="px-4 py-3 text-center">Amount</th>
                <th className="px-4 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {group.transactions.map((txn: Transaction, index: number) => (
                <tr key={index} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium">{txn.payer}</td>
                  <td className="px-4 py-3 text-gray-600">{txn.recipient}</td>
                  <td className="px-4 py-3 text-gray-500">{txn.category}</td>
                  <td className="px-4 py-3 text-center font-bold text-green-600">₹{txn.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{txn.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Who Owes Whom Section */}
        <div className="bg-white shadow-lg rounded-lg p-6 mt-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Who Owes Whom</h3>
          {group.owes.length > 0 ? (
            group.owes.map((entry: OwesEntry, index: number) => (
              <div key={index} className="flex justify-between items-center border-b py-3">
                <p className="text-gray-600">{entry.from} owes {entry.to}</p>
                <span className="font-bold text-red-500">₹{entry.amount.toLocaleString()}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic text-lg">🎉 All payments settled!</p>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          {/* Back to Group Button */}
          <Button
            text="Back to Group"
            onClick={() => router.push(`/groups`)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-lg transition-all duration-300"
          />

          {/* Settle Payment Button */}
          <Button
            text="Settle Payment"
            onClick={() => router.push(`/payments`)}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg text-lg transition-all duration-300"
          />
        </div>
      </div>
    </div>
  );
}