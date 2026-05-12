"use client";

import { useState, useTransition } from "react";
import { setPrecioVenta } from "./actions";

type Pedido = {
  id: string;
  estado: string;
  precio_venta: number | null;
  cant_planchas: number;
  cant_piezas: number;
  metros_canto: number;
  tipo_tablero: string;
  marca_melamina: string;
  fecha_ingreso: string;
  fecha_entrega_real: string | null;
  clientes: { nombre: string } | null;
};

const ESTADO_COLOR: Record<string, string> = {
  "En cola":       "#f59e0b",
  "En corte":      "#3b82f6",
  "En tapacantos": "#8b5cf6",
  "Listo":         "#10b981",
  "Cancelado":     "#6b7280",
  "Pausado":       "#ef4444",
};

function fmt(n: number) {
  return "$" + n.toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function PrecioInput({ pedidoId, inicial }: { pedidoId: string; inicial: number | null }) {
  const [val, setVal] = useState(inicial !== null ? String(inicial) : "");
  const [saved, setSaved] = useState(false);
  const [, startTransition] = useTransition();

  function handleBlur() {
    const num = parseFloat(val);
    if (isNaN(num) || num < 0) return;
    if (num === (inicial ?? -1)) return;
    startTransition(async () => {
      await setPrecioVenta(pedidoId, num);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="relative">
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">$</span>
      <input
        type="number"
        min="0"
        step="0.01"
        value={val}
        onChange={(e) => { setVal(e.target.value); setSaved(false); }}
        onBlur={handleBlur}
        placeholder="0.00"
        className="w-28 pl-6 pr-2 py-1.5 text-xs border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900"
        style={{ borderColor: saved ? "#10b981" : "#e4e4e7" }}
      />
      {saved && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-500 text-xs">✓</span>}
    </div>
  );
}

export default function FinancieroClient({
  pedidos,
  orgId,
  costoPlanche,
  costoCantoMetro,
  role,
}: {
  pedidos: Pedido[];
  orgId: string;
  costoPlanche: number;
  costoCantoMetro: number;
  role: string;
}) {
  const canEdit = ["developer", "admin", "gerencia"].includes(role);
  const [filtro, setFiltro] = useState<"todos" | "con_precio" | "sin_precio">("todos");

  const pedidosFiltrados = pedidos.filter((p) => {
    if (filtro === "con_precio") return p.precio_venta !== null;
    if (filtro === "sin_precio") return p.precio_venta === null;
    return true;
  });

  const ingresos = pedidos.reduce((s, p) => s + (p.precio_venta ?? 0), 0);
  const costoEstimado = pedidos.reduce((s, p) => {
    return s + p.cant_planchas * costoPlanche + p.metros_canto * costoCantoMetro;
  }, 0);
  const margen = ingresos - costoEstimado;
  const pedidosSinPrecio = pedidos.filter((p) => p.precio_venta === null).length;
  const completados = pedidos.filter((p) => p.estado === "Listo").length;

  const now = new Date();
  const mesLabel = now.toLocaleString("es-EC", { month: "long", year: "numeric" });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Módulo Financiero</h1>
        <p className="text-sm text-zinc-500 mt-0.5 capitalize">{mesLabel} · {pedidos.length} pedidos</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Ingresos del mes", value: fmt(ingresos), sub: `${pedidos.filter(p => p.precio_venta !== null).length} con precio`, color: "#10b981" },
          { label: "Costo estimado", value: fmt(costoEstimado), sub: costoPlanche ? `$${costoPlanche}/planche` : "Sin costo configurado", color: "#f59e0b" },
          { label: "Margen bruto", value: fmt(margen), sub: ingresos > 0 ? `${Math.round((margen / ingresos) * 100)}%` : "–", color: margen >= 0 ? "#1957A6" : "#ef4444" },
          { label: "Pedidos listos", value: String(completados), sub: `de ${pedidos.length} este mes`, color: "#7c3aed" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm">
            <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wide mb-1">{kpi.label}</p>
            <p className="text-2xl font-extrabold tracking-tight" style={{ color: kpi.color }}>{kpi.value}</p>
            <p className="text-xs text-zinc-400 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Alerta sin precio */}
      {pedidosSinPrecio > 0 && (
        <div className="mb-4 flex items-center gap-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-2.5 text-sm">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span><strong>{pedidosSinPrecio} pedido{pedidosSinPrecio > 1 ? "s" : ""}</strong> sin precio de venta — el margen no los incluye.</span>
        </div>
      )}

      {/* Filtros */}
      <div className="flex items-center gap-2 mb-4">
        {(["todos", "con_precio", "sin_precio"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            style={{
              background: filtro === f ? "#1957A6" : "#f4f4f5",
              color: filtro === f ? "#fff" : "#71717a",
            }}
          >
            {f === "todos" ? "Todos" : f === "con_precio" ? "Con precio" : "Sin precio"}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-xs text-zinc-500 uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-semibold">Cliente</th>
                <th className="text-left px-4 py-3 font-semibold">Material</th>
                <th className="text-center px-4 py-3 font-semibold">Planchas</th>
                <th className="text-center px-4 py-3 font-semibold">Estado</th>
                <th className="text-right px-4 py-3 font-semibold">Costo est.</th>
                <th className="text-right px-4 py-3 font-semibold">Precio venta</th>
                <th className="text-right px-4 py-3 font-semibold">Margen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {pedidosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-zinc-400 text-sm">
                    No hay pedidos para este filtro.
                  </td>
                </tr>
              )}
              {pedidosFiltrados.map((p) => {
                const costoEst = p.cant_planchas * costoPlanche + p.metros_canto * costoCantoMetro;
                const precio = p.precio_venta ?? null;
                const margenPed = precio !== null ? precio - costoEst : null;
                const margenPct = precio && precio > 0 ? Math.round(((precio - costoEst) / precio) * 100) : null;

                return (
                  <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-zinc-800">
                      {p.clientes?.nombre ?? <span className="text-zinc-400">Sin cliente</span>}
                      <p className="text-[10px] text-zinc-400 font-normal">
                        {new Date(p.fecha_ingreso).toLocaleDateString("es-EC", { day: "2-digit", month: "short" })}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {p.tipo_tablero}
                      {p.marca_melamina && <span className="text-zinc-400"> · {p.marca_melamina}</span>}
                    </td>
                    <td className="px-4 py-3 text-center text-zinc-700">{p.cant_planchas}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: (ESTADO_COLOR[p.estado] ?? "#6b7280") + "20",
                          color: ESTADO_COLOR[p.estado] ?? "#6b7280",
                        }}
                      >
                        {p.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-500 text-xs">
                      {costoPlanche > 0 ? fmt(costoEst) : <span className="text-zinc-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {canEdit ? (
                        <PrecioInput pedidoId={p.id} inicial={p.precio_venta} />
                      ) : (
                        <span className="font-semibold text-zinc-800">
                          {precio !== null ? fmt(precio) : <span className="text-zinc-300">—</span>}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {margenPed !== null ? (
                        <div>
                          <span className="font-semibold" style={{ color: margenPed >= 0 ? "#10b981" : "#ef4444" }}>
                            {fmt(margenPed)}
                          </span>
                          {margenPct !== null && (
                            <p className="text-[10px]" style={{ color: margenPed >= 0 ? "#10b981" : "#ef4444" }}>
                              {margenPct}%
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-zinc-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {pedidosFiltrados.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-zinc-200 bg-zinc-50 font-semibold text-sm">
                  <td colSpan={4} className="px-4 py-3 text-zinc-500">Totales del mes</td>
                  <td className="px-4 py-3 text-right text-zinc-600">{fmt(costoEstimado)}</td>
                  <td className="px-4 py-3 text-right text-zinc-800">{fmt(ingresos)}</td>
                  <td className="px-4 py-3 text-right" style={{ color: margen >= 0 ? "#10b981" : "#ef4444" }}>
                    {fmt(margen)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Nota costos */}
      {costoPlanche === 0 && (
        <p className="mt-3 text-xs text-zinc-400 text-center">
          El costo estimado aparecerá cuando configures el precio por planche en ajustes del sistema.
        </p>
      )}
    </div>
  );
}
