"use client";
import { useState } from "react";
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

  const [expenses, setExpenses] = useState([
    { id: 1, name: "Grocery Shopping", category: "Food", amount: "₹3,500", date: "Feb 12", settled: true },
    { id: 2, name: "Electricity Bill", category: "Utilities", amount: "₹1,200", date: "Feb 10", settled: false },
    { id: 3, name: "Netflix Subscription", category: "Entertainment", amount: "₹799", date: "Feb 5", settled: true },
    { id: 4, name: "Uber Ride", category: "Transport", amount: "₹320", date: "Feb 9", settled: false },
    { id: 5, name: "Dinner at The Taj", category: "Food", amount: "₹1,200", date: "Feb 3", settled: true },
  ]);

  const [expenseName, setExpenseName] = useState("");
  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [group, setGroup] = useState(""); // Selected Group

  // Sample Group Options
  const groups = ["Roommates", "Office Team", "Travel Buddies"];

  const handleSaveExpense = () => {
    if (!expenseName || !amount || !date || !group) {
      alert("Please fill in all fields!");
      return;
    }
    console.log({ expenseName, category, amount, date, group });
    setIsModalOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 pt-20">
      {/* Sidebar */}
      <Sidebar activePage="expenses" />

      <div className="flex-1 p-8">
        {/* Page Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-5xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">Expenses</h1>
            <p className="text-gray-600 text-lg mt-1">Manage your expenses and track your spending!</p>
          </div>
          {/* Add Expense Button */}
          <Button
            text="Add Expense"
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-xl flex items-center gap-2 text-xl"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Add Expense</span>
          </Button>
        </div>

        {/* Expense Overview (Unchanged) */}
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
            <p className="text-2xl font-bold text-green-500">₹7,980</p> </div> 
          </div>
          {/* Expense Charts (Updated for Balanced Sizing) */}
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

    {/* Transactions Table (Unchanged) */}
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Transactions</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200 text-gray-600">
            <th className="py-3 px-4 text-left">Transaction</th>
            <th className="py-3 px-4 text-left">Category</th>
            <th className="py-3 px-4 text-center">Amount</th>
            <th className="py-3 px-4 text-center">Date</th>
            <th className="py-3 px-4 text-center">Already Settled?</th>
            <th className="py-3 px-4 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id} className="border-t hover:bg-gray-100 transition">
              <td className="py-3 px-4">{expense.name}</td>
              <td className="py-3 px-4">{expense.category}</td>
              <td className="py-3 px-4 text-center font-bold">{expense.amount}</td>
              <td className="py-3 px-4 text-center text-gray-500">{expense.date}</td>
              <td className="py-3 px-4 text-center">{expense.settled ? "✅ Yes" : "❌ No"}</td>
              <td className="py-3 px-4 text-center">{!expense.settled && <Button text="Pay" className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md" />}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Expense Modal */}
    {isModalOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-xl font-semibold mb-4">Add Expense</h2>

          {/* Expense Name */}
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

          {/* Date Picker */}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border p-2 rounded mb-3"
          />

          {/* Group Dropdown */}
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="w-full border p-2 rounded mb-4"
          >
            <option value="" disabled>
              Select Group
            </option>
            {groups.map((grp, index) => (
              <option key={index} value={grp}>
                {grp}
              </option>
            ))}
          </select>

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
); }