import { useState } from "react";
import type { CSSProperties } from "react";
import { color, font, shadow } from "../theme";
import { TeardropPin } from "../components/icons";

type Status = "tagged" | "tagging" | "untagged" | "error";

const STATUS: Record<Status, { label: string; fg: string; bg: string; border: string }> = {
  tagged: { label: "Tagged", fg: color.success, bg: "rgba(46,125,82,0.10)", border: "rgba(46,125,82,0.22)" },
  tagging: { label: "Tagging…", fg: "#B06A12", bg: "rgba(232,150,40,0.12)", border: "rgba(232,150,40,0.28)" },
  untagged: { label: "Untagged", fg: color.muted, bg: color.surfaceMuted, border: color.border },
  error: { label: "No GPS", fg: color.danger, bg: "rgba(210,64,47,0.10)", border: "rgba(210,64,47,0.22)" },
};

type Photo = { name: string; status: Status; thumb: string; hasLocation: boolean };

const PHOTOS: Photo[] = [
  { name: "storefront_01.jpg", status: "tagged", thumb: "linear-gradient(135deg,#caa97e,#7c5a39)", hasLocation: true },
  { name: "patio_view.webp", status: "tagged", thumb: "linear-gradient(135deg,#8fb3a4,#42685c)", hasLocation: true },
  { name: "interior_2.jpg", status: "tagging", thumb: "linear-gradient(135deg,#c8b79b,#6f5e44)", hasLocation: true },
  { name: "exterior_w.png", status: "untagged", thumb: "linear-gradient(135deg,#a9b6c2,#5a6b7a)", hasLocation: false },
  { name: "staff_team.jpg", status: "untagged", thumb: "linear-gradient(135deg,#d2a6a0,#7a4f49)", hasLocation: false },
  { name: "signage.heic", status: "error", thumb: "linear-gradient(135deg,#b9a7c4,#5f4d6b)", hasLocation: false },
];

const KEYWORDS = ["san francisco", "ferry building", "embarcadero"];
const EXIF_ROWS = [
  { k: "Make", v: "Apple" },
  { k: "Model", v: "iPhone 15 Pro" },
  { k: "ISO", v: "64" },
  { k: "Exposure", v: "1/1200s" },
  { k: "Focal length", v: "24 mm" },
];

const inputStyle: CSSProperties = {
  height: 36, border: `1px solid ${color.border}`, borderRadius: 8, padding: "0 10px",
  fontSize: 13, color: color.ink,
};
const monoInput: CSSProperties = { ...inputStyle, fontFamily: font.mono, fontSize: 12.5 };
const labelText: CSSProperties = { fontSize: 11, fontWeight: 500, color: color.muted };
const fieldCol: CSSProperties = { display: "flex", flexDirection: "column", gap: 5 };

type Tab = "location" | "seo" | "exif";

export function Workspace() {
  const [tab, setTab] = useState<Tab>("location");
  const [selected, setSelected] = useState(0);
  const [checked, setChecked] = useState<Set<number>>(new Set([0, 1]));
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [preserve, setPreserve] = useState(true);

  const toggleCheck = (i: number) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const sel = PHOTOS[selected] ?? PHOTOS[0]!;

  return (
    <main style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
      {/* ============ LEFT: PHOTO TRAY ============ */}
      <aside style={{
        width: 312, flex: "none", background: color.surface,
        borderRight: `1px solid ${color.border}`, display: "flex", flexDirection: "column", minHeight: 0,
      }}>
        <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${color.borderSoft}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontFamily: font.display, fontWeight: 600, fontSize: 15 }}>Photos</span>
              <span style={{ fontFamily: font.mono, fontSize: 12, color: color.muted }}>{PHOTOS.length}</span>
            </div>
            <button style={{ background: "none", border: "none", color: color.muted, fontSize: 12, cursor: "pointer", padding: 4 }}>Clear</button>
          </div>
          <div style={{
            border: `1.5px dashed ${color.dashed}`, borderRadius: 12, background: color.paper, padding: 14,
            display: "flex", alignItems: "center", gap: 11, cursor: "pointer", position: "relative", overflow: "hidden",
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9, background: color.surface, border: `1px solid ${color.border}`,
              display: "flex", alignItems: "center", justifyContent: "center", flex: "none",
            }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color.accent} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 16V4M7 9l5-5 5 5" /><path d="M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
              </svg>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: color.ink }}>Drag photos here or browse</div>
              <div style={{ fontSize: 11, color: color.muted, marginTop: 2 }}>JPG · PNG · WebP · HEIC</div>
            </div>
          </div>
        </div>

        <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${color.borderSoft}` }}>
          <button style={{ flex: 1, height: 30, borderRadius: 7, border: `1px solid ${color.border}`, background: color.surface, color: color.ink, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>Select all</button>
          <button style={{ flex: 1, height: 30, borderRadius: 7, border: "none", background: color.ink, color: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>Apply to all</button>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "12px 16px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {PHOTOS.map((p, i) => {
              const st = STATUS[p.status];
              const isSel = i === selected;
              const isChecked = checked.has(i);
              return (
                <div key={p.name} onClick={() => setSelected(i)} style={{
                  border: `1px solid ${isSel ? color.accent : color.border}`,
                  borderRadius: 11, overflow: "hidden", cursor: "pointer", background: color.surface,
                  boxShadow: isSel ? `0 0 0 1px ${color.accent}` : "none",
                }}>
                  <div style={{ position: "relative", height: 78, background: p.thumb }}>
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(22,33,43,0.55))" }} />
                    <div
                      onClick={(e) => { e.stopPropagation(); toggleCheck(i); }}
                      style={{
                        position: "absolute", right: 6, top: 6, width: 18, height: 18, borderRadius: 5,
                        border: `1.5px solid ${isChecked ? color.accent : "rgba(255,255,255,0.8)"}`,
                        background: isChecked ? color.accent : "rgba(22,33,43,0.25)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {isChecked && (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                      )}
                    </div>
                    {p.hasLocation && (
                      <div style={{
                        position: "absolute", left: 6, bottom: 6, width: 18, height: 18, borderRadius: 999,
                        background: "rgba(255,90,60,0.95)", display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 2px 5px rgba(22,33,43,0.4)",
                      }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "7px 8px 8px" }}>
                    <div style={{ fontFamily: font.mono, fontSize: 10.5, color: color.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 5, marginTop: 5, height: 18, padding: "0 7px",
                      borderRadius: 999, fontSize: 9.5, fontWeight: 600, color: st.fg, background: st.bg, border: `1px solid ${st.border}`,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: 999, background: st.fg }} />{st.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button style={{
            marginTop: 14, width: "100%", height: 36, borderRadius: 9, border: `1px dashed ${color.dashedWarm}`,
            background: color.paper, color: color.ink, fontSize: 12.5, fontWeight: 500, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h2M8 17h2M14 13h2M14 17h2" /></svg>
            Bulk-assign by CSV
          </button>
        </div>
      </aside>

      {/* ============ CENTER: MAP ============ */}
      <section style={{ flex: 1, minWidth: 0, position: "relative", overflow: "hidden", background: "#EAE6DB" }}>
        <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0 }}>
          <rect width="800" height="600" fill="#EFEADD" />
          <g opacity="0.5">
            <path d="M-20 120 C 150 90, 300 160, 480 110 S 760 60, 840 120" fill="none" stroke="#16212B" strokeWidth="1" opacity="0.10" />
            <path d="M-20 180 C 150 150, 300 220, 480 170 S 760 120, 840 180" fill="none" stroke="#16212B" strokeWidth="1" opacity="0.08" />
            <path d="M-20 470 C 180 430, 320 510, 520 460 S 770 420, 840 470" fill="none" stroke="#16212B" strokeWidth="1" opacity="0.09" />
            <path d="M-20 520 C 180 480, 320 560, 520 510 S 770 470, 840 520" fill="none" stroke="#16212B" strokeWidth="1" opacity="0.07" />
          </g>
          <path d="M540 -20 C 520 120, 640 220, 600 360 C 575 470, 660 560, 640 640 L 860 640 L 860 -20 Z" fill="#CFE3DF" opacity="0.85" />
          <path d="M540 -20 C 520 120, 640 220, 600 360 C 575 470, 660 560, 640 640" fill="none" stroke="#0E7C7B" strokeWidth="2" opacity="0.25" />
          <rect x="70" y="320" width="150" height="120" rx="8" fill="#D5E3C8" opacity="0.8" />
          <path d="M70 380 h150 M145 320 v120" stroke="#B7CBA6" strokeWidth="2" opacity="0.6" fill="none" />
          <g stroke="#E3DCCD" strokeWidth="13" fill="none" strokeLinecap="round"><path d="M-20 240 H 820" /><path d="M-20 410 H 560" /><path d="M260 -20 V 620" /><path d="M450 -20 V 360" /><path d="M40 -20 L 380 360" /></g>
          <g stroke="#FFFFFF" strokeWidth="8" fill="none" strokeLinecap="round"><path d="M-20 240 H 820" /><path d="M-20 410 H 560" /><path d="M260 -20 V 620" /><path d="M450 -20 V 360" /><path d="M40 -20 L 380 360" /></g>
          <g stroke="#FFFFFF" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.9"><path d="M120 -20 V 620" /><path d="M620 200 H 860" /><path d="M-20 520 H 560" /><path d="M340 240 V 620" /></g>
          <g fill="#E3DCCD" opacity="0.55"><rect x="290" y="60" width="60" height="50" rx="3" /><rect x="370" y="50" width="55" height="70" rx="3" /><rect x="290" y="270" width="50" height="50" rx="3" /><rect x="380" y="270" width="55" height="55" rx="3" /><rect x="150" y="160" width="70" height="50" rx="3" /><rect x="60" y="160" width="60" height="50" rx="3" /><rect x="290" y="440" width="55" height="60" rx="3" /><rect x="380" y="450" width="60" height="55" rx="3" /></g>
        </svg>

        {/* search */}
        <div style={{ position: "absolute", top: 16, left: 16, width: 380, maxWidth: "calc(100% - 120px)", zIndex: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, height: 44, padding: "0 14px", background: color.surface, border: `1px solid ${color.border}`, borderRadius: 11, boxShadow: shadow.panel }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color.muted} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 120)}
              placeholder="Search an address or place"
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, color: color.ink }}
            />
            <kbd style={{ fontFamily: font.mono, fontSize: 10, color: color.muted, background: color.surfaceMuted, padding: "2px 6px", borderRadius: 5 }}>⌘K</kbd>
          </div>
          {searchOpen && (
            <div style={{ marginTop: 6, background: color.surface, border: `1px solid ${color.border}`, borderRadius: 11, boxShadow: "0 8px 30px rgba(22,33,43,0.12)", overflow: "hidden" }}>
              {[
                { title: "1 Ferry Building", sub: "San Francisco, CA 94111" },
                { title: "Pier 39", sub: "Beach St & The Embarcadero, SF" },
                { title: "Ferry Plaza Farmers Market", sub: "1 Ferry Building, SF" },
                { title: "Embarcadero Center", sub: "4 Embarcadero Ctr, SF" },
              ].map((s) => (
                <button key={s.title} style={{ width: "100%", display: "flex", alignItems: "center", gap: 11, padding: "10px 14px", background: "none", border: "none", borderBottom: `1px solid ${color.borderSoft}`, cursor: "pointer", textAlign: "left" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color.accent} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: color.ink }}>{s.title}</div>
                    <div style={{ fontSize: 11.5, color: color.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* map controls */}
        <div style={{ position: "absolute", top: 16, right: 16, display: "flex", flexDirection: "column", gap: 8, zIndex: 20 }}>
          <div style={{ background: color.surface, border: `1px solid ${color.border}`, borderRadius: 10, boxShadow: shadow.control, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <button style={{ width: 38, height: 38, border: "none", background: "none", cursor: "pointer", color: color.ink, borderBottom: `1px solid ${color.borderSoft}` }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg></button>
            <button style={{ width: 38, height: 38, border: "none", background: "none", cursor: "pointer", color: color.ink }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M5 12h14" /></svg></button>
          </div>
          <button style={{ width: 38, height: 38, border: `1px solid ${color.border}`, background: color.surface, borderRadius: 10, boxShadow: shadow.control, cursor: "pointer", color: color.ink, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg></button>
          <div style={{ background: color.surface, border: `1px solid ${color.border}`, borderRadius: 10, boxShadow: shadow.control, overflow: "hidden", display: "flex" }}>
            <button style={{ padding: "0 11px", height: 34, border: "none", background: color.ink, color: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>Street</button>
            <button style={{ padding: "0 11px", height: 34, border: "none", background: "none", color: color.muted, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>Satellite</button>
          </div>
        </div>

        {/* the pin */}
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -100%)", zIndex: 15, cursor: "grab", animation: "pinDrop 0.5s cubic-bezier(0.22,1,0.36,1)" }}>
          <TeardropPin />
        </div>

        {/* coordinate readout */}
        <div style={{ position: "absolute", left: 16, bottom: 16, zIndex: 20, background: color.surface, border: `1px solid ${color.border}`, borderRadius: 10, boxShadow: shadow.control, padding: "9px 13px", display: "flex", alignItems: "center", gap: 14 }}>
          {[["Lat", "37.795391"], ["Lng", "-122.393624"]].map(([k, v], idx) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {idx > 0 && <div style={{ width: 1, height: 26, background: color.border }} />}
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.08em", color: color.muted }}>{k}</span>
                <span style={{ fontFamily: font.mono, fontSize: 13, color: color.ink }}>{v}</span>
              </div>
            </div>
          ))}
          <div style={{ width: 1, height: 26, background: color.border }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 220 }}>
            <span style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.08em", color: color.muted }}>Resolved</span>
            <span style={{ fontSize: 12.5, color: color.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>1 Ferry Building, San Francisco</span>
          </div>
        </div>

        {/* apply bar */}
        <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", zIndex: 20, display: "flex", alignItems: "center", gap: 8, background: color.ink, borderRadius: 12, boxShadow: "0 8px 30px rgba(22,33,43,0.22)", padding: 8 }}>
          <button style={{ height: 36, padding: "0 14px", borderRadius: 8, border: "none", background: color.accent, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            Apply to selected <span style={{ fontFamily: font.mono, opacity: 0.8 }}>{checked.size}</span>
          </button>
          <button style={{ height: 36, padding: "0 14px", borderRadius: 8, border: "none", background: "rgba(255,255,255,0.10)", color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Apply to all</button>
          <button style={{ height: 36, padding: "0 12px", borderRadius: 8, border: "none", background: "none", color: color.faint, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Set as default</button>
        </div>
      </section>

      {/* ============ RIGHT: INSPECTOR ============ */}
      <aside style={{ width: 344, flex: "none", background: color.surface, borderLeft: `1px solid ${color.border}`, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{ padding: "14px 18px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: sel.thumb, flex: "none" }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: font.mono, fontSize: 12.5, color: color.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sel.name}</div>
              <div style={{ fontSize: 11.5, color: color.muted }}>{checked.size} selected · editing applies to selection</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 2, background: color.surfaceMuted, borderRadius: 9, padding: 3 }}>
            {(["location", "seo", "exif"] as const).map((t) => {
              const lbl = t === "location" ? "Location" : t === "seo" ? "SEO metadata" : "EXIF";
              const active = tab === t;
              return (
                <button key={t} onClick={() => setTab(t)} style={{
                  flex: 1, height: 30, borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500,
                  background: active ? color.surface : "transparent", color: active ? color.ink : color.muted,
                  boxShadow: active ? shadow.card : "none",
                }}>{lbl}</button>
              );
            })}
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px 18px 18px" }}>
          {tab === "location" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <label style={fieldCol}><span style={labelText}>Latitude</span><input value="37.795391" readOnly style={{ ...monoInput, background: color.paper }} /></label>
                <label style={fieldCol}><span style={labelText}>Longitude</span><input value="-122.393624" readOnly style={{ ...monoInput, background: color.paper }} /></label>
                <label style={fieldCol}><span style={labelText}>Altitude (m)</span><input defaultValue="5" style={monoInput} /></label>
                <label style={fieldCol}><span style={labelText}>Heading</span><input defaultValue="238" style={monoInput} /></label>
              </div>
              <div style={{ height: 1, background: color.borderSoft }} />
              <label style={fieldCol}><span style={labelText}>Resolved address</span><input value="1 Ferry Building, San Francisco, CA 94111" readOnly style={{ ...inputStyle, background: color.paper }} /></label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <label style={fieldCol}><span style={labelText}>City</span><input defaultValue="San Francisco" style={inputStyle} /></label>
                <label style={fieldCol}><span style={labelText}>State / Province</span><input defaultValue="California" style={inputStyle} /></label>
                <label style={fieldCol}><span style={labelText}>Postal code</span><input defaultValue="94111" style={monoInput} /></label>
                <label style={fieldCol}><span style={labelText}>Country</span><input defaultValue="United States" style={inputStyle} /></label>
              </div>
            </div>
          )}

          {tab === "seo" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <label style={fieldCol}><span style={labelText}>Caption / description</span><textarea rows={2} defaultValue="Outdoor patio dining at the Ferry Building waterfront." style={{ border: `1px solid ${color.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 13, color: color.ink, resize: "none", lineHeight: 1.45 }} /></label>
              <label style={fieldCol}><span style={labelText}>Business name (NAP)</span><input defaultValue="Olmsted & Vine" style={inputStyle} /></label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={labelText}>Keywords</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: 8, border: `1px solid ${color.border}`, borderRadius: 8, minHeight: 40, alignContent: "flex-start" }}>
                  {KEYWORDS.map((kw) => (
                    <span key={kw} style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 24, padding: "0 6px 0 9px", background: "rgba(14,124,123,0.10)", border: "1px solid rgba(14,124,123,0.22)", color: color.teal, borderRadius: 999, fontSize: 12, fontWeight: 500 }}>
                      {kw}
                      <button style={{ background: "none", border: "none", cursor: "pointer", color: color.teal, display: "flex", padding: 2 }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg></button>
                    </span>
                  ))}
                  <input placeholder="Add keyword…" style={{ flex: 1, minWidth: 90, border: "none", outline: "none", background: "transparent", fontSize: 12.5, color: color.ink, height: 24 }} />
                </div>
                <span style={{ fontSize: 11, color: color.muted }}>Press Enter to add. Written to IPTC/XMP keywords.</span>
              </div>
              <label style={fieldCol}><span style={labelText}>Sublocation / neighborhood</span><input defaultValue="Embarcadero" style={inputStyle} /></label>
              <label style={fieldCol}><span style={labelText}>Copyright</span><input defaultValue="© Olmsted & Vine" style={inputStyle} /></label>
            </div>
          )}

          {tab === "exif" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <label style={fieldCol}><span style={labelText}>DateTimeOriginal</span><input defaultValue="2026:05:14 11:42:08" style={monoInput} /></label>
              <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 12px", border: `1px solid ${color.border}`, borderRadius: 8 }}>
                <span style={{ fontSize: 12.5, color: color.ink }}>Preserve original timestamps</span>
                <button onClick={() => setPreserve((v) => !v)} style={{ width: 38, height: 22, borderRadius: 999, border: "none", cursor: "pointer", background: preserve ? color.teal : color.border, position: "relative", transition: "background .15s" }}>
                  <span style={{ position: "absolute", top: 2, left: preserve ? 18 : 2, width: 18, height: 18, borderRadius: 999, background: "#fff", transition: "left .15s", boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }} />
                </button>
              </label>
              <div style={{ border: `1px solid ${color.border}`, borderRadius: 8, overflow: "hidden" }}>
                <div style={{ padding: "9px 12px", background: color.paper, fontSize: 11, fontWeight: 600, color: color.muted, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${color.border}` }}>Existing EXIF (read-only)</div>
                {EXIF_ROWS.map((row) => (
                  <div key={row.k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderBottom: `1px solid ${color.borderSoft}`, fontSize: 12 }}>
                    <span style={{ color: color.muted }}>{row.k}</span><span style={{ fontFamily: font.mono, color: color.ink }}>{row.v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: "none", padding: "14px 18px", borderTop: `1px solid ${color.borderSoft}`, background: color.surface }}>
          <button style={{ width: "100%", height: 44, borderRadius: 10, border: "none", background: color.accent, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: shadow.accent }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
            Stamp &amp; process {checked.size} photos
          </button>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button style={{ flex: 1, height: 36, borderRadius: 8, border: `1px solid ${color.border}`, background: color.surface, color: color.ink, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Reset</button>
            <button style={{ flex: 1, height: 36, borderRadius: 8, border: `1px solid ${color.border}`, background: color.surface, color: color.ink, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Preview metadata</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 12, padding: "9px 11px", background: "rgba(14,124,123,0.07)", borderRadius: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color.teal} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>
            <span style={{ fontSize: 11, color: color.ink, lineHeight: 1.4 }}>Processed in your browser. Originals never leave your device.</span>
          </div>
        </div>
      </aside>
    </main>
  );
}
