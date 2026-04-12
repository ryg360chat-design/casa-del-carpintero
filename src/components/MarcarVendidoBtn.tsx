"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { marcarVendido } from "@/app/actions";

const ICON_SPIN = (
  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);
const ICON_CHECK = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const ICON_TRUCK = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

export default function MarcarVendidoBtn({ pedidoId }: { pedidoId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleClick() {
    if (loading || done) return;
    setLoading(true);
    await marcarVendido(pedidoId);
    setDone(true);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading || done}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all press-effect ${
        done
          ? "bg-teal-50 text-teal-700 border border-teal-200"
          : "bg-teal-600 text-white hover:bg-teal-700 shadow-sm"
      } disabled:opacity-60`}
    >
      {loading ? ICON_SPIN : done ? ICON_CHECK : ICON_TRUCK}
      {loading ? "Registrando..." : done ? "¡Despachado!" : "Marcar como despachado"}
    </button>
  );
}
