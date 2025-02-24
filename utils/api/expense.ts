import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const createExpense = async (payload: any) => {
  return await axios.post(`${API_URL}/expenses/create`, payload, {
    headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
  });
};

const getExpenseSummary = async (currency?: string) => {
  const params = currency || "";
  return await axios.get(`${API_URL}/expenses/summary`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
  });
};

const getRecentExpenses = async () => {
  return await axios.get(`${API_URL}/expenses/recent`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
  });
};

const getExpenseBreakdown = async (currency: string) => {
    return await axios.get(`${API_URL}/expenses/breakdown/${currency}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
  });
};

// New method for updating exchange rates
const updateExchangeRates = async () => {
  return await axios.post(`${API_URL}/expenses/update-exchange-rates`, null, {
    headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
  });
};

export default {
  createExpense,
  getExpenseSummary,
  getRecentExpenses,
  getExpenseBreakdown,
  updateExchangeRates,
};