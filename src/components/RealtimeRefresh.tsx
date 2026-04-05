"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RealtimeRefresh() {
  const router = useRouter();
  const routerRef = useRef(router);

  // Mantener ref actualizada sin re-suscribir al canal
  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("pedidos-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "pedidos" }, () => {
        routerRef.current.refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // sin deps — el canal se crea una sola vez

  return null;
}
