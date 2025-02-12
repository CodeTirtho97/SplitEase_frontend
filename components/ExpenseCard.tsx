export default function ExpenseCard({ title, amount }: { title: string; amount: number }) {
    return (
      <div className="bg-white shadow-md rounded-lg p-4 border border-gray-200">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-gray-500">Amount: ₹{amount}</p>
      </div>
    );
  }