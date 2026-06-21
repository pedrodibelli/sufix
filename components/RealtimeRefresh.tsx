"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Escucha cambios en `propuestas` y refresca la vista (badge + listas) en vivo.
// El RLS de la tabla hace que cada usuario reciba solo los cambios que le
// corresponden (sus propuestas / propuestas de sus publicaciones).
export function RealtimeRefresh() {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const refrescar = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => router.refresh(), 400);
    };

    const channel = supabase
      .channel("rt-propuestas")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "propuestas" },
        refrescar
      )
      .subscribe();

    return () => {
      if (timer.current) clearTimeout(timer.current);
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
