"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/Button";

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Simulating authentication check (Replace with actual auth logic)
  useEffect(() => {
    const user = localStorage.getItem("userToken"); // Replace this with actual authentication logic
    setIsLoggedIn(!!user);
  }, []);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("userToken"); // Clear token
    setIsLoggedIn(false);
    router.push("/login"); // Redirect to login page
  };

  return (
    <nav className="backdrop-blur-md bg-white/80 shadow-md fixed w-full top-0 left-0 px-6 py-4 z-50">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        {/* Logo & App Name */}
        <div className="flex items-center space-x-3">
          <Image src="/logo.png" alt="SplitEase Logo" width={40} height={40} />
          <Link href="/" className={`text-3xl font-extrabold tracking-tight ${isLoggedIn ? "pointer-events-none opacity-50" : "text-gray-900"}`}>
            SplitEase<span className="text-indigo-600">.</span>
          </Link>
        </div>

        {/* Navigation Links (Show based on Auth State) */}
        <div className="flex space-x-6">
          {isLoggedIn ? (
            <>
              {/* Dashboard Link (Only for Logged-In Users) */}
              <Link
                href="/dashboard"
                className="relative text-gray-700 px-4 py-2 rounded-md transition-all duration-300 
                before:absolute before:bottom-0 before:left-0 before:w-0 before:h-[2px] before:bg-indigo-500
                before:transition-all before:duration-300 hover:text-indigo-600 hover:before:w-full"
              >
                Dashboard
              </Link>

              {/* Profile Link */}
              <Link
                href="/profile"
                className="relative text-gray-700 px-4 py-2 rounded-md transition-all duration-300 
                before:absolute before:bottom-0 before:left-0 before:w-0 before:h-[2px] before:bg-gray-500
                before:transition-all before:duration-300 hover:text-gray-700 hover:before:w-full"
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
                className="relative text-gray-700 px-4 py-2 rounded-md transition-all duration-300 
                before:absolute before:bottom-0 before:left-0 before:w-0 before:h-[2px] before:bg-purple-500
                before:transition-all before:duration-300 hover:text-purple-600 hover:before:w-full"
              >
                Login
              </Link>

              {/* Sign Up Button */}
              <Link href="/signup">
                <button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 
                text-white rounded-lg transition-all duration-250 ease-out shadow-md transform hover:scale-105 
                w-[120px] h-[40px] flex items-center justify-center">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}