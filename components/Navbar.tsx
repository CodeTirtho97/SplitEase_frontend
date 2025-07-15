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

  // Check if we're on a dashboard-related page
  const isDashboardPage = [
    "/dashboard",
    "/groups",
    "/expenses",
    "/payments",
    "/profile",
  ].includes(pathname);

  // Don't show hamburger menu on auth pages if not logged in
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
          className={`mobile-menu fixed inset-0 bg-white/95 backdrop-blur-lg z-10 flex flex-col pt-24 px-6 transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          } lg:hidden`}
        >
          <div className="flex flex-col space-y-6 items-center">
            {isLoggedIn ? (
              <>
                {/* User Profile Section */}
                <div className="flex items-center space-x-3 p-4 bg-gray-100 rounded-lg w-full max-w-md">
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
                <div className="w-full max-w-md space-y-3">
                  <h3 className="text-lg font-semibold text-gray-800 text-center mb-4">
                    Navigation
                  </h3>
                  {dashboardNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`w-full flex items-center space-x-4 py-4 px-6 text-lg font-medium rounded-lg transition-colors ${
                        item.active
                          ? "text-indigo-700 bg-indigo-100 shadow-sm"
                          : "text-gray-700 hover:text-indigo-600 hover:bg-gray-100"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={item.icon}
                        className={`text-xl ${
                          item.active ? "text-indigo-600" : "text-gray-500"
                        }`}
                      />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>

                {/* Additional Links */}
                <div className="w-full max-w-md space-y-3 border-t border-gray-200 pt-6">
                  <Link
                    href="/profile"
                    className={`w-full py-4 text-center text-lg font-medium rounded-lg transition-colors ${
                      pathname === "/profile"
                        ? "text-gray-800 bg-gray-200 shadow-sm"
                        : "text-gray-700 hover:text-gray-800 hover:bg-gray-100"
                    }`}
                  >
                    Profile Settings
                  </Link>
                </div>

                {/* Sign Out Button */}
                <div className="w-full max-w-md mt-8">
                  <Button
                    text={isLoggingOut ? "Signing Out..." : "Sign Out"}
                    onClick={handleLogout}
                    variant="danger"
                    size="lg"
                    disabled={isLoggingOut}
                    className="w-full"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Home page mobile menu - show navigation or simple close */}
                {pathname === "/" ? (
                  <div className="w-full max-w-md space-y-4 text-center">
                    <p className="text-gray-600 mb-6">Ready to get started?</p>
                    <Link
                      href="/login"
                      className="w-full py-4 text-center text-lg font-medium rounded-lg transition-colors border border-gray-300 text-gray-700 hover:text-purple-600 hover:bg-gray-100"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="w-full py-4 text-center text-lg font-medium rounded-lg transition-colors bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
                    >
                      Sign Up
                    </Link>
                  </div>
                ) : (
                  <div className="w-full max-w-md text-center">
                    <p className="text-gray-600 mb-6">
                      Use the navigation above or
                    </p>
                    <Link
                      href="/"
                      className="w-full py-4 text-center text-lg font-medium rounded-lg transition-colors bg-indigo-500 text-white hover:bg-indigo-600"
                    >
                      Go to Home
                    </Link>
                  </div>
                )}
              </>
            )}
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
