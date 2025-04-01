"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import {
  validateTokenWithRedis,
  extendSession,
  getSessionStatus,
} from "@/utils/redis";
import { toast } from "react-toastify"; // Assuming you're using react-toastify

interface SessionManagerProps {
  children: React.ReactNode;
}

const SessionManager: React.FC<SessionManagerProps> = ({ children }) => {
  const { token, logout } = useAuth() || {};
  const router = useRouter();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [sessionExpiryWarning, setSessionExpiryWarning] = useState(false);

  // Check session validity on mount and periodically
  useEffect(() => {
    if (!token) {
      setSessionChecked(true);
      return;
    }

    // Initial session check
    const checkSession = async () => {
      try {
        const isValid = await validateTokenWithRedis(token);

        if (!isValid && logout) {
          toast.error("Your session has expired. Please log in again.");
          await logout();
          router.push("/login");
        } else {
          setSessionChecked(true);
        }
      } catch (error) {
        console.error("Session validation error:", error);
        setSessionChecked(true); // Continue even if validation fails
      }
    };

    checkSession();

    // Set up periodic session validation (every 5 minutes)
    const sessionInterval = setInterval(async () => {
      if (token) {
        try {
          const sessionStatus = await getSessionStatus(token);

          // If session is invalid, logout
          if (!sessionStatus.valid && logout) {
            toast.error("Your session has expired. Please log in again.");
            await logout();
            router.push("/login");
            return;
          }

          // Check if session will expire soon (within 10 minutes)
          if (sessionStatus.expiresIn && sessionStatus.expiresIn < 10 * 60) {
            setSessionExpiryWarning(true);
          } else {
            setSessionExpiryWarning(false);
          }
        } catch (error) {
          console.error("Periodic session check error:", error);
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => {
      clearInterval(sessionInterval);
    };
  }, [token, logout, router]);

  // Handle user activity to extend session
  useEffect(() => {
    if (!token) return;

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    let activityTimeout: NodeJS.Timeout;

    // Debounced function to extend session on user activity
    const handleUserActivity = () => {
      clearTimeout(activityTimeout);

      // Wait 5 seconds of inactivity before making the API call to avoid too many requests
      activityTimeout = setTimeout(async () => {
        if (token) {
          try {
            await extendSession(token);
            // Successfully extended session
            if (sessionExpiryWarning) {
              setSessionExpiryWarning(false);
              toast.success("Your session has been extended");
            }
          } catch (error) {
            console.error("Error extending session:", error);
          }
        }
      }, 5000);
    };

    // Add event listeners for user activity
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    return () => {
      // Clean up event listeners
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      clearTimeout(activityTimeout);
    };
  }, [token, sessionExpiryWarning]);

  // Render session expiry warning modal/toast
  useEffect(() => {
    if (sessionExpiryWarning) {
      const warningToast = toast.warning(
        "Your session will expire soon. Continue using the app to stay logged in.",
        {
          autoClose: false,
          closeOnClick: false,
          position: "bottom-center",
          closeButton: true,
          onClose: () => setSessionExpiryWarning(false),
        }
      );

      return () => {
        toast.dismiss(warningToast);
      };
    }
  }, [sessionExpiryWarning]);

  // Render loading or children based on session check status
  if (!sessionChecked && token) {
    // Optional: Show a loading indicator while validating session
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SessionManager;
