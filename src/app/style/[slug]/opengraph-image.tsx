import { ImageResponse } from "next/og";
import { VIBES } from "@/lib/style";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "My Threadloop style";

export default async function OgImage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const ids = decodeURIComponent(slug).split("_");
  const labels = VIBES.filter((v) => ids.includes(v.id)).map((v) => v.label);
  const label = labels.join("  +  ") || "Curated";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0d0b1f00",
          backgroundColor: "#1a1714",
          color: "#f4f1ea",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, letterSpacing: 2, color: "#b5765a", fontWeight: 700 }}>
          THREADLOOP
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 30, color: "#f4f1eaaa" }}>My style is</div>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 800, lineHeight: 1.05, marginTop: 12 }}>
            {label}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#f4f1eaaa" }}>
          Take the quiz · shop every store at once
        </div>
      </div>
    ),
    { ...size },
  );
}
