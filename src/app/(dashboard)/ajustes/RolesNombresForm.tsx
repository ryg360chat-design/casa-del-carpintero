"use client";

import { useState, useTransition } from "react";
import { guardarRolesNombres } from "./actions";
import { ROL_KEYS, ROL_DEFAULT_LABELS } from "@/lib/roles";

export default function RolesNombresForm({
  rolesNombres,
}: {
  rolesNombres: Record<string, string>;
}) {
  const [nombres, setNombres] = useState<Record<string, string>>(
    Object.fromEntries(ROL_KEYS.map(k => [k, rolesNombres[k] ?? ""]))
  );
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function handleChange(rol: string, value: string) {
    setSaved(false);
    setNombres(prev => ({ ...prev, [rol]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    startTransition(async () => {
      const res = await guardarRolesNombres(nombres);
      if (res.error) setError(res.error);
      else setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="divide-y divide-zinc-50">
        {ROL_KEYS.map(rol => (
          <div key={rol} className="px-5 py-3 flex items-center gap-3">
            <div className="w-36 shrink-0">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                {ROL_DEFAULT_LABELS[rol]}
              </p>
            </div>
            <input
              type="text"
              value={nombres[rol]}
              onChange={e => handleChange(rol, e.target.value)}
              placeholder={ROL_DEFAULT_LABELS[rol]}
              maxLength={30}
              className="flex-1 text-sm border border-zinc-200 rounded-lg px-3 py-1.5 text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>
      <div className="px-5 py-4 border-t border-zinc-100 flex items-center justify-between">
        <p className="text-xs text-zinc-400">Dejá el campo vacío para usar el nombre por defecto</p>
        <div className="flex items-center gap-3">
          {saved && <span className="text-xs text-emerald-600 font-semibold">✓ Guardado</span>}
          {error && <span className="text-xs text-red-500">{error}</span>}
          <button
            type="submit"
            disabled={isPending}
            className="text-sm font-bold text-white px-4 py-2 rounded-xl disabled:opacity-40 transition-all"
            style={{ background: "linear-gradient(135deg, #1957A6, #267A8C)" }}
          >
            {isPending ? "Guardando..." : "Guardar nombres"}
          </button>
        </div>
      </div>
    </form>
  );
}
