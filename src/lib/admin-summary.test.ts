import { describe, expect, it } from "vitest";
import { summarizePayments } from "./admin-summary";

describe("admin payment summary", () => {
  it("counts only approved payments as received revenue", () => {
    const base = { phone: "", kind: "premium", created_at: "2026-10-12" };
    expect(summarizePayments([
      { ...base, id: "a", amount: 2000, status: "approved" },
      { ...base, id: "b", amount: 1000, status: "approved" },
      { ...base, id: "c", amount: 5000, status: "pending" },
      { ...base, id: "d", amount: 5000, status: "rejected" },
    ])).toEqual({ approvedAmount: 3000, approved: 2, pending: 1, rejected: 1 });
  });
});