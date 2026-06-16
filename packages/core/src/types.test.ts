import { describe, it, expect } from "vitest";
import { isValidLatLng, TagStatus } from "./index";

describe("isValidLatLng", () => {
  it("accepts in-range coordinates", () => {
    expect(isValidLatLng(37.7793, -122.4193)).toBe(true);
  });
  it("rejects out-of-range latitude", () => {
    expect(isValidLatLng(91, 0)).toBe(false);
  });
  it("rejects out-of-range longitude", () => {
    expect(isValidLatLng(0, 181)).toBe(false);
  });
  it("rejects NaN", () => {
    expect(isValidLatLng(NaN, 0)).toBe(false);
  });
  it("exposes tag statuses", () => {
    expect(TagStatus.Tagged).toBe("tagged");
  });
});
