import type { Metadata, Viewport } from "next";
import { Inter, Poppins, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Reemplaza a Sora (rediseño 2026-08-28, look "crema/salvia" de la landing
// nueva) — se mantiene la misma variable --font-sora para no tener que
// tocar los usages de font-display en todo el resto del código.
const sora = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sufix — Soluciones para tu hogar en Buenos Aires",
  description:
    "Encontrá técnicos verificados para tu hogar en CABA. Mirá perfiles y reseñas, y contactalos directo por WhatsApp — sin publicar nada, sin esperar propuestas.",
  // Nombre + modo standalone al agregar a inicio en iOS
  appleWebApp: {
    capable: true,
    title: "Sufix",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#4E7A3E",
};

// Nota (rediseño 2026-08-28): antes había un tema oscuro dedicado para
// técnicos logueados (clase "theme-pro", ver globals.css) — el profesor de
// la facu lo criticó y se decidió unificar todo en un solo tema claro para
// demandante y técnico. Por eso este layout ya no necesita leer la sesión
// para elegir clase de tema (se evita esa consulta a Supabase en cada
// carga de página). La clase .theme-pro queda en globals.css sin usarse,
// por si en algún momento se quiere reactivar un tema oscuro real.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${sora.variable} ${jakarta.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen overflow-x-hidden antialiased max-sm:pb-[calc(5rem+env(safe-area-inset-bottom))]">{children}</body>
    </html>
  );
}
