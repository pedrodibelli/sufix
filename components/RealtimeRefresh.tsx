"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Escucha cambios en `propuestas` y refresca la vista (badge + listas) en vivo.
// El RLS filtra qué recibe cada usuario, por eso la conexión debe estar
// autenticada (setAuth) antes de suscribirse — si no, no llega ningún evento.
export function RealtimeRefresh() {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const refrescar = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => router.refresh(), 400);
    };

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        supabase.realtime.setAuth(session.access_token);
      }
      if (!active) return;
      channel = supabase
        .channel("rt-propuestas")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "propuestas" },
          refrescar
        )
        .subscribe();
    })();

    return () => {
      active = false;
      if (timer.current) clearTimeout(timer.current);
      if (channel) supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
