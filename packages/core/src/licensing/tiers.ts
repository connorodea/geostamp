import type { LicenseTier } from "./types";

export const TIER_QUOTA: Record<LicenseTier, number> = {
  starter: 100,
  pro: 1000,
  agency: 5000,
};

export const TIER_SEATS: Record<LicenseTier, number> = {
  starter: 1,
  pro: 1,
  agency: 5,
};

/** Map a Gumroad variant string (e.g. "(Pro)" or "Tier: Agency") to a tier. */
export function tierFromVariant(variant: string | undefined): LicenseTier {
  const v = (variant ?? "").toLowerCase();
  if (v.includes("agency")) return "agency";
  if (v.includes("pro")) return "pro";
  return "starter";
}
