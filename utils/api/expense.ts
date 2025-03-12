import axios from 'axios';
import Cookies from 'js-cookie'; // Import js-cookie

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function to get token from cookies
const getToken = () => {
  return Cookies.get('token');
};

const createExpense = async (payload: any) => {
  return await axios.post(`${API_URL}/expenses/create`, payload, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};

const getExpenseSummary = async (currency?: string) => {
  const params = currency || "";
  return await axios.get(`${API_URL}/expenses/summary`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};

const getRecentExpenses = async () => {
  return await axios.get(`${API_URL}/expenses/recent`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};

const getExpenseBreakdown = async (currency: string) => {
    return await axios.get(`${API_URL}/expenses/breakdown/${currency}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
  });
};

// New method for updating exchange rates
const updateExchangeRates = async () => {
  return await axios.post(`${API_URL}/expenses/update-exchange-rates`, null, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};

export default {
  createExpense,
  getExpenseSummary,
  getRecentExpenses,
  getExpenseBreakdown,
  updateExchangeRates,
};