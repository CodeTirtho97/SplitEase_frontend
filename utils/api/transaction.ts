import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const transactionApi = {
  getPendingTransactions: async () => {
    return await axios.get(`${API_URL}/transactions/pending`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
    });
  },
  getTransactionHistory: async () => {
    return await axios.get(`${API_URL}/transactions/history`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
    });
  },
  settleTransaction: async (
    transactionId: string,
    data: { status: "Success" | "Failed"; mode: "UPI" | "PayPal" | "Stripe" }
  ) => {
    return await axios.put(`${API_URL}/transactions/${encodeURIComponent(transactionId)}/settle`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
    });
  },
};

export default transactionApi;