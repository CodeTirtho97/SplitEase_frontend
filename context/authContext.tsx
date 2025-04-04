"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation"; // Removed usePathname to simplify
import Cookies from "js-cookie"; // Using cookies instead of localStorage
import { signup, login, logout as apiLogout } from "../utils/api/auth"; // Only import server-safe functions

interface AuthContextType {
  user: any;
  token: string | null;
  signup: (userData: any) => Promise<void>;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  googleAuth: () => void;
  setUser: (user: any) => void;
  setToken: (token: string | null) => void;
  loading: boolean;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Load user and token from cookies on client-side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loadFromCookies = () => {
        const storedUser = Cookies.get("user");
        const storedToken = Cookies.get("token");

        if (storedUser && storedToken) {
          try {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
          } catch (e) {
            console.error("Error parsing stored user data:", e);
            Cookies.remove("user");
            Cookies.remove("token");
          }
        }
      };

      loadFromCookies();
    }
  }, []);

  // Sync user and token with cookies on client-side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (user && token) {
        Cookies.set("user", JSON.stringify(user), {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });
        Cookies.set("token", token, {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });
      } else {
        Cookies.remove("user");
        Cookies.remove("token");
      }
    }
  }, [user, token]);

  // Handle signup
  const handleSignup = async (userData: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await signup(userData);
      setUser(data);
      setToken(data.token);
      if (typeof window !== "undefined") {
        router.push("/dashboard");
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Signup failed!");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle login
  const handleLogin = async (credentials: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await login(credentials);

      // First set the auth state
      setUser(data.user);
      setToken(data.token);

      // Then set cookies with proper expiration
      Cookies.set("token", data.token, {
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      Cookies.set("user", JSON.stringify(data.user), {
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      // Give time for cookie setting
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (typeof window !== "undefined") {
        router.push("/dashboard");
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Login failed!");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    setLoading(true);
    setError(null);

    try {
      // Call the logout API to invalidate Redis session if token exists
      if (token) {
        await apiLogout(token);
      }

      // Clear local state
      setUser(null);
      setToken(null);

      // Clear cookies (the API call also does this, but we do it here as well for robustness)
      Cookies.remove("token");
      Cookies.remove("user");
      Cookies.remove("rememberedEmail");

      // Clear any localStorage items if you're using them
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

      return Promise.resolve();
    } catch (error: any) {
      console.error("Logout error:", error);

      // Still clear local state and cookies even if API call fails
      setUser(null);
      setToken(null);
      Cookies.remove("token");
      Cookies.remove("user");
      Cookies.remove("rememberedEmail");

      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

      // Don't set error state since we're logging out anyway
      return Promise.resolve();
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Auth (Client-side only, dynamic import)
  const handleGoogleAuth = () => {
    if (typeof window !== "undefined") {
      import("../utils/api/auth").then((module) => {
        module.googleAuth();
      });
    }
  };

  const value = {
    user,
    token,
    signup: handleSignup,
    login: handleLogin,
    logout: handleLogout,
    googleAuth: handleGoogleAuth,
    setUser,
    setToken,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
