import type { GumroadVerifyResponse, License } from "./types";
import { parseGumroadVerifyResponse } from "./parse";

const GUMROAD_VERIFY_URL = "https://api.gumroad.com/v2/licenses/verify";

export interface LicenseVerifier {
  verify(key: string, incrementUses?: boolean): Promise<License | null>;
}

export class GumroadLicenseVerifier implements LicenseVerifier {
  constructor(
    private readonly productId: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async verify(key: string, incrementUses = false): Promise<License | null> {
    const body = new URLSearchParams({
      product_id: this.productId,
      license_key: key,
      increment_uses_count: String(incrementUses),
    });
    const res = await this.fetchImpl(GUMROAD_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) return null;
    const json = (await res.json()) as GumroadVerifyResponse;
    return parseGumroadVerifyResponse(key, json);
  }
}

/** Test double: returns a preset license regardless of key. */
export class FakeLicenseVerifier implements LicenseVerifier {
  constructor(private readonly result: License | null) {}
  async verify(): Promise<License | null> {
    return this.result;
  }
}
