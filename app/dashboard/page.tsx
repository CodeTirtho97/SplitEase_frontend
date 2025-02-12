"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ExpenseCard from "@/components/ExpenseCard";
import RecentTransactions from "@/components/RecentTransactions";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUserToken] = useState<{ name: string } | null>(null);

  // Simulated authentication check
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("userToken");
      if (!storedToken) {
        router.push("/login");  // Redirect if no token found
      } else {
        setUserToken({ name: "Test User" });
      }
    } catch (error) {
      console.error("Error retrieving userToken:", error);
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex mt-20">
      {/* Sidebar (Now properly aligned with navbar & footer) */}
      <Sidebar activePage=""/>

      {/* Main Content */}
      <main className="flex-1 min-h-screen p-6 bg-gray-100">
        {/* Greeting */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-5xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">Dashboard</h1>
            <p className="text-gray-600 text-lg mt-1">All your stats in one place!</p>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Welcome, <span className="text-purple-600">{user?.name || "User"}</span> 👋
          </h1>
        </div>
        {/* <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <p className="text-gray-600">Here’s your expense overview.</p>
        </div> */}

        {/* Expense Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ExpenseCard title="Total Expenses" amount="₹10,500" color="bg-red-500" />
          <ExpenseCard title="Pending Payments" amount="₹3,200" color="bg-yellow-500" />
          <ExpenseCard title="Settled Payments" amount="₹7,300" color="bg-green-500" />
        </div>

        {/* Recent Transactions */}
        <div className="mt-6">
          <RecentTransactions />
        </div>
      </main>
    </div>
  );
}