import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileInvoiceDollar,
  faChevronDown,
  faChevronUp,
  faExclamationCircle,
  faCheckCircle,
  faReceipt,
} from "@fortawesome/free-solid-svg-icons";

// Define types
interface User {
  userId?: string;
  id?: string;
  _id?: string;
  fullName?: string;
  email?: string;
}

interface SplitDetail {
  userId?: string;
  amountOwed: number;
  percentage?: number;
  transactionId?: string;
  user?: {
    _id?: string;
    fullName: string;
    email?: string;
  };
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
  splitDetails: SplitDetail[];
  payer: {
    _id?: string;
    id?: string;
    fullName: string;
    email?: string;
  };
}

interface RecentExpensesTableProps {
  expenses: Expense[];
  expandedRows: string[];
  toggleExpand: (expenseId: string) => void;
  groupMapping: { [key: string]: string };
  animate: boolean;
  user: User | null;
}

const RecentExpensesTable: React.FC<RecentExpensesTableProps> = ({
  expenses,
  expandedRows,
  toggleExpand,
  groupMapping,
  animate,
  user,
}) => {
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
            icon={faReceipt}
            className="text-6xl text-orange-400 absolute z-10"
          />
          <div
            className={`absolute inset-0 bg-orange-100 rounded-full scale-0 ${
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
    </div>
  );

  if (expenses.length === 0) {
    return <EmptyExpensesState />;
  }

  const currencySymbols: { [key: string]: string } = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };

  // Helper function to check if user is the payer
  const isUserPayer = (expense: Expense): boolean => {
    if (!user || !expense.payer) return false;

    const payerId = expense.payer._id || expense.payer.id;
    const userId = user.userId || user.id || user._id;

    return payerId === userId;
  };

  // Helper function to check if user is involved in a split
  const isUserInvolved = (
    userDetail: { _id?: string; fullName: string } | undefined
  ): boolean => {
    if (!user || !userDetail || !userDetail._id) return false;

    const userId = user.userId || user.id || user._id;
    return userDetail._id === userId;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-400 to-amber-300 px-6 py-4 flex items-center">
        <FontAwesomeIcon
          icon={faFileInvoiceDollar}
          className="text-white text-xl mr-3"
        />
        <h2 className="text-xl font-bold text-white">Recent Expenses</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600 tracking-wider">
                Description
              </th>
              <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600 tracking-wider hidden md:table-cell">
                Type
              </th>
              <th className="py-4 px-6 text-right text-sm font-semibold text-gray-600 tracking-wider">
                Amount
              </th>
              <th className="py-4 px-6 text-center text-sm font-semibold text-gray-600 tracking-wider hidden md:table-cell">
                Date Added
              </th>
              <th className="py-4 px-6 text-center text-sm font-semibold text-gray-600 tracking-wider hidden lg:table-cell">
                Group
              </th>
              <th className="py-4 px-6 text-center text-sm font-semibold text-gray-600 tracking-wider hidden md:table-cell">
                Status
              </th>
              <th className="py-4 px-6 text-center text-sm font-semibold text-gray-600 tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense, index) => {
              // Check if the current user is the payer
              const userIsPayer = isUserPayer(expense);

              return (
                <React.Fragment key={expense._id}>
                  <tr
                    className={`hover:bg-gray-50 transition-all duration-300 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="py-4 px-6 text-sm text-gray-800 font-medium border-t border-gray-100">
                      <div className="flex items-center">
                        <span className="truncate max-w-[150px]">
                          {expense.description}
                        </span>
                        {userIsPayer && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            You Paid
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-800 border-t border-gray-100 hidden md:table-cell">
                      <span
                        className={`px-2 py-1 rounded-full text-xs text-white ${
                          expense.type === "Food"
                            ? "bg-red-400"
                            : expense.type === "Transportation"
                            ? "bg-blue-400"
                            : expense.type === "Accommodation"
                            ? "bg-yellow-500"
                            : expense.type === "Utilities"
                            ? "bg-green-500"
                            : expense.type === "Entertainment"
                            ? "bg-purple-500"
                            : "bg-gray-500"
                        }`}
                      >
                        {expense.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-right font-bold border-t border-gray-100">
                      <span
                        className={`${
                          expense.expenseStatus
                            ? "text-green-600"
                            : "text-indigo-600"
                        }`}
                      >
                        {currencySymbols[expense.currency] || ""}
                        {expense.totalAmount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-center text-gray-500 border-t border-gray-100 hidden md:table-cell">
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-sm text-center border-t border-gray-100 hidden lg:table-cell">
                      {expense.groupId ? (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {groupMapping[expense.groupId] || "Unknown Group"}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-center border-t border-gray-100 hidden md:table-cell">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          expense.expenseStatus
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {expense.expenseStatus ? "Completed" : "Pending"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-center border-t border-gray-100">
                      <button
                        onClick={() => toggleExpand(expense._id)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        <FontAwesomeIcon
                          icon={
                            expandedRows.includes(expense._id)
                              ? faChevronUp
                              : faChevronDown
                          }
                          className="text-sm"
                        />
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Row - Expense Breakdown */}
                  {expandedRows.includes(expense._id) && (
                    <tr>
                      <td colSpan={7} className="py-0 px-0 border-t-0">
                        <div className="bg-gray-50 p-6 border-t border-b border-gray-200">
                          <div className="mb-4 flex items-center">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                              <FontAwesomeIcon
                                icon={faFileInvoiceDollar}
                                className="text-indigo-600"
                              />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">
                              Expense Breakdown
                            </h3>
                          </div>

                          <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-gray-100">
                                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                                    Who
                                  </th>
                                  <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                                    Owes
                                  </th>
                                  <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                                    Whom
                                  </th>
                                  <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
                                    Payment Status
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
                                    const isPaymentDone =
                                      !!member.transactionId;
                                    const amountColor = isPaymentDone
                                      ? "text-green-600"
                                      : "text-red-600";

                                    // Check if the current user is involved in this split
                                    const isCurrentUserInvolved =
                                      isUserInvolved(member.user) ||
                                      isUserPayer(expense);

                                    return (
                                      <tr
                                        key={`${expense._id}-member-${index}`}
                                        className={`border-b border-gray-200 ${
                                          isCurrentUserInvolved
                                            ? "bg-blue-50"
                                            : ""
                                        } ${
                                          index % 2 === 0 ? "" : "bg-gray-50"
                                        }`}
                                      >
                                        <td className="py-3 px-4 text-sm">
                                          <div className="flex items-center">
                                            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center mr-3 text-xs font-bold">
                                              {member.user?.fullName?.charAt(
                                                0
                                              ) || "?"}
                                            </div>
                                            <span className="font-medium">
                                              {member.user?.fullName ||
                                                "Unknown"}
                                              {isUserInvolved(member.user) && (
                                                <span className="ml-1 text-xs bg-indigo-100 text-indigo-800 px-1 py-0.5 rounded">
                                                  You
                                                </span>
                                              )}
                                            </span>
                                          </div>
                                        </td>
                                        <td
                                          className={`py-3 px-4 text-sm text-center font-bold ${amountColor}`}
                                        >
                                          {currencySymbols[expense.currency] ||
                                            ""}
                                          {Number(
                                            member.amountOwed
                                          ).toLocaleString()}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-center">
                                          <div className="flex items-center justify-center">
                                            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center mr-2 text-xs font-bold">
                                              {expense.payer.fullName?.charAt(
                                                0
                                              ) || "?"}
                                            </div>
                                            <span className="font-medium">
                                              {expense.payer.fullName ||
                                                "Unknown"}
                                              {isUserPayer(expense) && (
                                                <span className="ml-1 text-xs bg-indigo-100 text-indigo-800 px-1 py-0.5 rounded">
                                                  You
                                                </span>
                                              )}
                                            </span>
                                          </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-center">
                                          {isPaymentDone ? (
                                            <div className="flex items-center justify-center">
                                              <FontAwesomeIcon
                                                icon={faCheckCircle}
                                                className="text-green-500 mr-1"
                                              />
                                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                                Paid
                                              </span>
                                            </div>
                                          ) : (
                                            <div className="flex items-center justify-center">
                                              <FontAwesomeIcon
                                                icon={faExclamationCircle}
                                                className="text-red-500 mr-1"
                                              />
                                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                                                Pending
                                              </span>
                                            </div>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentExpensesTable;
