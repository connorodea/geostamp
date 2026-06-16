import { describe, it, expect, vi } from "vitest";
import { GumroadLicenseVerifier } from "../index";

function fakeFetch(json: unknown, ok = true) {
  return vi.fn(async () => ({ ok, json: async () => json })) as unknown as typeof fetch;
}

describe("GumroadLicenseVerifier", () => {
  it("posts product_id + license_key and returns a License", async () => {
    const fetchMock = fakeFetch({
      success: true,
      uses: 1,
      purchase: { email: "b@x.com", product_id: "abc123", variants: "(Pro)" },
    });
    const v = new GumroadLicenseVerifier("abc123", fetchMock);
    const lic = await v.verify("KEY-9");
    expect(lic?.tier).toBe("pro");
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = (fetchMock as any).mock.calls[0];
    expect(url).toContain("/v2/licenses/verify");
    expect(String((init as RequestInit).body)).toContain("KEY-9");
  });

  it("returns null on an unsuccessful verify", async () => {
    const v = new GumroadLicenseVerifier("abc123", fakeFetch({ success: false, uses: 0 }));
    expect(await v.verify("BAD")).toBeNull();
  });
});
