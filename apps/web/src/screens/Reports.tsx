import type { CSSProperties } from "react";
import { color, font, shadow } from "../theme";

type ReportRow = {
  name: string;
  coord: string;
  address: string;
  thumb: string;
};

const REPORT_ROWS: ReportRow[] = [
  { name: "storefront_01.jpg",  coord: "37.7954, -122.3936", address: "1 Ferry Building, SF 94111",   thumb: "linear-gradient(135deg,#caa97e,#7c5a39)" },
  { name: "patio_view.webp",    coord: "37.7955, -122.3937", address: "1 Ferry Building, SF 94111",   thumb: "linear-gradient(135deg,#8fb3a4,#42685c)" },
  { name: "interior_2.jpg",     coord: "37.7953, -122.3935", address: "1 Ferry Building, SF 94111",   thumb: "linear-gradient(135deg,#c8b79b,#6f5e44)" },
  { name: "exterior_w.png",     coord: "37.7956, -122.3938", address: "Ferry Bldg Marketplace, SF",   thumb: "linear-gradient(135deg,#a9b6c2,#5a6b7a)" },
  { name: "staff_team.jpg",     coord: "37.7952, -122.3934", address: "Embarcadero, San Francisco",   thumb: "linear-gradient(135deg,#d2a6a0,#7a4f49)" },
  { name: "signage.heic",       coord: "37.7957, -122.3939", address: "1 Ferry Building, SF 94111",   thumb: "linear-gradient(135deg,#b9a7c4,#5f4d6b)" },
];

const TODAY_STR = "May 14, 2026";
const PRODUCT_NAME = "GeoStamp";

const labelText: CSSProperties = { fontSize: 11, fontWeight: 500, color: color.muted };

export function Reports() {
  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", background: color.paper }}>
      <div style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding: "28px 28px 64px",
        display: "grid",
        gridTemplateColumns: "300px 1fr",
        gap: 24,
        alignItems: "start",
      }}>

        {/* ============ LEFT: BUILDER CARD ============ */}
        <div style={{
          background: color.surface,
          border: `1px solid ${color.border}`,
          borderRadius: 16,
          padding: 20,
          position: "sticky",
          top: 20,
        }}>
          <div style={{
            fontFamily: font.display,
            fontWeight: 600,
            fontSize: 16,
            marginBottom: 4,
            color: color.ink,
          }}>
            Build a geo report
          </div>
          <p style={{ fontSize: 12.5, color: color.muted, margin: "0 0 18px" }}>
            Client-ready proof that every photo is tagged at the right place.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Batch select */}
            <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={labelText}>Batch</span>
              <div style={{
                height: 38,
                border: `1px solid ${color.border}`,
                borderRadius: 8,
                padding: "0 11px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 13,
                color: color.ink,
                background: color.surface,
                cursor: "pointer",
              }}>
                Olmsted &amp; Vine — May 14
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </label>

            {/* Report title */}
            <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={labelText}>Report title</span>
              <input
                defaultValue="Geotag verification — Olmsted & Vine"
                style={{
                  height: 38,
                  border: `1px solid ${color.border}`,
                  borderRadius: 8,
                  padding: "0 11px",
                  fontSize: 13,
                  color: color.ink,
                  outline: "none",
                }}
              />
            </label>

            {/* Client name */}
            <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={labelText}>Client name</span>
              <input
                defaultValue="Olmsted & Vine"
                style={{
                  height: 38,
                  border: `1px solid ${color.border}`,
                  borderRadius: 8,
                  padding: "0 11px",
                  fontSize: 13,
                  color: color.ink,
                  outline: "none",
                }}
              />
            </label>

            {/* Logo drop — white-label */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={labelText}>
                Logo{" "}
                <span style={{ color: color.teal, fontWeight: 600 }}>· white-label</span>
              </span>
              <div style={{
                height: 60,
                border: `1.5px dashed ${color.dashed}`,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                color: color.muted,
                fontSize: 12.5,
                background: color.paper,
                cursor: "pointer",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color.muted} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 16V4M7 9l5-5 5 5" />
                  <path d="M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
                </svg>
                Drop logo
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: color.surfaceMuted, margin: "18px 0" }} />

          {/* Export PDF */}
          <button style={{
            width: "100%",
            height: 42,
            borderRadius: 10,
            border: "none",
            background: color.accent,
            color: "#fff",
            fontSize: 13.5,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginBottom: 8,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
              <path d="M14 2v6h6" />
            </svg>
            Export PDF
          </button>

          {/* Copy shareable link */}
          <button style={{
            width: "100%",
            height: 42,
            borderRadius: 10,
            border: `1px solid ${color.border}`,
            background: color.surface,
            color: color.ink,
            fontSize: 13.5,
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
              <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
            </svg>
            Copy shareable link
          </button>
        </div>

        {/* ============ RIGHT: PREVIEW CARD ============ */}
        <div style={{
          background: color.surface,
          border: `1px solid ${color.border}`,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 8px 30px rgba(22,33,43,0.08)",
        }}>
          {/* Header */}
          <div style={{
            padding: "22px 26px",
            borderBottom: `1px solid ${color.borderSoft}`,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}>
            <div>
              <div style={{
                fontFamily: font.display,
                fontWeight: 600,
                fontSize: 20,
                lineHeight: 1.25,
                letterSpacing: "-0.01em",
                color: color.ink,
              }}>
                Geotag verification — Olmsted &amp; Vine
              </div>
              <div style={{ fontSize: 12.5, color: color.muted, marginTop: 6 }}>
                Generated {TODAY_STR} · 6 photos · 100% tagged
              </div>
            </div>
            {/* GeoStamp logo lockup */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: color.ink,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <span style={{ fontFamily: font.display, fontWeight: 600, fontSize: 14, color: color.ink }}>
                {PRODUCT_NAME}
              </span>
            </div>
          </div>

          {/* Map strip */}
          <div style={{ position: "relative", height: 240, background: "#EFEADD", borderBottom: `1px solid ${color.borderSoft}` }}>
            {/* Inline SVG map */}
            <svg width="100%" height="100%" viewBox="0 0 900 240" preserveAspectRatio="xMidYMid slice">
              <rect width="900" height="240" fill="#EFEADD" />
              <path d="M700 -10 C 690 80, 760 140, 740 250 L 920 250 L 920 -10 Z" fill="#CFE3DF" opacity="0.85" />
              <g stroke="#FFFFFF" strokeWidth="9" fill="none">
                <path d="M-10 110 H 920" />
                <path d="M300 -10 V 250" />
                <path d="M-10 190 H 700" />
                <path d="M520 -10 V 250" />
              </g>
              <g stroke="#E3DCCD" strokeWidth="3" fill="none">
                <path d="M150 -10 V 250" />
                <path d="M-10 60 H 700" />
              </g>
            </svg>

            {/* Pin 1 — large, primary */}
            <div style={{ position: "absolute", left: "34%", top: "52%", transform: "translate(-50%,-100%)" }}>
              <div style={{
                width: 22,
                height: 22,
                borderRadius: "999px 999px 999px 2px",
                background: color.accent,
                transform: "rotate(45deg)",
                boxShadow: shadow.pin,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <div style={{ width: 8, height: 8, borderRadius: 999, background: "#fff" }} />
              </div>
            </div>

            {/* Pin 2 — small */}
            <div style={{ position: "absolute", left: "38%", top: "46%", transform: "translate(-50%,-100%)" }}>
              <div style={{
                width: 18,
                height: 18,
                borderRadius: "999px 999px 999px 2px",
                background: color.accent,
                transform: "rotate(45deg)",
                opacity: 0.85,
                boxShadow: shadow.pin,
              }} />
            </div>

            {/* Pin 3 — small */}
            <div style={{ position: "absolute", left: "30%", top: "58%", transform: "translate(-50%,-100%)" }}>
              <div style={{
                width: 18,
                height: 18,
                borderRadius: "999px 999px 999px 2px",
                background: color.accent,
                transform: "rotate(45deg)",
                opacity: 0.85,
                boxShadow: shadow.pin,
              }} />
            </div>

            {/* Accuracy badge */}
            <div style={{
              position: "absolute",
              right: 14,
              top: 14,
              background: "rgba(46,125,82,0.95)",
              color: "#fff",
              borderRadius: 8,
              padding: "6px 11px",
              fontSize: 12,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              All 6 within 8m accuracy
            </div>
          </div>

          {/* Table */}
          <div>
            {/* Header row */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "44px 1.4fr 1.3fr 1.6fr 1fr",
              padding: "11px 26px",
              background: color.paper,
              borderBottom: `1px solid ${color.border}`,
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: color.muted,
            }}>
              <span />
              <span>File</span>
              <span>Coordinates</span>
              <span>Address</span>
              <span>Status</span>
            </div>

            {/* Data rows */}
            {REPORT_ROWS.map((r) => (
              <div
                key={r.name}
                style={{
                  display: "grid",
                  gridTemplateColumns: "44px 1.4fr 1.3fr 1.6fr 1fr",
                  alignItems: "center",
                  padding: "10px 26px",
                  borderBottom: `1px solid ${color.borderSoft}`,
                  fontSize: 12.5,
                }}
              >
                {/* Thumbnail */}
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 5,
                  background: r.thumb,
                  border: `1px solid ${color.border}`,
                  flex: "none",
                }} />

                {/* Filename */}
                <span style={{
                  fontFamily: font.mono,
                  fontSize: 11.5,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  color: color.ink,
                }}>
                  {r.name}
                </span>

                {/* Coordinates */}
                <span style={{
                  fontFamily: font.mono,
                  fontSize: 11,
                  color: color.muted,
                }}>
                  {r.coord}
                </span>

                {/* Address */}
                <span style={{ color: color.ink }}>
                  {r.address}
                </span>

                {/* Status pill */}
                <span>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    height: 21,
                    padding: "0 9px",
                    borderRadius: 999,
                    background: "rgba(46,125,82,0.12)",
                    border: "1px solid rgba(46,125,82,0.22)",
                    color: color.success,
                    fontSize: 11,
                    fontWeight: 600,
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color.success} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    Tagged
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
