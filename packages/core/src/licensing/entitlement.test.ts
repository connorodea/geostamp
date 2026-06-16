import { describe, it, expect } from "vitest";
import { isEntitled, seatsExceeded, type License } from "../index";

const base: License = {
  key: "K", tier: "pro", monthlyQuota: 1000, seats: 1,
  uses: 1, refunded: false, disputed: false, productId: "p",
};

describe("license entitlement", () => {
  it("a clean license is entitled", () => {
    expect(isEntitled(base)).toBe(true);
  });
  it("a refunded license is NOT entitled", () => {
    expect(isEntitled({ ...base, refunded: true })).toBe(false);
  });
  it("a disputed license is NOT entitled", () => {
    expect(isEntitled({ ...base, disputed: true })).toBe(false);
  });
  it("seats not exceeded when uses <= seats", () => {
    expect(seatsExceeded({ ...base, seats: 3, uses: 3 })).toBe(false);
  });
  it("seats exceeded when uses > seats", () => {
    expect(seatsExceeded({ ...base, seats: 1, uses: 2 })).toBe(true);
  });
});
