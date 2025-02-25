"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Button from "@/components/Button";
import { motion } from "framer-motion"; // Import Framer Motion for animations
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBill,
  faUsers,
  faUserFriends,
  faWallet,
  faCheckCircle,
  faExclamationCircle,
  faRocket,
  faLightbulb,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios"; // Assuming you’re using axios for API calls

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ fullName: string } | null>(null); // Updated to store fullName
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for dashboard data (use null for uninitialized, undefined for missing data)
  const [totalExpenses, setTotalExpenses] = useState<number | null>(null);
  const [pendingPayments, setPendingPayments] = useState<number | null>(null);
  const [settledPayments, setSettledPayments] = useState<number | null>(null);
  const [totalGroups, setTotalGroups] = useState<number | null>(null);
  const [totalMembers, setTotalMembers] = useState<number | null>(null);
  const [groupExpenses, setGroupExpenses] = useState<number | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]); // For Recent Transactions table
  const [hasData, setHasData] = useState(false); // Track if user has any data

  // API base URL (update to match your backend port)
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"; // Fallback to default

  // ✅ Authentication and Initial Data Fetch with Enhanced Debugging and Correct Timing
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedToken = localStorage.getItem("userToken");
        if (!storedToken) {
          //console.log("No user token found, redirecting to login...");
          router.push("/login"); // Redirect if no token found
          return;
        }

        // Fetch user data (assuming backend returns fullName)
        //console.log("Fetching user profile from:", `${API_URL}/profile/me`);
        const userResponse = await axios.get(`${API_URL}/profile/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        console.log("User response data:", userResponse.data);
        setUser({ fullName: userResponse.data.fullName || "Test User" });

        // Fetch dashboard stats
        //console.log("Fetching stats from:", `${API_URL}/stats`);
        try {
          const statsResponse = await axios.get(`${API_URL}/stats`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          //console.log("Stats response data:", statsResponse.data);
          const {
            totalExpenses: expenses = 0,
            pendingPayments = 0,
            settledPayments = 0,
            totalGroups = 0,
            totalMembers = 0,
            groupExpenses = 0,
          } = statsResponse.data || {};

          // Set state with non-zero values directly, preserving data
          setTotalExpenses(expenses || null);
          setPendingPayments(pendingPayments || null);
          setSettledPayments(settledPayments || null);
          setTotalGroups(totalGroups || null);
          setTotalMembers(totalMembers || null);
          setGroupExpenses(groupExpenses || null);

          // Evaluate hasData immediately with API response data (before state updates)
          const initialHasData =
            expenses > 0 ||
            pendingPayments > 0 ||
            settledPayments > 0 ||
            totalGroups > 0 ||
            totalMembers > 0 ||
            groupExpenses > 0;

          // Fetch recent transactions
          // console.log(
          //   "Fetching transactions from:",
          //   `${API_URL}/transactions/recent`
          // );
          try {
            const transactionsResponse = await axios.get(
              `${API_URL}/transactions/recent`,
              {
                headers: { Authorization: `Bearer ${storedToken}` },
              }
            );
            // console.log(
            //   "Transactions response data:",
            //   transactionsResponse.data
            // );
            const transactions = transactionsResponse.data.transactions || [];
            setRecentTransactions(transactions);

            // Update hasData with transactions data
            const finalHasData =
              initialHasData ||
              (transactions.length > 0 &&
                transactions.some((txn: any) => txn.amount > 0));
            setHasData(finalHasData);
            //console.log("Final hasData set to:", finalHasData);
          } catch (transactionsError: any) {
            console.error("Transactions API error:", {
              status: transactionsError.response?.status,
              data: transactionsError.response?.data,
              message: transactionsError.message,
            });
            if (transactionsError.response?.status === 500) {
              setRecentTransactions([]); // Assume no transactions for new users
              setHasData(initialHasData); // Use stats-based hasData if transactions fail
            } else {
              throw transactionsError; // Re-throw other errors
            }
          }
        } catch (statsError: any) {
          console.error("Stats API error:", {
            status: statsError.response?.status,
            data: statsError.response?.data,
            message: statsError.message,
          });
          if (statsError.response?.status === 500) {
            // Handle 500 error gracefully—assume no data for new users
            setTotalExpenses(null);
            setPendingPayments(null);
            setSettledPayments(null);
            setTotalGroups(null);
            setTotalMembers(null);
            setGroupExpenses(null);
            setRecentTransactions([]);
            setHasData(false);
          } else {
            throw statsError; // Re-throw other errors
          }
        }

        setLoading(false);
      } catch (error: any) {
        console.error("Critical error fetching dashboard data:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        if (error.response?.status === 401) {
          router.push("/login"); // Redirect on unauthorized access
        } else {
          setError(
            error.response?.data?.message || "Failed to load dashboard data"
          );
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen mt-20 justify-center items-center">
        <div className="relative flex flex-col items-center justify-center p-8 bg-white/90 rounded-xl shadow-lg backdrop-blur-md animate-pulse">
          {/* Animated Loading SVG */}
          <svg
            className="w-16 h-16 text-indigo-500 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <p className="mt-4 text-xl font-medium text-gray-700">
            Loading Dashboard...
          </p>
          <p className="text-sm text-gray-500">
            Please wait while we fetch your data securely.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen mt-20 justify-center items-center">
        <div className="relative flex flex-col items-center justify-center p-8 bg-white/90 rounded-xl shadow-lg backdrop-blur-md animate-shake">
          {/* Animated Error SVG */}
          <svg
            className="w-16 h-16 text-red-500 animate-bounce"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-4 text-xl font-medium text-gray-900">
            Error Loading Dashboard
          </p>
          <p className="text-sm text-gray-600">
            {error}. Please try again or contact support if the issue persists.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition-all duration-300 animate-pulse-once"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Extract first name from fullName (assuming fullName is "First Last")
  const firstName = user?.fullName.split(" ")[0] || "User";

  // Stylish welcome message for new users with no data
  if (!hasData) {
    return (
      <div className="flex min-h-screen mt-20">
        <Sidebar activePage="dashboard" />

        <main className="flex-1 min-h-screen p-4 bg-gray-100 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-10 w-full max-w-6xl text-center border border-indigo-300 hover:shadow-3xl transition-all duration-500"
          >
            {/* Animated Rocket Icon */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute -top-16 left-1/2 transform -translate-x-1/2"
            >
              <FontAwesomeIcon
                icon={faRocket}
                className="text-indigo-500 text-6xl drop-shadow-md animate-pulse-slow"
              />
            </motion.div>

            {/* Main Message */}
            <h1 className="text-4xl font-extrabold text-gray-900 mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
              Welcome, {firstName}! 🚀
            </h1>
            <p className="text-lg text-gray-700 mb-8 font-medium">
              Looks like you’re new here! Let’s get started by adding your first
              group, expenses, and transactions to unlock your dashboard stats.
            </p>

            {/* Animated Icons and Call-to-Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mb-8">
              {/* Groups Icon */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 4 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center p-4 bg-indigo-100 rounded-xl shadow-md hover:bg-indigo-200 transition-all duration-100"
              >
                <FontAwesomeIcon
                  icon={faUsers}
                  className="text-indigo-600 text-5xl mb-2 animate-bounce-slow"
                />
                <p className="text-gray-800 text-xl font-semibold">
                  Create Groups
                </p>
                <Button
                  text="Go to Groups"
                  onClick={() => router.push("/groups")}
                  className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm"
                />
              </motion.div>

              {/* Expenses Icon */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: -4 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center p-4 bg-purple-100 rounded-xl shadow-md hover:bg-purple-200 transition-all duration-100"
              >
                <FontAwesomeIcon
                  icon={faMoneyBill}
                  className="text-purple-600 text-5xl mb-2 animate-bounce-slow"
                />
                <p className="text-gray-800 text-xl font-semibold">
                  Add Expenses
                </p>
                <Button
                  text="Go to Expenses"
                  onClick={() => router.push("/expenses")}
                  className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
                />
              </motion.div>

              {/* Transactions Icon */}
              {/* <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center p-4 bg-green-100 rounded-xl shadow-md hover:bg-green-200 transition-all duration-300"
              >
                <FontAwesomeIcon
                  icon={faWallet}
                  className="text-green-600 text-3xl mb-2 animate-bounce-slow"
                />
                <p className="text-gray-800 font-semibold">
                  Track Transactions
                </p>
                <Button
                  text="Go to Transactions"
                  onClick={() => router.push("/transactions")}
                  className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                />
              </motion.div> */}
            </div>

            {/* Inspirational Lightbulb */}
            <motion.div
              animate={{ rotate: [2, 5, -5] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="mt-6 flex items-center justify-center gap-4"
            >
              <FontAwesomeIcon
                icon={faLightbulb}
                className="text-yellow-500 text-3xl animate-pulse"
              />
              <p className="text-gray-600 text-sm italic">
                Tip: Start with creating a group to share expenses with friends!
              </p>
            </motion.div>
          </motion.div>
        </main>
      </div>
    );
  }

  // Existing dashboard content for users with data
  // Extract first name from fullName (assuming fullName is "First Last")
  //const firstName = user?.fullName.split(" ")[0] || "User";

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
                ₹{(totalExpenses ?? 0).toLocaleString()}
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
                ₹{(pendingPayments ?? 0).toLocaleString()}
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
                ₹{(settledPayments ?? 0).toLocaleString()}
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
              <p className="text-3xl font-bold text-gray-900">
                {totalGroups ?? 0}
              </p>
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
              <p className="text-3xl font-bold text-gray-900">
                {totalMembers ?? 0}
              </p>
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
                ₹{(groupExpenses ?? 0).toLocaleString()}
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
