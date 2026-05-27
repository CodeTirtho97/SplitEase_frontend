import {
  CURRENCIES,
  CURRENCY_SYMBOLS,
  EXPENSE_TYPES,
  PAYMENT_METHODS,
  SPLIT_METHODS,
  GROUP_TYPES,
  COOKIE_OPTIONS,
} from "@/utils/constants";

describe("CURRENCIES", () => {
  it("contains expected currencies", () => {
    expect(CURRENCIES).toContain("INR");
    expect(CURRENCIES).toContain("USD");
    expect(CURRENCIES).toContain("EUR");
    expect(CURRENCIES).toContain("GBP");
    expect(CURRENCIES).toContain("JPY");
  });

  it("has exactly 5 entries", () => {
    expect(CURRENCIES).toHaveLength(5);
  });
});

describe("CURRENCY_SYMBOLS", () => {
  it("maps INR to ₹", () => expect(CURRENCY_SYMBOLS.INR).toBe("₹"));
  it("maps USD to $", () => expect(CURRENCY_SYMBOLS.USD).toBe("$"));
  it("maps EUR to €", () => expect(CURRENCY_SYMBOLS.EUR).toBe("€"));
  it("maps GBP to £", () => expect(CURRENCY_SYMBOLS.GBP).toBe("£"));
  it("maps JPY to ¥", () => expect(CURRENCY_SYMBOLS.JPY).toBe("¥"));
});

describe("EXPENSE_TYPES", () => {
  it("contains Food and Transportation", () => {
    expect(EXPENSE_TYPES).toContain("Food");
    expect(EXPENSE_TYPES).toContain("Transportation");
  });

  it("has 6 types", () => {
    expect(EXPENSE_TYPES).toHaveLength(6);
  });
});

describe("PAYMENT_METHODS", () => {
  it("contains UPI, PayPal, Stripe", () => {
    expect(PAYMENT_METHODS).toContain("UPI");
    expect(PAYMENT_METHODS).toContain("PayPal");
    expect(PAYMENT_METHODS).toContain("Stripe");
  });
});

describe("SPLIT_METHODS", () => {
  it("contains Equal, Percentage, Custom", () => {
    expect(SPLIT_METHODS).toContain("Equal");
    expect(SPLIT_METHODS).toContain("Percentage");
    expect(SPLIT_METHODS).toContain("Custom");
  });
});

describe("GROUP_TYPES", () => {
  it("contains Travel and Friends", () => {
    expect(GROUP_TYPES).toContain("Travel");
    expect(GROUP_TYPES).toContain("Friends");
  });

  it("has 5 types", () => {
    expect(GROUP_TYPES).toHaveLength(5);
  });
});

describe("COOKIE_OPTIONS", () => {
  it("expires in 7 days", () => {
    expect(COOKIE_OPTIONS.expires).toBe(7);
  });

  it("uses lax sameSite", () => {
    expect(COOKIE_OPTIONS.sameSite).toBe("lax");
  });

  it("secure matches NODE_ENV", () => {
    const expected = process.env.NODE_ENV === "production";
    expect(COOKIE_OPTIONS.secure).toBe(expected);
  });
});
