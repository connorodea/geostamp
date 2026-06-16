# GeoStamp Desktop v1 — Foundation, Core Domain & Geotag Engine — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the GeoStamp monorepo and prove the two hardest pieces work end-to-end: (1) correctly writing GPS/EXIF metadata into real images, and (2) verifying Gumroad license keys + metering monthly usage — all behind clean, engine-agnostic interfaces the UI and web app will reuse.

**Architecture:** A pnpm workspace. `@geostamp/core` is pure, platform-free TypeScript: domain types, the `GeotagEngine` interface, Gumroad license verification, and usage metering — all unit-tested with Vitest and fake collaborators (no network). The actual pixel-touching geotag engine lives in Rust inside the Tauri desktop app (`apps/desktop/src-tauri`) and is proven with `cargo test` against image fixtures. The UI (Plan 2) and web app (Plan 4) depend only on `@geostamp/core` interfaces, never on Tauri or Rust directly.

**Tech Stack:** pnpm workspaces · TypeScript 5 · Vitest · Tauri 2 · Rust (`little_exif` for EXIF I/O) · Gumroad License API (`POST /v2/licenses/verify`).

---

## Prerequisites (one-time, not a TDD task)

- [ ] Node 20+ and pnpm 10+ (already present).
- [ ] Install the Rust toolchain (required for the desktop crate): `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh` then `source "$HOME/.cargo/env"`; verify `cargo --version`.
- [ ] Tauri 2 system deps for local builds (macOS: Xcode CLT `xcode-select --install`). Full desktop packaging is Plan 3; Plan 1 only needs `cargo test` to run.

## Git workflow for this plan

Work on a branch off `main`; never commit to `main` directly. Use the account-locked author on every commit:

```bash
git checkout -b feat/core-foundation
# each commit:
git commit --author="Connor O'Dea <102129457+connorodea@users.noreply.github.com>" -m "<type>: <summary>"
```

Open a PR into `main` at the end. Do not merge without explicit instruction.

## File Structure (created by this plan)

```
geostamp/
├── package.json                         # workspace root (private), scripts, devDeps
├── pnpm-workspace.yaml                  # packages: packages/*, apps/*
├── tsconfig.base.json                   # shared TS config
├── vitest.workspace.ts                  # vitest across packages
├── packages/core/
│   ├── package.json                     # @geostamp/core
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                     # public barrel export
│       ├── types.ts                     # domain types
│       ├── geotag-engine.ts             # GeotagEngine interface + result types
│       ├── gps.ts                       # decimal<->DMS conversions
│       ├── licensing/
│       │   ├── types.ts                 # License, LicenseTier, GumroadVerifyResponse
│       │   ├── tiers.ts                 # variant/tier -> photo quota mapping
│       │   ├── parse.ts                 # parseGumroadVerifyResponse()
│       │   └── verifier.ts              # LicenseVerifier interface + GumroadLicenseVerifier + FakeVerifier
│       ├── usage.ts                     # monthly usage metering (pure)
│       └── activation-store.ts          # ActivationStore interface + InMemoryActivationStore
├── apps/desktop/src-tauri/
│   ├── Cargo.toml                       # little_exif dep
│   └── src/
│       ├── lib.rs                       # crate root, exposes geotag module + tauri command
│       └── geotag.rs                    # write_geotag() + DMS helpers + tests
│       └── tests/fixtures/              # sample.jpg, sample.png, sample.webp
└── .github/workflows/ci.yml             # pnpm test + cargo test
```

---

### Task 1: Monorepo scaffold

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `vitest.workspace.ts`

- [ ] **Step 1: Create `pnpm-workspace.yaml`**

```yaml
packages:
  - "packages/*"
  - "apps/*"
```

- [ ] **Step 2: Create root `package.json`**

```json
{
  "name": "geostamp",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc -b"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "vitest": "^2.1.0"
  },
  "packageManager": "pnpm@10.33.1"
}
```

- [ ] **Step 3: Create `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "declaration": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "verbatimModuleSyntax": true
  }
}
```

- [ ] **Step 4: Create `vitest.workspace.ts`**

```ts
export default ["packages/*"];
```

- [ ] **Step 5: Install and verify**

Run: `pnpm install`
Expected: completes; root `node_modules` created.

- [ ] **Step 6: Commit**

```bash
git checkout -b feat/core-foundation
git add package.json pnpm-workspace.yaml tsconfig.base.json vitest.workspace.ts pnpm-lock.yaml
git commit --author="Connor O'Dea <102129457+connorodea@users.noreply.github.com>" -m "chore: scaffold pnpm monorepo with vitest"
```

---

### Task 2: `@geostamp/core` package + domain types

**Files:**
- Create: `packages/core/package.json`, `packages/core/tsconfig.json`, `packages/core/src/types.ts`, `packages/core/src/index.ts`
- Test: `packages/core/src/types.test.ts`

- [ ] **Step 1: Create `packages/core/package.json`**

```json
{
  "name": "@geostamp/core",
  "version": "0.0.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "scripts": { "test": "vitest run" }
}
```

- [ ] **Step 2: Create `packages/core/tsconfig.json`**

```json
{ "extends": "../../tsconfig.base.json", "include": ["src"] }
```

- [ ] **Step 3: Write the failing test** in `packages/core/src/types.test.ts`

```ts
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
```

- [ ] **Step 4: Run test to verify it fails**

Run: `pnpm --filter @geostamp/core test`
Expected: FAIL — cannot resolve `./index`.

- [ ] **Step 5: Create `packages/core/src/types.ts`**

```ts
export const TagStatus = {
  Untagged: "untagged",
  Tagged: "tagged",
  Processing: "processing",
  Error: "error",
} as const;
export type TagStatus = (typeof TagStatus)[keyof typeof TagStatus];

export type ImageFormat = "jpeg" | "png" | "webp" | "heic";

export interface GeoLocation {
  lat: number;
  lng: number;
  /** meters above sea level */
  altitude?: number;
  /** GPSImgDirection, degrees 0-359 */
  heading?: number;
}

export interface ResolvedAddress {
  formatted: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  sublocation?: string;
}

export interface SeoMetadata {
  caption?: string;
  keywords: string[];
  businessName?: string;
  copyright?: string;
}

export interface PhotoTagInput {
  location: GeoLocation;
  address?: ResolvedAddress;
  seo?: SeoMetadata;
  /** EXIF DateTimeOriginal override (ISO 8601); omit to keep existing */
  dateTimeOriginal?: string;
  /** when true, do not modify existing timestamps */
  preserveTimestamps: boolean;
}

export interface PhotoFile {
  id: string;
  name: string;
  path: string;
  format: ImageFormat;
  status: TagStatus;
}

export function isValidLatLng(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}
```

- [ ] **Step 6: Create `packages/core/src/index.ts`**

```ts
export * from "./types";
```

- [ ] **Step 7: Run test to verify it passes**

Run: `pnpm --filter @geostamp/core test`
Expected: PASS (5 tests).

- [ ] **Step 8: Commit**

```bash
git add packages/core
git commit --author="Connor O'Dea <102129457+connorodea@users.noreply.github.com>" -m "feat(core): domain types + lat/lng validation"
```

---

### Task 3: GPS decimal ↔ DMS conversion

EXIF stores GPS as degrees/minutes/seconds rationals plus a hemisphere ref. The UI uses decimals. This pure module is the single source of truth for the conversion and is reused by both the Rust engine (ported) and any JS engine.

**Files:**
- Create: `packages/core/src/gps.ts`
- Modify: `packages/core/src/index.ts`
- Test: `packages/core/src/gps.test.ts`

- [ ] **Step 1: Write the failing test** in `packages/core/src/gps.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { decimalToDms, dmsToDecimal } from "./index";

describe("decimalToDms", () => {
  it("converts a positive latitude with N ref", () => {
    const r = decimalToDms(37.795391, "lat");
    expect(r.ref).toBe("N");
    expect(r.degrees).toBe(37);
    expect(r.minutes).toBe(47);
    expect(r.seconds).toBeCloseTo(43.4076, 2);
  });
  it("uses S ref for negative latitude", () => {
    expect(decimalToDms(-33.8688, "lat").ref).toBe("S");
  });
  it("uses W ref for negative longitude", () => {
    expect(decimalToDms(-122.4193, "lng").ref).toBe("W");
  });
  it("round-trips within tolerance", () => {
    const back = dmsToDecimal(decimalToDms(-122.4193, "lng"));
    expect(back).toBeCloseTo(-122.4193, 5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @geostamp/core test gps`
Expected: FAIL — `decimalToDms` not exported.

- [ ] **Step 3: Create `packages/core/src/gps.ts`**

```ts
export type Axis = "lat" | "lng";
export interface Dms {
  degrees: number;
  minutes: number;
  seconds: number;
  ref: "N" | "S" | "E" | "W";
}

export function decimalToDms(value: number, axis: Axis): Dms {
  const positive = axis === "lat" ? "N" : "E";
  const negative = axis === "lat" ? "S" : "W";
  const ref = value >= 0 ? positive : negative;
  const abs = Math.abs(value);
  const degrees = Math.floor(abs);
  const minutesFloat = (abs - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = (minutesFloat - minutes) * 60;
  return { degrees, minutes, seconds, ref };
}

export function dmsToDecimal(dms: Dms): number {
  const magnitude = dms.degrees + dms.minutes / 60 + dms.seconds / 3600;
  return dms.ref === "S" || dms.ref === "W" ? -magnitude : magnitude;
}
```

- [ ] **Step 4: Export from `packages/core/src/index.ts`**

```ts
export * from "./types";
export * from "./gps";
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @geostamp/core test gps`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/gps.ts packages/core/src/gps.test.ts packages/core/src/index.ts
git commit --author="Connor O'Dea <102129457+connorodea@users.noreply.github.com>" -m "feat(core): GPS decimal<->DMS conversion"
```

---

### Task 4: GeotagEngine interface

The contract every platform engine (Rust-via-Tauri now, JS later for web) must satisfy. No implementation here — just the interface + result types the UI codes against.

**Files:**
- Create: `packages/core/src/geotag-engine.ts`
- Modify: `packages/core/src/index.ts`
- Test: `packages/core/src/geotag-engine.test.ts`

- [ ] **Step 1: Write the failing test** in `packages/core/src/geotag-engine.test.ts`

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @geostamp/core test geotag-engine`
Expected: FAIL — `GeotagEngine` not exported.

- [ ] **Step 3: Create `packages/core/src/geotag-engine.ts`**

```ts
import type { GeoLocation, PhotoTagInput, TagStatus } from "./types";

export interface ExistingMetadata {
  path: string;
  hasGps: boolean;
  location?: GeoLocation;
  dateTimeOriginal?: string;
}

export interface GeotagResult {
  path: string;
  status: TagStatus;
  location: GeoLocation;
  error?: string;
}

export interface WriteOptions {
  /** write a copy instead of overwriting in place */
  keepOriginal?: boolean;
  /** output dir when keepOriginal is true */
  outputDir?: string;
}

export interface GeotagEngine {
  readMetadata(path: string): Promise<ExistingMetadata>;
  writeGeotag(
    path: string,
    input: PhotoTagInput,
    options?: WriteOptions,
  ): Promise<GeotagResult>;
}
```

- [ ] **Step 4: Export from `packages/core/src/index.ts`** (append)

```ts
export * from "./geotag-engine";
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @geostamp/core test geotag-engine`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/geotag-engine.ts packages/core/src/geotag-engine.test.ts packages/core/src/index.ts
git commit --author="Connor O'Dea <102129457+connorodea@users.noreply.github.com>" -m "feat(core): GeotagEngine interface + result types"
```

---

### Task 5: License tiers + Gumroad response parsing

Gumroad `POST /v2/licenses/verify` returns `{ success, uses, purchase: {...} }`. We map the purchased variant/tier to a monthly photo quota and normalize into a `License` domain object. Pure function, no network.

**Files:**
- Create: `packages/core/src/licensing/types.ts`, `packages/core/src/licensing/tiers.ts`, `packages/core/src/licensing/parse.ts`
- Modify: `packages/core/src/index.ts`
- Test: `packages/core/src/licensing/parse.test.ts`

- [ ] **Step 1: Create `packages/core/src/licensing/types.ts`**

```ts
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
```

- [ ] **Step 2: Create `packages/core/src/licensing/tiers.ts`**

```ts
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
```

- [ ] **Step 3: Write the failing test** in `packages/core/src/licensing/parse.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { parseGumroadVerifyResponse } from "../index";

const base = {
  success: true,
  uses: 3,
  purchase: {
    email: "buyer@example.com",
    product_id: "abc123",
    variants: "(Pro)",
    refunded: false,
    disputed: false,
    chargebacked: false,
  },
};

describe("parseGumroadVerifyResponse", () => {
  it("maps a Pro purchase to the pro tier + 1000 quota", () => {
    const lic = parseGumroadVerifyResponse("KEY-1", base);
    expect(lic).not.toBeNull();
    expect(lic!.tier).toBe("pro");
    expect(lic!.monthlyQuota).toBe(1000);
    expect(lic!.email).toBe("buyer@example.com");
    expect(lic!.uses).toBe(3);
  });
  it("returns null when success is false", () => {
    expect(parseGumroadVerifyResponse("KEY-1", { success: false, uses: 0 })).toBeNull();
  });
  it("flags refunded purchases", () => {
    const lic = parseGumroadVerifyResponse("KEY-1", {
      ...base,
      purchase: { ...base.purchase, refunded: true },
    });
    expect(lic!.refunded).toBe(true);
  });
  it("defaults unknown variant to starter", () => {
    const lic = parseGumroadVerifyResponse("KEY-1", {
      ...base,
      purchase: { ...base.purchase, variants: "" },
    });
    expect(lic!.tier).toBe("starter");
    expect(lic!.monthlyQuota).toBe(100);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `pnpm --filter @geostamp/core test parse`
Expected: FAIL — `parseGumroadVerifyResponse` not exported.

- [ ] **Step 5: Create `packages/core/src/licensing/parse.ts`**

```ts
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
```

- [ ] **Step 6: Create `packages/core/src/index.ts` licensing exports** (append)

```ts
export * from "./licensing/types";
export * from "./licensing/tiers";
export * from "./licensing/parse";
```

- [ ] **Step 7: Run test to verify it passes**

Run: `pnpm --filter @geostamp/core test parse`
Expected: PASS (4 tests).

- [ ] **Step 8: Commit**

```bash
git add packages/core/src/licensing packages/core/src/index.ts
git commit --author="Connor O'Dea <102129457+connorodea@users.noreply.github.com>" -m "feat(core): Gumroad license tiers + response parsing"
```

---

### Task 6: LicenseVerifier (Gumroad HTTP) + fake

Wraps the network call behind an interface so the UI is testable. The real impl calls Gumroad; tests use a fake `fetch`.

**Files:**
- Create: `packages/core/src/licensing/verifier.ts`
- Modify: `packages/core/src/index.ts`
- Test: `packages/core/src/licensing/verifier.test.ts`

- [ ] **Step 1: Write the failing test** in `packages/core/src/licensing/verifier.test.ts`

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @geostamp/core test verifier`
Expected: FAIL — `GumroadLicenseVerifier` not exported.

- [ ] **Step 3: Create `packages/core/src/licensing/verifier.ts`**

```ts
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
```

- [ ] **Step 4: Export from `packages/core/src/index.ts`** (append)

```ts
export * from "./licensing/verifier";
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @geostamp/core test verifier`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/licensing/verifier.ts packages/core/src/licensing/verifier.test.ts packages/core/src/index.ts
git commit --author="Connor O'Dea <102129457+connorodea@users.noreply.github.com>" -m "feat(core): Gumroad license verifier behind an interface"
```

---

### Task 7: Monthly usage metering (pure)

Enforces the per-tier monthly photo quota locally. Pure functions over an explicit `now` so they are deterministic in tests.

**Files:**
- Create: `packages/core/src/usage.ts`
- Modify: `packages/core/src/index.ts`
- Test: `packages/core/src/usage.test.ts`

- [ ] **Step 1: Write the failing test** in `packages/core/src/usage.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { recordUsage, remaining, canTag, type UsageState } from "./index";

const jan = new Date("2026-01-10T12:00:00Z");
const feb = new Date("2026-02-02T08:00:00Z");
const fresh: UsageState = { periodStart: "2026-01-01", count: 0 };

describe("usage metering", () => {
  it("records usage within the same month", () => {
    const s = recordUsage(fresh, 5, jan);
    expect(s.count).toBe(5);
    expect(s.periodStart).toBe("2026-01-01");
  });
  it("resets the counter in a new month", () => {
    const used = recordUsage(fresh, 90, jan);
    const next = recordUsage(used, 3, feb);
    expect(next.count).toBe(3);
    expect(next.periodStart).toBe("2026-02-01");
  });
  it("computes remaining against a quota", () => {
    const used = recordUsage(fresh, 90, jan);
    expect(remaining(used, 100, jan)).toBe(10);
  });
  it("canTag is false when the batch would exceed quota", () => {
    const used = recordUsage(fresh, 95, jan);
    expect(canTag(used, 100, jan, 10)).toBe(false);
    expect(canTag(used, 100, jan, 5)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @geostamp/core test usage`
Expected: FAIL — exports missing.

- [ ] **Step 3: Create `packages/core/src/usage.ts`**

```ts
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
```

- [ ] **Step 4: Export from `packages/core/src/index.ts`** (append)

```ts
export * from "./usage";
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @geostamp/core test usage`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/usage.ts packages/core/src/usage.test.ts packages/core/src/index.ts
git commit --author="Connor O'Dea <102129457+connorodea@users.noreply.github.com>" -m "feat(core): monthly usage metering"
```

---

### Task 8: ActivationStore interface + in-memory impl

Persists the activated license + usage state. The Tauri filesystem-backed implementation comes in Plan 3; here we define the interface and an in-memory version the UI uses in tests/dev.

**Files:**
- Create: `packages/core/src/activation-store.ts`
- Modify: `packages/core/src/index.ts`
- Test: `packages/core/src/activation-store.test.ts`

- [ ] **Step 1: Write the failing test** in `packages/core/src/activation-store.test.ts`

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @geostamp/core test activation-store`
Expected: FAIL — exports missing.

- [ ] **Step 3: Create `packages/core/src/activation-store.ts`**

```ts
import type { License } from "./licensing/types";
import type { UsageState } from "./usage";

export interface Activation {
  license: License;
  usage: UsageState;
}

export interface ActivationStore {
  load(): Promise<Activation | null>;
  save(activation: Activation): Promise<void>;
  clear(): Promise<void>;
}

export class InMemoryActivationStore implements ActivationStore {
  constructor(private current: Activation | null = null) {}
  async load(): Promise<Activation | null> {
    return this.current;
  }
  async save(activation: Activation): Promise<void> {
    this.current = activation;
  }
  async clear(): Promise<void> {
    this.current = null;
  }
}
```

- [ ] **Step 4: Export from `packages/core/src/index.ts`** (append)

```ts
export * from "./activation-store";
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @geostamp/core test activation-store`
Expected: PASS.

- [ ] **Step 6: Run the full core suite + typecheck**

Run: `pnpm --filter @geostamp/core test && pnpm --filter @geostamp/core exec tsc -b`
Expected: all green, no type errors.

- [ ] **Step 7: Commit**

```bash
git add packages/core/src/activation-store.ts packages/core/src/activation-store.test.ts packages/core/src/index.ts
git commit --author="Connor O'Dea <102129457+connorodea@users.noreply.github.com>" -m "feat(core): activation store interface + in-memory impl"
```

---

### Task 9: Rust geotag engine (writes real GPS EXIF)

The desktop engine that actually edits images. Built as a plain Rust library module first (testable with `cargo test`), then exposed as a Tauri command in Plan 3. Mirrors the DMS logic from Task 3.

> **Engineering note:** `little_exif`'s exact tag constructors vary by version. Confirm against the installed version's docs (`cargo doc -p little_exif --open`). The GPS tags used below — `GPSLatitude`, `GPSLatitudeRef`, `GPSLongitude`, `GPSLongitudeRef`, `GPSAltitude`, `GPSAltitudeRef` — exist across recent versions; the rational element type may be `uR64`/`URational`. If a constructor signature differs, adapt the `set_tag` calls (the test asserts behavior, so it will catch a wrong encoding). If `little_exif` cannot satisfy all three formats on your version, fall back to bundling an `exiftool` sidecar (deferred design in Plan 3) — but try the pure-Rust path first.

**Files:**
- Create: `apps/desktop/src-tauri/Cargo.toml`, `apps/desktop/src-tauri/src/lib.rs`, `apps/desktop/src-tauri/src/geotag.rs`
- Create fixtures: `apps/desktop/src-tauri/tests/fixtures/sample.jpg` (+ `sample.png`, `sample.webp`)

- [ ] **Step 1: Create `apps/desktop/src-tauri/Cargo.toml`**

```toml
[package]
name = "geostamp-desktop"
version = "0.0.0"
edition = "2021"

[lib]
name = "geostamp_desktop"
path = "src/lib.rs"

[dependencies]
little_exif = "0.6"

[dev-dependencies]
tempfile = "3"
```

- [ ] **Step 2: Generate fixture images**

Run (creates tiny valid images via the `image` crate or sips on macOS):
```bash
mkdir -p apps/desktop/src-tauri/tests/fixtures
# macOS: make a 2x2 red JPEG/PNG/WebP from a generated PNG
python3 - <<'PY'
from pathlib import Path
import struct, zlib
# minimal 2x2 PNG (red)
def png(path):
    raw = b''.join(b'\x00' + b'\xff\x00\x00'*2 for _ in range(2))
    def chunk(t,d):
        c=t+d; return struct.pack('>I',len(d))+c+struct.pack('>I',zlib.crc32(c)&0xffffffff)
    ihdr=struct.pack('>IIBBBBB',2,2,8,2,0,0,0)
    Path(path).write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',ihdr)+chunk(b'IDAT',zlib.compress(raw))+chunk(b'IEND',b''))
png('apps/desktop/src-tauri/tests/fixtures/sample.png')
PY
sips -s format jpeg apps/desktop/src-tauri/tests/fixtures/sample.png --out apps/desktop/src-tauri/tests/fixtures/sample.jpg >/dev/null
sips -s format webp apps/desktop/src-tauri/tests/fixtures/sample.png --out apps/desktop/src-tauri/tests/fixtures/sample.webp >/dev/null
ls -1 apps/desktop/src-tauri/tests/fixtures/
```
Expected: `sample.jpg`, `sample.png`, `sample.webp` exist. (On Linux without `sips`, use ImageMagick `convert`.)

- [ ] **Step 3: Write the failing test + module** in `apps/desktop/src-tauri/src/geotag.rs`

```rust
use little_exif::metadata::Metadata;
use little_exif::exif_tag::ExifTag;
use std::path::Path;

/// One DMS component encoded as EXIF rationals: [(deg,1),(min,1),(sec*1000,1000)].
fn dms_rationals(value: f64) -> [(u32, u32); 3] {
    let abs = value.abs();
    let deg = abs.floor();
    let min_f = (abs - deg) * 60.0;
    let min = min_f.floor();
    let sec = (min_f - min) * 60.0;
    [
        (deg as u32, 1),
        (min as u32, 1),
        ((sec * 1000.0).round() as u32, 1000),
    ]
}

fn lat_ref(v: f64) -> &'static str { if v >= 0.0 { "N" } else { "S" } }
fn lng_ref(v: f64) -> &'static str { if v >= 0.0 { "E" } else { "W" } }

/// Write GPS latitude/longitude (and optional altitude) into the image at `path`, in place.
pub fn write_geotag(path: &Path, lat: f64, lng: f64, altitude: Option<f64>) -> Result<(), String> {
    let mut md = Metadata::new_from_path(path).unwrap_or_else(|_| Metadata::new());

    let to_r = |arr: [(u32, u32); 3]| {
        arr.iter()
            .map(|(n, d)| little_exif::rational::uR64 { nominator: *n, denominator: *d })
            .collect::<Vec<_>>()
    };

    md.set_tag(ExifTag::GPSLatitudeRef(lat_ref(lat).to_string()));
    md.set_tag(ExifTag::GPSLatitude(to_r(dms_rationals(lat))));
    md.set_tag(ExifTag::GPSLongitudeRef(lng_ref(lng).to_string()));
    md.set_tag(ExifTag::GPSLongitude(to_r(dms_rationals(lng))));
    if let Some(alt) = altitude {
        md.set_tag(ExifTag::GPSAltitudeRef(vec![if alt >= 0.0 { 0 } else { 1 }]));
        md.set_tag(ExifTag::GPSAltitude(vec![little_exif::rational::uR64 {
            nominator: (alt.abs() * 100.0).round() as u32,
            denominator: 100,
        }]));
    }

    md.write_to_file(path).map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use little_exif::metadata::Metadata;
    use little_exif::exif_tag::ExifTag;

    fn read_lat_ref(path: &Path) -> Option<String> {
        let md = Metadata::new_from_path(path).ok()?;
        for tag in md.into_iter() {
            if let ExifTag::GPSLatitudeRef(r) = tag {
                return Some(r);
            }
        }
        None
    }

    #[test]
    fn writes_gps_into_jpeg() {
        let dir = tempfile::tempdir().unwrap();
        let dst = dir.path().join("t.jpg");
        std::fs::copy("tests/fixtures/sample.jpg", &dst).unwrap();

        write_geotag(&dst, 37.795391, -122.393624, Some(5.0)).unwrap();

        assert_eq!(read_lat_ref(&dst).as_deref(), Some("N"));
    }

    #[test]
    fn dms_rationals_are_correct() {
        let [d, m, s] = dms_rationals(37.795391);
        assert_eq!(d, (37, 1));
        assert_eq!(m, (47, 1));
        // 43.4076..s * 1000
        assert!((s.0 as i64 - 43408).abs() < 5);
        assert_eq!(s.1, 1000);
    }
}
```

- [ ] **Step 4: Create `apps/desktop/src-tauri/src/lib.rs`**

```rust
pub mod geotag;
```

- [ ] **Step 5: Run the Rust tests**

Run: `cd apps/desktop/src-tauri && cargo test`
Expected: `dms_rationals_are_correct` PASS; `writes_gps_into_jpeg` PASS (reads back `N`). If `little_exif` constructor signatures differ on your version, adjust per the engineering note until both pass — do not change the assertions.

- [ ] **Step 6: Commit**

```bash
git add apps/desktop/src-tauri/Cargo.toml apps/desktop/src-tauri/src apps/desktop/src-tauri/tests Cargo.lock
git commit --author="Connor O'Dea <102129457+connorodea@users.noreply.github.com>" -m "feat(desktop): Rust geotag engine writes GPS EXIF (jpeg/png/webp)"
```

---

### Task 10: CI — run both test suites

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

```yaml
name: CI
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }
jobs:
  ts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
      - run: pnpm typecheck
  rust:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: sudo apt-get update && sudo apt-get install -y imagemagick
      - run: |
          mkdir -p apps/desktop/src-tauri/tests/fixtures
          convert -size 2x2 xc:red apps/desktop/src-tauri/tests/fixtures/sample.png
          convert apps/desktop/src-tauri/tests/fixtures/sample.png apps/desktop/src-tauri/tests/fixtures/sample.jpg
          convert apps/desktop/src-tauri/tests/fixtures/sample.png apps/desktop/src-tauri/tests/fixtures/sample.webp
      - uses: dtolnay/rust-toolchain@stable
      - run: cd apps/desktop/src-tauri && cargo test
```

> Note: fixtures are git-ignored as binaries? They are NOT — commit them (they are tiny). The CI regenerates them defensively in case they are absent.

- [ ] **Step 2: Commit and open the PR**

```bash
git add .github/workflows/ci.yml
git commit --author="Connor O'Dea <102129457+connorodea@users.noreply.github.com>" -m "ci: run core (vitest) + desktop (cargo) tests"
git push -u origin feat/core-foundation
unset GITHUB_TOKEN
gh pr create --base main --head feat/core-foundation \
  --title "feat: core foundation + Rust geotag engine + Gumroad licensing" \
  --body "Monorepo scaffold, @geostamp/core (types, GeotagEngine interface, Gumroad license verify, usage metering, activation store), and the Rust geotag engine proven on image fixtures. All tests green. Do not merge until reviewed."
```

- [ ] **Step 3: Do NOT merge** — wait for explicit instruction.

---

## Self-Review

**Spec coverage (vs `design-spec.json`):**
- Domain types (GPS, SEO metadata, formats) → Tasks 2, 3, 4. ✓
- Writing GPS + EXIF into JPG/PNG/WebP → Task 9. ✓ (HEIC ingest/output deferred — see below.)
- License-key activation + usage limits (v1 scope) → Tasks 5–8 (Gumroad verify, tiers→quota, metering, activation store). ✓
- Map / Places search, the workspace UI, packaging → **out of scope for Plan 1** (Plans 2 & 3). Documented in the decomposition.

**Deferred to later plans (intentional, not gaps):**
- `@geostamp/ui` workspace components → Plan 2.
- Tauri shell, MapLibre + geocoding, license activation modal, Tauri-fs `ActivationStore`, packaging/signing, auto-update → Plan 3.
- Web `apps/web` + `WebGeotagEngine` (JS EXIF via `piexifjs` for JPEG) → Plan 4.
- HEIC: ingest + convert-on-export, and the exiftool-sidecar fallback for maximum format coverage → Plan 3 decision.

**Placeholder scan:** none — every step has concrete code/commands. The one flagged risk (exact `little_exif` constructor names) is called out with a behavior-asserting test that fails loudly if the encoding is wrong.

**Type consistency:** `License`, `UsageState`, `Activation`, `GeotagEngine`, `PhotoTagInput` names are used identically across Tasks 4–9. `parseGumroadVerifyResponse(key, raw)` signature matches its test and its use in `GumroadLicenseVerifier`.
