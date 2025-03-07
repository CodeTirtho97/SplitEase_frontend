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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Update login status when token or user changes from AuthContext
  useEffect(() => {
    setIsLoggedIn(!!token);
  }, [token]); // Re-run when token changes

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        mobileMenuOpen &&
        !target.closest(".mobile-menu") &&
        !target.closest(".menu-button")
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Logout function using AuthContext
  const handleLogout = async () => {
    if (logout) {
      try {
        // First, call the logout function from AuthContext
        await logout();

        // Manually clear cookies to ensure immediate effect
        Cookies.remove("token");
        Cookies.remove("user");

        // Show success toast
        setShowToast({ message: "Logged out successfully!", type: "success" });

        // Force reset isLoggedIn state to ensure immediate UI update
        setIsLoggedIn(false);

        // Close mobile menu if open
        setMobileMenuOpen(false);

        // Wait a moment for state to update before redirecting
        setTimeout(() => {
          // Use window.location for a hard redirect that clears React Router state
          window.location.href = "/login";
        }, 1000);
      } catch (error) {
        console.error("Logout error:", error);
        setShowToast({
          message: "Logout failed. Please try again.",
          type: "error",
        });
      }
    }
  };

  // Hide toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  if (authLoading) {
    return (
      <div className="h-16 w-full backdrop-blur-md bg-white/80 shadow-md fixed top-0 left-0 z-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <nav className="backdrop-blur-md bg-white/80 shadow-md fixed w-full top-0 left-0 px-4 sm:px-6 py-4 z-50">
      <div className="flex justify-between items-center max-w-6xl mx-auto h-8">
        {/* Logo & App Name */}
        <div className="flex items-center space-x-2 sm:space-x-3 z-20">
          <Image
            src="/logo.png"
            alt="SplitEase Logo"
            width={36}
            height={36}
            className="w-8 h-8 sm:w-10 sm:h-10"
          />
          <Link
            href="/"
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isLoggedIn ? "pointer-events-none opacity-50" : "text-gray-900"
            }`}
          >
            SplitEase<span className="text-indigo-600">.</span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex space-x-6">
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

        {/* Mobile Menu Button */}
        <button
          className="menu-button md:hidden z-20 p-2 focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          <div className="w-6 h-5 flex flex-col justify-between relative">
            <span
              className={`w-full h-0.5 bg-gray-800 transform transition-all duration-300 ${
                mobileMenuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            ></span>
            <span
              className={`w-full h-0.5 bg-gray-800 transform transition-all duration-300 ${
                mobileMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            ></span>
            <span
              className={`w-full h-0.5 bg-gray-800 transform transition-all duration-300 ${
                mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            ></span>
          </div>
        </button>

        {/* Mobile Menu */}
        <div
          className={`mobile-menu fixed inset-0 bg-white/95 backdrop-blur-lg z-10 flex flex-col pt-24 px-6 transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          } md:hidden`}
        >
          <div className="flex flex-col space-y-6 items-center">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className={`w-full py-4 text-center text-lg font-medium rounded-lg transition-colors ${
                    pathname === "/dashboard"
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className={`w-full py-4 text-center text-lg font-medium rounded-lg transition-colors ${
                    pathname === "/profile"
                      ? "bg-gray-200 text-gray-800"
                      : "text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  Profile
                </Link>
                <Button
                  text="Sign Out"
                  onClick={handleLogout}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-lg text-lg font-medium transition shadow-md mt-4"
                />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`w-full py-4 text-center text-lg font-medium rounded-lg transition-colors ${
                    pathname === "/login"
                      ? "bg-purple-100 text-purple-700"
                      : "text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  Login
                </Link>
                <Link href="/signup" className="w-full">
                  <button
                    className={`w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 
                      text-white py-4 rounded-lg text-lg font-medium transition shadow-md ${
                        pathname === "/signup" ? "ring-2 ring-indigo-500" : ""
                      }`}
                  >
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>
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
