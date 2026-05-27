const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
};

export function formatCurrency(amount: number | string, currency = "INR"): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `${symbol}${isNaN(num) ? "0.00" : num.toFixed(2)}`;
}
