"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBill,
  faExclamationCircle,
  faCheckCircle,
  faUsers,
  faUserFriends,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios"; // Assuming you’re using axios for API calls

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ fullName: string } | null>(null); // Updated to store fullName
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for dashboard data
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [pendingPayments, setPendingPayments] = useState<number>(0);
  const [settledPayments, setSettledPayments] = useState<number>(0);
  const [totalGroups, setTotalGroups] = useState<number>(0);
  const [totalMembers, setTotalMembers] = useState<number>(0);
  const [groupExpenses, setGroupExpenses] = useState<number>(0);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]); // For Recent Transactions table

  // API base URL (update to match your backend port)
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"; // Fallback to default

  // ✅ Authentication and Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      console.log("Starting fetchData with API_URL:", API_URL); // Debug log
      try {
        const storedToken = localStorage.getItem("userToken");
        console.log("User Token from localStorage:", storedToken); // Debug log
        if (!storedToken) {
          console.log("No user token found, redirecting to login"); // Debug log
          router.push("/login"); // Redirect if no token found
          return;
        }

        // Fetch user data (assuming backend returns fullName)
        console.log("Fetching user data from:", `${API_URL}/profile/me`); // Debug log
        const userResponse = await axios.get(`${API_URL}/profile/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        console.log("User data response:", userResponse.data); // Debug log
        setUser({ fullName: userResponse.data.fullName || "Test User" });

        // Fetch dashboard stats
        console.log("Fetching stats from:", `${API_URL}/stats`); // Debug log
        const statsResponse = await axios.get(`${API_URL}/stats`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        console.log("Stats response:", statsResponse.data); // Debug log
        const {
          totalExpenses: expenses,
          pendingPayments,
          settledPayments,
          totalGroups,
          totalMembers,
          groupExpenses,
        } = statsResponse.data;
        setTotalExpenses(expenses || 0); // Default to 0 if undefined
        setPendingPayments(pendingPayments || 0);
        setSettledPayments(settledPayments || 0);
        setTotalGroups(totalGroups || 0);
        setTotalMembers(totalMembers || 0);
        setGroupExpenses(groupExpenses || 0);

        // Fetch recent transactions
        console.log(
          "Fetching transactions from:",
          `${API_URL}/transactions/recent`
        ); // Debug log
        const transactionsResponse = await axios.get(
          `${API_URL}/transactions/recent`,
          {
            headers: { Authorization: `Bearer ${storedToken}` },
          }
        );
        console.log("Transactions response:", transactionsResponse.data); // Debug log
        setRecentTransactions(transactionsResponse.data.transactions || []);

        setLoading(false);
        console.log("Data fetch completed successfully"); // Debug log
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error, {
          status: error.response?.status,
          data: error.response?.data,
          config: error.config,
        }); // Detailed error log
        setError(
          error.response?.data?.message || "Failed to load dashboard data"
        );
        setLoading(false);
        if (error.response?.status === 401) {
          console.log("Unauthorized, redirecting to login"); // Debug log
          router.push("/login"); // Redirect on unauthorized access
        }
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen mt-20 justify-center items-center">
        <p className="text-lg text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen mt-20 justify-center items-center">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  // Extract first name from fullName (assuming fullName is "First Last")
  const firstName = user?.fullName.split(" ")[0] || "User";

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
            Welcome, <span className="text-purple-600">{firstName}</span> 👋
          </h1>
        </div>

        {/* ✅ Dashboard Summary Cards (Expenses & Payments) */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {/* Total Expenses Card */}
          <div className="relative bg-white shadow-lg rounded-lg p-6 flex items-center gap-4 border-t-4 border-red-500 group">
            <div className="p-4 bg-red-100 rounded-full">
              <FontAwesomeIcon
                icon={faMoneyBill}
                className="text-red-600 text-2xl"
              />
            </div>
            <div>
              <h3 className="text-gray-700 text-lg font-semibold flex items-center">
                Total Expenses
                <span
                  className="ml-2 text-gray-400 text-sm cursor-pointer hover:text-blue-700 transition-transform duration-300 transform hover:scale-125"
                  title="Total amount YOU have spent personally in all transactions."
                >
                  ℹ️
                </span>
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                ₹{totalExpenses.toLocaleString()}
              </p>
              <p className="text-gray-500 text-sm">Your personal spending</p>
            </div>
          </div>

          {/* Pending Payments Card */}
          <div className="relative bg-white shadow-lg rounded-lg p-6 flex items-center gap-4 border-t-4 border-yellow-500 group">
            <div className="p-4 bg-yellow-100 rounded-full">
              <FontAwesomeIcon
                icon={faExclamationCircle}
                className="text-yellow-600 text-2xl"
              />
            </div>
            <div>
              <h3 className="text-gray-700 text-lg font-semibold flex items-center">
                Pending Payments
                <span
                  className="ml-2 text-gray-400 text-sm cursor-pointer hover:text-blue-700 transition-transform duration-300 transform hover:scale-125"
                  title="Amount you still need to pay in split expenses."
                >
                  ℹ️
                </span>
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                ₹{pendingPayments.toLocaleString()}
              </p>
              <p className="text-gray-500 text-sm">Unpaid balance</p>
            </div>
          </div>

          {/* Settled Payments Card */}
          <div className="relative bg-white shadow-lg rounded-lg p-6 flex items-center gap-4 border-t-4 border-green-500 group">
            <div className="p-4 bg-green-100 rounded-full">
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-green-600 text-2xl"
              />
            </div>
            <div>
              <h3 className="text-gray-700 text-lg font-semibold flex items-center">
                Settled Payments
                <span
                  className="ml-2 text-gray-400 text-sm cursor-pointer hover:text-blue-700 transition-transform duration-300 transform hover:scale-125"
                  title="Total amount you have paid in cleared expenses."
                >
                  ℹ️
                </span>
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                ₹{settledPayments.toLocaleString()}
              </p>
              <p className="text-gray-500 text-sm">Payments you've made</p>
            </div>
          </div>
        </div>

        {/* Group Related Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mt-6">
          {/* Total Groups */}
          <div className="relative bg-white shadow-lg rounded-lg p-6 flex items-center gap-4 border-t-4 border-blue-500 group">
            <div className="p-4 bg-blue-100 rounded-full">
              <FontAwesomeIcon
                icon={faUsers}
                className="text-blue-600 text-2xl"
              />
            </div>
            <div>
              <h3 className="text-gray-700 text-lg font-semibold flex items-center">
                Total Groups
                <span
                  className="ml-2 text-gray-400 text-sm cursor-pointer hover:text-blue-700 transition-transform duration-300 transform hover:scale-125"
                  title="Total number of groups you are part of."
                >
                  ℹ️
                </span>
              </h3>
              <p className="text-3xl font-bold text-gray-900">{totalGroups}</p>
              <p className="text-gray-500 text-sm">
                Your shared expense groups
              </p>
            </div>
          </div>

          {/* Total Members */}
          <div className="relative bg-white shadow-lg rounded-lg p-6 flex items-center gap-4 border-t-4 border-indigo-500 group">
            <div className="p-4 bg-indigo-100 rounded-full">
              <FontAwesomeIcon
                icon={faUserFriends}
                className="text-indigo-600 text-2xl"
              />
            </div>
            <div>
              <h3 className="text-gray-700 text-lg font-semibold flex items-center">
                Total Members
                <span
                  className="ml-2 text-gray-400 text-sm cursor-pointer hover:text-blue-700 transition-transform duration-300 transform hover:scale-125"
                  title="Total number of people across all groups."
                >
                  ℹ️
                </span>
              </h3>
              <p className="text-3xl font-bold text-gray-900">{totalMembers}</p>
              <p className="text-gray-500 text-sm">People in your groups</p>
            </div>
          </div>

          {/* Group Expenses */}
          <div className="relative bg-white shadow-lg rounded-lg p-6 flex items-center gap-4 border-t-4 border-purple-500 group">
            <div className="p-4 bg-purple-100 rounded-full">
              <FontAwesomeIcon
                icon={faWallet}
                className="text-purple-600 text-2xl"
              />
            </div>
            <div>
              <h3 className="text-gray-700 text-lg font-semibold flex items-center">
                Group Expenses
                <span
                  className="ml-2 text-gray-400 text-sm cursor-pointer hover:text-blue-700 transition-transform duration-300 transform hover:scale-125"
                  title="Total expenses contributed by all members across all shared groups."
                >
                  ℹ️
                </span>
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                ₹{groupExpenses.toLocaleString()}
              </p>
              <p className="text-gray-500 text-sm">
                Total shared group expenses
              </p>
            </div>
          </div>
        </div>

        {/* ✅ Recent Transactions Table */}
        <div className="mt-6 bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Recent Transactions
          </h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-gray-600">
                <th className="py-3 px-4 text-left">Sender</th>
                <th className="py-3 px-4 text-left">Receiver</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-left">Mode</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length > 0 ? (
                recentTransactions.map((txn, index) => (
                  <tr
                    key={index}
                    className={`border-t hover:bg-gray-100 transition ${
                      txn.status === "Settled" ? "bg-green-100" : ""
                    }`}
                  >
                    <td className="py-3 px-4">
                      {txn.sender?.fullName || "Unknown"}
                    </td>
                    <td className="py-3 px-4">
                      {txn.receiver?.fullName || "Unknown"}
                    </td>
                    <td className="py-3 px-4 text-right text-indigo-500 font-bold">
                      ₹{txn.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">{txn.paymentMode}</td>
                    <td className="py-3 px-4 text-center">{txn.status}</td>
                    <td className="py-3 px-4 text-center text-gray-500">
                      {new Date(txn.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-4 text-center text-gray-500 italic"
                  >
                    No recent transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
