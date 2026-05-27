export const CURRENCIES = ["INR", "USD", "EUR", "GBP", "JPY"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
};

export const EXPENSE_TYPES = [
  "Food",
  "Transportation",
  "Accommodation",
  "Utilities",
  "Entertainment",
  "Miscellaneous",
] as const;
export type ExpenseType = (typeof EXPENSE_TYPES)[number];

export const PAYMENT_METHODS = ["UPI", "PayPal", "Stripe"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const SPLIT_METHODS = ["Equal", "Percentage", "Custom"] as const;
export type SplitMethod = (typeof SPLIT_METHODS)[number];

export const GROUP_TYPES = [
  "Travel",
  "Household",
  "Event",
  "Work",
  "Friends",
] as const;
export type GroupType = (typeof GROUP_TYPES)[number];

export const COOKIE_OPTIONS = {
  expires: 7,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
};
