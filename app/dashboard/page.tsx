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
  faSmileWink,
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
                  <FontAwesomeIcon icon={faSmileWink} />
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
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 0.95, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative"
              >
                <FontAwesomeIcon
                  icon={faRocket}
                  className="absolute top-10 left-10 text-yellow-500 
                opacity-30 text-4xl"
                />
                <FontAwesomeIcon
                  icon={faChartLine}
                  className="absolute bottom-10 right-10 text-green-500 
                opacity-30 text-4xl"
                />
                <FontAwesomeIcon
                  icon={faGlobe}
                  className="text-indigo-600 animate-pulse text-8xl"
                />
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

  // Existing dashboard content for users with data
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
