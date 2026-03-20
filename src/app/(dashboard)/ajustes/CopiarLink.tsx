"use client";

import { useState, useEffect } from "react";

export default function CopiarLink() {
  const [copiado, setCopiado] = useState(false);
  const [url, setUrl] = useState("/seguimiento");

  useEffect(() => {
    setUrl(`${window.location.origin}/seguimiento`);
  }, []);

  function copiar() {
    navigator.clipboard.writeText(`${window.location.origin}/seguimiento`);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-600 font-mono truncate select-all">
        {url}
      </div>
      <button
        onClick={copiar}
        className={`shrink-0 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
          copiado
            ? "bg-zinc-100 text-zinc-600"
            : "bg-zinc-900 text-white hover:bg-zinc-800"
        }`}
      >
        {copiado ? "¡Copiado!" : "Copiar"}
      </button>
      <a
        href="/seguimiento"
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 border border-zinc-200 text-zinc-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-50 transition-colors"
      >
        Abrir →
      </a>
    </div>
  );
}
