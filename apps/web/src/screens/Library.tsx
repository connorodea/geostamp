import type { CSSProperties } from "react";
import { color, font, shadow } from "../theme";

type Photo = { name: string; coord: string; thumb: string };

type Batch = {
  title: string;
  count: number;
  date: string;
  address: string;
  photos: Photo[];
};

const BATCHES: Batch[] = [
  {
    title: "Olmsted & Vine — May 14",
    count: 6,
    date: "2026-05-14",
    address: "1 Ferry Building, San Francisco, CA 94111",
    photos: [
      { name: "storefront_01.jpg",  coord: "37.7954, -122.3936", thumb: "linear-gradient(135deg,#caa97e,#7c5a39)" },
      { name: "patio_view.webp",    coord: "37.7955, -122.3937", thumb: "linear-gradient(135deg,#8fb3a4,#42685c)" },
      { name: "interior_2.jpg",     coord: "37.7953, -122.3935", thumb: "linear-gradient(135deg,#c8b79b,#6f5e44)" },
      { name: "exterior_w.png",     coord: "37.7956, -122.3938", thumb: "linear-gradient(135deg,#a9b6c2,#5a6b7a)" },
      { name: "staff_team.jpg",     coord: "37.7952, -122.3934", thumb: "linear-gradient(135deg,#d2a6a0,#7a4f49)" },
      { name: "signage.heic",       coord: "37.7957, -122.3939", thumb: "linear-gradient(135deg,#b9a7c4,#5f4d6b)" },
    ],
  },
  {
    title: "Pier 39 Storefront — May 9",
    count: 6,
    date: "2026-05-09",
    address: "Pier 39, Beach St & The Embarcadero, San Francisco, CA 94133",
    photos: [
      { name: "entrance_main.jpg",  coord: "37.8087, -122.4098", thumb: "linear-gradient(135deg,#a8c8d8,#4a7a8a)" },
      { name: "bay_view_01.webp",   coord: "37.8088, -122.4099", thumb: "linear-gradient(135deg,#c2d4a0,#6a8450)" },
      { name: "retail_floor.jpg",   coord: "37.8086, -122.4097", thumb: "linear-gradient(135deg,#d8c4a8,#8a7460)" },
      { name: "signage_pier.png",   coord: "37.8089, -122.4100", thumb: "linear-gradient(135deg,#c4b8d0,#7060a0)" },
      { name: "crowd_shot.jpg",     coord: "37.8085, -122.4096", thumb: "linear-gradient(135deg,#e0b8a8,#906050)" },
      { name: "twilight_ext.heic",  coord: "37.8090, -122.4101", thumb: "linear-gradient(135deg,#b0c8e0,#506080)" },
    ],
  },
];

const thumbContainerStyle: CSSProperties = {
  position: "relative",
  height: 88,
};

export function Library() {
  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", background: color.paper }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 28px 64px" }}>

        {/* ===== Header ===== */}
        <div style={{
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
          gap: 16, marginBottom: 22,
        }}>
          <div>
            <h1 style={{
              fontFamily: font.display, fontWeight: 600, fontSize: 26,
              letterSpacing: "-0.02em", margin: "0 0 4px",
              color: color.ink,
            }}>
              Library
            </h1>
            <p style={{ fontSize: 13.5, color: color.muted, margin: 0 }}>
              Every batch you've stamped. Search, peek the EXIF, re-download anytime.
            </p>
          </div>
          <button style={{
            height: 38, padding: "0 15px", borderRadius: 9,
            border: `1px solid ${color.border}`, background: color.surface,
            color: color.ink, fontSize: 13, fontWeight: 500, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 7,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12M7 10l5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
            Re-download selected
          </button>
        </div>

        {/* ===== Filter row ===== */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          {/* Search box */}
          <div style={{
            flex: 1, display: "flex", alignItems: "center", gap: 9,
            height: 40, padding: "0 13px",
            background: color.surface, border: `1px solid ${color.border}`, borderRadius: 10,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color.muted} strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              placeholder="Search by filename or address"
              style={{
                flex: 1, border: "none", outline: "none", background: "transparent",
                fontSize: 13.5, color: color.ink,
              }}
            />
          </div>
          {/* Status filter */}
          <button style={{
            height: 40, padding: "0 14px", borderRadius: 10,
            border: `1px solid ${color.border}`, background: color.surface,
            color: color.ink, fontSize: 13, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 7,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M7 12h10M11 18h2" />
            </svg>
            Status
          </button>
          {/* Date filter */}
          <button style={{
            height: 40, padding: "0 14px", borderRadius: 10,
            border: `1px solid ${color.border}`, background: color.surface,
            color: color.ink, fontSize: 13, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 7,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            Date
          </button>
        </div>

        {/* ===== Batch groups ===== */}
        {BATCHES.map((batch) => (
          <div key={batch.title} style={{ marginBottom: 28 }}>
            {/* Batch header row */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <span style={{
                fontFamily: font.display, fontWeight: 600, fontSize: 16,
                color: color.ink,
              }}>
                {batch.title}
              </span>
              {/* Count pill */}
              <span style={{
                height: 22, padding: "0 9px", borderRadius: 999,
                background: color.surfaceMuted, border: `1px solid ${color.border}`,
                fontSize: 11.5, color: color.muted,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.5-3.5L9 20" />
                </svg>
                {batch.count}
              </span>
              <span style={{ fontFamily: font.mono, fontSize: 12, color: color.muted }}>
                {batch.date}
              </span>
              <span style={{ marginLeft: "auto", fontSize: 12.5, color: color.muted }}>
                {batch.address}
              </span>
            </div>

            {/* Photo grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: 12,
            }}>
              {batch.photos.map((ph) => (
                <div key={ph.name} style={{
                  background: color.surface,
                  border: `1px solid ${color.border}`,
                  borderRadius: 11,
                  overflow: "hidden",
                  boxShadow: shadow.card,
                }}>
                  {/* Thumbnail */}
                  <div style={{ ...thumbContainerStyle, background: ph.thumb }}>
                    {/* Accent pin badge */}
                    <div style={{
                      position: "absolute", left: 6, bottom: 6,
                      width: 18, height: 18, borderRadius: 999,
                      background: "rgba(255,90,60,0.95)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 2px 5px rgba(22,33,43,0.4)",
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="2.5" />
                      </svg>
                    </div>
                  </div>
                  {/* Card footer */}
                  <div style={{ padding: "7px 8px 9px" }}>
                    <div style={{
                      fontFamily: font.mono, fontSize: 10,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      color: color.ink,
                    }}>
                      {ph.name}
                    </div>
                    <div style={{
                      fontFamily: font.mono, fontSize: 9.5,
                      color: color.muted, marginTop: 3,
                    }}>
                      {ph.coord}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
