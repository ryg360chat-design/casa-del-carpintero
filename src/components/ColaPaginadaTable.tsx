"use client";

import { useState } from "react";
import { limaDateTime } from "@/lib/time";

type PedidoActivo = {
  id: string;
  tipo_tablero: string;
  cant_planchas: number;
  cant_piezas: number;
  maquina_asignada: string | null;
  estado: string;
  fecha_entrega_estimada: string | null;
  cliente: { nombre: string } | null;
};

const ESTADO_BADGE: Record<string, string> = {
  "En corte":      "bg-zinc-900 text-white",
  "En tapacantos": "bg-zinc-700 text-white",
  "En cola":       "bg-zinc-100 text-zinc-600",
  "Pausado":       "bg-amber-100 text-amber-700",
};

const PAGE_SIZE = 10;

export default function ColaPaginadaTable({ pedidos }: { pedidos: PedidoActivo[] }) {
  const [page, setPage] = useState(0);
  const total = pedidos.length;
  const pages = Math.ceil(total / PAGE_SIZE);
  const slice = pedidos.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const from = page * PAGE_SIZE + 1;
  const to   = Math.min((page + 1) * PAGE_SIZE, total);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              {["#", "Cliente", "Material", "Planchas", "Máquina", "Estado", "Entrega est."].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((p, idx) => {
              const estado = p.estado;
              const cliente = p.cliente?.nombre ?? "—";
              const numeroOrden = `#${p.id.slice(-6).toUpperCase()}`;
              const entrega = p.fecha_entrega_estimada
                ? limaDateTime(p.fecha_entrega_estimada)
                : "—";
              return (
                <tr key={p.id} className={`border-b border-zinc-50 last:border-0 ${idx % 2 === 0 ? "bg-white" : "bg-zinc-50/50"}`}>
                  <td className="px-4 py-3 font-bold text-zinc-700">{numeroOrden}</td>
                  <td className="px-4 py-3 font-semibold text-zinc-900">{cliente}</td>
                  <td className="px-4 py-3 text-zinc-600">{p.tipo_tablero}</td>
                  <td className="px-4 py-3 font-bold text-zinc-900">{p.cant_planchas}</td>
                  <td className="px-4 py-3">
                    <span className="bg-zinc-900 text-white text-xs font-bold px-2 py-0.5 rounded">
                      {p.maquina_asignada ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ESTADO_BADGE[estado] ?? ESTADO_BADGE["En cola"]}`}>
                      {estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">{entrega}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-100">
          <span className="text-xs text-zinc-400 font-medium">
            {from}–{to} de {total} pedidos
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 0}
              className="px-3 py-1.5 text-xs font-semibold border border-zinc-200 rounded-lg disabled:opacity-40 hover:bg-zinc-50 transition-colors"
            >
              ← Anterior
            </button>
            <span className="text-xs font-bold text-zinc-700 px-2">
              {page + 1} / {pages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === pages - 1}
              className="px-3 py-1.5 text-xs font-semibold border border-zinc-200 rounded-lg disabled:opacity-40 hover:bg-zinc-50 transition-colors"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
