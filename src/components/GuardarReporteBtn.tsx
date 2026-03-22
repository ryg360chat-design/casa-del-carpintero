"use client";

import { useState } from "react";
import { guardarReporte } from "@/app/actions";

type Stats = {
  pedidosHoy: number;
  enCola: number;
  enCorte: number;
  enTapacantos: number;
  listos: number;
  cancelados: number;
  totalPlanchas: number;
  totalPiezas: number;
  totalMetros: number;
};

export default function GuardarReporteBtn({ stats }: { stats: Stats }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleClick() {
    if (state === "loading") return;
    setState("loading");
    const res = await guardarReporte(stats);
    setState(res.ok ? "done" : "error");
    setTimeout(() => setState("idle"), 2500);
  }

  return (
    <button
      onClick={handleClick}
      disabled={state === "loading"}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all press-effect disabled:opacity-60 ${
        state === "done"
          ? "bg-emerald-600 text-white"
          : state === "error"
          ? "bg-red-100 text-red-700 border border-red-200"
          : "bg-white border border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
      }`}
    >
      {state === "loading" ? (
        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      ) : state === "done" ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
          <polyline points="7 3 7 8 15 8"/>
        </svg>
      )}
      {state === "loading" ? "Guardando..." : state === "done" ? "¡Guardado!" : state === "error" ? "Error al guardar" : "Guardar reporte"}
    </button>
  );
}
