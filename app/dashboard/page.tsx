"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import RecentTransactions from "@/components/RecentTransactions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBill,
  faExclamationCircle,
  faCheckCircle,
  faUsers,
  faUserFriends,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUserToken] = useState<{ name: string } | null>(null);

  // ✅ Simulated Authentication Check
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("userToken");
      if (!storedToken) {
        router.push("/login"); // Redirect if no token found
      } else {
        setUserToken({ name: "Test User" });
      }
    } catch (error) {
      console.error("Error retrieving userToken:", error);
      router.push("/login");
    }
  }, [router]);

  // ✅ State Variables for Expense & Payment Stats
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [pendingPayments, setPendingPayments] = useState<number>(0);
  const [settledPayments, setSettledPayments] = useState<number>(0);

  // ✅ Fetch Expenses & Payments Data
  useEffect(() => {
    const expensesData = [
      { amount: 5000 },
      { amount: 3000 },
      { amount: 2500 },
    ];
    setTotalExpenses(expensesData.reduce((acc, curr) => acc + curr.amount, 0));

    const paymentsData = [
      { amount: 1200, status: "Pending" },
      { amount: 2000, status: "Settled" },
    ];
    setPendingPayments(
      paymentsData
        .filter((p) => p.status === "Pending")
        .reduce((acc, curr) => acc + curr.amount, 0)
    );
    setSettledPayments(
      paymentsData
        .filter((p) => p.status === "Settled")
        .reduce((acc, curr) => acc + curr.amount, 0)
    );
  }, []);

  // ✅ State Variables for Groups Summary
  const [totalGroups, setTotalGroups] = useState<number>(0);
  const [totalMembers, setTotalMembers] = useState<number>(0);
  const [groupExpenses, setGroupExpenses] = useState<number>(0);

  useEffect(() => {
    const groupsData = [
      { name: "Trip to Goa", members: 6, totalExpense: 25000 },
      { name: "Weekend Getaway", members: 5, totalExpense: 12000 },
    ];

    setTotalGroups(groupsData.length);
    setTotalMembers(groupsData.reduce((acc, group) => acc + group.members, 0));
    setGroupExpenses(
      groupsData.reduce((acc, group) => acc + group.totalExpense, 0)
    );
  }, []);

  return (
    <div className="flex mt-20">
      {/* Sidebar */}
      <Sidebar activePage="dashboard" />

      {/* Main Content */}
      <main className="flex-1 min-h-screen p-6 bg-gray-100">
        {/* Heading & Greeting */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-5xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
              Dashboard
            </h1>
            <p className="text-gray-600 text-lg mt-1">
              All your stats in one place!
            </p>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Welcome,{" "}
            <span className="text-purple-600">{user?.name || "User"}</span> 👋
          </h1>
        </div>

        {/* ✅ Dashboard Summary Cards (Expenses & Payments) */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {/* Total Expenses Card */}
          <div className="relative bg-white shadow-lg rounded-lg p-6 flex items-center gap-4 border-t-4 border-red-500 group">
            <div className="p-4 bg-red-100 rounded-full">
              <FontAwesomeIcon icon={faMoneyBill} className="text-red-600 text-2xl" />
            </div>
            <div>
              <h3 className="text-gray-700 text-lg font-semibold flex items-center">
                Total Expenses
                <span className="ml-2 text-gray-400 text-sm cursor-pointer hover:text-blue-700 transition-transform duration-300 transform hover:scale-125" title="Total amount YOU have spent personally in all transactions.">
                  ℹ️
                </span>
              </h3>
              <p className="text-3xl font-bold text-gray-900">₹{totalExpenses.toLocaleString()}</p>
              <p className="text-gray-500 text-sm">Your personal spending</p> {/* 🔹 Added Label */}
            </div>
          </div>

          {/* Pending Payments Card */}
          <div className="relative bg-white shadow-lg rounded-lg p-6 flex items-center gap-4 border-t-4 border-yellow-500 group">
            <div className="p-4 bg-yellow-100 rounded-full">
              <FontAwesomeIcon icon={faExclamationCircle} className="text-yellow-600 text-2xl" />
            </div>
            <div>
              <h3 className="text-gray-700 text-lg font-semibold flex items-center">
                Pending Payments
                <span className="ml-2 text-gray-400 text-sm cursor-pointer hover:text-blue-700 transition-transform duration-300 transform hover:scale-125" title="Amount you still need to pay in split expenses.">
                  ℹ️
                </span>
              </h3>
              <p className="text-3xl font-bold text-gray-900">₹{pendingPayments.toLocaleString()}</p>
              <p className="text-gray-500 text-sm">Unpaid balance</p> {/* 🔹 Added Label */}
            </div>
          </div>

          {/* Settled Payments Card */}
          <div className="relative bg-white shadow-lg rounded-lg p-6 flex items-center gap-4 border-t-4 border-green-500 group">
            <div className="p-4 bg-green-100 rounded-full">
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-2xl" />
            </div>
            <div>
              <h3 className="text-gray-700 text-lg font-semibold flex items-center">
                Settled Payments
                <span className="ml-2 text-gray-400 text-sm cursor-pointer hover:text-blue-700 transition-transform duration-300 transform hover:scale-125" title="Total amount you have paid in cleared expenses.">
                  ℹ️
                </span>
              </h3>
              <p className="text-3xl font-bold text-gray-900">₹{settledPayments.toLocaleString()}</p>
              <p className="text-gray-500 text-sm">Payments you've made</p> {/* 🔹 Added Label */}
            </div>
          </div>
        </div>

        {/* Group Related Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mt-6">
          {/* Total Groups */}
          <div className="relative bg-white shadow-lg rounded-lg p-6 flex items-center gap-4 border-t-4 border-blue-500 group">
            <div className="p-4 bg-blue-100 rounded-full">
              <FontAwesomeIcon icon={faUsers} className="text-blue-600 text-2xl" />
            </div>
            <div>
              <h3 className="text-gray-700 text-lg font-semibold flex items-center">
                Total Groups
                <span className="ml-2 text-gray-400 text-sm cursor-pointer hover:text-blue-700 transition-transform duration-300 transform hover:scale-125" title="Total number of groups you are part of.">
                  ℹ️
                </span>
              </h3>
              <p className="text-3xl font-bold text-gray-900">{totalGroups}</p>
              <p className="text-gray-500 text-sm">Your shared expense groups</p> {/* 🔹 Added Label */}
            </div>
          </div>

          {/* Total Members */}
          <div className="relative bg-white shadow-lg rounded-lg p-6 flex items-center gap-4 border-t-4 border-indigo-500 group">
            <div className="p-4 bg-indigo-100 rounded-full">
              <FontAwesomeIcon icon={faUserFriends} className="text-indigo-600 text-2xl" />
            </div>
            <div>
              <h3 className="text-gray-700 text-lg font-semibold flex items-center">
                Total Members
                <span className="ml-2 text-gray-400 text-sm cursor-pointer hover:text-blue-700 transition-transform duration-300 transform hover:scale-125" title="Total number of people across all groups.">
                  ℹ️
                </span>
              </h3>
              <p className="text-3xl font-bold text-gray-900">{totalMembers}</p>
              <p className="text-gray-500 text-sm">People in your groups</p> {/* 🔹 Added Label */}
            </div>
          </div>

          {/* Group Expenses */}
          <div className="relative bg-white shadow-lg rounded-lg p-6 flex items-center gap-4 border-t-4 border-purple-500 group">
            <div className="p-4 bg-purple-100 rounded-full">
              <FontAwesomeIcon icon={faWallet} className="text-purple-600 text-2xl" />
            </div>
            <div>
              <h3 className="text-gray-700 text-lg font-semibold flex items-center">
                Group Expenses
                <span className="ml-2 text-gray-400 text-sm cursor-pointer hover:text-blue-700 transition-transform duration-300 transform hover:scale-125" title="Total expenses contributed by all members across all shared groups.">
                  ℹ️
                </span>
              </h3>
              <p className="text-3xl font-bold text-gray-900">₹{groupExpenses.toLocaleString()}</p>
              <p className="text-gray-500 text-sm">Total shared group expenses</p> {/* 🔹 Added Label */}
            </div>
          </div>
        </div>

        {/* ✅ Recent Transactions */}
        <div className="mt-6">
          <RecentTransactions />
        </div>
      </main>
    </div>
  );
}