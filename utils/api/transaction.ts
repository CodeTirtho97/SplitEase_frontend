import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie for cookie-based auth

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const transactionApi = {
  getPendingTransactions: async () => {
    return await axios.get(`${API_URL}/transactions/pending`, {
      headers: { Authorization: `Bearer ${Cookies.get("token")}` }, // Use cookie instead of localStorage
    });
  },
  getTransactionHistory: async () => {
    return await axios.get(`${API_URL}/transactions/history`, {
      headers: { Authorization: `Bearer ${Cookies.get("token")}` }, // Use cookie instead of localStorage
    });
  },
  settleTransaction: async (
    transactionId: string,
    data: { status: "Success" | "Failed"; mode: "UPI" | "PayPal" | "Stripe" }
  ) => {
    return await axios.put(`${API_URL}/transactions/${encodeURIComponent(transactionId)}/settle`, data, {
      headers: { Authorization: `Bearer ${Cookies.get("token")}` }, // Use cookie instead of localStorage
    });
  },
};

export default transactionApi;