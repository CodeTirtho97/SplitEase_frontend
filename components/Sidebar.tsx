"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faMoneyBill,
  faUsers,
  faCreditCard,
  faChevronLeft,
  faChartPie,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";

interface SidebarProps {
  activePage: string;
  userName?: string; // Optional user name to display
}

const Sidebar = ({ activePage, userName = "User" }: SidebarProps) => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  // Auto-collapse on small screens
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Set initial state

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sidebar width based on collapsed state
  const sidebarWidth = collapsed ? "w-16" : "w-64";

  return (
    <aside
      className={`${sidebarWidth} transition-all duration-300 ease-in-out flex flex-col fixed h-screen z-10`}
      style={{
        top: "4rem", // Adjust based on your navbar height
        bottom: "1rem",
      }}
    >
      {/* Sidebar Container with blurred glass effect */}
      <div
        className={`${sidebarWidth} h-full bg-gradient-to-b from-indigo-600 to-purple-700 rounded-r-xl shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col`}
      >
        {/* Frosted glass overlay */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

        {/* Content container */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Top section with back button */}
          <div className="p-4 flex items-center justify-between border-b border-white/20">
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-white/20 transition group ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <FontAwesomeIcon
                icon={faArrowLeft}
                className="text-white/90 group-hover:text-white"
              />
              {!collapsed && (
                <span className="font-medium text-white">Dashboard</span>
              )}
            </Link>

            {/* Collapse toggle button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-white"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <FontAwesomeIcon
                icon={faChevronLeft}
                className={`transition-transform duration-300 ${
                  collapsed ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* User greeting - only show when expanded */}
          {!collapsed && (
            <div className="px-4 py-3 border-b border-white/20">
              <p className="text-white/70 text-sm">Welcome,</p>
              <p className="text-white font-semibold truncate">{userName}</p>
            </div>
          )}

          {/* Navigation menu */}
          <nav className="flex-1 overflow-y-auto py-4 px-2">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/groups"
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition ${
                    collapsed ? "justify-center" : ""
                  } ${
                    activePage === "groups"
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div
                    className={`${
                      activePage === "groups" ? "bg-white/30" : "bg-white/10"
                    } w-9 h-9 rounded-lg flex items-center justify-center`}
                  >
                    <FontAwesomeIcon icon={faUsers} />
                  </div>
                  {!collapsed && <span className="font-medium">Groups</span>}
                </Link>
              </li>

              <li>
                <Link
                  href="/expenses"
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition ${
                    collapsed ? "justify-center" : ""
                  } ${
                    activePage === "expenses"
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div
                    className={`${
                      activePage === "expenses" ? "bg-white/30" : "bg-white/10"
                    } w-9 h-9 rounded-lg flex items-center justify-center`}
                  >
                    <FontAwesomeIcon icon={faCreditCard} />
                  </div>
                  {!collapsed && <span className="font-medium">Expenses</span>}
                </Link>
              </li>

              <li>
                <Link
                  href="/payments"
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition ${
                    collapsed ? "justify-center" : ""
                  } ${
                    activePage === "payments"
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div
                    className={`${
                      activePage === "payments" ? "bg-white/30" : "bg-white/10"
                    } w-9 h-9 rounded-lg flex items-center justify-center`}
                  >
                    <FontAwesomeIcon icon={faMoneyBill} />
                  </div>
                  {!collapsed && <span className="font-medium">Payments</span>}
                </Link>
              </li>

              <li>
                <Link
                  href="/analytics"
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition ${
                    collapsed ? "justify-center" : ""
                  } ${
                    activePage === "analytics"
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div
                    className={`${
                      activePage === "analytics" ? "bg-white/30" : "bg-white/10"
                    } w-9 h-9 rounded-lg flex items-center justify-center`}
                  >
                    <FontAwesomeIcon icon={faChartPie} />
                  </div>
                  {!collapsed && <span className="font-medium">Analytics</span>}
                </Link>
              </li>
            </ul>
          </nav>

          {/* App branding - bottom of sidebar */}
          <div
            className={`p-4 border-t border-white/20 flex items-center ${
              collapsed ? "justify-center" : ""
            }`}
          >
            {collapsed ? (
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold text-sm">SE</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-bold text-sm">SE</span>
                </div>
                <span className="font-bold text-white">SplitEase</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expand button - appears when sidebar is collapsed on mobile */}
      {collapsed && windowWidth < 768 && (
        <button
          onClick={() => setCollapsed(false)}
          className="absolute -right-10 top-4 p-2 bg-indigo-600 text-white rounded-r-lg shadow-lg hover:bg-indigo-700 transition"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="rotate-180" />
        </button>
      )}
    </aside>
  );
};

export default Sidebar;
