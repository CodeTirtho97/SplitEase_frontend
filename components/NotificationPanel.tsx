"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCheckCircle,
  faExclamationCircle,
  faTrash,
  faCheckDouble,
  faCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useSocket } from "@/context/socketContext";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const NotificationPanel: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    isConnected,
  } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Close panel on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  // Auto-mark as read when panel opens
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  }, [isOpen, unreadCount, markAllAsRead]);

  // Toggle notification panel
  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  // Handle notification click - navigate to relevant page
  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);

    // Navigate based on notification type
    if (notification.data) {
      if (notification.data.expenseId) {
        router.push("/expenses");
      } else if (notification.data.transactionId) {
        router.push("/payments");
      } else if (notification.data.groupId) {
        router.push("/groups");
      }
    }

    setIsOpen(false);
  };

  // Format notification timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="notification-container relative z-50">
      {/* Notification Bell with Badge */}
      <button
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
        onClick={togglePanel}
        aria-label="Notifications"
      >
        <FontAwesomeIcon icon={faBell} className="text-gray-600 text-xl" />

        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}

        {/* Connection status indicator */}
        <div
          className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
            isConnected ? "bg-green-500" : "bg-gray-400"
          }`}
        ></div>
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 20, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute top-12 right-0 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
                <h3 className="text-white font-semibold flex items-center">
                  <FontAwesomeIcon icon={faBell} className="mr-2" />
                  Notifications
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={markAllAsRead}
                    className="text-xs bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded transition-colors"
                    title="Mark all as read"
                  >
                    <FontAwesomeIcon icon={faCheckDouble} className="mr-1" />
                    Read All
                  </button>
                  <button
                    onClick={clearNotifications}
                    className="text-xs bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded transition-colors"
                    title="Clear all notifications"
                  >
                    <FontAwesomeIcon icon={faTrash} className="mr-1" />
                    Clear
                  </button>
                </div>
              </div>

              {/* Connection status */}
              <div
                className={`px-4 py-2 text-xs flex items-center ${
                  isConnected
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-50 text-gray-600"
                }`}
              >
                <div
                  className={`h-2 w-2 rounded-full mr-2 ${
                    isConnected ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></div>
                {isConnected
                  ? "Real-time connection active"
                  : "Connecting to real-time service..."}
              </div>

              {/* Notifications List */}
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <FontAwesomeIcon
                        icon={faBell}
                        className="text-gray-400 text-xl"
                      />
                    </div>
                    <p className="text-gray-500">No notifications yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      You'll be notified about important updates
                    </p>
                  </div>
                ) : (
                  <div>
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors flex items-start ${
                          notification.read ? "" : "bg-indigo-50/70"
                        }`}
                      >
                        <div className="mt-1 mr-3">
                          {notification.type === "error" ? (
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                              <FontAwesomeIcon
                                icon={faExclamationCircle}
                                className="text-red-500"
                              />
                            </div>
                          ) : notification.type === "success" ? (
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <FontAwesomeIcon
                                icon={faCheckCircle}
                                className="text-green-500"
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <FontAwesomeIcon
                                icon={faCircle}
                                className="text-blue-500"
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-800 truncate pr-2">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-4 py-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                  {isConnected
                    ? "All updates are in real-time"
                    : "Connecting to real-time service..."}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationPanel;
