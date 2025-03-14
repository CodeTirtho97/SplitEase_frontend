"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/utils/api/auth";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Image from "next/image";
import { faLock, faKey, faUndo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// SearchParamsHandler component - unchanged functionality
const SearchParamsHandler = ({
  setToken,
}: {
  setToken: (token: string | null) => void;
}) => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    setToken(token);
  }, [searchParams]);

  return null;
};

const ResetPasswordPage = () => {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);

  // Auto redirect functionality - unchanged
  useEffect(() => {
    if (message.includes("successful")) {
      const interval = setInterval(
        () => setCountdown((prev) => prev - 1),
        1000
      );
      setTimeout(() => router.push("/login"), 5000);
      return () => clearInterval(interval);
    }
  }, [message, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setMessage("Invalid reset token!");
      return;
    }

    try {
      const res = await resetPassword(
        token,
        form.newPassword,
        form.confirmPassword
      );
      setMessage(res.message);
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  return (
    <Suspense fallback={<div>Loading reset page...</div>}>
      <SearchParamsHandler setToken={setToken} />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-indigo-100 px-4 relative overflow-hidden">
        {/* Background animated elements */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-300/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-300/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-300/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            {/* Top Gradient Bar */}
            <div className="h-2 w-full bg-gradient-to-r from-indigo-500 to-purple-600"></div>

            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mx-auto flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faKey} className="text-white text-3xl" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Reset Your Password
              </h2>
              <p className="text-white/80 mt-1 text-sm">
                Create a new secure password for your account
              </p>
            </div>

            {/* Form Section */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Password Fields */}
                <div className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        <FontAwesomeIcon icon={faLock} />
                      </span>
                      <input
                        type="password"
                        name="newPassword"
                        placeholder="Enter new password"
                        value={form.newPassword}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 pl-1">
                      Must be at least 8 characters
                    </p>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        <FontAwesomeIcon icon={faLock} />
                      </span>
                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Re-enter your password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Feedback Message */}
                {message && (
                  <div
                    className={`p-4 rounded-lg ${
                      message.includes("successful")
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    } text-sm`}
                  >
                    <p className="font-medium flex items-center">
                      {message.includes("successful") ? (
                        <svg
                          className="w-5 h-5 mr-2 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 mr-2 text-red-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {message}
                    </p>
                    {message.includes("successful") && (
                      <div className="mt-2 text-center">
                        <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium animate-pulse">
                          Redirecting to login in {countdown}s...
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  text="Update Password"
                  icon={faUndo}
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth={true}
                />
              </form>

              {/* Back to Login Link */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => router.push("/login")}
                  className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </div>
          </div>

          {/* App Branding */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="ml-2 text-gray-700 font-semibold">
                SplitEase
              </span>
            </div>
            <p className="text-gray-500 text-xs mt-2">
              Secure Password Management
            </p>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default ResetPasswordPage;
