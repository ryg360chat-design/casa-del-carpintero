"use client";

import { useState } from "react";
import { avanzarEstado } from "@/app/actions";

const SIGUIENTE: Record<string, string> = {
  "En cola":       "En corte",
  "En corte":      "En tapacantos",
  "En tapacantos": "Listo",
};

const LABEL: Record<string, string> = {
  "En cola":       "Iniciar corte",
  "En corte":      "Pasar a enchape",
  "En tapacantos": "Marcar listo",
};

const ICON_NEXT = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const ICON_CHECK = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ICON_SPIN = (
  <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

export default function AvanzarEstadoBtn({
  pedidoId,
  estadoActual,
  showLabel = false,
}: {
  pedidoId: string;
  estadoActual: string;
  showLabel?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const siguiente = SIGUIENTE[estadoActual];
  const label = LABEL[estadoActual];

  if (!siguiente) return null;

  async function handleClick() {
    if (loading || done) return;
    setLoading(true);
    await avanzarEstado(pedidoId, estadoActual);
    setLoading(false);
    setDone(true);
    setTimeout(() => setDone(false), 1200);
  }

  const isMarcarListo = estadoActual === "En tapacantos";

  if (showLabel) {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all press-effect ${
          done
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : isMarcarListo
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : "bg-zinc-900 text-white hover:bg-zinc-800"
        } disabled:opacity-50`}
      >
        {loading ? ICON_SPIN : done ? ICON_CHECK : ICON_NEXT}
        {loading ? "Actualizando..." : done ? "¡Listo!" : label}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      data-tooltip={label}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all press-effect ${
        done
          ? "bg-emerald-100 text-emerald-700"
          : "border border-zinc-200 text-zinc-500 hover:bg-zinc-900 hover:text-white hover:border-zinc-900"
      } disabled:opacity-40`}
    >
      {loading ? ICON_SPIN : done ? ICON_CHECK : ICON_NEXT}
    </button>
  );
}
