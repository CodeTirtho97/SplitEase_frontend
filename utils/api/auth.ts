import axios from "axios";

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
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/login`;
};

// 🔹 Handle Google OAuth Callback
export const handleGoogleCallback = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const userId = urlParams.get("userId");
  const fullName = urlParams.get("fullName");
  const profilePic = urlParams.get("profilePic");
  const email = urlParams.get("email");

  if (token && userId) {
    localStorage.setItem("userToken", token);
    // localStorage.setItem(
    //   "user",
    //   JSON.stringify({ userId, fullName, profilePic, email })
    // );

    return { user: { userId, fullName, profilePic, email }, token };
  }

  throw new Error("Google authentication failed!");
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