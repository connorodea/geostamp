// GeoStamp design tokens — extracted verbatim from the Claude Design handoff
// (light "cartographic" identity). Single source of truth for the UI port.

export const color = {
  paper: "#FAF7F0",
  surface: "#FFFFFF",
  surfaceMuted: "#F2EEE4",
  border: "#E3DCCD",
  borderSoft: "#F2EEE4",
  dashed: "#D8CFBC",
  dashedWarm: "#C9B89E",
  ink: "#16212B",
  inkSoft: "#0d161e",
  muted: "#5C6670",
  faint: "#9AA6B2",
  accent: "#FF5A3C",
  accentHover: "#E8482C",
  teal: "#0E7C7B",
  success: "#2E7D52",
  danger: "#D2402F",
} as const;

export const font = {
  display: "'Space Grotesk', sans-serif",
  sans: "'IBM Plex Sans', system-ui, sans-serif",
  mono: "'IBM Plex Mono', monospace",
} as const;

export const shadow = {
  card: "0 1px 2px rgba(22,33,43,0.05)",
  control: "0 4px 16px rgba(22,33,43,0.08)",
  panel: "0 8px 30px rgba(22,33,43,0.10)",
  float: "0 8px 30px rgba(22,33,43,0.18)",
  pin: "0 4px 10px rgba(22,33,43,0.30)",
  accent: "0 4px 12px rgba(255,90,60,0.25)",
} as const;
