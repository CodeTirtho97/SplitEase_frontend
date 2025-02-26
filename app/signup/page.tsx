"use client";

import React, { useState, useContext, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation"; // Use usePathname for navigation detection
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import {
  faCheckCircle,
  faExclamationCircle,
  faUser,
  faLock,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { signup } from "@/utils/api/auth"; // Only import server-safe functions
import { AuthContext } from "@/context/authContext";
import dynamic from "next/dynamic";
import Cookies from "js-cookie"; // Using cookies instead of localStorage
import { handleGoogleCallback } from "@/utils/api/auth"; // Import API-based Google callback

// Dynamically import Google OAuth components
const GoogleLoginComponent = dynamic(
  () => import("@react-oauth/google").then((mod) => mod.GoogleLogin),
  { ssr: false }
);
const GoogleOAuthProvider = dynamic(
  () => import("@react-oauth/google").then((mod) => mod.GoogleOAuthProvider),
  { ssr: false }
);

const Signup = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { setUser, setToken, user, loading, error } =
    useContext(AuthContext) || {}; // Include loading and error
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [errors, setErrors] = useState<{ field: string; message: string }[]>(
    []
  );
  const [showToast, setShowToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Validation Functions
  const validateName = (name: string) => /^[A-Za-z\s]+$/.test(name);
  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) =>
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
      password
    );

  // Handle Submit (Server-safe)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const newErrors: { field: string; message: string }[] = [];

    if (!fullName)
      newErrors.push({ field: "fullName", message: "Full Name is required" });
    if (!validateName(fullName))
      newErrors.push({
        field: "fullName",
        message: "Full Name should contain only alphabets!",
      });
    if (!email)
      newErrors.push({ field: "email", message: "Email is required" });
    if (!validateEmail(email))
      newErrors.push({ field: "email", message: "Invalid email format" });

    if (!password)
      newErrors.push({ field: "password", message: "Password is required" });
    if (!confirmPassword)
      newErrors.push({
        field: "confirmPassword",
        message: "Confirm Password is required",
      });
    if (password !== confirmPassword)
      newErrors.push({
        field: "confirmPassword",
        message: "Passwords do not match",
      });

    if (!gender)
      newErrors.push({ field: "gender", message: "Please select a gender" });

    if (!agreeToTerms)
      newErrors.push({
        field: "terms",
        message: "You must agree to Terms & Conditions",
      });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setShowToast({ message: newErrors[0].message, type: "error" });
      setTimeout(() => setShowToast(null), 3000);
      return;
    }

    try {
      const response = await signup({
        fullName,
        email,
        gender,
        password,
        confirmPassword,
      });
      if (setToken && setUser) {
        // Type guard
        setToken(response.token);
        setUser(response.user);
      }
      setShowToast({ message: "Signup successful!", type: "success" });

      setTimeout(() => {
        setShowToast({
          message: "Redirecting to dashboard...",
          type: "success",
        });
        setTimeout(() => router.push("/dashboard"), 2000);
      }, 2000);
    } catch (error: any) {
      console.error("Signup Error:", error); // Debug log
      setShowToast({
        message: error.response?.data?.message || "Signup failed!",
        type: "error",
      });
      setTimeout(() => setShowToast(null), 3000);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setErrors((prevErrors) =>
      prevErrors.filter(
        (err) => err.field !== "password" && err.field !== "confirmPassword"
      )
    );
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(e.target.value);
    if (password !== e.target.value) {
      setErrors([
        { field: "confirmPassword", message: "Passwords do not match" },
      ]);
    } else {
      setErrors((prevErrors) =>
        prevErrors.filter((err) => err.field !== "confirmPassword")
      );
    }
  };

  // Handle Google Auth Success (Updated to use API-based callback)
  const handleGoogleSuccess = async (response: any) => {
    if (typeof window !== "undefined") {
      try {
        console.log("Google OAuth Success Response:", response); // Debug log
        const { credential } = response;
        const { user, token } = await handleGoogleCallback(); // API call to get token and user
        if (setToken && setUser) {
          // Type guard
          setToken(token);
          setUser(user);
        }
        setShowToast({ message: "Signup successful!", type: "success" });
        setTimeout(() => {
          setShowToast({
            message: "Redirecting to dashboard...",
            type: "success",
          });
          setTimeout(() => router.push("/dashboard"), 2000);
        }, 2000);
      } catch (error: any) {
        console.error("Google Signup Error:", error); // Debug log
        setShowToast({
          message: error.message || "Google Signup failed!",
          type: "error",
        });
        setTimeout(() => setShowToast(null), 3000);
      }
    }
  };

  // Handle Google Auth Error
  const handleGoogleError = () => {
    if (typeof window !== "undefined") {
      console.error("Google Signup Failed"); // Log error internally
      setShowToast({ message: "Google Signup failed!", type: "error" });
      setTimeout(() => setShowToast(null), 3000);
    }
  };

  // Stabilize particle animations (defer to client)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const particleElements = document.querySelectorAll(
        ".animate-float-particle"
      );
      particleElements.forEach((element, index) => {
        const top = `${Math.random() * 100}%`;
        const left = `${Math.random() * 100}%`;
        const backgroundColor =
          index % 3 === 0
            ? "indigo-300"
            : index % 3 === 1
            ? "purple-300"
            : "gray-300";
        const animationDelay = `${Math.random() * 5}s`;

        (element as HTMLElement).style.top = top;
        (element as HTMLElement).style.left = left;
        (element as HTMLElement).style.backgroundColor = backgroundColor;
        (element as HTMLElement).style.animationDelay = animationDelay;
      });
    }
  }, []);

  return (
    <div
      className="min-h-screen pt-20 pb-6 flex items-center justify-center relative bg-gradient-to-br from-gray-100 via-gray-50 to-indigo-50 overflow-hidden"
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
              Signing Up...
            </p>
            <p className="text-sm text-gray-500">
              Please wait while we process your request securely.
            </p>
          </div>
        </div>
      )}

      {/* Enhanced Animated Background Elements (Client-side only) */}
      <div className="absolute inset-0 z-0">
        {/* Subtle Gradient Overlay with More Depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/50 via-purple-100/40 to-gray-100/50 animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-purple-200/20 via-indigo-200/15 to-gray-200/10 animate-gradient-pulse"></div>

        {/* Multiple Floating Icons (Client-side only) */}
        {typeof window !== "undefined" && (
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
        )}

        {/* Enhanced Particle Effects (Client-side only) */}
        {typeof window !== "undefined" &&
          Array.from({ length: 30 }).map((_, index) => (
            <span
              key={index}
              className={`absolute w-${index % 2 === 0 ? 2 : 3} h-${
                index % 2 === 0 ? 2 : 3
              } rounded-full opacity-15 animate-float-particle`}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                backgroundColor:
                  index % 3 === 0
                    ? "indigo-300"
                    : index % 3 === 1
                    ? "purple-300"
                    : "gray-300",
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}

        {/* Multiple Subtle Wave Patterns */}
        <svg
          className="absolute bottom-0 w-full h-32 text-indigo-200 opacity-30"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
        >
          <path
            fill="currentColor"
            d="M0,160L48,176C96,192,192,224,288,208C384,192,480,128,576,117.3C672,107,768,149,864,160C960,171,1056,149,1152,138.7C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
        <svg
          className="absolute bottom-16 w-full h-32 text-purple-200 opacity-20"
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
      </div>

      {/* Custom Toast Notification */}
      {showToast && typeof window !== "undefined" && (
        <div
          className={`fixed top-24 right-6 px-6 py-2 rounded-md text-white text-md font-semibold shadow-lg transition-all duration-300 ${
            showToast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
          suppressHydrationWarning
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

      {error && typeof window !== "undefined" && (
        <div
          className="fixed top-24 right-6 px-6 py-2 rounded-md text-white text-md font-semibold shadow-lg bg-red-500 transition-all duration-300"
          suppressHydrationWarning
        >
          <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
          {error}
        </div>
      )}

      <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-xl border border-gray-300 backdrop-blur-md relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="SplitEase" className="w-12 h-12" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Create an Account
        </h2>
        <p className="text-gray-600 text-center mb-4">
          Sign up to get started!
        </p>

        {/* Google Sign-In with OAuth Provider (Client-side only) */}
        {typeof window !== "undefined" && (
          <GoogleOAuthProvider
            clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
          >
            <GoogleLoginComponent
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
            />
          </GoogleOAuthProvider>
        )}

        {/* OR Separator */}
        <div className="flex items-center my-4">
          <hr className="w-full border-gray-300" />
          <span className="mx-3 text-gray-500 text-sm">OR</span>
          <hr className="w-full border-gray-300" />
        </div>

        {/* Signup Form */}
        <form
          className="space-y-4"
          onSubmit={(e) => handleSubmit(e).catch(console.error)}
        >
          {/* Full Name */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.some((err) => err.field === "fullName")
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-indigo-500"
              }`}
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.some((err) => err.field === "email")
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-indigo-500"
              }`}
              disabled={loading}
            />
          </div>

          {/* Gender Dropdown */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.some((err) => err.field === "gender")
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-indigo-500"
              }`}
              disabled={loading}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={handlePasswordChange}
              className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.some((err) => err.field === "password")
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-indigo-500"
              }`}
              disabled={loading}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.some((err) => err.field === "confirmPassword")
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-green-600"
              }`}
              disabled={loading}
            />
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="terms"
              checked={agreeToTerms}
              onChange={() => setAgreeToTerms(!agreeToTerms)}
              disabled={loading}
            />
            <label htmlFor="terms" className="ml-2 text-gray-700 text-sm">
              I agree to the
              <span
                className="ml-1 text-indigo-600 font-semibold cursor-pointer underline decoration-transparent hover:decoration-indigo-600 transition-all duration-200"
                onClick={() => setIsTermsModalOpen(true)}
                aria-disabled={loading}
              >
                Terms & Conditions
              </span>
            </label>
          </div>

          {/* Signup Button */}
          <button
            type="submit"
            className={`w-full py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 active:scale-95 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>

          {/* Login Link */}
          <div className="text-center mt-5">
            <p className="text-gray-600">
              Already have an account?{" "}
              <span
                className="text-indigo-600 font-semibold cursor-pointer hover:underline"
                onClick={() => router.push("/login")}
                aria-disabled={loading}
              >
                Login
              </span>
            </p>
          </div>
        </form>
      </div>

      {/* Terms & Conditions Modal (Client-side only) */}
      {isTermsModalOpen && typeof window !== "undefined" && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          suppressHydrationWarning
        >
          <div className="bg-white w-[90%] max-w-3xl rounded-lg shadow-xl relative">
            {/* Header with Title & Close Button */}
            <div className="p-5 border-b flex justify-between items-center bg-gray-100 rounded-t-lg">
              <h2 className="text-xl font-semibold text-gray-800">
                Terms & Conditions
              </h2>
              <button
                onClick={() => setIsTermsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition text-lg"
                disabled={loading}
              >
                ✖
              </button>
            </div>

            {/* Scrollable Content Section */}
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 text-gray-700">
              {/* 1️⃣ Introduction */}
              <section>
                <h3 className="font-semibold text-lg text-gray-800">
                  1. Introduction
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Welcome to <strong>SplitEase</strong>. By using our platform,
                  you agree to these Terms & Conditions. Please read them
                  carefully before proceeding. Your use of this application
                  signifies acceptance of these terms.
                </p>
              </section>
              {/* 2️⃣ User Responsibilities */}
              <section>
                <h3 className="font-semibold text-lg text-gray-800">
                  2. User Responsibilities
                </h3>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mt-1">
                  <li>
                    Users must provide accurate and up-to-date information.
                  </li>
                  <li>
                    Any fraudulent or misleading activity will lead to **account
                    suspension**.
                  </li>
                  <li>
                    Users are responsible for maintaining the security of their
                    accounts.
                  </li>
                </ul>
              </section>
              {/* 3️⃣ Payment Terms */}
              <section>
                <h3 className="font-semibold text-lg text-gray-800">
                  3. Payments & Transactions
                </h3>
                <ul className="list-decimal list-inside text-sm text-gray-600 space-y-1 mt-1">
                  <li>
                    <strong>SplitEase</strong> does not hold or manage funds
                    directly.
                  </li>
                  <li>
                    Users are responsible for handling disputes related to
                    payments.
                  </li>
                  <li>
                    Transaction records are stored for tracking but do not
                    guarantee dispute resolution.
                  </li>
                </ul>
              </section>
              {/* 4️⃣ Privacy & Data Security */}
              <section>
                <h3 className="font-semibold text-lg text-gray-800">
                  4. Privacy & Data Security
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  We value your privacy. All personal data is handled as per{" "}
                  <strong>GDPR & industry standards</strong>. We do not share
                  user data with third parties unless required by law.
                </p>
              </section>
              {/* 5️⃣ Limitation of Liability */}
              <section>
                <h3 className="font-semibold text-lg text-gray-800">
                  5. Limitation of Liability
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>SplitEase</strong> is not responsible for incorrect
                  transactions, disputes among users, or financial losses
                  incurred while using the platform.
                </p>
              </section>
            </div>

            {/* Sticky Footer with OK Button */}
            <div className="p-5 border-t bg-gray-100 rounded-b-lg flex justify-end">
              <button
                onClick={() => setIsTermsModalOpen(false)}
                className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                disabled={loading}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
