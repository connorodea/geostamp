import { describe, it, expect } from "vitest";
import { recordUsage, remaining, canTag, type UsageState } from "./index";

const jan = new Date("2026-01-10T12:00:00Z");
const feb = new Date("2026-02-02T08:00:00Z");
const fresh: UsageState = { periodStart: "2026-01-01", count: 0 };

describe("usage metering", () => {
  it("records usage within the same month", () => {
    const s = recordUsage(fresh, 5, jan);
    expect(s.count).toBe(5);
    expect(s.periodStart).toBe("2026-01-01");
  });
  it("resets the counter in a new month", () => {
    const used = recordUsage(fresh, 90, jan);
    const next = recordUsage(used, 3, feb);
    expect(next.count).toBe(3);
    expect(next.periodStart).toBe("2026-02-01");
  });
  it("computes remaining against a quota", () => {
    const used = recordUsage(fresh, 90, jan);
    expect(remaining(used, 100, jan)).toBe(10);
  });
  it("canTag is false when the batch would exceed quota", () => {
    const used = recordUsage(fresh, 95, jan);
    expect(canTag(used, 100, jan, 10)).toBe(false);
    expect(canTag(used, 100, jan, 5)).toBe(true);
  });
});
