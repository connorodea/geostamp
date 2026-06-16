import { describe, it, expect } from "vitest";
import type { GeotagEngine } from "./index";
import { TagStatus, type PhotoTagInput } from "./index";

// A trivial fake proves the interface is implementable and shaped right.
class FakeEngine implements GeotagEngine {
  async readMetadata(path: string) {
    return { path, hasGps: false };
  }
  async writeGeotag(path: string, input: PhotoTagInput) {
    return { path, status: TagStatus.Tagged, location: input.location };
  }
}

describe("GeotagEngine contract", () => {
  it("writeGeotag returns a tagged result", async () => {
    const engine: GeotagEngine = new FakeEngine();
    const res = await engine.writeGeotag("/tmp/a.jpg", {
      location: { lat: 1, lng: 2 },
      preserveTimestamps: true,
    });
    expect(res.status).toBe(TagStatus.Tagged);
    expect(res.location.lat).toBe(1);
  });
});
