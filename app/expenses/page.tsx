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
} from "@fortawesome/free-solid-svg-icons";
import { Pie, Bar, Line } from "react-chartjs-2";
import "chart.js/auto";
import expenseApi from "@/utils/api/expense";
import DashboardCards from "@/components/ExpenseCard";
import { useGroups } from "@/context/groupContext";
import ExpenseModal from "@/components/ExpenseModal";
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
    } catch (error) {
      console.error("Error fetching recent expenses:", error);
      setToast({ message: "Failed to load recent expenses", type: "error" });
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
    } catch (error) {
      console.error("Error fetching expense summary:", error);
      setError("Failed to load summary");
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
    } catch (error) {
      console.error("Error fetching expense breakdown:", error);
      setChartData(null);
      setToast({ message: "Failed to load chart data", type: "error" });
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
          await fetchRecentExpenses();
          await fetchSummary();
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
        // Refresh expenses list after adding a new expense
        fetchRecentExpenses();
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

  // Empty state component for no expenses
  const EmptyExpensesState = () => (
    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <FontAwesomeIcon
          icon={faFileInvoiceDollar}
          className="text-6xl text-purple-400 mb-4"
        />
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
        className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl flex items-center gap-2"
      >
        <FontAwesomeIcon icon={faPlus} />
        <span>Add Your First Expense</span>
      </Button>
    </div>
  );

  // Empty state component for charts
  const EmptyChartsState = () => (
    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-lg col-span-1 md:col-span-3">
      <div className="text-center mb-6">
        <FontAwesomeIcon
          icon={faChartLine}
          className="text-5xl text-blue-400 mb-4"
        />
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
    <div className="flex min-h-screen bg-gray-100 pt-20">
      <Sidebar activePage="expenses" />
      <div className="flex-1 p-8">
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
          expenses={expenses}
          summary={summary}
          fetchSummary={fetchSummary}
          error={error}
          selectedCurrency={selectedCurrency}
          setSelectedCurrency={setSelectedCurrency}
        />

        <button
          onClick={() => setShowCharts(!showCharts)}
          className="bg-gray-700 text-white px-4 py-2 rounded-md mb-6"
        >
          {showCharts ? "Hide Charts" : "Show Charts"}
        </button>

        {showCharts && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {loadingCharts ? (
              <div className="w-full text-center py-10 col-span-1 md:col-span-3">
                <p className="text-xl text-gray-500">Loading charts...</p>
              </div>
            ) : !chartData ||
              (Object.keys(chartData?.breakdown || {}).length === 0 &&
                Object.keys(chartData?.monthlyTrend || {}).length === 0) ? (
              <EmptyChartsState />
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

                {/* Rest of the charts - same as original */}
                {/* ...additional charts would go here... */}
              </>
            )}
          </div>
        )}

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-lg font-semibold text-orange-500 mb-4">
            Recent Expenses
          </h2>
          {expenses.length === 0 ? (
            <EmptyExpensesState />
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
                {expenses.map((expense) => (
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
                    {expense.groupId && expandedRows.includes(expense._id) && (
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
                                <th className="py-2 px-3 text-center">Owes</th>
                                <th className="py-2 px-3 text-center">Whom</th>
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
                                    expense.payer.fullName
                                )
                                .map((member, index) => {
                                  const isPaymentDone = !!member.transactionId;
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
                                        {expense.payer.fullName || "Unknown"}
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
                ))}
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
