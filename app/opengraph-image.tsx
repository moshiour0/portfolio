import { ImageResponse } from "next/og";
import { profile } from "@/lib/content";

export const alt = `${profile.displayName} — ${profile.roleShort}`;
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
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#05070f",
          backgroundImage:
            "radial-gradient(900px 600px at 78% 30%, #132a5e 0%, transparent 62%), radial-gradient(700px 500px at 15% 85%, #2a1a55 0%, transparent 60%)",
          color: "#e8f0e8",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#4d8cff",
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: 999, background: "#4d8cff" }} />
          {profile.location}
        </div>

        <div
          style={{
            marginTop: 28,
            fontSize: 74,
            fontWeight: 700,
            letterSpacing: -2,
            lineHeight: 1,
          }}
        >
          {profile.displayName}
        </div>

        <div style={{ marginTop: 28, fontSize: 30, color: "#9aa7c2", letterSpacing: -1 }}>
          {profile.roleShort}
        </div>

        <div
          style={{
            marginTop: 56,
            display: "flex",
            gap: 14,
            fontSize: 19,
            color: "#6b7794",
          }}
        >
          {["NASA Space Apps Global Finalist", "Top 11", "Galactic Problem Solver"].map((org) => (
            <div
              key={org}
              style={{
                border: "1px solid #2e3c60",
                borderRadius: 999,
                padding: "10px 26px",
              }}
            >
              {org}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
