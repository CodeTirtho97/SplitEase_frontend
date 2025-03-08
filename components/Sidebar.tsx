"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faMoneyBill,
  faUsers,
  faCreditCard,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";

interface SidebarProps {
  activePage: string; // Accept activePage prop
}

const Sidebar = ({ activePage }: SidebarProps) => {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll to prevent footer overlap
  useEffect(() => {
    const handleScroll = () => {
      // Check if page is scrolled
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <aside
      className="hidden md:block"
      style={{
        position: "fixed",
        top: "4rem", // Below navbar
        left: 0,
        bottom: 0,
        width: "16rem",
        zIndex: 40,
      }}
    >
      <div
        className="h-full flex flex-col bg-gradient-to-b from-indigo-700 via-indigo-600 to-purple-700 overflow-hidden"
        style={{
          maxHeight: "calc(100vh - 4rem)", // Viewport height minus navbar
          overflowY: "auto",
          overscrollBehavior: "contain",
        }}
      >
        {/* Content container */}
        <div className="relative flex flex-col h-full">
          {/* Dashboard back button with improved styling */}
          <Link
            href="/dashboard"
            className="flex items-center gap-3 p-5 font-semibold text-white hover:bg-white/10 transition-all duration-200 border-b border-white/20"
          >
            <div className="p-2 rounded-lg bg-white/10 shadow-inner flex items-center justify-center">
              <FontAwesomeIcon icon={faArrowLeft} className="text-white" />
            </div>
            <span className="text-lg">Dashboard</span>
          </Link>

          {/* Main navigation menu */}
          <nav className="flex-1 py-5 px-4">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/groups"
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activePage === "groups"
                      ? "bg-white/15 text-white shadow-sm"
                      : "text-white/90 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div
                    className={`${
                      activePage === "groups" ? "bg-indigo-500" : "bg-white/10"
                    } w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm`}
                  >
                    <FontAwesomeIcon icon={faUsers} />
                  </div>
                  <span className="font-medium">Groups</span>
                </Link>
              </li>

              <li>
                <Link
                  href="/expenses"
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activePage === "expenses"
                      ? "bg-white/15 text-white shadow-sm"
                      : "text-white/90 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div
                    className={`${
                      activePage === "expenses"
                        ? "bg-indigo-500"
                        : "bg-white/10"
                    } w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm`}
                  >
                    <FontAwesomeIcon icon={faCreditCard} />
                  </div>
                  <span className="font-medium">Expenses</span>
                </Link>
              </li>

              <li>
                <Link
                  href="/payments"
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activePage === "payments"
                      ? "bg-white/15 text-white shadow-sm"
                      : "text-white/90 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div
                    className={`${
                      activePage === "payments"
                        ? "bg-indigo-500"
                        : "bg-white/10"
                    } w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm`}
                  >
                    <FontAwesomeIcon icon={faMoneyBill} />
                  </div>
                  <span className="font-medium">Payments</span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* App branding at bottom */}
          <div className="border-t border-white/20 p-5 mt-auto">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md">
                <span className="text-indigo-700 font-bold text-lg">S</span>
              </div>
              <span className="font-semibold text-white">SplitEase</span>
            </div>
          </div>

          {/* Extra padding to ensure content doesn't get cut off by footer */}
          <div className="py-3"></div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
