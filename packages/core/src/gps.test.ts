import { describe, it, expect } from "vitest";
import { decimalToDms, dmsToDecimal } from "./index";

describe("decimalToDms", () => {
  it("converts a positive latitude with N ref", () => {
    const r = decimalToDms(37.795391, "lat");
    expect(r.ref).toBe("N");
    expect(r.degrees).toBe(37);
    expect(r.minutes).toBe(47);
    expect(r.seconds).toBeCloseTo(43.4076, 2);
  });
  it("uses S ref for negative latitude", () => {
    expect(decimalToDms(-33.8688, "lat").ref).toBe("S");
  });
  it("uses W ref for negative longitude", () => {
    expect(decimalToDms(-122.4193, "lng").ref).toBe("W");
  });
  it("round-trips within tolerance", () => {
    const back = dmsToDecimal(decimalToDms(-122.4193, "lng"));
    expect(back).toBeCloseTo(-122.4193, 5);
  });
});
