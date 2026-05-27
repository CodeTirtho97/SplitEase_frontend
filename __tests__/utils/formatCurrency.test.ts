import { formatCurrency } from "@/utils/formatCurrency";

describe("formatCurrency", () => {
  it("formats INR by default", () => {
    expect(formatCurrency(100)).toBe("₹100.00");
  });

  it("formats USD", () => {
    expect(formatCurrency(50.5, "USD")).toBe("$50.50");
  });

  it("formats EUR", () => {
    expect(formatCurrency(200, "EUR")).toBe("€200.00");
  });

  it("formats GBP", () => {
    expect(formatCurrency(75.99, "GBP")).toBe("£75.99");
  });

  it("formats JPY", () => {
    expect(formatCurrency(1000, "JPY")).toBe("¥1000.00");
  });

  it("accepts string amount", () => {
    expect(formatCurrency("123.456", "USD")).toBe("$123.46");
  });

  it("returns 0.00 for NaN string", () => {
    expect(formatCurrency("not-a-number", "USD")).toBe("$0.00");
  });

  it("falls back to currency code when symbol is unknown", () => {
    expect(formatCurrency(50, "AUD")).toBe("AUD50.00");
  });

  it("handles zero", () => {
    expect(formatCurrency(0)).toBe("₹0.00");
  });

  it("handles negative amount", () => {
    expect(formatCurrency(-25.5, "USD")).toBe("$-25.50");
  });
});
