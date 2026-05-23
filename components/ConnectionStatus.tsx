"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const [reconnected, setReconnected] = useState(false);
  const wasDisconnected = useRef(false);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);

    if (!isConnected) {
      wasDisconnected.current = true;
      setReconnected(false);
      setShowStatus(true);
    } else if (wasDisconnected.current) {
      // Only show "reconnected" banner if we were previously disconnected
      setReconnected(true);
      setShowStatus(true);
      hideTimeout.current = setTimeout(() => {
        setShowStatus(false);
        setReconnected(false);
      }, 3000);
    }

    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
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
              reconnected
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            <FontAwesomeIcon
              icon={reconnected ? faWifi : faExclamationTriangle}
              className="text-white/80"
            />
            <span className="text-sm font-medium">
              {reconnected ? "Reconnected" : "Connection lost — reconnecting..."}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectionStatus;
