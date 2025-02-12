"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faCheckCircle, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

const LoginPage = () => {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ field: string; message: string }[]>([]);
  const [showToast, setShowToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Validation Functions
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => password.length >= 6;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { field: string; message: string }[] = [];

    if (!form.email) newErrors.push({ field: "email", message: "Email is required" });
    else if (!validateEmail(form.email)) newErrors.push({ field: "email", message: "Invalid email format" });

    if (!form.password) newErrors.push({ field: "password", message: "Password is required" });
    else if (!validatePassword(form.password)) newErrors.push({ field: "password", message: "Password must be at least 6 characters" });

    setErrors(newErrors);

    if (newErrors.length === 0) {
      setShowToast({ message: "Login successful!", type: "success" });
      setTimeout(() => {
        setShowToast(null);
        router.push("/dashboard");
      }, 2000);
    } else {
      setShowToast({ message: newErrors[0].message, type: "error" });
      setTimeout(() => setShowToast(null), 3000);
    }
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 px-8 relative">
      {/* Custom Toast Notification */}
      {showToast && (
        <div className={`fixed top-24 right-6 px-4 py-3 rounded-md text-white text-sm font-semibold shadow-lg transition-all duration-300 
          ${showToast.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          <FontAwesomeIcon icon={showToast.type === "success" ? faCheckCircle : faExclamationCircle} className="mr-2" />
          {showToast.message}
        </div>
      )}

      <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md border border-gray-300 backdrop-blur-md">
        {/* Logo */}
        <div className="flex justify-center mb-5">
          <Image src="/logo.png" alt="SplitEase" width={50} height={50} />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-2">Welcome Back</h2>
        <p className="text-gray-500 text-center mb-6">Login to continue with SplitEase.</p>

        {/* Google Sign-In */}
        <button className="w-full flex items-center justify-center gap-3 border border-indigo-500 bg-white text-gray-700 font-semibold py-2.5 rounded-lg shadow-sm transition-all 
        hover:bg-gray-100 hover:shadow-md hover:border-gray-200 active:scale-95">
          <FontAwesomeIcon icon={faGoogle} className="text-indigo-900 text-2xl"/>
          Sign in with Google
        </button>

        {/* Divider */}
        <div className="relative flex items-center my-6">
          <div className="w-full h-[1px] bg-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm bg-white font-semibold">OR</span>
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
              errors.some((err) => err.field === "email") ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
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
              errors.some((err) => err.field === "password") ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
            }`}
          />

          <div className="flex justify-between text-sm text-gray-600">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600" />
              <span>Remember Me</span>
            </label>
            <span className="text-indigo-600 font-semibold cursor-pointer hover:underline">
              Forgot Password?
            </span>
          </div>

          <Button 
            text="Login" 
            type="submit" 
            fullWidth 
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg py-3 rounded-lg shadow-lg transition" 
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
    </div>
  );
};

export default LoginPage;