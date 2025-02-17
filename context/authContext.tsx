"use client";

import { createContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { signup, login, googleAuth } from "../utils/api/auth";

interface AuthContextType {
  user: any;
  token: string | null;
  signup: (userData: any) => Promise<void>;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  googleAuth: () => void;
  setUser: (user: any) => void;
  setToken: (token: string | null) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const handleSignup = async (userData: any) => {
    const data = await signup(userData);
    setUser(data);
    setToken(data.token);
    localStorage.setItem("user", JSON.stringify(data));
    localStorage.setItem("token", data.token);
    router.push("/dashboard");
  };

  const handleLogin = async (credentials: any) => {
    const data = await login(credentials);
    setUser(data);
    setToken(data.token);
    localStorage.setItem("user", JSON.stringify(data));
    localStorage.setItem("token", data.token);
    router.push("/dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        signup: handleSignup,
        login: handleLogin,
        logout: handleLogout,
        googleAuth,
        setUser,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
