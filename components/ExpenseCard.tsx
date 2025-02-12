export default function ExpenseCard({ title, amount, color }: { title: string; amount: string; color: string }) {
  return (
    <div className={`p-6 rounded-lg shadow-md text-white ${color}`}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-2xl font-bold">{amount}</p>
    </div>
  );
}