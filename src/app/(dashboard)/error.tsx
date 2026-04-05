"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-full flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 className="text-lg font-bold text-zinc-900 mb-1">Error al cargar la página</h2>
        <p className="text-zinc-500 text-sm mb-5">
          {error.message ?? "Ocurrió un error inesperado. Intentá de nuevo."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #1957A6, #267A8C)" }}
          >
            Reintentar
          </button>
          <a href="/dashboard" className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-600 border border-zinc-200 hover:bg-zinc-50 transition-colors">
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  );
}
