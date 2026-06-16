# GeoStamp

**Geotag your photos for Local SEO in seconds.**

GeoStamp is a fast, privacy-first photo geotagging tool. Drop in photos, pin a location
on the map, and it writes accurate GPS + Local-SEO metadata (EXIF/IPTC/XMP) into every
image — hundreds at a time. A modern competitor to GeoImgr Pro.

> Status: early development. Shipping the desktop app first (the downloadable "executable"),
> then the same UI as a web app. Distributed via [Gumroad](https://connorodea.gumroad.com).

## Why GeoStamp

- **Clean two-column workspace** — photos + metadata on the left, a large map on the right.
- **Local-SEO metadata, not just GPS** — keywords, caption, business name (NAP), city/state/country.
- **Bulk + per-photo locations** — apply one location to all, or map different addresses per photo (CSV).
- **Privacy-first** — images are processed locally; originals never leave your device.
- **All the formats** — JPG, PNG, WebP, plus HEIC ingest.
- **Geo reports** — verifiable map + EXIF table to prove photos are correctly tagged.

## Architecture

A pnpm monorepo with a shared React core, shipped as both a desktop app and a web app.

```
geostamp/
├── packages/
│   ├── core/     # @geostamp/core — domain types, GeotagEngine interface, licensing, usage metering
│   └── ui/       # @geostamp/ui   — the React workspace (engine-agnostic)
├── apps/
│   ├── desktop/  # @geostamp/desktop — Tauri shell + Rust geotag engine (ships first)
│   └── web/      # @geostamp/web     — browser build of the same UI (later)
└── docs/         # specs + implementation plans
```

- **Design spec:** [`design-spec.json`](./design-spec.json)
- **Implementation plans:** [`docs/superpowers/plans/`](./docs/superpowers/plans/)
- **Identity:** APIDistributed canonical — charcoal + orange-red, Archivo / Hanken Grotesk / JetBrains Mono.

## Licensing & distribution

Sold on Gumroad with Gumroad's built-in license keys. The app activates by verifying the
key against the Gumroad License API; the purchased tier sets the monthly photo quota.

## Development

Requirements: Node 20+, pnpm 10+, Rust + Cargo (for the desktop build).

```bash
pnpm install
pnpm test          # core + ui tests
pnpm --filter @geostamp/desktop tauri dev   # run the desktop app
```

## License

Proprietary — © Connor O'Dea. All rights reserved.
