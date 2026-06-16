import { describe, it, expect } from "vitest";
import { InMemoryActivationStore, type Activation } from "./index";

const activation: Activation = {
  license: {
    key: "KEY-1", tier: "pro", monthlyQuota: 1000, seats: 1,
    uses: 1, refunded: false, disputed: false, productId: "abc123",
  },
  usage: { periodStart: "2026-06-01", count: 12 },
};

describe("InMemoryActivationStore", () => {
  it("returns null before activation", async () => {
    expect(await new InMemoryActivationStore().load()).toBeNull();
  });
  it("round-trips an activation", async () => {
    const store = new InMemoryActivationStore();
    await store.save(activation);
    const loaded = await store.load();
    expect(loaded?.license.key).toBe("KEY-1");
    expect(loaded?.usage.count).toBe(12);
  });
  it("clears on deactivate", async () => {
    const store = new InMemoryActivationStore(activation);
    await store.clear();
    expect(await store.load()).toBeNull();
  });
});
