"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faMoneyBill,
  faUsers,
  faCreditCard,
  faTachometerAlt,
} from "@fortawesome/free-solid-svg-icons";

interface SidebarProps {
  activePage: string;
}

const Sidebar = ({ activePage }: SidebarProps) => {
  const router = useRouter();

  return (
    // Only show on desktop (lg screens and above), completely hidden on mobile/tablet
    <aside className="hidden lg:flex flex-col w-64 bg-gradient-to-b from-indigo-700 via-indigo-600 to-purple-700 text-white shadow-xl fixed left-0 top-20 bottom-0 z-30">
      <div className="w-64 bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 text-white flex-col shadow-xl overflow-hidden border-r border-white/10">
        {/* Dashboard Link */}
        <Link
          href="/dashboard"
          className={`flex items-center gap-4 px-6 py-4 transition-all duration-300 ${
            activePage === "dashboard"
              ? "bg-white/20 shadow-md"
              : "hover:bg-white/10 hover:translate-x-1"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              activePage === "dashboard"
                ? "bg-indigo-500 shadow-md"
                : "bg-white/10"
            }`}
          >
            <FontAwesomeIcon
              icon={faTachometerAlt}
              className={
                activePage === "dashboard" ? "text-white" : "text-white/90"
              }
            />
          </div>
          <span
            className={
              activePage === "dashboard" ? "text-white" : "text-white/90"
            }
          >
            Dashboard
          </span>
        </Link>

        {/* Sidebar Menu */}
        <nav className="flex-1 mt-4">
          <ul className="space-y-3">
            <li>
              <Link
                href="/groups"
                className={`flex items-center gap-4 px-6 py-4 transition-all duration-300 rounded-r-full text-lg font-medium ${
                  activePage === "groups"
                    ? "bg-white/20 shadow-md"
                    : "hover:bg-white/10 hover:translate-x-1"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activePage === "groups"
                      ? "bg-indigo-500 shadow-md"
                      : "bg-white/10"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={faUsers}
                    className={
                      activePage === "groups" ? "text-white" : "text-white/90"
                    }
                  />
                </div>
                <span
                  className={
                    activePage === "groups" ? "text-white" : "text-white/90"
                  }
                >
                  Groups
                </span>
              </Link>
            </li>

            <li>
              <Link
                href="/expenses"
                className={`flex items-center gap-4 px-6 py-4 transition-all duration-300 rounded-r-full text-lg font-medium ${
                  activePage === "expenses"
                    ? "bg-white/20 shadow-md"
                    : "hover:bg-white/10 hover:translate-x-1"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activePage === "expenses"
                      ? "bg-indigo-500 shadow-md"
                      : "bg-white/10"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={faMoneyBill}
                    className={
                      activePage === "expenses" ? "text-white" : "text-white/90"
                    }
                  />
                </div>
                <span
                  className={
                    activePage === "expenses" ? "text-white" : "text-white/90"
                  }
                >
                  Expenses
                </span>
              </Link>
            </li>

            <li>
              <Link
                href="/payments"
                className={`flex items-center gap-4 px-6 py-4 transition-all duration-300 rounded-r-full text-lg font-medium ${
                  activePage === "payments"
                    ? "bg-white/20 shadow-md"
                    : "hover:bg-white/10 hover:translate-x-1"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activePage === "payments"
                      ? "bg-indigo-500 shadow-md"
                      : "bg-white/10"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={faCreditCard}
                    className={
                      activePage === "payments" ? "text-white" : "text-white/90"
                    }
                  />
                </div>
                <span
                  className={
                    activePage === "payments" ? "text-white" : "text-white/90"
                  }
                >
                  Payments
                </span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
