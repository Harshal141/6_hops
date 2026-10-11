import { ImageResponse } from "next/og";
import { SITE } from "./siteMeta";

// The link preview shown when the site is shared (WhatsApp, LinkedIn, X, Slack, iMessage).
// Drawn rather than taken from the logo file, which is only 100px and would blur at this size.

export const alt = `${SITE.name}: ${SITE.description}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 64,
          padding: "0 96px",
          background: SITE.background,
          color: "#ffffff",
        }}
      >
        <Logo size={240} />
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -4 }}>{SITE.name}</div>
          <div style={{ fontSize: 38, lineHeight: 1.35, color: "#c8c8d0", marginTop: 24 }}>
            {SITE.description}
          </div>
          <div style={{ fontSize: 30, color: SITE.accent, marginTop: 40 }}>6-hops.com</div>
        </div>
      </div>
    ),
    size,
  );
}

/** The H mark: two bars joined by an arc, traced from the logo at 512×512 and cropped to the mark. */
function Logo({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="150 150 212 212">
      <rect x="178" y="165" width="35" height="187" fill="#ffffff" />
      <rect x="300" y="165" width="35" height="187" fill="#ffffff" />
      <path d="M206 250 Q256 214 307 250" stroke={SITE.accent} strokeWidth="10" fill="none" strokeLinecap="round" />
      <circle cx="206" cy="250" r="11" fill={SITE.accent} />
      <circle cx="307" cy="250" r="11" fill={SITE.accent} />
    </svg>
  );
}
