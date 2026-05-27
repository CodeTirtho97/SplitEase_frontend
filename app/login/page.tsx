"use client";

import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation"; // Removed usePathname to simplify
import Image from "next/image";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import {
  faExclamationCircle,
  faUser,
  faLock,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { login } from "@/utils/api/auth"; // Only import server-safe functions
import { AuthContext } from "@/context/authContext";
import Cookies from "js-cookie"; // Using cookies instead of localStorage


export default function LoginPage() {
  const router = useRouter();
  const { setUser, setToken, user, token, loading, error, logout } =
    useContext(AuthContext) || {};
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ field: string; message: string }[]>(
    []
  );
  //const [setLoading] = useState(false);

  // Forgot Password State
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);

  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // Load remembered email from cookies on client-side only
  useEffect(() => {
    const storedEmail = Cookies.get("rememberedEmail");
    if (storedEmail) {
      setForm((prev) => ({ ...prev, email: storedEmail }));
      setRememberMe(true);
    }
  }, []);

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
      toast.error(newErrors[0].message);
      return;
    }

    setIsLoginLoading(true);

    try {
      const response = await login(form);
      if (setToken && setUser) {
        // Type guard
        setToken(response.token);
        setUser(response.user);
      }
      if (rememberMe) {
        Cookies.set("rememberedEmail", form.email, {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });
      } else {
        Cookies.remove("rememberedEmail");
      }

      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login Error:", error);
      toast.error(error.response?.data?.message || "Login failed!");
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/login`;
  };

  // Handle logout
  const handleLogout = () => {
    if (logout) {
      logout();
      toast.success("Logged out successfully!");
      setTimeout(() => router.push("/login"), 2000);
    }
  };

  // Handle Forgot Password (Client-side only)
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value.trim().toLowerCase();
    setResetEmail(emailValue);
    setIsEmailValid(validateEmail(emailValue));
  };

  const handlePasswordReset = async () => {
    setIsLoginLoading(true);
    setResetMessage("");

    try {
      await import("@/utils/api/auth").then((module) =>
        module.forgotPassword(resetEmail)
      );
      setResetMessage("✅ Reset Link sent. Check your email!");
    } catch (error) {
      setResetMessage("If this email is registered, a reset link has been sent.");
    } finally {
      setIsLoginLoading(false);
    }
  };


  useEffect(() => {
    // Check if user is authenticated and should be redirected
    if (user && token) {
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [user, token, router]);

  return (
    <div
      className="min-h-screen pt-16 flex items-center justify-center relative bg-gradient-to-br from-gray-100 via-gray-50 to-purple-50 overflow-hidden"
      suppressHydrationWarning
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="relative flex flex-col items-center justify-center p-8 bg-white/90 rounded-xl shadow-lg backdrop-blur-md animate-pulse">
            <svg
              className="w-16 h-16 text-indigo-500 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <p className="mt-4 text-xl font-medium text-gray-700">
              Logging In...
            </p>
            <p className="text-sm text-gray-500">
              Please wait while we process your request securely.
            </p>
          </div>
        </div>
      )}

      {/* Static Background Elements (Server-safe) */}
      <div className="absolute inset-0 z-0">
        {/* Deeper Gradient Overlay (Server-safe) */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/50 via-purple-100/40 to-gray-100/50 animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-purple-200/20 via-indigo-200/15 to-gray-200/10 animate-gradient-pulse"></div>

        {/* Wave Patterns (Server-safe) */}
        <svg
          className="absolute bottom-0 w-full h-32 text-purple-200 opacity-30"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
        >
          <path
            fill="currentColor"
            d="M0,160L48,176C96,192,192,224,288,208C384,192,480,128,576,117.3C672,107,768,149,864,160C960,171,1056,149,1152,138.7C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
        <svg
          className="absolute bottom-16 w-full h-32 text-indigo-200 opacity-20"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
        >
          <path
            fill="currentColor"
            d="M0,160L48,144C96,128,192,96,288,96C384,96,480,128,576,138.7C672,149,768,139,864,128C960,117,1056,107,1152,117.3C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
        <svg
          className="absolute bottom-32 w-full h-32 text-gray-200 opacity-15"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
        >
          <path
            fill="currentColor"
            d="M0,160L48,176C96,192,192,224,288,208C384,192,480,128,576,117.3C672,107,768,149,864,160C960,171,1056,149,1152,138.7C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
        <>
            <div className="absolute top-20 left-10 animate-float-slow">
              <FontAwesomeIcon
                icon={faUser}
                className="text-indigo-400 text-4xl opacity-20"
              />
            </div>
            <div className="absolute top-40 left-60 animate-float">
              <FontAwesomeIcon
                icon={faLock}
                className="text-purple-400 text-4xl opacity-20"
              />
            </div>
            <div className="absolute top-60 right-20 animate-float-fast">
              <FontAwesomeIcon
                icon={faGoogle}
                className="text-purple-400 text-4xl opacity-20"
              />
            </div>
            <div className="absolute bottom-20 left-20 animate-float-slow">
              <FontAwesomeIcon
                icon={faEnvelope}
                className="text-green-400 text-4xl opacity-20"
              />
            </div>
            <div className="absolute bottom-40 right-40 animate-float">
              <FontAwesomeIcon
                icon={faExclamationCircle}
                className="text-red-400 text-4xl opacity-20"
              />
            </div>
            <div className="absolute top-10 right-60 animate-float-fast">
              <FontAwesomeIcon
                icon={faUser}
                className="text-indigo-400 text-4xl opacity-20"
              />
            </div>
            <div className="absolute bottom-10 left-60 animate-float-slow">
              <FontAwesomeIcon
                icon={faLock}
                className="text-purple-400 text-4xl opacity-20"
              />
            </div>
        </>
      </div>

      {error && (
        <div
          className="fixed top-24 right-6 px-6 py-2 rounded-md text-white text-md font-semibold shadow-lg bg-red-500 transition-all duration-300"
          suppressHydrationWarning
        >
          <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
          {error}
        </div>
      )}

      <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md border border-gray-300 backdrop-blur-md relative z-10">
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

        {/* Google Sign-In with OAuth Provider (Client-side only) */}
        <div className="flex justify-center w-full">
          <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-xl py-3 px-4 text-gray-700 font-semibold shadow-sm hover:shadow-md hover:border-indigo-300 hover:bg-gray-50 active:scale-98 transition-all duration-300 relative overflow-hidden group"
              disabled={loading}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <FontAwesomeIcon
                icon={faGoogle}
                className="text-indigo-600 text-xl group-hover:text-indigo-700 group-hover:scale-110 transition-transform duration-300"
              />
              <span className="relative text-base tracking-wide group-hover:tracking-wider transition-all duration-300">
                Continue with Google
              </span>
            </button>
        </div>

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
                disabled={loading}
              />
              <span>Remember Me</span>
            </label>
            <button
              type="button"
              className="text-indigo-600 font-semibold cursor-pointer hover:underline"
              onClick={(e) => {
                e.preventDefault();
                setIsForgotPasswordOpen(true);
              }}
              disabled={loading}
              aria-disabled={loading}
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
            Don&apos;t have an account?{" "}
            <span
              className="text-indigo-600 font-semibold cursor-pointer hover:underline"
              onClick={() => router.push("/signup")}
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal (Client-side only) */}
      {isForgotPasswordOpen && (
        <div
          className="fixed inset-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center z-50"
          onClick={() => setIsForgotPasswordOpen(false)}
          suppressHydrationWarning
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
              disabled={loading || isLoginLoading}
            />

            {/* Reset Password Button */}
            <button
              onClick={handlePasswordReset}
              disabled={!isEmailValid || isLoginLoading || loading}
              className={`w-full py-2 mt-6 text-white rounded-lg transition-all ${
                !isEmailValid || isLoginLoading || loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {isLoginLoading ? (
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
}
