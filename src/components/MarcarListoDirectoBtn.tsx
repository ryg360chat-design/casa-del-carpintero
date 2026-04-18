"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { marcarComoListo } from "@/app/actions";

const ESTADOS_ACTIVOS = ["En cola", "En corte", "En tapacantos"];

export default function MarcarListoDirectoBtn({
  pedidoId,
  estadoActual,
}: {
  pedidoId: string;
  estadoActual: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [confirming, setConfirming] = useState(false);

  if (!ESTADOS_ACTIVOS.includes(estadoActual)) return null;

  async function handleConfirm() {
    setLoading(true);
    setConfirming(false);
    await marcarComoListo(pedidoId);
    setDone(true);
    setLoading(false);
    router.refresh();
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        ¡Marcado como Listo!
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-zinc-500 font-medium">¿Saltar etapas y marcar como Listo?</span>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Actualizando..." : "Sí, marcar Listo"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-500 text-sm font-semibold hover:bg-zinc-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 text-emerald-700 bg-emerald-50 text-sm font-semibold hover:bg-emerald-100 hover:border-emerald-300 transition-all"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Marcar como Listo
    </button>
  );
}
