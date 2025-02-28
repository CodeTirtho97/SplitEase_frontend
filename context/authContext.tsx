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
import { signup, login } from "../utils/api/auth"; // Only import server-safe functions

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
      setUser(data);
      setToken(data.token);
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
  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setLoading(false);
    setError(null);
    if (typeof window !== "undefined") {
      router.push("/login");
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
