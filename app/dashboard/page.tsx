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
  faGlobe,
  faChartPie,
  faChartLine,
  faSmile,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios"; // Assuming you’re using axios for API calls
import Cookies from "js-cookie"; // Import Cookies for token persistence
import { useAuth } from "@/context/authContext"; // Import useAuth
import EnhancedLoadingScreen from "@/components/EnhancedLoadingScreen";

export default function Dashboard() {
  const router = useRouter();
  const {
    user,
    token,
    setToken,
    setUser,
    loading: authLoading,
    error: authError,
  } = useAuth() || {}; // Use useAuth for authentication state
  const [dashboardLoading, setDashboardLoading] = useState(true); // Separate loading state for dashboard data
  const [dashboardError, setDashboardError] = useState<string | null>(null);

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

  useEffect(() => {
    // Immediately redirect if no auth token is found
    if (!token && !Cookies.get("token")) {
      router.replace("/login");
    }
  }, []);

  useEffect(() => {
    // Check for auth token
    const hasToken = !!token || !!Cookies.get("token");

    if (!hasToken) {
      // No token means not logged in, redirect to login
      router.replace("/login");
    }
  }, [token, router]);

  // ✅ Authentication and Initial Data Fetch with Enhanced Debugging and Correct Timing
  useEffect(() => {
    const fetchData = async () => {
      // First, check if we have auth context
      if (!token || !user) {
        // Check if we have cookies from Google auth
        const cookieToken = Cookies.get("token");
        const cookieUserString = Cookies.get("user");

        if (cookieToken && cookieUserString && setToken && setUser) {
          try {
            // Parse user data and set up auth context
            const cookieUser = JSON.parse(cookieUserString);
            setToken(cookieToken);
            setUser(cookieUser);

            // Continue to fetch dashboard data
            // The useEffect will run again with the new auth context
            return;
          } catch (e) {
            console.error("Error parsing cookie user data:", e);
            router.push("/login");
            return;
          }
        } else {
          // No auth data found, redirect to login
          //console.log("No user or token found, redirecting to login...");
          router.push("/login");
          return;
        }
      }

      setDashboardLoading(true);

      try {
        // Fetch dashboard stats
        //console.log("Fetching stats from:", `${API_URL}/stats`);
        const statsResponse = await axios.get(`${API_URL}/stats`, {
          headers: { Authorization: `Bearer ${token}` },
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
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          //console.log("Transactions response data:", transactionsResponse.data);
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
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchData();
  }, [router, token, user, setToken, setUser]); // Add token and user as dependencies to re-run if they change

  if (authLoading || dashboardLoading) {
    return <EnhancedLoadingScreen />;
  }

  if (authError || dashboardError) {
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
            {authError || dashboardError}. Please try again or contact support
            if the issue persists.
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
      <div className="relative min-h-screen bg-gradient-to-br from-indigo-200 via-white to-purple-400 overflow-hidden">
        {/* Advanced Background Design */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Layered Gradient Backgrounds */}
          <div
            className="absolute inset-0 opacity-50 bg-gradient-to-br 
          from-indigo-100/20 via-purple-100/10 to-blue-100/20 
          animate-gradient-slow"
          ></div>

          {/* Geometric Background Shapes */}
          <div
            className="absolute top-0 right-0 w-96 h-96 
          bg-indigo-200/20 rounded-full mix-blend-multiply 
          filter blur-3xl animate-blob-1"
          ></div>
          <div
            className="absolute bottom-0 left-0 w-80 h-80 
          bg-purple-200/20 rounded-full mix-blend-multiply 
          filter blur-3xl animate-blob-2"
          ></div>

          {/* Subtle Grid Pattern */}
          <div
            className="absolute inset-0 opacity-5 
          bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),
          linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] 
          bg-[size:20px_20px]"
          ></div>
        </div>

        {/* Welcome Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-10 bg-white/90 backdrop-blur-lg 
          rounded-3xl shadow-2xl border border-gray-200/50 
          p-10 max-w-4xl w-full grid md:grid-cols-2 
          gap-10 items-center 
          ring-4 ring-indigo-500/10 
          hover:ring-indigo-500/20 
          transition-all duration-300"
          >
            {/* Left Side: Welcome Message & Features */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Welcome, <span className="text-indigo-600">{firstName}</span>
                  {" !"}
                </h1>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Transform how you manage shared expenses. Our platform makes
                  splitting bills, tracking costs, and settling payments
                  effortless and transparent.
                </p>
              </motion.div>

              {/* Feature Highlights with Enhanced Hover Effects */}
              <div className="space-y-6">
                {[
                  {
                    icon: (
                      <FontAwesomeIcon
                        icon={faUsers}
                        className="text-indigo-600 text-2xl"
                      />
                    ),
                    title: "Seamless Group Sharing",
                    description:
                      "Easily split expenses with friends, roommates, or colleagues",
                  },
                  {
                    icon: (
                      <FontAwesomeIcon
                        icon={faMoneyBill}
                        className="text-green-600 text-2xl"
                      />
                    ),
                    title: "Smart Expense Tracking",
                    description:
                      "Automatically categorize and analyze your spending patterns",
                  },
                  {
                    icon: (
                      <FontAwesomeIcon
                        icon={faChartPie}
                        className="text-purple-600 text-2xl"
                      />
                    ),
                    title: "Detailed Insights",
                    description:
                      "Gain comprehensive financial visibility across all your groups",
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.2 }}
                    className="flex items-center space-x-4 p-4 
                  bg-gray-50/60 rounded-xl 
                  hover:bg-indigo-50 
                  transition-all duration-300 
                  group cursor-pointer 
                  border border-transparent 
                  hover:border-indigo-200 
                  hover:shadow-md"
                  >
                    <div
                      className="p-3 bg-white rounded-full 
                    shadow-md group-hover:shadow-lg 
                    transition-shadow"
                    >
                      {feature.icon}
                    </div>
                    <div>
                      <h3
                        className="font-semibold text-gray-800 
                      group-hover:text-indigo-600 
                      transition"
                      >
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Action Buttons with Enhanced Interaction */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-8 flex space-x-4"
              >
                <Button
                  text="Create Groups"
                  onClick={() => router.push("/groups")}
                  className="flex-1 flex items-center justify-center 
                bg-indigo-600 text-white py-3 rounded-lg 
                hover:bg-indigo-700 transition-colors 
                font-semibold shadow-lg hover:shadow-xl 
                transform hover:-translate-y-1
                active:scale-95
                group"
                  {...({ icon: faUsers } as any)}
                />
                <Button
                  text="Add Expenses"
                  onClick={() => router.push("/expenses")}
                  className="flex-1 flex items-center justify-center 
                bg-green-600 text-white py-3 rounded-lg 
                hover:bg-green-700 transition-colors 
                font-semibold shadow-lg hover:shadow-xl 
                transform hover:-translate-y-1
                active:scale-95
                group"
                  {...({ icon: faMoneyBill } as any)}
                />
              </motion.div>
            </div>

            {/* Right Side: Illustrative Graphic with Enhanced Animation */}
            <div
              className="hidden md:flex flex-col items-center justify-center 
  bg-gradient-to-br from-indigo-50 to-purple-100 
  rounded-3xl p-10 relative overflow-hidden"
            >
              <motion.div
                animate={{
                  rotate: [0, 3, -3, 0],
                  scale: [1, 1.03, 0.97, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative flex items-center justify-center"
              >
                {/* Network Connection Illustration */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 250 250"
                  className="w-64 h-64 text-indigo-600"
                >
                  {/* Background Circle */}
                  <circle
                    cx="125"
                    cy="125"
                    r="120"
                    fill="rgba(99, 102, 241, 0.1)"
                    className="text-indigo-500"
                  />

                  {/* Network Nodes */}
                  <motion.circle
                    cx="125"
                    cy="50"
                    r="15"
                    fill="#6366f1"
                    initial={{ scale: 1 }}
                    animate={{
                      scale: [1, 1.2, 1],
                      translateY: [0, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0,
                    }}
                  />
                  <motion.circle
                    cx="50"
                    cy="175"
                    r="15"
                    fill="#10b981"
                    initial={{ scale: 1 }}
                    animate={{
                      scale: [1, 1.2, 1],
                      translateY: [0, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                  />
                  <motion.circle
                    cx="200"
                    cy="175"
                    r="15"
                    fill="#ec4899"
                    initial={{ scale: 1 }}
                    animate={{
                      scale: [1, 1.2, 1],
                      translateY: [0, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1,
                    }}
                  />

                  {/* Connecting Lines */}
                  <line
                    x1="125"
                    y1="65"
                    x2="65"
                    y2="160"
                    stroke="#6366f1"
                    strokeWidth="3"
                    strokeDasharray="10 5"
                    className="opacity-50"
                  />
                  <line
                    x1="125"
                    y1="65"
                    x2="185"
                    y2="160"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray="10 5"
                    className="opacity-50"
                  />
                  <line
                    x1="65"
                    y1="160"
                    x2="185"
                    y2="160"
                    stroke="#ec4899"
                    strokeWidth="3"
                    strokeDasharray="10 5"
                    className="opacity-50"
                  />
                </svg>
              </motion.div>
              <p className="mt-6 text-center text-gray-600 italic">
                Simplify your financial connections
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Modern Enterprise Dashboard
  return (
    <div className="flex">
      {/* Sidebar - kept for reference but not part of this component */}
      <Sidebar activePage="dashboard" />

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 bg-gray-50 mt-20">
        {/* Header with Dashboard title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text font-bold">
              Dashboard
            </h1>
            <p className="text-gray-500 mt-1">All your stats in one place!</p>
          </div>
          <div className="mt-4 md:mt-0">
            <h1 className="text-2xl font-semibold text-gray-700">
              Welcome, <span className="text-indigo-600">{firstName}</span>
              <span className="ml-2 inline-block">👋</span>
            </h1>
          </div>
        </div>

        {/* First Row: Expense & Payment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {/* Total Expenses Card */}
          <div
            className="rounded-lg overflow-hidden border border-red-200"
            style={{ boxShadow: "0 2px 10px rgba(228, 45, 45, 0.07)" }}
          >
            <div className="p-5 flex items-center">
              <div className="rounded-full bg-red-100 p-3 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path
                    fillRule="evenodd"
                    d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm flex items-center">
                  Total Expenses
                  <svg
                    className="h-4 w-4 ml-1 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </p>
                <h3 className="text-3xl font-bold text-gray-800">
                  ₹{(totalExpenses ?? 0).toLocaleString()}
                </h3>
                <p className="text-gray-500 text-xs mt-1">
                  Your personal spending
                </p>
              </div>
            </div>
          </div>

          {/* Pending Payments Card */}
          <div
            className="rounded-lg overflow-hidden border border-yellow-200"
            style={{ boxShadow: "0 2px 10px rgba(251, 191, 36, 0.07)" }}
          >
            <div className="p-5 flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-yellow-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm flex items-center">
                  Pending Payments
                  <svg
                    className="h-4 w-4 ml-1 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </p>
                <h3 className="text-3xl font-bold text-gray-800">
                  ₹{(pendingPayments ?? 0).toLocaleString()}
                </h3>
                <p className="text-gray-500 text-xs mt-1">Unpaid balance</p>
              </div>
            </div>
          </div>

          {/* Settled Payments Card */}
          <div
            className="rounded-lg overflow-hidden border border-green-200"
            style={{ boxShadow: "0 2px 10px rgba(16, 185, 129, 0.07)" }}
          >
            <div className="p-5 flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm flex items-center">
                  Settled Payments
                  <svg
                    className="h-4 w-4 ml-1 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </p>
                <h3 className="text-3xl font-bold text-gray-800">
                  ₹{(settledPayments ?? 0).toLocaleString()}
                </h3>
                <p className="text-gray-500 text-xs mt-1">
                  Payments you've made
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Second Row: Group Related Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* Total Groups */}
          <div
            className="rounded-lg overflow-hidden border border-blue-200"
            style={{ boxShadow: "0 2px 10px rgba(59, 130, 246, 0.07)" }}
          >
            <div className="p-5 flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm flex items-center">
                  Total Groups
                  <svg
                    className="h-4 w-4 ml-1 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </p>
                <h3 className="text-3xl font-bold text-gray-800">
                  {totalGroups ?? 0}
                </h3>
                <p className="text-gray-500 text-xs mt-1">
                  Your shared expense groups
                </p>
              </div>
            </div>
          </div>

          {/* Total Members */}
          <div
            className="rounded-lg overflow-hidden border border-indigo-200"
            style={{ boxShadow: "0 2px 10px rgba(99, 102, 241, 0.07)" }}
          >
            <div className="p-5 flex items-center">
              <div className="rounded-full bg-indigo-100 p-3 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-indigo-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm flex items-center">
                  Total Members
                  <svg
                    className="h-4 w-4 ml-1 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </p>
                <h3 className="text-3xl font-bold text-gray-800">
                  {totalMembers ?? 0}
                </h3>
                <p className="text-gray-500 text-xs mt-1">
                  People in your groups
                </p>
              </div>
            </div>
          </div>

          {/* Group Expenses */}
          <div
            className="rounded-lg overflow-hidden border border-purple-200"
            style={{ boxShadow: "0 2px 10px rgba(139, 92, 246, 0.07)" }}
          >
            <div className="p-5 flex items-center">
              <div className="rounded-full bg-purple-100 p-3 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path
                    fillRule="evenodd"
                    d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm flex items-center">
                  Group Expenses
                  <svg
                    className="h-4 w-4 ml-1 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </p>
                <h3 className="text-3xl font-bold text-gray-800">
                  ₹{(groupExpenses ?? 0).toLocaleString()}
                </h3>
                <p className="text-gray-500 text-xs mt-1">
                  Total shared group expenses
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions Table with Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">
              Recent Transactions
            </h2>
            <button className="text-indigo-600 text-sm hover:text-indigo-800">
              View All
            </button>
          </div>

          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Sender</th>
                  <th className="px-6 py-3">Receiver</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3">Mode</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-center">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((txn, index) => (
                    <tr
                      key={index}
                      className={`hover:bg-gray-50 ${
                        txn.status === "Settled" ? "bg-green-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                        {txn.sender?.fullName || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {txn.receiver?.fullName || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right text-indigo-600">
                        ₹{txn.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {txn.paymentMode === "UPI" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            UPI
                          </span>
                        ) : txn.paymentMode === "PayPal" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            PayPal
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {txn.paymentMode}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        {txn.status === "Settled" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <span className="h-2 w-2 mr-1 rounded-full bg-green-500"></span>
                            Settled
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <span className="h-2 w-2 mr-1 rounded-full bg-yellow-500"></span>
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                        {new Date(txn.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 italic"
                    >
                      No recent transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
