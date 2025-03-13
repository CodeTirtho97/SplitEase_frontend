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
    <div className="flex mt-20">
      {/* Sidebar */}
      <Sidebar activePage="dashboard" />

      {/* Main Content */}
      <main className="flex-1 min-h-screen p-8 bg-gray-50">
        {/* Heading & Greeting */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="text-gray-500 text-lg mt-1">
              All your stats in one place!
            </p>
          </div>
          <div className="mt-4 md:mt-0 bg-white shadow-sm rounded-xl p-3 border border-gray-100">
            <h1 className="text-2xl font-semibold text-gray-800">
              Welcome, <span className="text-violet-600">{firstName}</span>
              <span className="ml-2 inline-block animate-wave">👋</span>
            </h1>
          </div>
        </div>

        {/* Dashboard Summary Cards (Expenses & Payments) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Total Expenses Card */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
            <div className="px-6 py-5 flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-red-50 mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center">
                    Total Expenses
                    <span
                      className="ml-1 text-gray-400 cursor-pointer hover:text-blue-600 transition-all"
                      title="Total amount YOU have spent personally in all transactions."
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
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
                    </span>
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    ₹{(totalExpenses ?? 0).toLocaleString()}
                  </h3>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500">Your personal spending</p>
            </div>
          </div>

          {/* Pending Payments Card */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
            <div className="px-6 py-5 flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-amber-50 mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-amber-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center">
                    Pending Payments
                    <span
                      className="ml-1 text-gray-400 cursor-pointer hover:text-blue-600 transition-all"
                      title="Amount you still need to pay in split expenses."
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
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
                    </span>
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    ₹{(pendingPayments ?? 0).toLocaleString()}
                  </h3>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-amber-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500">Unpaid balance</p>
            </div>
          </div>

          {/* Settled Payments Card */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
            <div className="px-6 py-5 flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-50 mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center">
                    Settled Payments
                    <span
                      className="ml-1 text-gray-400 cursor-pointer hover:text-blue-600 transition-all"
                      title="Total amount you have paid in cleared expenses."
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
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
                    </span>
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    ₹{(settledPayments ?? 0).toLocaleString()}
                  </h3>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500">Payments you've made</p>
            </div>
          </div>
        </div>

        {/* Group Related Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Groups */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
            <div className="px-6 py-5 flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-50 mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center">
                    Total Groups
                    <span
                      className="ml-1 text-gray-400 cursor-pointer hover:text-blue-600 transition-all"
                      title="Total number of groups you are part of."
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
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
                    </span>
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {totalGroups ?? 0}
                  </h3>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Your shared expense groups
              </p>
            </div>
          </div>

          {/* Total Members */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
            <div className="px-6 py-5 flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-indigo-50 mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center">
                    Total Members
                    <span
                      className="ml-1 text-gray-400 cursor-pointer hover:text-blue-600 transition-all"
                      title="Total number of people across all groups."
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
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
                    </span>
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {totalMembers ?? 0}
                  </h3>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500">People in your groups</p>
            </div>
          </div>

          {/* Group Expenses */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
            <div className="px-6 py-5 flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-50 mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-purple-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center">
                    Group Expenses
                    <span
                      className="ml-1 text-gray-400 cursor-pointer hover:text-blue-600 transition-all"
                      title="Total expenses contributed by all members across all shared groups."
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
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
                    </span>
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    ₹{(groupExpenses ?? 0).toLocaleString()}
                  </h3>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-purple-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Total shared group expenses
              </p>
            </div>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 mb-8">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Transactions
            </h3>
            <button className="text-sm px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3 border-b border-gray-100">Sender</th>
                  <th className="px-6 py-3 border-b border-gray-100">
                    Receiver
                  </th>
                  <th className="px-6 py-3 border-b border-gray-100 text-right">
                    Amount
                  </th>
                  <th className="px-6 py-3 border-b border-gray-100">Mode</th>
                  <th className="px-6 py-3 border-b border-gray-100 text-center">
                    Status
                  </th>
                  <th className="px-6 py-3 border-b border-gray-100 text-center">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((txn, index) => (
                    <tr
                      key={index}
                      className={`hover:bg-gray-50 transition-colors ${
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
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
                            <svg
                              className="h-2 w-2 mr-1 text-green-500"
                              fill="currentColor"
                              viewBox="0 0 8 8"
                            >
                              <circle cx="4" cy="4" r="3" />
                            </svg>
                            Settled
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <svg
                              className="h-2 w-2 mr-1 text-yellow-500"
                              fill="currentColor"
                              viewBox="0 0 8 8"
                            >
                              <circle cx="4" cy="4" r="3" />
                            </svg>
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

          {/* Footer with Pagination */}
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-100 bg-gray-50">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Showing <span className="font-medium">1</span> to{" "}
                  <span className="font-medium">
                    {recentTransactions.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {recentTransactions.length}
                  </span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Previous</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-indigo-600 hover:bg-gray-50">
                    1
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Next</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
        {/* Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Activity Chart - Placeholder */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                Expense Trend
              </h3>
            </div>
            <div className="p-6 min-h-64 flex items-center justify-center">
              <div className="w-full h-64">
                {/* This would be replaced with actual chart component */}
                <div className="w-full h-full bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg flex flex-col items-center justify-center p-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-indigo-300 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <p className="text-gray-500 text-sm text-center">
                    Your expense trend visualization will appear here.
                    <br />
                    Data is being processed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Category Distribution - Placeholder */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                Expense Categories
              </h3>
            </div>
            <div className="p-6 min-h-64 flex items-center justify-center">
              <div className="w-full h-64">
                {/* This would be replaced with actual chart component */}
                <div className="w-full h-full bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg flex flex-col items-center justify-center p-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-purple-300 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                    />
                  </svg>
                  <p className="text-gray-500 text-sm text-center">
                    Your expense category distribution will appear here.
                    <br />
                    Data is being processed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Activities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                Quick Actions
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center p-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-all duration-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span>Add Expense</span>
                </button>
                <button className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-all duration-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span>Settle Up</span>
                </button>
                <button className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-all duration-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <span>Create Group</span>
                </button>
                <button className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-all duration-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>View Reports</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Recent Activities
              </h3>
              <button className="text-sm text-indigo-600 hover:text-indigo-900">
                See all
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">
                      Added a new expense of ₹4,000
                    </p>
                    <p className="text-xs text-gray-500">Today at 10:30 AM</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">
                      Settled payment of ₹4,333
                    </p>
                    <p className="text-xs text-gray-500">
                      Yesterday at 6:15 PM
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-indigo-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">
                      Created a new group "Trip to Goa"
                    </p>
                    <p className="text-xs text-gray-500">
                      Mar 11, 2025 at 2:45 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
