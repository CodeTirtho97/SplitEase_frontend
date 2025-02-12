"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faCheckCircle, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

const Signup = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState<{ field: string; message: string }[]>([]);
  const [showToast, setShowToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Validation Functions
  const validateName = (name: string) => /^[A-Za-z\s]+$/.test(name);
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  // Handle Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { field: string; message: string }[] = [];

    if (!fullName) newErrors.push({ field: "fullName", message: "Full Name is required" });
    else if (!validateName(fullName)) newErrors.push({ field: "fullName", message: "Only letters & spaces allowed" });

    if (!email) newErrors.push({ field: "email", message: "Email is required" });
    else if (!validateEmail(email)) newErrors.push({ field: "email", message: "Invalid email format" });

    if (!password) newErrors.push({ field: "password", message: "Password is required" });
    else if (!validatePassword(password)) newErrors.push({ field: "password", message: "Password must be 8+ chars with uppercase, number & symbol" });

    if (!confirmPassword) newErrors.push({ field: "confirmPassword", message: "Confirm Password is required" });
    else if (password !== confirmPassword) newErrors.push({ field: "confirmPassword", message: "Passwords do not match" });

    if (!agreeToTerms) newErrors.push({ field: "terms", message: "You must agree to Terms & Conditions" });

    setErrors(newErrors);

    if (newErrors.length === 0) {
      setShowToast({ message: "Registration successful!", type: "success" });
      setTimeout(() => setShowToast(null), 3000);
    } else {
      setShowToast({ message: newErrors[0].message, type: "error" });
      setTimeout(() => setShowToast(null), 3000);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-6 flex items-center justify-center bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 px-8 relative">
      {/* Custom Toast Notification */}
      {showToast && (
        <div className={`fixed top-24 right-6 px-6 py-2 rounded-md text-white text-sm font-semibold shadow-lg transition-all duration-300 
          ${showToast.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          <FontAwesomeIcon icon={showToast.type === "success" ? faCheckCircle : faExclamationCircle} className="mr-2" />
          {showToast.message}
        </div>
      )}

      <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-xl border border-gray-300 backdrop-blur-md">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="SplitEase" className="w-12 h-12" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-900">Create an Account</h2>
        <p className="text-gray-600 text-center mb-4">Sign up to get started!</p>

        {/* Google Sign-In Button */}
        <button className="w-full flex items-center justify-center gap-3 border border-indigo-500 bg-white text-gray-700 font-semibold py-2.5 rounded-lg shadow-sm transition-all 
          hover:bg-gray-100 hover:shadow-md hover:border-gray-400 active:scale-95">
          <FontAwesomeIcon icon={faGoogle} className="text-indigo-900 text-2xl"/>
          Sign Up with Google
        </button>

        {/* OR Separator */}
        <div className="flex items-center my-4">
          <hr className="w-full border-gray-300" />
          <span className="mx-3 text-gray-500 text-sm">OR</span>
          <hr className="w-full border-gray-300" />
        </div>

        {/* Signup Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div>
            <label className="text-sm font-semibold text-gray-700">Full Name</label>
            <input 
              type="text" 
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.some((err) => err.field === "fullName") ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
              }`}
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
                errors.some((err) => err.field === "email") ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
              }`}
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <input 
              type="password" 
              placeholder="Create a password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
            <input 
              type="password" 
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.some((err) => err.field === "confirmPassword") ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
              }`}
            />
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-center">
            <input type="checkbox" id="terms" checked={agreeToTerms} onChange={() => setAgreeToTerms(!agreeToTerms)} />
            <label htmlFor="terms" className="ml-2 text-gray-700 text-sm">I agree to the <a href="#" className="text-indigo-600 font-semibold">Terms & Conditions</a></label>
          </div>

          {/* Signup Button */}
          <button type="submit" className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 active:scale-95">
            Sign Up
          </button>
          {/* Login Link */}
          <div className="text-center mt-5">
              <p className="text-gray-600">
                Already have an account?{" "}
                <span
                  className="text-indigo-600 font-semibold cursor-pointer hover:underline"
                  onClick={() => router.push("/login")}
                >
                  Login
                </span>
              </p>
            </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;