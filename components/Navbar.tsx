"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/Button";
import { useAuth } from "@/context/authContext";
import Cookies from "js-cookie";
import { useSocket } from "@/context/socketContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faUsers,
  faMoneyBill,
  faCreditCard,
} from "@fortawesome/free-solid-svg-icons";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, logout, loading: authLoading } = useAuth() || {};
  const { isConnected } = useSocket();
  const [showToast, setShowToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Update login status when token or user changes from AuthContext
  useEffect(() => {
    setIsLoggedIn(!!token);
  }, [token]);

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

  // Logout function
  const handleLogout = async () => {
    if (logout) {
      try {
        setIsLoggingOut(true);
        await logout();
        setShowToast({ message: "Logged out successfully!", type: "success" });
        setIsLoggedIn(false);
        setMobileMenuOpen(false);
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      } catch (error) {
        console.error("Logout error:", error);
        setShowToast({
          message: "Logout failed. Please try again.",
          type: "error",
        });
      } finally {
        setIsLoggingOut(false);
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

  // Dashboard navigation items
  const dashboardNavItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: faTachometerAlt,
      active: pathname === "/dashboard",
    },
    {
      href: "/groups",
      label: "Groups",
      icon: faUsers,
      active: pathname === "/groups",
    },
    {
      href: "/expenses",
      label: "Expenses",
      icon: faMoneyBill,
      active: pathname === "/expenses",
    },
    {
      href: "/payments",
      label: "Payments",
      icon: faCreditCard,
      active: pathname === "/payments",
    },
  ];

  // Only show hamburger menu if logged in OR on pages where it makes sense
  const showMobileMenu =
    isLoggedIn ||
    (!isLoggedIn &&
      !pathname.includes("/login") &&
      !pathname.includes("/signup"));

  if (authLoading) {
    return (
      <div className="h-16 w-full backdrop-blur-md bg-white/80 shadow-md fixed top-0 left-0 z-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
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
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900"
            >
              SplitEase<span className="text-indigo-600">.</span>
            </Link>

            {/* Connection Status Indicator - Only show when logged in */}
            {isLoggedIn && (
              <div className="ml-2 flex items-center">
                <div
                  className={`h-2 w-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span className="ml-1 text-xs text-gray-500 hidden sm:inline">
                  {isConnected ? "Connected" : "Offline"}
                </span>
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex space-x-6">
            {isLoggedIn ? (
              <>
                {/* Dashboard Navigation for Desktop */}
                {dashboardNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-4 py-2 rounded-md transition-all duration-300 
                      before:absolute before:bottom-0 before:left-0 before:w-0 before:h-[2px] before:bg-indigo-500
                      before:transition-all before:duration-300 hover:text-indigo-600 hover:before:w-full
                      ${
                        item.active
                          ? "text-indigo-700 font-semibold bg-indigo-100 px-4 py-2 rounded-md shadow-sm"
                          : "text-gray-700"
                      }`}
                  >
                    {item.label}
                  </Link>
                ))}

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
                  text={isLoggingOut ? "Signing Out..." : "Sign Out"}
                  onClick={handleLogout}
                  variant="danger"
                  size="md"
                  disabled={isLoggingOut}
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

          {/* Mobile Menu Button - Only show when appropriate */}
          {showMobileMenu && (
            <button
              className="menu-button lg:hidden z-20 p-2 focus:outline-none"
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
          )}
        </div>
      </nav>

      {/* Mobile Menu - Only show when hamburger is shown */}
      {showMobileMenu && (
        <div
          className={`mobile-menu fixed inset-0 bg-white z-40 flex flex-col transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          } lg:hidden`}
        >
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white shadow-sm mt-16">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="SplitEase" width={32} height={32} />
              <span className="text-lg font-bold text-gray-900">SplitEase</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          {/* Mobile Menu Content */}
          <div className="flex-1 overflow-y-auto bg-white">
            <div className="p-6">
              {isLoggedIn ? (
                <>
                  {/* User Profile Section */}
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {user?.name?.[0]?.toUpperCase() ||
                          user?.fullName?.[0]?.toUpperCase() ||
                          "U"}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {user?.name || user?.fullName || "User"}
                      </p>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                    </div>
                  </div>

                  {/* Dashboard Navigation for Mobile/Tablet */}
                  <div className="space-y-2 mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Navigation
                    </h3>
                    {dashboardNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${
                          item.active
                            ? "text-indigo-600 bg-indigo-50"
                            : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={item.icon}
                          className={`text-lg ${
                            item.active ? "text-indigo-600" : "text-gray-500"
                          }`}
                        />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>

                  {/* Additional Links */}
                  <div className="space-y-2 pt-4 border-t border-gray-200 mb-6">
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block p-3 rounded-lg font-medium transition-colors ${
                        pathname === "/profile"
                          ? "text-gray-800 bg-gray-100"
                          : "text-gray-700 hover:text-gray-800 hover:bg-gray-50"
                      }`}
                    >
                      Profile Settings
                    </Link>
                  </div>

                  {/* Sign Out Button */}
                  <Button
                    text={isLoggingOut ? "Signing Out..." : "Sign Out"}
                    onClick={handleLogout}
                    variant="danger"
                    size="lg"
                    disabled={isLoggingOut}
                    className="w-full"
                  />
                </>
              ) : (
                <>
                  {/* Non-logged-in users mobile menu */}
                  <div className="text-center">
                    {/* App Info Section */}
                    <div className="mb-8">
                      <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-xl">S</span>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Welcome to SplitEase
                      </h2>
                      <p className="text-gray-600 text-sm">
                        Split bills and track expenses with friends
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 mb-8">
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block w-full py-3 px-4 text-center font-medium rounded-lg border-2 transition-all duration-300 ${
                          pathname === "/login"
                            ? "border-purple-500 bg-purple-50 text-purple-700"
                            : "border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-600"
                        }`}
                      >
                        Login to Your Account
                      </Link>

                      <Link
                        href="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block w-full py-3 px-4 text-center font-medium rounded-lg transition-all duration-300 ${
                          pathname === "/signup"
                            ? "bg-gradient-to-r from-indigo-600 to-purple-700 text-white"
                            : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
                        }`}
                      >
                        Create New Account
                      </Link>
                    </div>

                    {/* Features Preview */}
                    <div className="pt-6 border-t border-gray-200">
                      <p className="text-sm text-gray-500 mb-4">
                        What you can do:
                      </p>
                      <div className="space-y-3 text-left">
                        <div className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3 flex-shrink-0"></div>
                          <span>Split bills with friends easily</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 flex-shrink-0"></div>
                          <span>Track group expenses in real-time</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-pink-500 rounded-full mr-3 flex-shrink-0"></div>
                          <span>Settle payments securely</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div
          className={`fixed top-20 right-4 z-60 px-6 py-3 rounded-lg shadow-lg ${
            showToast.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white transition-all duration-300`}
        >
          {showToast.message}
        </div>
      )}
    </>
  );
}
