"use client";

import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import {
  faCheckCircle,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import {
  login,
  googleAuth,
  forgotPassword,
  handleGoogleCallback,
} from "@/utils/api/auth";
import { AuthContext } from "@/context/authContext";

const LoginPage = () => {
  const router = useRouter();
  const { setUser, setToken } = useContext(AuthContext) || {}; // Get context functions
  const [form, setForm] = useState({
    email:
      typeof window !== "undefined"
        ? localStorage.getItem("rememberedEmail") || ""
        : "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState<boolean>(false); // Default to false

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Ensure it's client-side
      const storedEmail = localStorage.getItem("rememberedEmail");
      if (storedEmail) {
        setForm((prev) => ({ ...prev, email: storedEmail }));
        setRememberMe(true);
      }
    }
  }, []);
  const [errors, setErrors] = useState<{ field: string; message: string }[]>(
    []
  );
  const [showToast, setShowToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot Password State
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);

  // Validation Functions
  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => password.length >= 6;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    const newErrors: { field: string; message: string }[] = [];

    if (!form.email)
      newErrors.push({ field: "email", message: "Email is required" });
    else if (!validateEmail(form.email))
      newErrors.push({ field: "email", message: "Invalid email format" });

    if (!form.password)
      newErrors.push({ field: "password", message: "Password is required" });
    else if (!validatePassword(form.password))
      newErrors.push({
        field: "password",
        message: "Password must be at least 6 characters",
      });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setShowToast({ message: newErrors[0].message, type: "error" });
      setTimeout(() => setShowToast(null), 3000);
      setLoading(false);
      return;
    }

    try {
      const data = await login(form); // 🔹 Call API
      setUser?.(data); // 🔹 Set user in context
      setToken?.(data.token); // 🔹 Set token in context
      // localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("userToken", data.token);

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", form.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      setShowToast({ message: "Login successful!", type: "success" });
      setTimeout(() => {
        setShowToast(null);
        router.push("/dashboard"); // Redirect after login
      }, 2000);
    } catch (error: any) {
      setShowToast({
        message: error.response?.data?.message || "Login failed!",
        type: "error",
      });
      setTimeout(() => setShowToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    googleAuth();
  };

  useEffect(() => {
    if (typeof window === "undefined") return; // Ensure window object is available

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userId = params.get("userId");
    const fullName = params.get("fullName");
    const profilePic = params.get("profilePic");
    const email = params.get("email");

    if (token && userId) {
      localStorage.setItem("userToken", token);
      // localStorage.setItem(
      //   "user",
      //   JSON.stringify({ userId, fullName, profilePic, email })
      // );

      setUser?.({ userId, fullName, profilePic, email });
      setToken?.(token);

      setShowToast({ message: "Login successful!", type: "success" });
      setTimeout(() => {
        setShowToast(null);
        router.push("/dashboard");
      }, 2000);
    }
  }, [router]);

  const [isLoading, setIsLoading] = useState(false);

  // Handle Forgot Password
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value.trim().toLowerCase();
    setResetEmail(emailValue);
    setIsEmailValid(validateEmail(emailValue));
  };

  const handlePasswordReset = async () => {
    setIsLoading(true); // Start loading
    setResetMessage(""); // Clear old messages

    try {
      await forgotPassword(resetEmail);
      setTimeout(() => {
        setResetMessage("✅ Reset Link sent. Check your email!");
        setIsLoading(false); // Stop loading
      }, 2000); // Delay response for UI effect
    } catch (error) {
      setTimeout(() => {
        setResetMessage("❌ Email Not Registered!");
        setIsLoading(false); // Stop loading
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 px-8 relative">
      {/* Custom Toast Notification */}
      {showToast && (
        <div
          className={`fixed top-24 right-6 px-4 py-3 rounded-md text-white text-sm font-semibold shadow-lg transition-all duration-300 
          ${showToast.type === "success" ? "bg-green-500" : "bg-red-500"}`}
        >
          <FontAwesomeIcon
            icon={
              showToast.type === "success" ? faCheckCircle : faExclamationCircle
            }
            className="mr-2"
          />
          {showToast.message}
        </div>
      )}

      <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md border border-gray-300 backdrop-blur-md">
        {/* Logo */}
        <div className="flex justify-center mb-5">
          <Image src="/logo.png" alt="SplitEase" width={50} height={50} />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-2">
          Welcome Back
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Login to continue with SplitEase.
        </p>

        {/* Google Sign-In */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white text-gray-700 font-semibold py-3 rounded-lg shadow-md transition-all 
              hover:bg-orange-600 hover:text-white hover:shadow-lg hover:border-orange-600 active:scale-95 relative overflow-hidden group"
        >
          {/* Left Background Animation Effect */}
          <span className="absolute left-0 w-0 h-full bg-indigo-500 transition-all duration-300 group-hover:w-full opacity-10"></span>

          {/* Google Icon */}
          <FontAwesomeIcon
            icon={faGoogle}
            className="text-indigo-900 group-hover:text-white text-2xl transition-all duration-300"
          />

          <span className="relative">Sign In with Google</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center my-6">
          <div className="w-full h-[1px] bg-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm bg-white font-semibold">
            OR
          </span>
          <div className="w-full h-[1px] bg-gray-300"></div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.some((err) => err.field === "email")
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-indigo-500"
            }`}
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.some((err) => err.field === "password")
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-indigo-500"
            }`}
          />

          <div className="flex justify-between text-sm text-gray-600">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="form-checkbox h-4 w-4 text-indigo-600"
              />
              <span>Remember Me</span>
            </label>
            <button
              type="button" // This prevents triggering the form submission
              className="text-indigo-600 font-semibold cursor-pointer hover:underline"
              onClick={(e) => {
                e.preventDefault(); // Prevents default form validation trigger
                setIsForgotPasswordOpen(true);
              }}
            >
              Forgot Password?
            </button>
          </div>

          <Button
            text={loading ? "Logging in..." : "Login"}
            type="submit"
            fullWidth
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg py-3 rounded-lg shadow-lg transition"
            disabled={loading}
          />
        </form>

        {/* Signup Link */}
        <div className="text-center mt-5">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <span
              className="text-indigo-600 font-semibold cursor-pointer hover:underline"
              onClick={() => router.push("/signup")}
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>
      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div
          className="fixed inset-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center z-50"
          onClick={() => setIsForgotPasswordOpen(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Reset Password
            </h2>

            {/* Email Input Field */}
            <input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={handleEmailChange}
              className="w-full p-2 border rounded-lg mt-4"
            />

            {/* Reset Password Button */}
            <button
              onClick={handlePasswordReset}
              disabled={!isEmailValid || isLoading}
              className={`w-full py-2 mt-6 text-white rounded-lg transition-all 
          ${
            !isEmailValid || isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }
        `}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 0116 0h-2a6 6 0 10-12 0H4z"
                    />
                  </svg>
                  Sending...
                </div>
              ) : (
                "Reset Password"
              )}
            </button>

            {/* Reset Link Confirmation Message */}
            {resetMessage && (
              <p className="text-sm text-center mt-3">{resetMessage}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
