"use client";

import { createContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation"; // Removed usePathname to simplify
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

  // Load user and token from localStorage on client-side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loadFromLocalStorage = () => {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      };

      loadFromLocalStorage();

      // Listen for localStorage changes
      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === "user" || event.key === "token") {
          loadFromLocalStorage();
        }
      };

      window.addEventListener("storage", handleStorageChange);

      return () => window.removeEventListener("storage", handleStorageChange);
    }
  }, []);

  // Sync user and token with localStorage on client-side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (user && token) {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
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
