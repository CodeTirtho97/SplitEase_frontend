"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faMoneyBill,
  faUsers,
  faCreditCard,
  faChartPie,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";

interface SidebarProps {
  activePage: string; // Accept activePage prop
}

const Sidebar = ({ activePage }: SidebarProps) => {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile screen on client side
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  return (
    <aside
      className="flex flex-col w-64 shadow-lg"
      style={{
        marginTop: "4.5rem", // Start below navbar (adjusted to match your layout)
        marginBottom: "0.75rem", // Stop before footer
        height: "calc(100vh - 5.25rem)", // Full height minus navbar and margin
      }}
    >
      <div className="w-64 rounded-r-xl overflow-hidden fixed flex flex-col h-[calc(100vh-5.25rem)] bg-gradient-to-b from-indigo-600 to-purple-700">
        {/* Frosted glass effect overlay */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

        {/* Content container */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Dashboard back button with subtle gradient */}
          <Link
            href="/dashboard"
            className="flex items-center gap-3 py-4 px-6 text-xl font-semibold text-white hover:bg-white/10 transition-all duration-200 border-b border-white/10"
          >
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-8 h-8 rounded-lg flex items-center justify-center shadow-md">
              <FontAwesomeIcon
                icon={faArrowLeft}
                className="text-white text-sm"
              />
            </div>
            <span>Dashboard</span>
          </Link>

          {/* Main navigation */}
          <nav className="flex-1 py-6 px-3 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-transparent">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/groups"
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activePage === "groups"
                      ? "bg-white/20 text-white shadow-sm"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div
                    className={`${
                      activePage === "groups" ? "bg-white/20" : "bg-white/10"
                    } w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200`}
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
                      ? "bg-white/20 text-white shadow-sm"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div
                    className={`${
                      activePage === "expenses" ? "bg-white/20" : "bg-white/10"
                    } w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200`}
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
                      ? "bg-white/20 text-white shadow-sm"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div
                    className={`${
                      activePage === "payments" ? "bg-white/20" : "bg-white/10"
                    } w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200`}
                  >
                    <FontAwesomeIcon icon={faMoneyBill} />
                  </div>
                  <span className="font-medium">Payments</span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* App branding at bottom */}
          <div className="border-t border-white/10 p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md">
              <span className="text-indigo-700 font-bold text-lg">SE</span>
            </div>
            <span className="font-semibold text-white">SplitEase</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
