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

// This import will be expected from the Redis utilities
// If validateTokenWithRedis doesn't exist yet, we'll need to create it
import { validateTokenWithRedis } from "@/utils/redis";

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
    expense_update: [],
    transaction_update: [],
    group_update: [],
    notification: [],
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
        if (eventName === "expense_update") {
          if (data.event === "expense_created") {
            toast.info(`New expense added: ${data.expense.description}`);
          } else if (data.event === "expense_deleted") {
            toast.info(`Expense deleted: ${data.expense.description}`);
          }
        } else if (eventName === "transaction_update") {
          if (data.event === "transaction_settled") {
            toast.success(
              `Transaction settled: ${data.transaction.currency} ${data.transaction.amount}`
            );
          } else if (data.event === "transaction_failed") {
            toast.error(
              `Transaction failed: ${data.transaction.currency} ${data.transaction.amount}`
            );
          }
        } else if (eventName === "group_update") {
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

    const socketUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://splitease-backend-34tz.onrender.com";

    const socketInstance = io(socketUrl, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket"],
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
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
    });

    // Setup event handlers for different event types
    setupEvent(socketInstance, "expense_update");
    setupEvent(socketInstance, "transaction_update");
    setupEvent(socketInstance, "group_update");

    // Setup notification handling
    socketInstance.on("notification", (notification: Notification) => {
      console.log("Received notification:", notification);

      // Add to notifications list
      setNotifications((prev) => [notification, ...prev].slice(0, 50)); // Keep last 50 notifications

      // Notify handlers
      if (eventHandlers.notification) {
        eventHandlers.notification.forEach((handler) => {
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
  }, [token, user, setupEvent]);

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

    // First validate the token with Redis to ensure it's still valid
    try {
      const isValid = await validateTokenWithRedis(token);

      if (!isValid) {
        console.log("Token is no longer valid, not reconnecting socket");
        return;
      }

      // Disconnect existing socket if any
      if (socket) {
        socket.disconnect();
      }

      // Create a new socket connection
      const socketUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://splitease-backend-34tz.onrender.com";

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
        console.log("Socket reconnected");
        setIsConnected(true);
      });

      socketInstance.on("connect_error", (error) => {
        console.error("Socket reconnection error:", error);
        setIsConnected(false);
      });

      socketInstance.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        setIsConnected(false);
      });

      // Setup events
      setupEvent(socketInstance, "expense_update");
      setupEvent(socketInstance, "transaction_update");
      setupEvent(socketInstance, "group_update");

      // Setup notification handling
      socketInstance.on("notification", (notification: Notification) => {
        console.log("Received notification:", notification);
        setNotifications((prev) => [notification, ...prev].slice(0, 50));

        if (eventHandlers.notification) {
          eventHandlers.notification.forEach((handler) => {
            try {
              handler(notification);
            } catch (error) {
              console.error("Error in notification handler:", error);
            }
          });
        }

        toast[notification.type === "error" ? "error" : "info"](
          notification.message,
          {
            position: "bottom-right",
            autoClose: 3000,
          }
        );
      });

      toast.success("Real-time connection refreshed", {
        position: "bottom-right",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Error during socket reconnection:", error);
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
