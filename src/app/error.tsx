"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html>
      <body className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-zinc-900 mb-2">Algo salió mal</h1>
          <p className="text-zinc-500 text-sm mb-6">
            Ocurrió un error inesperado. Podés intentar recargar la página.
          </p>
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #1957A6, #267A8C)" }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
