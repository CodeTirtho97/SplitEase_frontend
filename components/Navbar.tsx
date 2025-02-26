"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/Button";
import { useAuth } from "@/context/authContext"; // Import useAuth from AuthContext
import Cookies from "js-cookie"; // Import Cookies for token persistence

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname(); // Get the current route
  const { user, token, logout, loading: authLoading } = useAuth() || {}; // Use useAuth for authentication state
  const [showToast, setShowToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // State to track login status (derived from AuthContext)
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);

  // Update login status when token or user changes from AuthContext
  useEffect(() => {
    setIsLoggedIn(!!token);
  }, [token]); // Re-run when token changes

  // Logout function using AuthContext
  const handleLogout = () => {
    if (logout) {
      logout(); // Use AuthContext logout to clear state and cookies
      setShowToast({ message: "Logged out successfully!", type: "success" });
      setTimeout(() => {
        setShowToast(null);
        router.push("/login"); // Redirect to login after logout
      }, 2000);
    }
  };

  if (authLoading) {
    return null; // Or a loading spinner if desired
  }

  return (
    <nav className="backdrop-blur-md bg-white/80 shadow-md fixed w-full top-0 left-0 px-6 py-4 z-50 h-16">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        {/* Logo & App Name */}
        <div className="flex items-center space-x-3">
          <Image src="/logo.png" alt="SplitEase Logo" width={40} height={40} />
          <Link
            href="/"
            className={`text-3xl font-extrabold tracking-tight ${
              isLoggedIn ? "pointer-events-none opacity-50" : "text-gray-900"
            }`}
          >
            SplitEase<span className="text-indigo-600">.</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex space-x-6">
          {isLoggedIn ? (
            <>
              {/* Dashboard Link */}
              <Link
                href="/dashboard"
                className={`relative px-4 py-2 rounded-md transition-all duration-300 
                  before:absolute before:bottom-0 before:left-0 before:w-0 before:h-[2px] before:bg-indigo-500
                  before:transition-all before:duration-300 hover:text-indigo-600 hover:before:w-full
                  ${
                    pathname === "/dashboard"
                      ? "text-indigo-700 font-semibold bg-indigo-100 px-4 py-2 rounded-md shadow-sm"
                      : "text-gray-700"
                  }`}
              >
                Dashboard
              </Link>

              {/* Profile Link */}
              <Link
                href="/profile"
                className={`relative px-4 py-2 rounded-md transition-all duration-300 
                  before:absolute before:bottom-0 before:left-0 before:w-0 before:h-[2px] before:bg-gray-500
                  before:transition-all before:duration-300 hover:text-gray-700 hover:before:w-full
                  ${
                    pathname === "/profile"
                      ? "text-gray-800 font-semibold bg-gray-200 px-4 py-2 rounded-md shadow-sm"
                      : "text-gray-700"
                  }`}
              >
                Profile
              </Link>

              {/* Sign Out Button */}
              <Button
                text="Sign Out"
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition shadow-md"
              />
            </>
          ) : (
            <>
              {/* Login Button */}
              <Link
                href="/login"
                className={`relative px-4 py-2 rounded-md transition-all duration-300 
                  before:absolute before:bottom-0 before:left-0 before:w-0 before:h-[2px] before:bg-purple-500
                  before:transition-all before:duration-300 hover:text-purple-600 hover:before:w-full
                  ${
                    pathname === "/login"
                      ? "text-purple-700 font-semibold bg-purple-100 px-4 py-2 rounded-md shadow-sm"
                      : "text-gray-700"
                  }`}
              >
                Login
              </Link>

              {/* Sign Up Button */}
              <Link href="/signup">
                <button
                  className={`bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 
                    text-white rounded-lg transition-all duration-250 ease-out shadow-md transform hover:scale-105 
                    w-[120px] h-[40px] flex items-center justify-center
                    ${
                      pathname === "/signup"
                        ? "ring-2 ring-indigo-500 shadow-md scale-100"
                        : ""
                    }`}
                >
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div
          className={`fixed top-20 right-6 px-6 py-2 rounded-md text-white text-md font-semibold shadow-lg transition-all duration-300 ${
            showToast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {showToast.message}
        </div>
      )}
    </nav>
  );
}
