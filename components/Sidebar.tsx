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

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: faTachometerAlt, page: "dashboard" },
  { href: "/groups", label: "Groups", icon: faUsers, page: "groups" },
  { href: "/expenses", label: "Expenses", icon: faCreditCard, page: "expenses" },
  { href: "/payments", label: "Payments", icon: faMoneyBill, page: "payments" },
];

const Sidebar = ({ activePage }: SidebarProps) => {
  return (
    <aside className="w-64 shrink-0">
      <div className="w-64 bg-gray-900 text-white fixed top-16 left-0 h-[calc(100vh-4rem)] flex flex-col shadow-xl border-r border-gray-800">
        {/* Brand header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-semibold text-sm text-white tracking-wide">SplitEase</span>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest px-3 mb-3">
            Navigation
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = activePage === item.page;
              return (
                <li key={item.page}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 flex items-center justify-center rounded-md text-xs flex-shrink-0 ${
                        isActive ? "bg-white/20" : "bg-gray-800"
                      }`}
                    >
                      <FontAwesomeIcon icon={item.icon} />
                    </span>
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-800">
          <p className="text-[11px] text-gray-600 text-center">SplitEase v1.0</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
