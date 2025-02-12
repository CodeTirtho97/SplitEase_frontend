export default function RecentTransactions() {
    // Sample Transactions
    const transactions = [
      { id: 11, name: "Movie Tickets", amount: "₹800", date: "Feb 12" },
      { id: 10, name: "Gym Membership", amount: "₹1,500", date: "Feb 11" },
      { id: 9, name: "Dinner at The Taj", amount: "₹1,200", date: "Feb 10" },
      { id: 8, name: "Uber Ride", amount: "₹320", date: "Feb 9" },
      { id: 7, name: "Netflix Subscription", amount: "₹799", date: "Feb 5" },
      { id: 6, name: "Grocery Shopping", amount: "₹2,000", date: "Feb 4" },
      { id: 5, name: "Flight Ticket", amount: "₹4,500", date: "Feb 2" },
      { id: 4, name: "Amazon Order", amount: "₹2,300", date: "Feb 1" },
      { id: 3, name: "Electricity Bill", amount: "₹3,600", date: "Jan 30" },
      { id: 2, name: "Spotify Premium", amount: "₹199", date: "Jan 28" },
      { id: 1, name: "Weekend Brunch", amount: "₹1,100", date: "Jan 26" },
    ];
  
    // Show only the latest 10 transactions
    const latestTransactions = transactions.slice(0, 10);
  
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Recent 10 Transactions</h3>
  
        {/* Transaction Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
            <thead>
              <tr className="bg-indigo-600 text-white uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Transaction</th>
                <th className="py-3 px-6 text-center">Amount</th>
                <th className="py-3 px-6 text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {latestTransactions.map((tx, index) => (
                <tr
                  key={tx.id}
                  className={`border-b transition hover:bg-indigo-50 ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="py-3 px-6 text-left">{tx.name}</td>
                  <td className="py-3 px-6 text-center font-semibold">{tx.amount}</td>
                  <td className="py-3 px-6 text-right text-gray-500">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }