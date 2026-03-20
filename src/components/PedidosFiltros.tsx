"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";

export default function PedidosFiltros() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams]
  );

  const estadoActual = searchParams.get("estado") ?? "";
  const maquinaActual = searchParams.get("maquina") ?? "";

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[180px]">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          defaultValue={searchParams.get("q") ?? ""}
          placeholder="Buscar cliente o material..."
          onChange={(e) => updateParam("q", e.target.value)}
          className="w-full pl-8 pr-4 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 bg-white"
          style={{ "--tw-ring-color": "#f97316" } as React.CSSProperties}
        />
      </div>

      {/* Estado filter */}
      <div className="relative">
        <select
          defaultValue={estadoActual}
          onChange={(e) => updateParam("estado", e.target.value)}
          className={`appearance-none border rounded-lg pl-3 pr-8 py-2 text-sm font-medium focus:outline-none focus:ring-2 bg-white cursor-pointer transition-colors ${
            estadoActual
              ? "border-orange-300 text-orange-700 bg-orange-50 focus:ring-orange-400"
              : "border-zinc-200 text-zinc-600 hover:border-zinc-300 focus:ring-orange-400"
          }`}
        >
          <option value="">Estado: Todos</option>
          <option>En cola</option>
          <option>En corte</option>
          <option>En tapacantos</option>
          <option>Listo</option>
          <option>Cancelado</option>
        </select>
        <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>

      {/* Máquina filter */}
      <div className="relative">
        <select
          defaultValue={maquinaActual}
          onChange={(e) => updateParam("maquina", e.target.value)}
          className={`appearance-none border rounded-lg pl-3 pr-8 py-2 text-sm font-medium focus:outline-none focus:ring-2 bg-white cursor-pointer transition-colors ${
            maquinaActual
              ? "border-orange-300 text-orange-700 bg-orange-50 focus:ring-orange-400"
              : "border-zinc-200 text-zinc-600 hover:border-zinc-300 focus:ring-orange-400"
          }`}
        >
          <option value="">Máquina: Todas</option>
          <option>M1</option>
          <option>M2</option>
        </select>
        <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>
    </div>
  );
}
