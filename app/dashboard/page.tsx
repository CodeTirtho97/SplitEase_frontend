import ExpenseCard from "@/components/ExpenseCard";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
      <p className="text-gray-600 mt-1">Manage your expenses and settlements.</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <ExpenseCard title="Trip to Goa" amount={2500} />
        <ExpenseCard title="Office Lunch" amount={1200} />
      </div>
    </div>
  );
}