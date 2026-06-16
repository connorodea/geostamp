import type { GumroadVerifyResponse, License } from "./types";
import { TIER_QUOTA, TIER_SEATS, tierFromVariant } from "./tiers";

export function parseGumroadVerifyResponse(
  key: string,
  raw: GumroadVerifyResponse,
): License | null {
  if (!raw.success || !raw.purchase) return null;
  const p = raw.purchase;
  const tier = tierFromVariant(p.variants);
  return {
    key,
    tier,
    monthlyQuota: TIER_QUOTA[tier],
    seats: TIER_SEATS[tier],
    email: p.email,
    uses: raw.uses ?? 0,
    refunded: Boolean(p.refunded),
    disputed: Boolean(p.disputed ?? p.chargebacked),
    productId: p.product_id ?? "",
  };
}
