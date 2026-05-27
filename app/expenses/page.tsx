"use client";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Button from "@/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import "chart.js/auto";
import expenseApi from "@/utils/api/expense";
import DashboardCards from "@/components/ExpenseCard";
import { useGroups } from "@/context/groupContext";
import ExpenseModal from "@/components/ExpenseModal";
import RecentExpensesTable from "@/components/RecentExpensesTable";
import ExpenseCharts from "@/components/ExpenseCharts";
import { useTransactionContext } from "@/context/transactionContext";
import { useAuth } from "@/context/authContext";
import { useSocket } from "@/context/socketContext";
import NotificationPanel from "@/components/NotificationPanel";
import ConnectionStatus from "@/components/ConnectionStatus";

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
  const { addEventListener, removeEventListener } = useSocket();
  const { groups: contextGroups, refreshGroups } = useGroups();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [showCharts, setShowCharts] = useState(false);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loadingCharts, setLoadingCharts] = useState(false);
  const recentExpensesAbortRef = useRef<AbortController | null>(null);
  const [summary, setSummary] = useState<
    { [key in Currency]?: Summary } | null
  >(null);
  const [_error, setError] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("INR");
  const { refreshExpenses: _refreshExpenses } = useTransactionContext();
  const [animate, setAnimate] = useState(false);

  // NEW: State to track overall loading status
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState({
    summary: false,
    expenses: false,
    charts: false,
  });

  // Track if component has mounted to prevent multiple fetches in Strict Mode
  const [hasMounted, setHasMounted] = useState(false);

  const currentSummary =
    summary && selectedCurrency && summary[selectedCurrency as Currency]
      ? summary[selectedCurrency as Currency]
      : null;

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

  // Function to check if all data is loaded
  const checkAllLoaded = useCallback(() => {
    const allLoaded =
      loadingProgress.summary &&
      loadingProgress.expenses &&
      loadingProgress.charts;

    if (allLoaded) {
      setIsLoading(false);
      setAnimate(true);
    }
  }, [loadingProgress]);

  // Fetch recent expenses only on page mount
  const fetchRecentExpenses = useCallback(async () => {
    recentExpensesAbortRef.current?.abort();
    recentExpensesAbortRef.current = new AbortController();
    const { signal } = recentExpensesAbortRef.current;
    try {
      const response = await expenseApi.getRecentExpenses(signal);
      setExpenses(response.data.expenses || []);
      setLoadingProgress((prev) => ({ ...prev, expenses: true }));
    } catch (error) {
      if ((error as { name?: string })?.name === "CanceledError") return;
      console.error("Error fetching recent expenses:", error);
      setLoadingProgress((prev) => ({ ...prev, expenses: true }));
      const errorMessage = (error as { response?: { data?: { message?: string }; status?: number } })?.response?.data?.message || "";
      const errorStatus = (error as { response?: { status?: number } })?.response?.status;
      if (
        !errorMessage.includes("No expenses") &&
        !errorMessage.includes("not found") &&
        errorStatus !== 404
      ) {
        toast.error("Failed to load recent expenses");
      }
    }
  }, []);

  // Fetch expense summary for the selected currency
  const fetchSummary = useCallback(async () => {
    try {
      const response = await expenseApi.getExpenseSummary(selectedCurrency);
      if (response.data?.summary) {
        setSummary(response.data.summary);
      } else {
        setSummary({});
      }
      setLoadingProgress((prev) => ({ ...prev, summary: true }));
    } catch (error) {
      console.error("Error fetching expense summary:", error);
      setLoadingProgress((prev) => ({ ...prev, summary: true }));

      const errorMessage = (error as any)?.response?.data?.message || "";
      if (
        !errorMessage.includes("No summary") &&
        !errorMessage.includes("not found")
      ) {
        setError("Failed to load summary");
      }
    }
  }, [selectedCurrency]);

  // Fetch chart data for the selected currency
  const fetchExpenseBreakdown = useCallback(async () => {
    setLoadingCharts(true);
    try {
      const response = await expenseApi.getExpenseBreakdown(selectedCurrency);
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
      setLoadingProgress((prev) => ({ ...prev, charts: true }));
    } catch (error) {
      console.error("Error fetching expense breakdown:", error);
      setChartData(null);
      setLoadingProgress((prev) => ({ ...prev, charts: true }));

      const errorMessage = (error as any)?.response?.data?.message || "";
      const errorStatus = (error as any)?.response?.status;
      if (
        !errorMessage.includes("No data") &&
        !errorMessage.includes("not found") &&
        !errorMessage.includes("No expenses") &&
        errorStatus !== 404
      ) {
        toast.error("Failed to load chart data");
      }
    } finally {
      setLoadingCharts(false);
    }
  }, []);

  useEffect(() => {
    // Handler for expense updates
    const handleExpenseUpdate = (data: any) => {
      console.log("Expense update received:", data);

      if (
        data.event === "expense_created" ||
        data.event === "expense_deleted"
      ) {
        // Directly fetch data instead of using state flags
        Promise.all([
          fetchRecentExpenses(),
          fetchSummary(),
          fetchExpenseBreakdown(),
        ]).catch((err) => {
          console.error("Error refreshing data after socket event:", err);
        });
      }
    };

    // Handler for transaction updates affecting expenses
    const handleTransactionUpdate = (data: any) => {
      console.log("Transaction update received:", data);

      if (
        data.event === "transaction_settled" ||
        data.event === "transaction_failed"
      ) {
        Promise.all([fetchRecentExpenses(), fetchSummary()]).catch((err) => {
          console.error("Error refreshing data after transaction event:", err);
        });
      }
    };

    if (addEventListener && removeEventListener) {
      // Register event listeners
      addEventListener("expense_update", handleExpenseUpdate);
      addEventListener("transaction_update", handleTransactionUpdate);

      // Cleanup on unmount
      return () => {
        removeEventListener("expense_update", handleExpenseUpdate);
        removeEventListener("transaction_update", handleTransactionUpdate);
      };
    }
  }, [addEventListener, removeEventListener]);

  // Check if all data has loaded whenever loading progress changes
  useEffect(() => {
    checkAllLoaded();
  }, [loadingProgress, checkAllLoaded]);

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
          // Fetch data in parallel
          await Promise.all([
            fetchRecentExpenses(),
            fetchSummary(),
            fetchExpenseBreakdown(),
          ]);
        } catch (error) {
          console.error("Error in fetchInitialData:", error);
          // Ensure we don't get stuck in loading state
          setLoadingProgress({
            summary: true,
            expenses: true,
            charts: true,
          });

          if (
            error instanceof Error &&
            !error.message.includes("No expenses") &&
            !error.message.includes("No data") &&
            !error.message.includes("not found")
          ) {
            toast.error("Failed to load initial data");
          }
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

  // Re-fetch summary and charts when currency selector changes
  useEffect(() => {
    if (!hasMounted) return;
    fetchSummary();
    fetchExpenseBreakdown();
  }, [selectedCurrency]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch groups when modal opens
  useEffect(() => {
    if (isModalOpen) {
      refreshGroups();
    }
  }, [isModalOpen, refreshGroups]);


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
      // First close the modal to prevent UI glitches
      setIsModalOpen(false);

      // Then make the API call
      const response = await expenseApi.createExpense(payload);

      if (response.status === 201) {
        toast.success("Expense added successfully!");

        // Fallback - in case sockets are not working, refresh data manually after a delay
        setTimeout(() => {
          fetchRecentExpenses();
          fetchSummary();
          fetchExpenseBreakdown();
        }, 1000);
      }
    } catch (error: any) {
      console.error("Error saving expense:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Error adding expense");
      // Reopen the modal if there was an error
      setIsModalOpen(true);
    }
  };

  const toggleExpand = (expenseId: string) => {
    setExpandedRows((prevRows) =>
      prevRows.includes(expenseId)
        ? prevRows.filter((id) => id !== expenseId)
        : [...prevRows, expenseId]
    );
  };

  // Empty state component for summary data
  const EmptySummaryState = () => (
    <div
      className={`rounded-lg bg-white shadow-md p-6 text-center mb-6 transition-all duration-500 ease-in-out transform ${
        animate ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className="flex items-center justify-center mb-2">
        <FontAwesomeIcon
          icon={faExclamationCircle}
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 pt-16">
        <Sidebar activePage="expenses" />
        <div className="flex-1 p-4 sm:p-6 md:p-8 animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-9 w-36 bg-gray-200 rounded-lg" />
            <div className="h-10 w-32 bg-gray-200 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="h-4 w-28 bg-gray-200 rounded mb-3" />
                <div className="h-8 w-36 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
          <div className="h-10 w-44 bg-gray-200 rounded-lg mb-6" />
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="h-12 bg-gray-100 border-b border-gray-200" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-gray-100">
                <div className="h-4 w-24 bg-gray-100 rounded" />
                <div className="h-4 flex-1 bg-gray-100 rounded" />
                <div className="h-4 w-20 bg-gray-100 rounded" />
                <div className="h-4 w-16 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main content renders only when loading is complete
  return (
    <div className="flex min-h-screen bg-gray-50 pt-16">
      <Sidebar activePage="expenses" />
      <div className="fixed top-5 right-5 z-50">
        <NotificationPanel />
      </div>
      <ConnectionStatus />
      <div className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Expenses</h1>
          <Button
            text="Add Expense"
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            size="lg"
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

        <ExpenseCharts
          showCharts={showCharts}
          setShowCharts={setShowCharts}
          chartData={chartData}
          loadingCharts={loadingCharts}
          animate={animate}
          selectedCurrency={selectedCurrency}
          summary={currentSummary}
        />

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
