"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RealtimeRefresh({ channelName = "pedidos-changes" }: { channelName?: string }) {
  const router = useRouter();
  const routerRef = useRef(router);

  // Mantener ref actualizada sin re-suscribir al canal
  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(channelName)
      // Solo INSERT y UPDATE — los deletes no ocurren en esta app
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "pedidos" }, () => {
        routerRef.current.refresh();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "pedidos" }, () => {
        routerRef.current.refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName]); // channelName es estático, no causa re-suscripciones

  return null;
}
