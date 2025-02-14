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
  const [gender, setGender] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
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

    if (!gender) newErrors.push({ field: "gender", message: "Gender is required" });

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

        {/* Google Sign-Up Button */}
        <button className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white text-gray-700 font-semibold py-3 rounded-lg shadow-md transition-all 
          hover:bg-orange-600 hover:text-white hover:shadow-lg hover:border-orange-600 active:scale-95 relative overflow-hidden group">
          
          {/* Left Background Animation Effect */}
          <span className="absolute left-0 w-0 h-full bg-indigo-500 transition-all duration-300 group-hover:w-full opacity-10"></span>

          {/* Google Icon */}
          <FontAwesomeIcon icon={faGoogle} className="text-indigo-900 group-hover:text-white text-2xl transition-all duration-300" />

          <span className="relative">Sign Up with Google</span>
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

          {/* Gender Dropdown */}
          <div>
            <label className="text-sm font-semibold text-gray-700">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.some((err) => err.field === "gender") ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
              }`}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
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
            <label htmlFor="terms" className="ml-2 text-gray-700 text-sm">
              I agree to the 
              <span 
                className="ml-1 text-indigo-600 font-semibold cursor-pointer underline decoration-transparent hover:decoration-indigo-600 transition-all duration-200" 
                onClick={() => setIsTermsModalOpen(true)}
              >
                Terms & Conditions
              </span>
            </label>
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

      {/* Terms & Conditions Modal */}
      {isTermsModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white w-[90%] max-w-3xl rounded-lg shadow-xl relative">
            {/* Header with Title & Close Button */}
            <div className="p-5 border-b flex justify-between items-center bg-gray-100 rounded-t-lg">
              <h2 className="text-xl font-semibold text-gray-800">Terms & Conditions</h2>
              <button
                onClick={() => setIsTermsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition text-lg"
              >
                ✖
              </button>
            </div>

            {/* Scrollable Content Section */}
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 text-gray-700">
              {/* 1️⃣ Introduction */}
              <section>
                <h3 className="font-semibold text-lg text-gray-800">1. Introduction</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Welcome to <strong>SplitEase</strong>. By using our platform, you agree to these Terms & Conditions. 
                  Please read them carefully before proceeding. Your use of this application signifies acceptance of these terms.
                </p>
              </section>

              {/* 2️⃣ User Responsibilities */}
              <section>
                <h3 className="font-semibold text-lg text-gray-800">2. User Responsibilities</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mt-1">
                  <li>Users must provide accurate and up-to-date information.</li>
                  <li>Any fraudulent or misleading activity will lead to **account suspension**.</li>
                  <li>Users are responsible for maintaining the security of their accounts.</li>
                </ul>
              </section>

              {/* 3️⃣ Payment Terms */}
              <section>
                <h3 className="font-semibold text-lg text-gray-800">3. Payments & Transactions</h3>
                <ul className="list-decimal list-inside text-sm text-gray-600 space-y-1 mt-1">
                  <li><strong>SplitEase</strong> does not hold or manage funds directly.</li>
                  <li>Users are responsible for handling disputes related to payments.</li>
                  <li>Transaction records are stored for tracking but do not guarantee dispute resolution.</li>
                </ul>
              </section>

              {/* 4️⃣ Privacy & Data Security */}
              <section>
                <h3 className="font-semibold text-lg text-gray-800">4. Privacy & Data Security</h3>
                <p className="text-sm text-gray-600 mt-1">
                  We value your privacy. All personal data is handled as per <strong>GDPR & industry standards</strong>. 
                  We do not share user data with third parties unless required by law.
                </p>
              </section>

              {/* 5️⃣ Limitation of Liability */}
              <section>
                <h3 className="font-semibold text-lg text-gray-800">5. Limitation of Liability</h3>
                <p className="text-sm text-gray-600 mt-1">
                <strong>SplitEase</strong> is not responsible for incorrect transactions, disputes among users, or financial losses incurred while using the platform.
                </p>
              </section>
            </div>

            {/* Sticky Footer with OK Button */}
            <div className="p-5 border-t bg-gray-100 rounded-b-lg flex justify-end">
              <button
                onClick={() => setIsTermsModalOpen(false)}
                className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
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