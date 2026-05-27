"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./authContext";
import { toast } from "react-toastify";

interface SocketContextType {
  isConnected: boolean;
  joinGroupRoom: (groupId: string) => void;
  leaveGroupRoom: (groupId: string) => void;
  addEventListener: <T>(event: string, callback: (data: T) => void) => void;
  removeEventListener: <T>(event: string, callback: (data: T) => void) => void;
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  reconnectSocket: () => Promise<void>;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: Record<string, any>;
}

// Create context with default values
const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  joinGroupRoom: () => {},
  leaveGroupRoom: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearNotifications: () => {},
  reconnectSocket: async () => {},
});

// Event handlers map
type EventHandlersMap = Record<string, Function[]>;

// Socket Provider
export const SocketProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { token, user } = useAuth() || { token: null, user: null };
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [eventHandlers, setEventHandlers] = useState<EventHandlersMap>({
    expense_events: [],
    transaction_events: [],
    group_events: [],
    notification_events: [],
  });

  // Setup event handling helper function
  const setupEvent = useCallback(
    (socketInstance: Socket, eventName: string) => {
      socketInstance.on(eventName, (data: any) => {
        console.log(`Received ${eventName}:`, data);

        // Notify event handlers
        if (eventHandlers[eventName]) {
          eventHandlers[eventName].forEach((handler) => {
            try {
              handler(data);
            } catch (error) {
              console.error(`Error in ${eventName} handler:`, error);
            }
          });
        }

        // Show toast notification based on event type
        if (eventName === "expense_events") {
          if (data.event === "expense_created") {
            toast.info(`New expense added: ${data.expense.description}`);
          } else if (data.event === "expense_deleted") {
            toast.info(`Expense deleted: ${data.expense.description}`);
          }
        } else if (eventName === "transaction_events") {
          if (data.event === "transaction_settled") {
            toast.success(
              `Transaction settled: ${data.transaction.currency} ${data.transaction.amount}`
            );
          } else if (data.event === "transaction_failed") {
            toast.error(
              `Transaction failed: ${data.transaction.currency} ${data.transaction.amount}`
            );
          }
        } else if (eventName === "group_events") {
          if (data.event === "group_created") {
            toast.info(`New group created: ${data.group.name}`);
          } else if (data.event === "group_updated") {
            toast.info(`Group updated: ${data.group.name}`);
          } else if (data.event === "group_deleted") {
            toast.info(`Group deleted: ${data.group.name}`);
          }
        }
      });
    },
    [eventHandlers]
  );

  // Initialize socket connection
  useEffect(() => {
    if (!token || !user) return;

    const socketUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

    const socketInstance = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      // Do not add any path, namespace, or extra options
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
      toast.success("Real-time connection established", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", {
        message: error.message,
        details: error,
        connectionURL: socketUrl,
        transportOptions: socketInstance.io.opts.transports,
      });
      setIsConnected(false);

      // Show more specific error message
      toast.error(
        `Connection error: ${error.message}. Trying to reconnect...`,
        {
          position: "bottom-right",
          autoClose: 5000,
        }
      );
    });

    socketInstance.on("connection_success", (data) => {
      console.log("Server confirmed connection:", data);
    });

    socketInstance.on("reconnect_attempt", (attemptNumber) => {
      console.log(`Socket reconnection attempt #${attemptNumber}`);
    });

    socketInstance.on("reconnect", () => {
      console.log("Socket reconnected successfully");
      setIsConnected(true);
      toast.success("Real-time connection restored", {
        position: "bottom-right",
        autoClose: 2000,
      });
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);

      // Only show toast for unexpected disconnections
      if (reason !== "io client disconnect") {
        toast.warn("Real-time connection lost. Reconnecting...", {
          position: "bottom-right",
          autoClose: 3000,
        });
      }
    });

    // Setup event handlers for different event types
    setupEvent(socketInstance, "expense_events");
    setupEvent(socketInstance, "transaction_events");
    setupEvent(socketInstance, "group_events");

    // Setup notification handling
    socketInstance.on("notification_events", (notification: Notification) => {
      // Add to notifications list
      setNotifications((prev) => [notification, ...prev].slice(0, 50));

      // Notify handlers
      if (eventHandlers.notification_events) {
        eventHandlers.notification_events.forEach((handler) => {
          try {
            handler(notification);
          } catch (error) {
            console.error("Error in notification handler:", error);
          }
        });
      }

      // Show toast notification
      toast[notification.type === "error" ? "error" : "info"](
        notification.message,
        {
          position: "bottom-right",
          autoClose: 3000,
        }
      );
    });

    return () => {
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [token, user]);

  // Join a group room
  const joinGroupRoom = useCallback(
    (groupId: string) => {
      if (!socket || !isConnected) {
        console.error("Socket not connected, cannot join group room");
        return;
      }

      socket.emit("join_group", groupId);
      console.log(`Joined group room: ${groupId}`);
    },
    [socket, isConnected]
  );

  // Leave a group room
  const leaveGroupRoom = useCallback(
    (groupId: string) => {
      if (!socket || !isConnected) {
        console.error("Socket not connected, cannot leave group room");
        return;
      }

      socket.emit("leave_group", groupId);
      console.log(`Left group room: ${groupId}`);
    },
    [socket, isConnected]
  );

  const reconnectSocket = useCallback(async () => {
    if (!token || !user) return;

    // Skip Redis validation on initial connection
    // We assume the token is valid since they just logged in
    try {
      // Disconnect existing socket if any
      if (socket) {
        socket.disconnect();
      }

      // Create a new socket connection
      const socketUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

      const socketInstance = io(socketUrl, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ["websocket"],
      });

      setSocket(socketInstance);

      // Setup event handlers
      socketInstance.on("connect", () => {
        setIsConnected(true);
      });

      socketInstance.on("connect_error", (error) => {
        console.error("Socket reconnection error:", error);
        setIsConnected(false);
        toast.error(
          "Connection issue. Some real-time features may be unavailable.",
          {
            position: "bottom-right",
            autoClose: 5000,
          }
        );
      });

      // Re-register all existing event handlers on the new socket instance
      Object.entries(eventHandlers).forEach(([eventName, handlers]) => {
        handlers.forEach((handler) => {
          socketInstance.on(eventName, handler as (...args: any[]) => void);
        });
      });
    } catch (error) {
      console.error("Error during socket reconnection:", error);
      // Don't log out here either
    }
  }, [token, user, socket, setupEvent, eventHandlers]);

  // Add event listener
  // Add event listener
  const addEventListener = useCallback(
    <T,>(event: string, callback: (data: T) => void) => {
      setEventHandlers((prev) => {
        const handlers = prev[event] || [];
        // Use type assertion with Function instead of any
        if (!handlers.includes(callback as Function)) {
          return {
            ...prev,
            [event]: [...handlers, callback as Function],
          };
        }
        return prev;
      });

      return true;
    },
    []
  );

  // Remove event listener
  const removeEventListener = useCallback(
    <T,>(event: string, callback: (data: T) => void) => {
      setEventHandlers((prev) => {
        const handlers = prev[event] || [];
        return {
          ...prev,
          [event]: handlers.filter((h) => h !== (callback as Function)),
        };
      });

      return true;
    },
    []
  );

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Context value
  const value = {
    isConnected,
    joinGroupRoom,
    leaveGroupRoom,
    addEventListener,
    removeEventListener,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    reconnectSocket,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

// Custom hook for using the socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
