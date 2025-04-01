"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/context/socketContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWifi,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";

const ConnectionStatus: React.FC = () => {
  const { isConnected } = useSocket();
  const [showStatus, setShowStatus] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  // Show indicator on connection status change
  useEffect(() => {
    setShowStatus(true);

    // Clear any existing timeout
    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }

    // Hide after 5 seconds
    const timeout = setTimeout(() => {
      setShowStatus(false);
    }, 5000);

    setHideTimeout(timeout);

    return () => {
      if (hideTimeout) clearTimeout(hideTimeout);
    };
  }, [isConnected]);

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div
            className={`px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 ${
              isConnected
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                : "bg-gradient-to-r from-orange-500 to-red-500 text-white"
            }`}
          >
            <FontAwesomeIcon
              icon={isConnected ? faWifi : faExclamationTriangle}
              className={isConnected ? "text-green-200" : "text-orange-200"}
            />
            <span className="text-sm font-medium">
              {isConnected
                ? "Real-time connection active"
                : "Reconnecting to server..."}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectionStatus;
