"use client";

import { useTransition, useState } from "react";
import { toggleMaquina } from "@/app/actions";

export default function MaquinaToggle({ id, nombre, activaInicial }: { id: string; nombre: string; activaInicial: boolean }) {
  const [activa, setActiva] = useState(activaInicial);
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    const nuevo = !activa;
    setActiva(nuevo);
    startTransition(async () => { await toggleMaquina(id, nuevo); });
  }

  return (
    <div className="flex items-center justify-between py-4 group">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${activa ? "border-zinc-900 bg-zinc-900 shadow-sm" : "border-zinc-200 bg-zinc-50"}`}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={activa ? "white" : "#a1a1aa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>
          </svg>
        </div>
        <div>
          <p className="font-semibold text-zinc-900 text-sm">{nombre}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {activa && !pending && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
              </span>
            )}
            <p className={`text-xs font-medium transition-colors ${activa ? "text-green-600" : "text-zinc-400"}`}>
              {pending ? "Actualizando..." : activa ? "Operativa" : "Inactiva / Pausa"}
            </p>
          </div>
        </div>
      </div>

      {/* Toggle switch */}
      <button
        onClick={handleToggle}
        disabled={pending}
        className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 disabled:opacity-50 press-effect ${activa ? "bg-zinc-900" : "bg-zinc-300 hover:bg-zinc-400"}`}
        role="switch"
        aria-checked={activa}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${activa ? "translate-x-6" : "translate-x-0"}`} />
      </button>
    </div>
  );
}
