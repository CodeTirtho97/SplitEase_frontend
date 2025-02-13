"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Button from "@/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCheckCircle, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { Pie, Bar, Line } from "react-chartjs-2";
import "chart.js/auto";

export default function Expenses() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [showCharts, setShowCharts] = useState(false);
  const [user, setUserToken] = useState<{ name: string } | null>(null);

  // ✅ Initialize Form States
  const [expenseName, setExpenseName] = useState("");
  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [group, setGroup] = useState("");
  const [settled, setSettled] = useState(false);

  // ✅ Sample Groups for Dropdown
  const groups = ["Roommates", "Office Team", "Travel Buddies"];

  // ✅ Define Expense Type
  type Expense = {
    id: number;
    name: string;
    category: string;
    amount: number;
    date: string;
    settled: boolean;
    groupId?: number;
    splitDetails?: {
      name: string;
      paid: number;
      owes: number;
      settled: boolean;
    }[];
  };

  // 🔹 Dummy Groups (Replace with real data)
  const groupMapping: { [key: number]: string } = {
    1: "Roommates",
    2: "Office Team",
    3: "Travel Buddies",
  };

  // ✅ Expense Data
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: 1,
      name: "Grocery Shopping",
      category: "Food",
      amount: 3500,
      date: "2024-02-12",
      settled: true,
    },
    {
      id: 2,
      name: "Weekend Trip",
      category: "Entertainment",
      amount: 5000,
      date: "2024-02-15",
      settled: false,
      groupId: 1,
      splitDetails: [
        { name: "Alice", paid: 2000, owes: 1500, settled: false },
        { name: "Bob", paid: 1500, owes: 2000, settled: false },
        { name: "Charlie", paid: 1500, owes: 1500, settled: true },
      ],
    },
  ]);

  // ✅ Toast Notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ✅ Toggle Expense Expansion
  const toggleExpand = (expenseId: number) => {
    setExpandedRows((prevRows) =>
      prevRows.includes(expenseId) ? prevRows.filter((id) => id !== expenseId) : [...prevRows, expenseId]
    );
  };

  // ✅ Handle Expense Submission
  const handleSaveExpense = () => {
    if (!expenseName || !amount || !date || !group) {
      setToast({ message: "Please fill in all required fields!", type: "error" });
      return;
    }

    const newExpense: Expense = {
      id: expenses.length + 1,
      name: expenseName,
      category,
      amount: parseFloat(amount),
      date,
      settled: false,
    };

    setExpenses([...expenses, newExpense]);

    setIsModalOpen(false);
    setExpenseName("");
    setCategory("Food");
    setAmount("");
    setDate("");
    setGroup("");

    setToast({ message: "Expense added successfully!", type: "success" });
  };

  // Simulated authentication check
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("userToken");
      if (!storedToken) {
        router.push("/login");  // Redirect if no token found
      } else {
        setUserToken({ name: "Test User" });
      }
    } catch (error) {
      console.error("Error retrieving userToken:", error);
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen bg-gray-100 pt-20">
      <Sidebar activePage="expenses" />

      <div className="flex-1 p-8">
        {toast && (
          <div
            className={`fixed top-24 right-6 px-6 py-3 rounded-md shadow-lg flex items-center gap-3 text-white text-sm transition-all duration-500 transform ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
            style={{ zIndex: 10000 }}
          >
            <FontAwesomeIcon icon={toast.type === "success" ? faCheckCircle : faExclamationCircle} className="text-lg" />
            <span>{toast.message}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-5xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">Expenses</h1>
          <Button text="Add Expense" onClick={() => setIsModalOpen(true)} className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-xl flex items-center gap-2 text-xl">
            <FontAwesomeIcon icon={faPlus} />
            <span>Add Expense</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white shadow-lg rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-700">Total Expenses</h2>
            <p className="text-2xl font-bold text-red-500">₹10,500</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-700">Pending Payments</h2>
            <p className="text-2xl font-bold text-yellow-500">₹1,520</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-700">Settled Payments</h2>
            <p className="text-2xl font-bold text-green-500">₹7,980</p>
          </div>
        </div>

        <button onClick={() => setShowCharts(!showCharts)} className="bg-gray-700 text-white px-4 py-2 rounded-md mb-6">
          {showCharts ? "Hide Charts" : "Show Charts"}
        </button>

        {showCharts && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Pie Chart - Larger Size */}
          <div className="bg-white shadow-lg rounded-lg p-6 col-span-1 md:col-span-2 flex flex-col items-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 self-start">Expense Breakdown</h2>
            <div className="w-full h-[300px]">
              <Pie
                data={{
                  labels: ["Food", "Utilities", "Entertainment", "Transport"],
                  datasets: [{ data: [4700, 1200, 799, 320], backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50"] }],
                }}
                options={{ maintainAspectRatio: false }}
              />
            </div>
          </div>
    
          {/* Bar Chart - Normal Size */}
          <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 self-start">Category-wise Expense</h2>
            <div className="w-full h-[250px]">
              <Bar
                data={{
                  labels: ["Food", "Utilities", "Entertainment", "Transport"],
                  datasets: [{ label: "Amount", data: [4700, 1200, 799, 320], backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50"] }],
                }}
                options={{ maintainAspectRatio: false }}
              />
            </div>
          </div>
    
          {/* Line Chart - Spanning Full Width */}
          <div className="bg-white shadow-lg rounded-lg p-6 col-span-1 md:col-span-3 flex flex-col items-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 self-start">Monthly Spending Trend</h2>
            <div className="w-full h-[250px]">
              <Line
                data={{
                  labels: ["Jan", "Feb", "Mar", "Apr", "May", "June", "July"],
                  datasets: [{ label: "Spending", data: [8000, 9500, 7600, 10500, 9800, 7300, 8200], borderColor: "#6200ea", backgroundColor: "rgba(98, 0, 234, 0.2)", fill: true }],
                }}
                options={{ maintainAspectRatio: false }}
              />
            </div>
          </div>
        </div>
        )}

        {/* Transactions Table - FINAL FIX */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Transactions</h2>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-gray-600">
                <th className="py-3 px-4 text-left">Transaction</th>
                <th className="py-3 px-4 text-left">Category</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Date</th>
                <th className="py-3 px-4 text-center">Group</th>
                <th className="py-3 px-4 text-center">Settled?</th>
                <th className="py-3 px-4 text-center">Expand</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <React.Fragment key={expense.id}>
                  {/* ✅ MAIN TRANSACTION ROW */}
                  <tr className="border-t hover:bg-gray-100 transition">
                    <td className="py-3 px-4">{expense.name}</td>
                    <td className="py-3 px-4">{expense.category}</td>
                    <td className="py-3 px-4 text-right font-bold">₹{expense.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center text-gray-500">{expense.date}</td>
                    <td className="py-3 px-4 text-center">
                      {expense.groupId ? groupMapping[expense.groupId] || "Unknown Group" : "-"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {expense.settled ? (
                        <span className="text-green-500 text-lg">✅</span>
                      ) : (
                        <span className="text-red-500 text-lg">❌</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {expense.groupId ? (
                        <button
                          onClick={() => toggleExpand(expense.id)}
                          className="text-blue-500 hover:text-blue-700 text-lg"
                        >
                          {expandedRows.includes(expense.id) ? "🔼" : "🔽"}
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>

                  {/* ✅ EXPANDED SECTION (ONLY IF GROUP EXPENSE & EXPANDED) */}
                  {expense.groupId && expandedRows.includes(expense.id) && (
                    <tr key={`details-${expense.id}`}>
                      <td colSpan={7} className="bg-gray-50 p-4 rounded-lg shadow-inner">
                        <h3 className="font-semibold text-gray-700 mb-2">Expense Breakdown</h3>
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-200 text-gray-600">
                              <th className="py-2 px-3 text-left">Member</th>
                              <th className="py-2 px-3 text-center">Paid</th>
                              <th className="py-2 px-3 text-center">Owes</th>
                              <th className="py-2 px-3 text-center">Settled?</th>
                            </tr>
                          </thead>
                          <tbody>
                            {expense.splitDetails?.map((member, index) => (
                              <tr key={`${expense.id}-member-${index}`} className="border-t">
                                <td className="py-2 px-3">{member.name}</td>
                                <td className="py-2 px-3 text-center font-bold text-green-600">
                                  ₹{member.paid.toLocaleString()}
                                </td>
                                <td className="py-2 px-3 text-center font-bold text-red-500">
                                  ₹{member.owes.toLocaleString()}
                                </td>
                                <td className="py-2 px-3 text-center">
                                  {member.settled ? (
                                    <span className="text-green-500 text-lg">✅</span>
                                  ) : (
                                    <span className="text-red-500 text-lg">❌</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Expense Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl font-semibold mb-4">Add Expense</h2>

              {/* Transaction Name */}
              <input
                type="text"
                placeholder="Transaction Name"
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
                className="w-full border p-2 rounded mb-3"
              />

              {/* Category Dropdown */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border p-2 rounded mb-3"
              >
                <option value="Food">Food</option>
                <option value="Utilities">Utilities</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Transport">Transport</option>
              </select>

              {/* Amount Input */}
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border p-2 rounded mb-3"
              />

              {/* Group Selection Dropdown */}
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="w-full border p-2 rounded mb-3"
              >
                <option value="" disabled>Select Group</option>
                <option value="Roommates">Roommates</option>
                <option value="Office Team">Office Team</option>
                <option value="Travel Buddies">Travel Buddies</option>
              </select>

              {/* Settled or Not Settled Radio Buttons */}
              <div className="mb-3">
                <p className="text-gray-700 font-semibold">Transaction Status</p>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="settledStatus"
                      checked={settled === true}  // ✅ Now checks for boolean true
                      onChange={() => setSettled(true)}  // ✅ Sets true
                      className="form-radio text-green-500"
                    />
                    <span>Settled</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="settledStatus"
                      checked={settled === false}  // ✅ Now checks for boolean false
                      onChange={() => setSettled(false)}  // ✅ Sets false
                      className="form-radio text-red-500"
                    />
                    <span>Not Settled</span>
                  </label>
                </div>
              </div>

              {/* Date Picker (Only if Settled is selected) */}
              {settled && (
                <div>
                  <p className="text-gray-700 font-semibold">Transaction Date</p>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border p-2 rounded mb-3"
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={handleSaveExpense}
                  className="w-1/2 bg-green-500 text-white py-2 rounded hover:bg-green-600 mr-2"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 bg-red-500 text-white py-2 rounded hover:bg-red-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}