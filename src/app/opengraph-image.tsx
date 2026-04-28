import { ImageResponse } from "next/og";

import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/metadata";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: "64px",
          background:
            "linear-gradient(135deg, #020617 0%, #0f172a 52%, #1e293b 100%)",
          color: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "36px",
            padding: "56px",
            background:
              "radial-gradient(circle at top right, rgba(255,255,255,0.12), transparent 34%), rgba(255,255,255,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 24,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.68)",
            }}
          >
            Tesla-inspired platform
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                display: "flex",
                maxWidth: 840,
                fontSize: 72,
                lineHeight: 1.05,
                fontWeight: 700,
                letterSpacing: "-0.04em",
              }}
            >
              {SITE_NAME}
            </div>
            <div
              style={{
                display: "flex",
                maxWidth: 860,
                fontSize: 30,
                lineHeight: 1.45,
                color: "rgba(255,255,255,0.82)",
              }}
            >
              {SITE_DESCRIPTION}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 22,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            <span>Vehicles</span>
            <span>Energy</span>
            <span>Shop</span>
            <span>Admin</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
