"use client";

import { useState, useTransition } from "react";
import { guardarRolesNombres } from "./actions";
import { ROL_KEYS, ROL_DEFAULT_LABELS } from "@/lib/roles";

export default function RolesNombresForm({
  rolesNombres,
}: {
  rolesNombres: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const [nombres, setNombres] = useState<Record<string, string>>(
    Object.fromEntries(ROL_KEYS.map(k => [k, rolesNombres[k] ?? ""]))
  );
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const customCount = ROL_KEYS.filter(k => nombres[k]?.trim()).length;

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
      else { setSaved(true); setOpen(false); }
    });
  }

  return (
    <div>
      {/* Header toggle */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-zinc-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-700">
            {customCount > 0 ? `${customCount} nombre${customCount > 1 ? "s" : ""} personalizado${customCount > 1 ? "s" : ""}` : "Usar nombres por defecto"}
          </span>
          {saved && <span className="text-xs text-emerald-600 font-semibold">✓ Guardado</span>}
        </div>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5"
          className={`text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Contenido colapsable */}
      {open && (
        <form onSubmit={handleSubmit} className="border-t border-zinc-100">
          <div className="divide-y divide-zinc-50">
            {ROL_KEYS.map(rol => (
              <div key={rol} className="px-5 py-2.5 flex items-center gap-3">
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
          <div className="px-5 py-3.5 border-t border-zinc-100 flex items-center justify-between">
            <p className="text-xs text-zinc-400">Vacío = nombre por defecto</p>
            <div className="flex items-center gap-3">
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
      )}
    </div>
  );
}
