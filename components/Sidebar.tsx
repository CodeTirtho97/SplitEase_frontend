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

interface SidebarProps {
  activePage: string; // Accept activePage prop
}

const Sidebar = ({ activePage }: SidebarProps) => {
  const router = useRouter();

  return (
    <aside
      className="flex flex-col w-64 bg-gradient-to-b from-indigo-700 via-indigo-600 to-purple-700 text-white shadow-xl top-8 rounded-r-xl"
      style={{
        marginTop: "0.25rem", // Start below navbar
        marginBottom: "0.75rem", // Stop before footer
      }}
    >
      {/* Back Button */}
      <div className="w-64 bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 text-white fixed top-24 mt-8 mb-8 left-0 flex-col shadow-xl rounded-r-xl overflow-hidden border-r border-white/10">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="flex items-center gap-3 py-4 px-6 text-xl font-semibold bg-white/10 hover:bg-white/20 transition-all duration-300 border-b border-white/10"
        >
          <div className="bg-indigo-500 w-8 h-8 rounded-lg flex items-center justify-center shadow-md">
            <FontAwesomeIcon icon={faArrowLeft} className="text-white" />
          </div>
          <span className="font-medium tracking-wide">Dashboard</span>
        </Link>

        {/* Sidebar Menu */}
        <nav className="flex-1 mt-6 mb-8">
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
                    icon={faCreditCard}
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
                    icon={faMoneyBill}
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

        {/* SplitEase branding at bottom */}
        {/* <div className="mt-auto mb-6 px-6 flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md">
            <span className="text-indigo-700 font-bold text-lg">S</span>
          </div>
          <span className="font-semibold text-white">SplitEase</span>
        </div> */}
      </div>
    </aside>
  );
};

export default Sidebar;
