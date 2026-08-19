import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0f0e",
          backgroundImage: "linear-gradient(135deg, #c9b356 0%, #7a9a55 100%)",
          color: "#0a0f0e",
          fontSize: 42,
          fontWeight: 700,
          fontFamily: "sans-serif",
          letterSpacing: -2,
          borderRadius: 14,
        }}
      >
        M
      </div>
    ),
    size,
  );
}
