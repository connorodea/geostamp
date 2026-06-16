export type LicenseTier = "starter" | "pro" | "agency";

export interface License {
  key: string;
  tier: LicenseTier;
  monthlyQuota: number;
  seats: number;
  email?: string;
  /** total verifications Gumroad has counted for this key */
  uses: number;
  refunded: boolean;
  disputed: boolean;
  productId: string;
}

/** Shape of the relevant fields from Gumroad's verify response. */
export interface GumroadVerifyResponse {
  success: boolean;
  uses: number;
  purchase?: {
    email?: string;
    product_id?: string;
    variants?: string;
    refunded?: boolean;
    chargebacked?: boolean;
    disputed?: boolean;
    subscription_cancelled_at?: string | null;
    subscription_ended_at?: string | null;
  };
  message?: string;
}
