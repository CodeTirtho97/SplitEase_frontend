import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBill,
  faUsers,
  faCreditCard,
  faTachometerAlt,
} from "@fortawesome/free-solid-svg-icons";

interface SidebarProps {
  activePage: string;
}

const Sidebar = ({ activePage }: SidebarProps) => {
  return (
    <aside
      className="flex flex-col w-64 bg-gray-900 text-white shadow-xl top-8"
      style={{
        marginTop: "0.25rem",
        marginBottom: "0.75rem",
      }}
    >
      <div className="w-64 bg-gray-900 text-white fixed top-24 mt-8 mb-8 left-0 flex-col shadow-xl overflow-hidden border-r border-gray-800">
        {/* App Logo & Name
        <div className="flex items-center gap-3 py-4 px-6 bg-white/10 border-b border-white/10">
          <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-md">
            <span className="text-indigo-700 font-bold text-xl">S</span>
          </div>
          <span className="font-semibold text-xl tracking-wide">SplitEase</span>
        </div> */}

        {/* Dashboard Link */}
        <Link
          href="/dashboard"
          className={`flex items-center gap-4 px-6 py-4 transition-colors duration-150 ${
            activePage === "dashboard"
              ? "bg-gray-800 border-l-2 border-indigo-400"
              : "hover:bg-gray-800 border-l-2 border-transparent"
          }`}
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              activePage === "dashboard" ? "bg-indigo-500" : "bg-gray-800"
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
                className={`flex items-center gap-4 px-6 py-4 transition-colors duration-150 text-base font-medium ${
                  activePage === "groups"
                    ? "bg-gray-800 border-l-2 border-indigo-400"
                    : "hover:bg-gray-800 border-l-2 border-transparent"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    activePage === "groups" ? "bg-indigo-500" : "bg-gray-800"
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
                className={`flex items-center gap-4 px-6 py-4 transition-colors duration-150 text-base font-medium ${
                  activePage === "expenses"
                    ? "bg-gray-800 border-l-2 border-indigo-400"
                    : "hover:bg-gray-800 border-l-2 border-transparent"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    activePage === "expenses" ? "bg-indigo-500" : "bg-gray-800"
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
                className={`flex items-center gap-4 px-6 py-4 transition-colors duration-150 text-base font-medium ${
                  activePage === "payments"
                    ? "bg-gray-800 border-l-2 border-indigo-400"
                    : "hover:bg-gray-800 border-l-2 border-transparent"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    activePage === "payments" ? "bg-indigo-500" : "bg-gray-800"
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

        {/* User Profile Link (Optional)
        <div className="mt-auto">
          <Link
            href="/profile"
            className={`flex items-center gap-4 px-6 py-4 border-t border-white/10 transition-all duration-300 ${
              activePage === "profile" ? "bg-white/20" : "hover:bg-white/10"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-white font-medium">U</span>
            </div>
            <span className="text-white/90">Profile</span>
          </Link>
        </div> */}
      </div>
    </aside>
  );
};

export default Sidebar;
