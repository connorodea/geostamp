import type { License } from "./types";

/** A license unlocks the app only if it hasn't been refunded or disputed/charged back. */
export function isEntitled(lic: License): boolean {
  return !lic.refunded && !lic.disputed;
}

/** True when the license has been activated on more seats than it includes. */
export function seatsExceeded(lic: License): boolean {
  return lic.uses > lic.seats;
}
