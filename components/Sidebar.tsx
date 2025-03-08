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
      className="flex flex-col w-64 bg-gradient-to-b from-blue-900 via-indigo-700 to-pink-600 text-white shadow-lg top-8"
      style={{
        marginTop: "0.25rem", // Start below navbar
        marginBottom: "0.75rem", // Stop before footer
      }}
    >
      {/* Back Button */}
      <div className="w-64 bg-gradient-to-br from-indigo-800 to-pink-300 text-white fixed top-24 mt-8 mb-8 left-0 flex-col shadow-lg">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="flex items-center gap-3 py-4 px-6 text-xl font-semibold bg-white/20 hover:bg-white/40 transition"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Dashboard</span>
        </Link>

        {/* Sidebar Menu */}
        <nav className="flex-1 mt-8 mb-8">
          <ul className="space-y-4">
            <li>
              <Link
                href="/groups"
                className={`flex items-center gap-3 px-10 py-5 transition rounded-r-full text-lg ${
                  activePage === "groups" ? "bg-white/20" : "hover:bg-white/10"
                }`}
              >
                <FontAwesomeIcon icon={faUsers} />
                <span>Groups</span>
              </Link>
            </li>

            <li>
              <Link
                href="/expenses"
                className={`flex items-center gap-3 px-10 py-5 transition rounded-r-full text-lg ${
                  activePage === "expenses"
                    ? "bg-white/20"
                    : "hover:bg-white/10"
                }`}
              >
                <FontAwesomeIcon icon={faCreditCard} />
                <span>Expenses</span>
              </Link>
            </li>

            <li>
              <Link
                href="/payments"
                className={`flex items-center gap-3 px-10 py-5 transition rounded-r-full text-lg ${
                  activePage === "payments"
                    ? "bg-white/20"
                    : "hover:bg-white/10"
                }`}
              >
                <FontAwesomeIcon icon={faMoneyBill} />
                <span>Payments</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
