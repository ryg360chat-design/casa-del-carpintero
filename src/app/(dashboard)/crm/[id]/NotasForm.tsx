"use client";

import { useState, useTransition } from "react";
import { guardarNotasCliente } from "../actions";

export default function NotasForm({ clienteId, notasIniciales }: { clienteId: string; notasIniciales: string }) {
  const [notas, setNotas] = useState(notasIniciales);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await guardarNotasCliente(clienteId, notas);
      if (!result.error) setSaved(true);
    });
  }

  return (
    <div className="space-y-2">
      <textarea
        value={notas}
        onChange={(e) => { setNotas(e.target.value); setSaved(false); }}
        placeholder="Ej: Paga siempre en efectivo. Prefiere MDF. Cliente frecuente los martes..."
        rows={3}
        className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 placeholder:text-zinc-400"
      />
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="px-3 py-1.5 text-xs font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Guardar nota"}
        </button>
        {saved && <span className="text-xs text-green-600 font-medium">Guardado</span>}
      </div>
    </div>
  );
}
