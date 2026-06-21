import type { Metadata, Viewport } from "next";
import { Inter, Sora, Plus_Jakarta_Sans } from "next/font/google";
import { createSupabaseServer } from "@/lib/supabase-server";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SolvIT — Soluciones para tu hogar en Buenos Aires",
  description:
    "Marketplace de servicios para el hogar en CABA. Publicá tu problema, técnicos verificados compiten por tomarlo. Sin presupuestos al voleo, sin perder la mañana.",
  // Nombre + modo standalone al agregar a inicio en iOS
  appleWebApp: {
    capable: true,
    title: "SolvIT",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#3d9b5e",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Marca el tema según el rol para que la pantalla de carga combine
  // (oscura para el técnico, clara para el demandante/visitante).
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();
  const esTecnico = session?.user?.user_metadata?.es_profesional === true;

  return (
    <html
      lang="es"
      className={`${inter.variable} ${sora.variable} ${jakarta.variable}${esTecnico ? " theme-pro" : ""}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen overflow-x-hidden antialiased max-sm:pb-[calc(5rem+env(safe-area-inset-bottom))]">{children}</body>
    </html>
  );
}
