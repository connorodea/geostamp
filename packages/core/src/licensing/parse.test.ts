import { describe, it, expect } from "vitest";
import { parseGumroadVerifyResponse } from "../index";

const base = {
  success: true,
  uses: 3,
  purchase: {
    email: "buyer@example.com",
    product_id: "abc123",
    variants: "(Pro)",
    refunded: false,
    disputed: false,
    chargebacked: false,
  },
};

describe("parseGumroadVerifyResponse", () => {
  it("maps a Pro purchase to the pro tier + 1000 quota", () => {
    const lic = parseGumroadVerifyResponse("KEY-1", base);
    expect(lic).not.toBeNull();
    expect(lic!.tier).toBe("pro");
    expect(lic!.monthlyQuota).toBe(1000);
    expect(lic!.email).toBe("buyer@example.com");
    expect(lic!.uses).toBe(3);
  });
  it("returns null when success is false", () => {
    expect(parseGumroadVerifyResponse("KEY-1", { success: false, uses: 0 })).toBeNull();
  });
  it("flags refunded purchases", () => {
    const lic = parseGumroadVerifyResponse("KEY-1", {
      ...base,
      purchase: { ...base.purchase, refunded: true },
    });
    expect(lic!.refunded).toBe(true);
  });
  it("defaults unknown variant to starter", () => {
    const lic = parseGumroadVerifyResponse("KEY-1", {
      ...base,
      purchase: { ...base.purchase, variants: "" },
    });
    expect(lic!.tier).toBe("starter");
    expect(lic!.monthlyQuota).toBe(100);
  });
});
