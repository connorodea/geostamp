import { useState } from "react";
import { TopBar } from "./components/TopBar";
import type { View } from "./components/TopBar";
import { Workspace } from "./screens/Workspace";
import { Library } from "./screens/Library";
import { Reports } from "./screens/Reports";
import { color, font } from "./theme";

const PRODUCT_NAME = "GeoStamp";

function Placeholder({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", background: color.paper }}>
      <div style={{ textAlign: "center", maxWidth: 380 }}>
        <div style={{ fontFamily: font.display, fontWeight: 600, fontSize: 22, color: color.ink, marginBottom: 8 }}>{title}</div>
        <p style={{ fontSize: 13.5, color: color.muted, margin: 0, lineHeight: 1.5 }}>{blurb}</p>
      </div>
    </div>
  );
}

export function App() {
  const [view, setView] = useState<View>("workspace");

  if (view === "landing") {
    return <Placeholder title="Landing page" blurb="The marketing/landing screen from the handoff lands here next." />;
  }

  return (
    <div style={{ height: "100vh", width: "100%", display: "flex", flexDirection: "column", overflow: "hidden", background: color.paper }}>
      <TopBar
        view={view}
        onNav={setView}
        productName={PRODUCT_NAME}
        usageLabel="342 / 1000"
        usagePct={34}
        onLicense={() => {}}
      />
      {view === "workspace" && <Workspace />}
      {view === "library" && <Library />}
      {view === "reports" && <Reports />}
    </div>
  );
}
