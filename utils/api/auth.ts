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
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(error.response.data.message || "Login failed");
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error("No response from server. Please check your internet connection.");
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error("Error setting up the request: " + error.message);
    }
  }
};

// 🔹 Google OAuth Redirect
export const googleAuth = () => {
  if (typeof window !== "undefined") {
    // Use the auth/google/callback page we created
    const callbackUrl = `${window.location.origin}/auth/google/callback`;
    
    // Redirect to Google login with specified callback
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/login?redirect_uri=${encodeURIComponent(callbackUrl)}`;
  }
};

// 🔹 Handle Google OAuth Callback (Updated to use API call instead of URLSearchParams)
export const handleGoogleCallback = async (options?: { redirectUri?: string }): Promise<{ user: any; token: string }> => {
  try {
    // Remove the hardcoded URL and use environment variables
    const response = await axios.get(`${API_URL}/auth/google/callback`, {
      withCredentials: true,
    });
    
    const { token, user } = response.data;
    
    if (token && user) {
      if (typeof window !== 'undefined') {
        Cookies.set("token", token, { expires: 7, secure: true, sameSite: "lax" });
        Cookies.set("user", JSON.stringify(user), { expires: 7, secure: true, sameSite: "lax" });
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