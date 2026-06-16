import type { CSSProperties } from "react";
import { color, font } from "../theme";
import { PinIcon } from "./icons";

export type View = "workspace" | "library" | "reports" | "landing";

const navIcon: Record<Exclude<View, "landing">, JSX.Element> = {
  workspace: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /><circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  ),
  library: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.5-3.5L9 20" />
    </svg>
  ),
  reports: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18 3 20V6l6-2 6 2 6-2v14l-6 2-6-2Z" /><path d="M9 4v14M15 6v14" />
    </svg>
  ),
};

function navStyle(active: boolean): CSSProperties {
  return {
    display: "flex", alignItems: "center", gap: 7, height: 34, padding: "0 12px",
    borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
    background: active ? color.surfaceMuted : "transparent",
    color: active ? color.ink : color.muted,
  };
}

export function TopBar({
  view, onNav, productName, usageLabel, usagePct, onLicense,
}: {
  view: View;
  onNav: (v: View) => void;
  productName: string;
  usageLabel: string;
  usagePct: number;
  onLicense: () => void;
}) {
  return (
    <header style={{
      height: 60, flex: "none", display: "flex", alignItems: "center", gap: 24,
      padding: "0 20px", background: color.surface, borderBottom: `1px solid ${color.border}`, zIndex: 40,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, background: color.ink,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <PinIcon size={17} color={color.accent} />
        </div>
        <span style={{ fontFamily: font.display, fontWeight: 600, fontSize: 18, letterSpacing: "-0.02em", color: color.ink }}>
          {productName}
        </span>
      </div>

      <nav style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 8 }}>
        {(["workspace", "library", "reports"] as const).map((v) => (
          <button key={v} onClick={() => onNav(v)} style={navStyle(view === v)}>
            {navIcon[v]}
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </nav>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 184 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: color.muted }}>
            <span style={{ fontWeight: 500, whiteSpace: "nowrap" }}>Usage this month</span>
            <span style={{ fontFamily: font.mono, color: color.ink }}>{usageLabel}</span>
          </div>
          <div style={{ height: 5, background: color.surfaceMuted, borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: `${usagePct}%`, height: "100%", background: color.accent, borderRadius: 999 }} />
          </div>
        </div>
        <button onClick={onLicense} style={{
          display: "flex", alignItems: "center", gap: 7, height: 34, padding: "0 13px",
          borderRadius: 8, border: `1px solid ${color.border}`, background: color.surface,
          color: color.ink, fontSize: 13, fontWeight: 500, cursor: "pointer",
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color.teal} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="7.5" cy="15.5" r="4.5" /><path d="m10.5 12.5 8-8M16 4l3 3M18 6l2 2" />
          </svg>
          Enter license key
        </button>
        <div style={{
          width: 34, height: 34, borderRadius: 999, background: `linear-gradient(135deg, ${color.teal}, ${color.ink})`,
          display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF",
          fontWeight: 600, fontSize: 13, cursor: "pointer",
        }}>AM</div>
      </div>
    </header>
  );
}
