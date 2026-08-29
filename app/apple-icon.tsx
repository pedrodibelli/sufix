import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Ícono para "Agregar a inicio" en iOS (apple-touch-icon).
// iOS exige cuadrado y sin transparencia, así que ponemos el logo centrado
// sobre el verde oscuro de marca (sv.dark) en un lienzo de 180x180.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const logo = readFileSync(join(process.cwd(), "public/logo.png"));
  const src = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1D2E20",
        }}
      >
        {/* logo 225x239 escalado a 132x140 manteniendo proporción */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={132} height={140} alt="Sufix" />
      </div>
    ),
    { ...size }
  );
}
