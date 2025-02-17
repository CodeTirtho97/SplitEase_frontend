"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/utils/api/auth";
import Input from "@/components/Input";
import Button from "@/components/Button";

const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (message.includes("successful")) {
      const interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      setTimeout(() => router.push("/login"), 5000);
      return () => clearInterval(interval);
    }
  }, [message, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await resetPassword(
        token!,
        form.newPassword,
        form.confirmPassword
      );
      setMessage(res.message);
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="p-8 bg-white shadow-2xl rounded-2xl w-full max-w-md border border-gray-300">
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
          🔒 Reset Password
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password */}
          <div className="relative">
            <Input
              label="New Password"
              type="password"
              name="newPassword"
              placeholder="Enter new password"
              value={form.newPassword}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              placeholder="Re-enter new password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Submit Button */}
          <Button
            text="🔄 Update Password"
            type="submit"
            className="w-full py-3 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition-all active:scale-95"
          />
        </form>

        {/* Redirect Message */}
        {message && (
          <p
            className={`text-center mt-5 text-sm font-medium ${
              message.includes("successful") ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}{" "}
            {message.includes("successful") && (
              <span className="font-bold text-indigo-600 animate-pulse">
                Redirecting in {countdown}s...
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
