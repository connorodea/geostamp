// Small reusable SVG icons (props pass through to <svg>).
type IconProps = { size?: number; color?: string; strokeWidth?: number };

export function PinIcon({ size = 17, color = "#FF5A3C", strokeWidth = 2 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function TeardropPin({ size = 30 }: { size?: number }) {
  // The draggable map marker — rotated teardrop with a white dot.
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "999px 999px 999px 2px",
        background: "#FF5A3C", transform: "rotate(45deg)",
        boxShadow: "0 4px 10px rgba(22,33,43,0.30)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "pinPulse 2.4s ease-out infinite",
      }}
    >
      <div style={{ width: size * 0.37, height: size * 0.37, borderRadius: 999, background: "#FFFFFF" }} />
    </div>
  );
}
