"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Button from "@/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faCheckCircle,
  faExclamationCircle,
  faFileInvoiceDollar,
  faChartLine,
  faMoneyBillWave,
  faUsers,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Pie, Bar, Line } from "react-chartjs-2";
import "chart.js/auto";
import expenseApi from "@/utils/api/expense";
import DashboardCards from "@/components/ExpenseCard";
import { useGroups } from "@/context/groupContext";
import ExpenseModal from "@/components/ExpenseModal";
import RecentExpensesTable from "@/components/RecentExpensesTable";
import { useTransactionContext } from "@/context/transactionContext";
import { useAuth } from "@/context/authContext";

// Define types at the top of the file
type Currency = "INR" | "USD" | "EUR" | "GBP" | "JPY";

interface Summary {
  totalExpenses: number;
  totalPending: number;
  totalSettled: number;
}

interface Expense {
  _id: string;
  description: string;
  type: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  groupId?: string;
  expenseStatus: boolean;
  splitDetails: {
    user: { fullName: string };
    amountOwed: number;
    percentage?: number;
    transactionId?: string;
  }[];
  payer: { fullName: string };
}

interface Member {
  _id: string;
  fullName: string;
}

interface Group {
  _id: string;
  name: string;
  members: Member[];
  completed?: boolean;
}

interface ChartData {
  breakdown: { [key: string]: number };
  monthlyTrend: { [key: string]: number };
  breakdownPending: { [key: string]: number };
  breakdownSettled: { [key: string]: number };
  monthlyTrendPending: { [key: string]: number };
  monthlyTrendSettled: { [key: string]: number };
}

export default function Expenses() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const { groups: contextGroups, refreshGroups } = useGroups();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [showCharts, setShowCharts] = useState(false);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loadingCharts, setLoadingCharts] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [summary, setSummary] = useState<
    { [key in Currency]?: Summary } | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("INR");
  const { refreshExpenses } = useTransactionContext();
  const [animate, setAnimate] = useState(false);

  // Track if component has mounted to prevent multiple fetches in Strict Mode
  const [hasMounted, setHasMounted] = useState(false);

  // Transform context groups to match ExpenseModal's expected type
  const transformedGroups: Group[] = useMemo(() => {
    if (!contextGroups || contextGroups.length === 0) return [];
    return contextGroups.map((group) => {
      let members: Member[];

      if (!group.members || !Array.isArray(group.members)) {
        console.warn(
          `Group ${group._id} has no valid members array:`,
          group.members
        );
        members = [];
      } else if (typeof group.members[0] === "string") {
        members = group.members.map((memberId: string) => ({
          _id: memberId,
          fullName: `User_${memberId.slice(-4)}`,
        }));
      } else if (
        group.members[0] &&
        typeof group.members[0] === "object" &&
        "_id" in group.members[0]
      ) {
        members = group.members.map((member: any) => ({
          _id: member._id,
          fullName: member.fullName || `User_${member._id.slice(-4)}`,
        }));
      } else {
        console.warn(
          `Unexpected members format in group ${group._id}:`,
          group.members
        );
        members = [];
      }

      return {
        _id: group._id,
        name: group.name,
        members,
        completed: group.completed || false, // Include completed status
      };
    });
  }, [contextGroups]);

  // Fetch recent expenses only on page mount
  const fetchRecentExpenses = useCallback(async () => {
    if (isFetching || hasMounted) return;
    setIsFetching(true);
    try {
      const response = await expenseApi.getRecentExpenses();
      setExpenses(response.data.expenses || []);
      // Don't show error toasts for empty expenses - it's an expected state
    } catch (error) {
      console.error("Error fetching recent expenses:", error);

      // Never show error toasts for "No expenses found" or "No data" scenarios
      // This suppresses "Failed to load recent expenses" messages when there are no expenses yet
      const errorMessage = (error as any)?.response?.data?.message || "";
      const errorStatus = (error as any)?.response?.status;

      // Only show error toast if it's a real server/network error (not 404 or empty data)
      if (
        !errorMessage.includes("No expenses") &&
        !errorMessage.includes("not found") &&
        errorStatus !== 404
      ) {
        setToast({ message: "Failed to load recent expenses", type: "error" });
      }
    } finally {
      setIsFetching(false);
    }
  }, [isFetching, hasMounted]);

  // Fetch expense summary only on page mount
  const fetchSummary = useCallback(async () => {
    if (hasMounted) return;
    try {
      const response = await expenseApi.getExpenseSummary();
      if (response.data?.summary) {
        setSummary(response.data.summary);
      } else {
        setSummary({});
      }
      // Don't show errors for empty summary data
    } catch (error) {
      console.error("Error fetching expense summary:", error);
      // Only capture the error if it's not related to empty data
      const errorMessage = (error as any)?.response?.data?.message || "";
      if (
        !errorMessage.includes("No summary") &&
        !errorMessage.includes("not found")
      ) {
        setError("Failed to load summary");
      }
    }
  }, [hasMounted]);

  // Fetch chart data only on page mount
  const fetchExpenseBreakdown = useCallback(async () => {
    if (hasMounted) return;
    setLoadingCharts(true);
    try {
      const response = await expenseApi.getExpenseBreakdown("INR");
      setChartData(
        response.data || {
          breakdown: {},
          monthlyTrend: {},
          breakdownPending: {},
          breakdownSettled: {},
          monthlyTrendPending: {},
          monthlyTrendSettled: {},
        }
      );
      // Don't show errors for empty chart data
    } catch (error) {
      console.error("Error fetching expense breakdown:", error);
      setChartData(null);

      // Never show error toasts for empty data scenarios
      // This suppresses "Failed to load chart data" messages when there are no expenses yet
      const errorMessage = (error as any)?.response?.data?.message || "";
      const errorStatus = (error as any)?.response?.status;

      // Only show error toast if it's a real server/network error (not 404 or empty data)
      if (
        !errorMessage.includes("No data") &&
        !errorMessage.includes("not found") &&
        !errorMessage.includes("No expenses") &&
        errorStatus !== 404
      ) {
        setToast({ message: "Failed to load chart data", type: "error" });
      }
    } finally {
      setLoadingCharts(false);
    }
  }, [hasMounted]);

  // Auth check and data fetching
  useEffect(() => {
    // Check for authentication using cookies/authContext
    if (!token) {
      router.push("/login");
      return;
    }

    if (!hasMounted) {
      setHasMounted(true);
      const fetchInitialData = async () => {
        try {
          // Fetch expenses with a catch block to suppress error messages for no data
          try {
            await fetchRecentExpenses();
          } catch (error) {
            console.error("Error fetching recent expenses:", error);
            // Don't show toast for empty expenses
          }

          // Fetch summary with a catch block to suppress error messages for no data
          try {
            await fetchSummary();
          } catch (error) {
            console.error("Error fetching summary:", error);
            // Don't show toast for empty summary
          }

          // Fetch chart data with a catch block to suppress error messages for no data
          try {
            await fetchExpenseBreakdown();
          } catch (error) {
            console.error("Error fetching chart data:", error);
            // Don't show toast for empty chart data
          }

          // Start animation after data is loaded (or attempted to load)
          setTimeout(() => setAnimate(true), 300);
        } catch (error) {
          console.error("Error in fetchInitialData:", error);
          // Only show toast for critical errors that don't involve missing data
          if (
            error instanceof Error &&
            !error.message.includes("No expenses") &&
            !error.message.includes("No data") &&
            !error.message.includes("not found")
          ) {
            setToast({ message: "Failed to load initial data", type: "error" });
          }

          // Still trigger animation even if there's an error
          setTimeout(() => setAnimate(true), 300);
        }
      };
      fetchInitialData();
    }
  }, [
    router,
    token,
    fetchRecentExpenses,
    fetchSummary,
    fetchExpenseBreakdown,
    hasMounted,
  ]);

  // Fetch groups when modal opens
  useEffect(() => {
    if (isModalOpen) {
      refreshGroups();
    }
  }, [isModalOpen, refreshGroups]);

  // Clear toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const groupMapping = useMemo(() => {
    return transformedGroups.reduce((acc, group) => {
      acc[group._id] = group.name;
      return acc;
    }, {} as { [key: string]: string });
  }, [transformedGroups]);

  const handleSaveExpense = async (data: any) => {
    const {
      groupId,
      payeeId,
      description,
      type,
      currency,
      amount,
      splitMethod,
      participants,
    } = data;

    const payload = {
      totalAmount: amount,
      description,
      participants: participants.map(
        (p: { userId: string; amount?: number; percentage?: number }) =>
          p.userId
      ),
      splitMethod,
      splitValues: participants.map(
        (p: { userId: string; amount?: number; percentage?: number }) => ({
          userId: p.userId,
          [splitMethod === "Percentage" ? "percentage" : "amount"]:
            splitMethod === "Percentage" ? p.percentage ?? 0 : p.amount ?? 0,
        })
      ),
      groupId,
      currency,
      type,
      paymentMode: "UPI",
      payeeId,
    };

    try {
      const response = await expenseApi.createExpense(payload);
      if (response.status === 201) {
        setToast({ message: "Expense added successfully!", type: "success" });
        setIsModalOpen(false);
        fetchRecentExpenses();
      }
    } catch (error: any) {
      // More detailed error logging
      console.error("Error saving expense:", error.response?.data || error);
      setToast({
        message: error.response?.data?.message || "Error adding expense",
        type: "error",
      });
    }
  };

  const toggleExpand = (expenseId: string) => {
    setExpandedRows((prevRows) =>
      prevRows.includes(expenseId)
        ? prevRows.filter((id) => id !== expenseId)
        : [...prevRows, expenseId]
    );
  };

  // Empty state component for no expenses with animation
  const EmptyExpensesState = () => (
    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-lg transition-all duration-500 ease-in-out transform">
      <div
        className={`text-center mb-8 transition-all duration-700 ease-in-out transform ${
          animate ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <div className="mb-4 relative mx-auto w-24 h-24 flex items-center justify-center">
          <FontAwesomeIcon
            icon={faFileInvoiceDollar}
            className="text-6xl text-purple-400 absolute z-10"
          />
          <div
            className={`absolute inset-0 bg-purple-100 rounded-full scale-0 ${
              animate ? "animate-ping-slow" : ""
            }`}
          ></div>
        </div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">
          No Expenses Yet!
        </h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Start tracking your shared expenses by adding your first expense with
          friends or roommates.
        </p>
      </div>
      <Button
        text="Add Your First Expense"
        onClick={() => setIsModalOpen(true)}
        className={`bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-700 ease-in-out transform ${
          animate
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-10 opacity-0 scale-95"
        }`}
      >
        <FontAwesomeIcon icon={faPlus} />
        <span>Add Your First Expense</span>
      </Button>
    </div>
  );

  // Empty state component for summary data
  const EmptySummaryState = () => (
    <div
      className={`rounded-lg bg-white shadow-md p-6 text-center mb-6 transition-all duration-500 ease-in-out transform ${
        animate ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className="flex items-center justify-center mb-2">
        <FontAwesomeIcon
          icon={faChartLine}
          className="text-2xl text-blue-400 mr-2"
        />
        <h3 className="text-lg font-medium text-gray-600">
          No Summary Data Available
        </h3>
      </div>
      <p className="text-sm text-gray-500">
        Add your first expense to see financial summaries
      </p>
    </div>
  );

  // Empty state component for charts with animation
  const EmptyChartsState = () => (
    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-lg col-span-1 md:col-span-3 transition-all duration-500">
      <div
        className={`text-center mb-6 transition-all duration-700 ease-in-out transform ${
          animate ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <div className="mb-4 relative mx-auto w-20 h-20 flex items-center justify-center">
          <FontAwesomeIcon
            icon={faChartLine}
            className="text-5xl text-blue-400 absolute z-10"
          />
          <div
            className={`absolute inset-0 bg-blue-100 rounded-full scale-0 ${
              animate ? "animate-pulse" : ""
            }`}
          ></div>
        </div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">
          No Chart Data Available
        </h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Add some expenses to see your spending patterns and analysis here.
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-purple-100 to-indigo-200 pt-20">
      <Sidebar activePage="expenses" />
      <div className="flex-1 p-4 sm:p-6 md:p-8">
        {toast && (
          <div
            className={`fixed top-24 right-6 px-6 py-3 rounded-md shadow-lg flex items-center gap-3 text-white text-sm z-50 ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            <FontAwesomeIcon
              icon={
                toast.type === "success" ? faCheckCircle : faExclamationCircle
              }
              className="text-lg"
            />
            <span>{toast.message}</span>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text font-bold">
            Expenses
          </h1>
          <Button
            text="Add Expense"
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 sm:px-6 md:px-8 py-3 md:py-4 rounded-xl flex items-center justify-center gap-2 text-lg md:text-xl transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span className="hidden sm:inline">Add Expense</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        {/* Show empty summary state if summary is null or empty */}
        {!summary || Object.keys(summary).length === 0 ? (
          <EmptySummaryState />
        ) : (
          <DashboardCards
            expenses={expenses}
            summary={summary}
            fetchSummary={fetchSummary}
            error={null} // Hide error messages in the cards
            selectedCurrency={selectedCurrency}
            setSelectedCurrency={setSelectedCurrency}
          />
        )}

        <button
          onClick={() => setShowCharts(!showCharts)}
          className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-md mb-6 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          {showCharts ? "Hide Charts" : "Show Charts"}
        </button>

        {showCharts && (
          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 transition-all duration-700 ease-in-out transform ${
              animate ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            {loadingCharts ? (
              <div className="w-full text-center py-10 col-span-1 md:col-span-3">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                </div>
                <p className="text-xl text-gray-500 mt-4">Loading charts...</p>
              </div>
            ) : !chartData ||
              (Object.keys(chartData?.breakdown || {}).length === 0 &&
                Object.keys(chartData?.monthlyTrend || {}).length === 0) ? (
              <EmptyChartsState />
            ) : (
              <>
                <div className="bg-white shadow-lg rounded-lg p-6 col-span-1 md:col-span-2 flex flex-col items-center transition-all duration-500 hover:shadow-xl">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4 self-start">
                    Expense Breakdown (Total)
                  </h2>
                  <div className="w-full h-[300px]">
                    <Pie
                      data={{
                        labels: Object.keys(chartData?.breakdown || {}),
                        datasets: [
                          {
                            label: "Total Expenses",
                            data: Object.values(chartData?.breakdown || {}),
                            backgroundColor: [
                              "#FF6384",
                              "#36A2EB",
                              "#FFCE56",
                              "#4CAF50",
                              "#8A2BE2",
                              "#00FA9A",
                            ],
                            borderColor: [
                              "#FF6384",
                              "#36A2EB",
                              "#FFCE56",
                              "#4CAF50",
                              "#8A2BE2",
                              "#00FA9A",
                            ],
                            borderWidth: 1,
                          },
                        ],
                      }}
                      options={{
                        maintainAspectRatio: false,
                        plugins: {
                          title: {
                            display: true,
                            text: "Expense Breakdown (Total)",
                            font: { size: 16 },
                          },
                          legend: {
                            position: "top",
                          },
                          tooltip: {
                            callbacks: {
                              label: (context) => {
                                const value = context.raw as number;
                                const total = Object.values(
                                  chartData?.breakdown || {}
                                ).reduce((sum, val) => sum + (val || 0), 0);
                                const percentage = total
                                  ? ((value / total) * 100).toFixed(1)
                                  : "0.0";
                                return `${
                                  context.label
                                }: ₹${value.toLocaleString()} (${percentage}%)`;
                              },
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center transition-all duration-500 hover:shadow-xl">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4 self-start">
                    Monthly Expense Trend (Total)
                  </h2>
                  <div className="w-full h-[250px]">
                    <Line
                      data={{
                        labels: Object.keys(chartData?.monthlyTrend || {}),
                        datasets: [
                          {
                            label: "Total Expenses",
                            data: Object.values(chartData?.monthlyTrend || {}),
                            borderColor: "#6200ea",
                            backgroundColor: "rgba(98, 0, 234, 0.2)",
                            fill: true,
                            tension: 0.1,
                          },
                        ],
                      }}
                      options={{
                        maintainAspectRatio: false,
                        plugins: {
                          title: {
                            display: true,
                            text: "Monthly Expense Trend (Total)",
                            font: { size: 16 },
                          },
                          legend: {
                            display: false,
                          },
                          tooltip: {
                            callbacks: {
                              label: (context) => {
                                const value = context.raw as number;
                                return `Spending: ₹${value.toLocaleString()}`;
                              },
                            },
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: "Amount (INR)",
                            },
                          },
                          x: {
                            title: {
                              display: true,
                              text: "Month",
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <RecentExpensesTable
          expenses={expenses}
          expandedRows={expandedRows}
          toggleExpand={toggleExpand}
          groupMapping={groupMapping}
          animate={animate}
          user={user}
        />

        <ExpenseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          groups={transformedGroups}
          handleSaveExpense={handleSaveExpense}
        />
      </div>
    </div>
  );
}
