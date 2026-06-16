export interface UsageState {
  /** ISO date (YYYY-MM-DD) of the first day of the current billing month */
  periodStart: string;
  count: number;
}

function monthStart(now: Date): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

export function rolloverIfNeeded(state: UsageState, now: Date): UsageState {
  const current = monthStart(now);
  return state.periodStart === current ? state : { periodStart: current, count: 0 };
}

export function recordUsage(state: UsageState, n: number, now: Date): UsageState {
  const s = rolloverIfNeeded(state, now);
  return { periodStart: s.periodStart, count: s.count + n };
}

export function remaining(state: UsageState, quota: number, now: Date): number {
  const s = rolloverIfNeeded(state, now);
  return Math.max(0, quota - s.count);
}

export function canTag(state: UsageState, quota: number, now: Date, n: number): boolean {
  return remaining(state, quota, now) >= n;
}
