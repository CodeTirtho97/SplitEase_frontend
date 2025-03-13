import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface LoadingTip {
  title: string;
  content: string;
}

interface UnifiedLoadingScreenProps {
  message?: string;
  logoSrc?: string;
  showTips?: boolean;
  section?:
    | "dashboard"
    | "expenses"
    | "groups"
    | "payments"
    | "profile"
    | "generic";
}

const UnifiedLoadingScreen: React.FC<UnifiedLoadingScreenProps> = ({
  message = "Loading...",
  logoSrc = "/logo.png",
  showTips = true,
  section = "generic",
}) => {
  const [currentTip, setCurrentTip] = useState(0);

  // Tips that can be shown during loading
  const loadingTips: LoadingTip[] = [
    {
      title: "Track Everything",
      content:
        "Track every expense, no matter how small. Those ₹10 chai breaks add up quickly!",
    },
    {
      title: "Fair Splits",
      content:
        "Use split features to fairly divide group expenses and avoid awkward money conversations.",
    },
    {
      title: "Stay Organized",
      content:
        "Set monthly budgets for shared expenses. Transparency helps prevent financial misunderstandings.",
    },
    {
      title: "Be Prepared",
      content:
        "Always have a small emergency fund for unexpected group expenses or personal emergencies.",
    },
    {
      title: "Review Regularly",
      content:
        "Review your expenses monthly. Understanding spending patterns helps you save more.",
    },
  ];

  // Determine gradient colors based on section
  const getGradientColors = () => {
    switch (section) {
      case "dashboard":
        return "from-indigo-800 via-indigo-700 to-purple-800";
      case "expenses":
        return "from-purple-800 via-purple-700 to-indigo-800";
      case "groups":
        return "from-blue-800 via-indigo-700 to-purple-800";
      case "payments":
        return "from-purple-900 via-indigo-800 to-blue-900";
      case "profile":
        return "from-indigo-900 via-purple-700 to-indigo-800";
      default:
        return "from-indigo-800 via-purple-700 to-indigo-800";
    }
  };

  // Cycle through tips
  useEffect(() => {
    if (!showTips) return;

    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % loadingTips.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [showTips, loadingTips.length]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br ${getGradientColors()} overflow-hidden`}
    >
      {/* Background Animation Elements */}
      <div className="absolute inset-0 opacity-20">
        {/* Animated Circles */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Logo and Spinner */}
      <div className="mb-10 relative z-10">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-white/20 blur-md animate-pulse"></div>
          <div className="w-24 h-24 relative">
            {logoSrc ? (
              <Image
                src={logoSrc}
                alt="SplitEase Logo"
                width={96}
                height={96}
                className="rounded-full p-1 bg-white/10 backdrop-blur-sm"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <span className="text-4xl font-bold text-white">S</span>
              </div>
            )}
            <div className="absolute inset-0 rounded-full border-4 border-t-white/80 border-white/20 animate-spin"></div>
          </div>
        </div>
      </div>

      {/* Loading Message */}
      <motion.h2
        className="text-2xl font-semibold text-white mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {message}
      </motion.h2>

      {/* Loading Progress Indicator */}
      <div className="w-48 h-1.5 bg-white/20 rounded-full mb-12 overflow-hidden">
        <div className="h-full bg-white animate-loading-progress rounded-full"></div>
      </div>

      {/* Financial Tip Section */}
      {showTips && (
        <motion.div
          key={currentTip}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full mx-4 p-6 bg-white/10 backdrop-blur-md rounded-xl shadow-lg"
        >
          <h3 className="text-xl font-semibold text-white mb-2">
            {loadingTips[currentTip].title}
          </h3>
          <p className="text-white/90">{loadingTips[currentTip].content}</p>
        </motion.div>
      )}
    </div>
  );
};

export default UnifiedLoadingScreen;
