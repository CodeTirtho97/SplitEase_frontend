import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  CreditCard,
  Wallet,
  PiggyBank,
  Calculator,
  TrendingUp,
  Banknote,
  AlarmClock,
  Share2,
  RefreshCcw,
} from "lucide-react";

// Array of cost-related financial tips
const FINANCIAL_TIPS = [
  {
    icon: <Lightbulb className="text-yellow-500" />,
    tip: "Track every expense, no matter how small. Those ₹10 chai breaks add up quickly!",
  },
  {
    icon: <CreditCard className="text-blue-500" />,
    tip: "Use split bill features to fairly divide group expenses and avoid awkward money conversations.",
  },
  {
    icon: <Wallet className="text-green-500" />,
    tip: "Set a monthly budget for shared expenses. Transparency helps prevent financial misunderstandings.",
  },
  {
    icon: <PiggyBank className="text-pink-500" />,
    tip: "Always have a small emergency fund for unexpected group expenses or personal emergencies.",
  },
  {
    icon: <Calculator className="text-purple-500" />,
    tip: "Review your expenses monthly. Understanding spending patterns helps you save more.",
  },
  {
    icon: <TrendingUp className="text-indigo-500" />,
    tip: "Negotiate group discounts or split bulk purchases to save money collectively.",
  },
  {
    icon: <Banknote className="text-emerald-500" />,
    tip: "Pay pending bills immediately to avoid late fees and maintain good financial karma.",
  },
  {
    icon: <AlarmClock className="text-orange-500" />,
    tip: "Set reminders for bill payments and expense settlements to stay financially organized.",
  },
  {
    icon: <Share2 className="text-teal-500" />,
    tip: "Communicate openly about shared expenses. Clear communication prevents financial conflicts.",
  },
  {
    icon: <RefreshCcw className="text-red-500" />,
    tip: "Regular expense tracking helps you identify and cut unnecessary spending habits.",
  },
];

export default function EnhancedLoadingScreen() {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    const tipCycle = setInterval(() => {
      setCurrentTipIndex(
        (prevIndex) => (prevIndex + 1) % FINANCIAL_TIPS.length
      );
    }, 5000); // Change tip every 5 seconds

    return () => clearInterval(tipCycle);
  }, []);

  const currentTip = FINANCIAL_TIPS[currentTipIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center 
      bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 
      overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
          animate-pulse-slow origin-center transform -skew-y-12"
        ></div>
      </div>

      {/* Loading Content */}
      <motion.div
        key="loading-content"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center max-w-xl w-full px-4"
      >
        {/* Spinning Loader */}
        <svg
          className="mx-auto w-24 h-24 text-white animate-spin"
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
            d="M4 12a8 8 0 018-8V4a8 8 0 00-8 8h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>

        {/* Financial Tip Section */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTipIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mt-6 p-6 bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl"
          >
            <div className="flex items-center justify-center mb-4">
              {currentTip.icon}
              <h2 className="ml-3 text-white font-semibold text-xl">
                Quick Financial Tip
              </h2>
            </div>
            <p className="text-white text-base text-center">{currentTip.tip}</p>
          </motion.div>
        </AnimatePresence>

        {/* Loading Text */}
        <div className="mt-6">
          <p className="text-xl text-white/80 font-medium">
            Loading Dashboard
            <span className="animate-pulse">...</span>
          </p>
          <p className="text-sm text-white/60 mt-2">
            Preparing your financial insights securely
          </p>
        </div>
      </motion.div>
    </div>
  );
}
