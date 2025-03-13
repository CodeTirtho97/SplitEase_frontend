import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileInvoiceDollar,
  faChartLine,
  faSpinner,
  faMoneyBillWave,
  faSync,
} from "@fortawesome/free-solid-svg-icons";

interface ExpenseLoadingScreenProps {
  logoSrc?: string; // Optional logo image source
}

const ExpenseLoadingScreen: React.FC<ExpenseLoadingScreenProps> = ({
  logoSrc,
}) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-indigo-100 to-purple-100 z-50">
      {/* Logo and App Name */}
      <div className="mb-12 text-center">
        {logoSrc ? (
          <img
            src={logoSrc}
            alt="SplitEase Logo"
            className="h-16 mx-auto mb-4"
          />
        ) : (
          <div className="text-indigo-600 text-4xl font-bold mb-4 flex items-center">
            <span className="text-5xl text-orange-500 mr-2">S</span>
            plit<span className="text-purple-600">Ease</span>
          </div>
        )}
        <p className="text-gray-500 text-lg">Your Expense Tracking App</p>
      </div>

      {/* Loading Animation */}
      <div className="relative w-20 h-20 mb-10">
        <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-indigo-500 animate-spin"></div>
        <div className="absolute inset-3 rounded-full border-t-4 border-r-4 border-purple-500 animate-spin-reverse"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <FontAwesomeIcon
            icon={faMoneyBillWave}
            className="text-2xl text-indigo-600"
          />
        </div>
      </div>

      {/* Loading Message */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        Loading Your Expenses
      </h2>

      {/* Loading Stages */}
      <div className="mt-6 bg-white rounded-lg shadow-lg p-4 w-80 max-w-full">
        <div className="flex items-center mb-3">
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-green-100 mr-3">
            <FontAwesomeIcon icon={faSync} className="text-green-500" />
          </div>
          <div className="flex-grow">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">
                Getting summary data
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
              <div className="bg-green-500 h-1 rounded-full w-full"></div>
            </div>
          </div>
        </div>

        <div className="flex items-center mb-3">
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-purple-100 mr-3">
            <FontAwesomeIcon
              icon={faFileInvoiceDollar}
              className="text-purple-500 animate-pulse"
            />
          </div>
          <div className="flex-grow">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">
                Loading your expenses
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
              <div className="bg-purple-500 h-1 rounded-full w-full animate-pulse-linear"></div>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 mr-3">
            <FontAwesomeIcon icon={faChartLine} className="text-blue-500" />
          </div>
          <div className="flex-grow">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">
                Preparing analytics
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
              <div className="bg-blue-500 h-1 rounded-full w-3/4 animate-pulse-delay"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Extra Inspirational Message */}
      <p className="text-gray-500 mt-8 text-center max-w-md px-4">
        "The first step to financial freedom is tracking your expenses."
      </p>
    </div>
  );
};

export default ExpenseLoadingScreen;
