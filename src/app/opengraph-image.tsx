import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Kuadra — Software de gestión para talleres de corte";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#1a1714",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "80px",
        fontFamily: "system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow top-right */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -120,
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(200,71,42,0.22) 0%, transparent 70%)",
          display: "flex",
        }}
      />
      {/* Glow bottom-left */}
      <div
        style={{
          position: "absolute",
          bottom: -80,
          left: -80,
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(200,71,42,0.10) 0%, transparent 70%)",
          display: "flex",
        }}
      />

      {/* Badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(200,71,42,0.12)",
          border: "1px solid rgba(200,71,42,0.35)",
          borderRadius: 100,
          padding: "8px 18px",
          marginBottom: 36,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#c8472a",
            display: "flex",
          }}
        />
        <span
          style={{
            color: "#e8705a",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          RyG SaaS · Ecuador y Latinoamérica
        </span>
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 100,
          fontWeight: 900,
          color: "rgba(255,255,255,0.92)",
          letterSpacing: "-0.04em",
          lineHeight: 1,
          marginBottom: 20,
          display: "flex",
        }}
      >
        Kuadra
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: 26,
          color: "rgba(255,255,255,0.50)",
          fontWeight: 400,
          marginBottom: 52,
          display: "flex",
        }}
      >
        Software de gestión para talleres de corte
      </div>

      {/* Feature pills */}
      <div style={{ display: "flex", gap: 12 }}>
        {[
          { v: "Pedidos digitales", c: "#c8472a" },
          { v: "Producción en tiempo real", c: "#818cf8" },
          { v: "Control por máquina", c: "#34d399" },
          { v: "Reportes automáticos", c: "#fbbf24" },
        ].map((s) => (
          <div
            key={s.v}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 10,
              padding: "12px 18px",
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: s.c,
                display: "flex",
                flexShrink: 0,
              }}
            />
            <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, fontWeight: 600 }}>
              {s.v}
            </span>
          </div>
        ))}
      </div>

      {/* URL bottom-right */}
      <div
        style={{
          position: "absolute",
          bottom: 48,
          right: 80,
          color: "rgba(255,255,255,0.18)",
          fontSize: 16,
          fontWeight: 500,
          display: "flex",
        }}
      >
        kuadra.app
      </div>
    </div>,
    { ...size }
  );
}
