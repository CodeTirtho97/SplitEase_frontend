import axios from "axios";
import Cookies from "js-cookie"; // Using cookies instead of localStorage

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 🔹 Signup API Call
export const signup = async (userData: { fullName: string; email: string; gender: string; password: string; confirmPassword: string }) => {
  const response = await axios.post(`${API_URL}/auth/signup`, userData);
  return response.data;
};

// 🔹 Login API Call
export const login = async (credentials: { email: string; password: string }) => {
  const response = await axios.post(`${API_URL}/auth/login`, credentials);
  return response.data;
};

// 🔹 Google OAuth Redirect
export const googleAuth = () => {
  if (typeof window !== "undefined") {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/login`;
  }
  // Note: If called server-side, this will throw; handle in components with `typeof window !== "undefined"`
};

// 🔹 Handle Google OAuth Callback (Updated to use API call instead of URLSearchParams)
export const handleGoogleCallback = async (options?: { redirectUri?: string }): Promise<{ user: any; token: string }> => {
  try {
    const redirectUri = options?.redirectUri || (typeof window !== 'undefined' ? window.location.origin + '/auth/google/callback' : 'https://split-ease-v1-tirth.vercel.app/auth/google/callback');
    const response = await axios.get(`${API_URL}/auth/google/callback`, {
      withCredentials: true, // Include cookies for authentication
    });
    const { token, user } = response.data;

    if (token && user) {
      if (typeof window !== 'undefined') {
        Cookies.set("userToken", token, { expires: 7, secure: process.env.NODE_ENV === "production", sameSite: "strict" });
        Cookies.set("user", JSON.stringify(user), { expires: 7, secure: process.env.NODE_ENV === "production", sameSite: "strict" });
      }
      return { user, token };
    }

    throw new Error("Google authentication failed! Invalid token or user data.");
  } catch (error: any) {
    console.error("Google Callback Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Google authentication failed!");
  }
};

// 🔹 Forgot Password API Call
export const forgotPassword = async (email: string) => {
  const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
  return response.data;
};

// 🔹 Reset Password API Call
export const resetPassword = async (token: string, newPassword: string, confirmPassword: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/reset-password`, {
      token,
      newPassword,
      confirmPassword,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Password reset failed! Please try again."
    );
  }
};