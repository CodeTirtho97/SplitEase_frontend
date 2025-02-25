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
} from "@fortawesome/free-solid-svg-icons";
import { Pie, Bar, Line } from "react-chartjs-2";
import "chart.js/auto";
import expenseApi from "@/utils/api/expense";
import DashboardCards from "@/components/ExpenseCard"; // Updated component name
import { useGroups } from "@/context/groupContext";
import ExpenseModal from "@/components/ExpenseModal";
import { useTransactionContext } from "@/context/transactionContext";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const {
    groups: contextGroups,
    refreshGroups,
    //error: groupsError,
  } = useGroups();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [showCharts, setShowCharts] = useState(false);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loadingCharts, setLoadingCharts] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [summary, setSummary] = useState<
    { [key in Currency]?: Summary } | null
  >(null); // Use defined types
  const [error, setError] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("INR"); // UI-only for Expense Cards, no data impact
  const { refreshExpenses } = useTransactionContext(); // Keep for potential future use, but decouple completely

  // Track if component has mounted to prevent multiple fetches in Strict Mode
  const [hasMounted, setHasMounted] = useState(false);

  // Transform context groups to match ExpenseModal's expected type (only when modal is open)
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
      };
    });
  }, []); // Empty dependency array to prevent re-computation

  // Fetch recent expenses only on page mount (no polling, context updates, or refresh)
  const fetchRecentExpenses = useCallback(async () => {
    if (isFetching || hasMounted) return; // Prevent multiple fetches in Strict Mode
    setIsFetching(true);
    try {
      //console.log("Fetching recent expenses on page load...");
      const response = await expenseApi.getRecentExpenses();
      // console.log(
      //   "Recent expenses response:",
      //   JSON.stringify(response.data.expenses, null, 2)
      // );
      setExpenses(response.data.expenses || []);
    } catch (error) {
      console.error("Error fetching recent expenses:", error);
      setToast({ message: "Failed to load recent expenses", type: "error" });
    } finally {
      setIsFetching(false);
    }
  }, [isFetching, hasMounted]); // Add hasMounted to prevent re-fetching

  // Fetch expense summary only on page mount (no polling, context updates, or refresh)
  const fetchSummary = useCallback(async () => {
    if (hasMounted) return; // Prevent multiple fetches in Strict Mode
    try {
      //console.log("Fetching expense summary on page load...");
      const response = await expenseApi.getExpenseSummary();
      if (response.data?.summary) {
        setSummary(response.data.summary);
      } else {
        setSummary({}); // Default to empty object if no summary is provided
      }
    } catch (error) {
      console.error("Error fetching expense summary:", error);
      setError("Failed to load summary");
    }
  }, [hasMounted]); // Add hasMounted to prevent re-fetching

  // Fetch chart data only on page mount (no polling, context updates, or refresh)
  const fetchExpenseBreakdown = useCallback(async () => {
    if (hasMounted) return; // Prevent multiple fetches in Strict Mode
    //console.log("fetchExpenseBreakdown called (page load only)");
    setLoadingCharts(true);
    try {
      const response = await expenseApi.getExpenseBreakdown("INR"); // Hardcode INR for charts, no dynamic updates
      // console.log(
      //   "Expense breakdown response:",
      //   JSON.stringify(response.data, null, 2)
      // );
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
    } catch (error) {
      console.error("Error fetching expense breakdown:", error);
      setChartData(null);
      setToast({ message: "Failed to load chart data", type: "error" });
    } finally {
      setLoadingCharts(false);
    }
  }, [hasMounted]); // Add hasMounted to prevent re-fetching

  // Fetch on page mount only (no polling, context updates, or refresh), handle Strict Mode
  useEffect(() => {
    //console.log("useEffect triggered in Expenses.tsx (page load only)", {
    //   mounted: true,
    //   renderCount: (window as any).renderCount || 0,
    //   showCharts,
    //   selectedCurrency,
    //   user,
    //   expensesLength: expenses.length,
    //   summary: summary ? Object.keys(summary) : "null",
    //   chartData: chartData ? Object.keys(chartData).length : "null",
    //   contextGroupsLength: contextGroups?.length || 0,
    // });
    (window as any).renderCount = ((window as any).renderCount || 0) + 1;
    const storedToken = localStorage.getItem("userToken");
    if (!storedToken) {
      router.push("/login");
    } else if (!hasMounted) {
      setUser({ name: "Test User" });
      setHasMounted(true); // Mark as mounted to prevent subsequent fetches
      const fetchInitialData = async () => {
        try {
          //console.log("Fetching recent expenses on page load...");
          await fetchRecentExpenses();
          //console.log("Fetching expense summary on page load...");
          await fetchSummary();
          //console.log("fetchExpenseBreakdown called (page load only)");
          await fetchExpenseBreakdown();
        } catch (error) {
          console.error("Error fetching initial data:", error);
          setToast({ message: "Failed to load initial data", type: "error" });
        }
      };
      fetchInitialData();
    }
  }, [
    router,
    fetchRecentExpenses,
    fetchSummary,
    fetchExpenseBreakdown,
    hasMounted,
  ]); // Add hasMounted to control re-fetching

  // Fetch groups only when the "Add Expense" modal is opened
  useEffect(() => {
    if (isModalOpen) {
      const fetchGroups = async () => {
        try {
          await refreshGroups();
          //console.log("Groups fetched for Add Expense modal:", contextGroups);
        } catch (error) {
          console.error("Error fetching groups for modal:", error);
          setToast({ message: "Failed to load groups", type: "error" });
        }
      };
      fetchGroups();
    }
  }, [isModalOpen, refreshGroups]); // Trigger groups fetch only when modal opens

  // Update expenses when a new expense is created (but only on page refresh)
  useEffect(() => {
    if (expenses.length > 5) {
      setExpenses((prev) => prev.slice(0, 5));
    }
  }, [expenses]);

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
  }, []); // Empty dependency array to prevent re-computation

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
      payeeId, // Already added in your previous update
    };

    // console.log(
    //   "Final payload for createExpense:",
    //   JSON.stringify(payload, null, 2)
    // ); // Debug payload before sending

    try {
      const response = await expenseApi.createExpense(payload);
      if (response.status === 201) {
        setToast({ message: "Expense added successfully!", type: "success" });
        // No immediate fetch after save—updates will occur on page refresh
      }
    } catch (error: any) {
      console.error("Error saving expense:", error);
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

  return (
    <div className="flex min-h-screen bg-gray-100 pt-20">
      <Sidebar activePage="expenses" />
      <div className="flex-1 p-8">
        {toast && (
          <div
            className={`fixed top-24 right-6 px-6 py-3 rounded-md shadow-lg flex items-center gap-3 text-white text-sm ${
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-5xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            Expenses
          </h1>
          <Button
            text="Add Expense"
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-xl flex items-center gap-2 text-xl"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Add Expense</span>
          </Button>
        </div>
        <DashboardCards
          expenses={expenses} // Pass current expenses (updated on page load)
          summary={summary}
          fetchSummary={fetchSummary} // Pass for potential manual refresh, but not used here
          error={error}
          selectedCurrency={selectedCurrency}
          setSelectedCurrency={setSelectedCurrency} // Pass for UI-only currency selection in Expense Cards
        />{" "}
        {/* Pass necessary props to DashboardCards */}
        <button
          onClick={() => setShowCharts(!showCharts)}
          className="bg-gray-700 text-white px-4 py-2 rounded-md mb-6"
        >
          {showCharts ? "Hide Charts" : "Show Charts"}
        </button>
        {showCharts && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {loadingCharts ? (
              <div className="w-full text-center py-10">
                <p className="text-xl text-gray-500">Loading charts...</p>
              </div>
            ) : !chartData ||
              (Object.keys(chartData?.breakdown || {}).length === 0 &&
                Object.keys(chartData?.monthlyTrend || {}).length === 0 &&
                Object.keys(chartData?.breakdownPending || {}).length === 0 &&
                Object.keys(chartData?.breakdownSettled || {}).length === 0 &&
                Object.keys(chartData?.monthlyTrendPending || {}).length ===
                  0 &&
                Object.keys(chartData?.monthlyTrendSettled || {}).length ===
                  0) ? (
              <div className="flex flex-col items-center text-center justify-center w-full py-12">
                <h2 className="text-2xl font-semibold text-gray-700">
                  No Expenses Added Yet!
                </h2>
                <p className="text-gray-500 text-lg mt-2">
                  Start tracking your spending by adding an expense.
                </p>
              </div>
            ) : (
              <>
                <div className="bg-white shadow-lg rounded-lg p-6 col-span-1 md:col-span-2 flex flex-col items-center">
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
                              "#FF6384", // Food (Pink)
                              "#36A2EB", // Transportation (Blue)
                              "#FFCE56", // Accommodation (Yellow)
                              "#4CAF50", // Utilities (Green, if needed)
                              "#8A2BE2", // Entertainment (Purple, if needed)
                              "#00FA9A", // Miscellaneous (Turquoise, if needed)
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
                            labels: {
                              generateLabels: (chart) => {
                                const data = chart.data;
                                if (
                                  !data.labels ||
                                  !data.datasets ||
                                  data.datasets.length === 0 ||
                                  !data.datasets[0].backgroundColor
                                ) {
                                  return [];
                                }
                                const labels = data.labels as string[];
                                const backgroundColors = Array.isArray(
                                  data.datasets[0].backgroundColor
                                )
                                  ? (data.datasets[0]
                                      .backgroundColor as string[])
                                  : typeof data.datasets[0].backgroundColor ===
                                    "string"
                                  ? Array(labels.length).fill(
                                      data.datasets[0].backgroundColor
                                    )
                                  : [
                                      data.datasets[0]
                                        .backgroundColor as string,
                                    ];
                                return labels.map((label, i) => ({
                                  text: label,
                                  fillStyle:
                                    (backgroundColors[i] as string) ||
                                    "#000000",
                                  hidden: false,
                                  lineWidth: 0,
                                  fontColor: "#000",
                                }));
                              },
                            },
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
                <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center">
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
                            display: false, // Hide legend for Line chart if not needed
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
                <div className="bg-white shadow-lg rounded-lg p-6 col-span-1 md:col-span-2 flex flex-col items-center">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4 self-start">
                    Expense Breakdown by Category (Pending)
                  </h2>
                  <div className="w-full h-[250px]">
                    <Bar
                      data={{
                        labels: Object.keys(chartData?.breakdownPending || {}),
                        datasets: [
                          {
                            label: "Pending Expenses",
                            data: Object.values(
                              chartData?.breakdownPending || {}
                            ),
                            backgroundColor: "rgba(255, 206, 86, 0.2)",
                            borderColor: "rgba(255, 206, 86, 1)",
                            borderWidth: 1,
                          },
                        ],
                      }}
                      options={{
                        maintainAspectRatio: false,
                        plugins: {
                          title: {
                            display: true,
                            text: "Expense Breakdown by Category (Pending)",
                            font: { size: 16 },
                          },
                          legend: {
                            display: false, // Hide legend for Bar chart if not needed
                          },
                          tooltip: {
                            callbacks: {
                              label: (context) => {
                                const value = context.raw as number;
                                return `${
                                  context.label
                                }: ₹${value.toLocaleString()}`;
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
                              text: "Category",
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
                <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4 self-start">
                    Monthly Expense Trend (Pending)
                  </h2>
                  <div className="w-full h-[250px]">
                    <Line
                      data={{
                        labels: Object.keys(
                          chartData?.monthlyTrendPending || {}
                        ),
                        datasets: [
                          {
                            label: "Pending Expenses",
                            data: Object.values(
                              chartData?.monthlyTrendPending || {}
                            ),
                            borderColor: "rgba(255, 206, 86, 1)",
                            backgroundColor: "rgba(255, 206, 86, 0.2)",
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
                            text: "Monthly Expense Trend (Pending)",
                            font: { size: 16 },
                          },
                          legend: {
                            display: false, // Hide legend for Line chart if not needed
                          },
                          tooltip: {
                            callbacks: {
                              label: (context) => {
                                const value = context.raw as number;
                                return `Pending: ₹${value.toLocaleString()}`;
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
                <div className="bg-white shadow-lg rounded-lg p-6 col-span-1 md:col-span-2 flex flex-col items-center">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4 self-start">
                    Expense Breakdown by Category (Settled)
                  </h2>
                  <div className="w-full h-[250px]">
                    <Bar
                      data={{
                        labels: Object.keys(chartData?.breakdownSettled || {}),
                        datasets: [
                          {
                            label: "Settled Expenses",
                            data: Object.values(
                              chartData?.breakdownSettled || {}
                            ),
                            backgroundColor: "rgba(75, 192, 192, 0.2)",
                            borderColor: "rgba(75, 192, 192, 1)",
                            borderWidth: 1,
                          },
                        ],
                      }}
                      options={{
                        maintainAspectRatio: false,
                        plugins: {
                          title: {
                            display: true,
                            text: "Expense Breakdown by Category (Settled)",
                            font: { size: 16 },
                          },
                          legend: {
                            display: false, // Hide legend for Bar chart if not needed
                          },
                          tooltip: {
                            callbacks: {
                              label: (context) => {
                                const value = context.raw as number;
                                return `${
                                  context.label
                                }: ₹${value.toLocaleString()}`;
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
                              text: "Category",
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
                <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4 self-start">
                    Monthly Expense Trend (Settled)
                  </h2>
                  <div className="w-full h-[250px]">
                    <Line
                      data={{
                        labels: Object.keys(
                          chartData?.monthlyTrendSettled || {}
                        ),
                        datasets: [
                          {
                            label: "Settled Expenses",
                            data: Object.values(
                              chartData?.monthlyTrendSettled || {}
                            ),
                            borderColor: "rgba(75, 192, 192, 1)",
                            backgroundColor: "rgba(75, 192, 192, 0.2)",
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
                            text: "Monthly Expense Trend (Settled)",
                            font: { size: 16 },
                          },
                          legend: {
                            display: false, // Hide legend for Line chart if not needed
                          },
                          tooltip: {
                            callbacks: {
                              label: (context) => {
                                const value = context.raw as number;
                                return `Settled: ₹${value.toLocaleString()}`;
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
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-lg font-semibold text-orange-500 mb-4">
            Recent Expenses
          </h2>
          {expenses.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No recent expenses found.
            </p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-600">
                  <th className="py-3 px-4 text-left">Description</th>
                  <th className="py-3 px-4 text-left">Type</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Date Added</th>
                  <th className="py-3 px-4 text-center">Group</th>
                  <th className="py-3 px-4 text-center">Completed?</th>
                  <th className="py-3 px-4 text-center">Show Details</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => {
                  // console.log(
                  //   "Rendering expense:",
                  //   JSON.stringify(expense, null, 2)
                  // ); // Log for debugging (optional)
                  return (
                    <React.Fragment key={expense._id}>
                      <tr className="border-t hover:bg-gray-100 transition">
                        <td className="py-3 px-4">{expense.description}</td>
                        <td className="py-3 px-4">{expense.type}</td>
                        <td className="py-3 px-4 text-right text-indigo-500 font-bold">
                          {expense.currency === "INR"
                            ? "₹"
                            : expense.currency === "EUR"
                            ? "€"
                            : expense.currency === "USD"
                            ? "$"
                            : expense.currency === "GBP"
                            ? "£"
                            : "¥"}
                          {expense.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-500">
                          {new Date(expense.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {expense.groupId
                            ? groupMapping[expense.groupId] || "Unknown Group"
                            : "-"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {expense.expenseStatus ? "Yes" : "No"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {expense.groupId ? (
                            <button
                              onClick={() => toggleExpand(expense._id)}
                              className="text-blue-500 hover:text-blue-700 text-lg"
                            >
                              {expandedRows.includes(expense._id) ? "🔼" : "🔽"}
                            </button>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                      {expense.groupId &&
                        expandedRows.includes(expense._id) && (
                          <tr key={`details-${expense._id}`}>
                            <td
                              colSpan={7}
                              className="bg-gray-50 p-4 rounded-lg shadow-inner"
                            >
                              <h3 className="font-semibold text-gray-700 mb-2">
                                Expense Breakdown
                              </h3>
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr className="bg-gray-200 text-gray-600">
                                    <th className="py-2 px-3 text-left">Who</th>
                                    <th className="py-2 px-3 text-center">
                                      Owes
                                    </th>
                                    <th className="py-2 px-3 text-center">
                                      Whom
                                    </th>
                                    <th className="py-2 px-3 text-center">
                                      Payment Done?
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {expense.splitDetails
                                    ?.filter(
                                      (member) =>
                                        member.user?.fullName !==
                                        expense.payer.fullName // Filter out self-payments
                                    )
                                    .map((member, index) => {
                                      // console.log(
                                      //   `Rendering split detail for expense ${expense._id}, member ${index}:`,
                                      //   JSON.stringify(member, null, 2)
                                      // ); // Log for debugging (optional)
                                      const isPaymentDone =
                                        !!member.transactionId; // Boolean check for transactionId
                                      const amountColor = isPaymentDone
                                        ? "text-green-500"
                                        : "text-red-500";
                                      const statusColor = isPaymentDone
                                        ? "text-green-500"
                                        : "text-red-500";

                                      return (
                                        <tr
                                          key={`${expense._id}-member-${index}`}
                                          className="border-t"
                                        >
                                          <td className="py-2 px-3">
                                            {member.user?.fullName || "Unknown"}
                                          </td>
                                          <td
                                            className={`py-2 px-3 text-center font-bold ${amountColor}`}
                                          >
                                            {expense.currency === "INR"
                                              ? "₹"
                                              : expense.currency === "EUR"
                                              ? "€"
                                              : expense.currency === "USD"
                                              ? "$"
                                              : expense.currency === "GBP"
                                              ? "£"
                                              : "¥"}
                                            {Number(
                                              member.amountOwed
                                            ).toLocaleString()}
                                          </td>
                                          <td className="py-2 px-3 text-center">
                                            {expense.payer.fullName ||
                                              "Unknown"}{" "}
                                            {/* Debug payee name */}
                                          </td>
                                          <td
                                            className={`py-2 px-3 font-bold text-center ${statusColor}`}
                                          >
                                            {isPaymentDone ? "Yes" : "No"}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
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
