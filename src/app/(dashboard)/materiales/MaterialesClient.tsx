"use client";

import { useState, useTransition } from "react";
import { registrarEntrada } from "./actions";

type Material = {
  id: string; tipo: string; marca: string; espesor: string;
  stock_actual: number; stock_minimo: number; precio_unitario: number;
};

type Movimiento = {
  id: string; tipo: string; cantidad: number; stock_resultante: number;
  notas: string | null; created_at: string; pedido_id: string | null;
  materiales: { tipo: string; marca: string; espesor: string } | null;
};

function fmt(n: number) {
  return "$" + n.toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function EntradaModal({ materiales, orgId, onClose }: { materiales: Material[]; orgId: string; onClose: () => void }) {
  const [materialId, setMaterialId] = useState(materiales[0]?.id ?? "");
  const [cantidad, setCantidad] = useState("");
  const [notas, setNotas] = useState("");
  const [saving, setSaving] = useState(false);
  const [, startTransition] = useTransition();

  function handleSave() {
    const cant = parseFloat(cantidad);
    if (!materialId || isNaN(cant) || cant <= 0) return;
    setSaving(true);
    startTransition(async () => {
      await registrarEntrada(materialId, cant, notas);
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold text-zinc-900 text-sm">Registrar entrada de material</p>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg hover:bg-zinc-100">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Material</label>
            <select value={materialId} onChange={e => setMaterialId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900">
              {materiales.map(m => (
                <option key={m.id} value={m.id}>{m.tipo} {m.marca} {m.espesor}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Cantidad (planchas)</label>
            <input type="number" min="0.5" step="0.5" value={cantidad} onChange={e => setCantidad(e.target.value)}
              placeholder="50"
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Notas (opcional)</label>
            <input type="text" value={notas} onChange={e => setNotas(e.target.value)}
              placeholder="Ej: Compra proveedor XYZ, factura #123"
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-4">
          <button onClick={onClose} className="text-sm text-zinc-500 px-3 py-2 rounded-xl hover:bg-zinc-100">Cancelar</button>
          <button onClick={handleSave} disabled={saving || !cantidad}
            className="text-sm font-semibold px-4 py-2 rounded-xl text-white flex items-center gap-1.5 disabled:opacity-50"
            style={{ background: "#10b981" }}>
            {saving ? "Registrando..." : <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Registrar entrada
            </>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MaterialesClient({ materiales, movimientos, orgId, role }: {
  materiales: Material[]; movimientos: Movimiento[]; orgId: string; role: string;
}) {
  const canEdit = ["developer", "admin", "gerencia", "almacen_tableros"].includes(role);
  const [tab, setTab] = useState<"inventario" | "kardex">("inventario");
  const [showEntrada, setShowEntrada] = useState(false);
  const [filtroMat, setFiltroMat] = useState("todos");

  const bajoMinimo = materiales.filter(m => m.stock_actual <= m.stock_minimo);
  const valorTotal = materiales.reduce((s, m) => s + m.stock_actual * m.precio_unitario, 0);

  const tipos = ["todos", ...Array.from(new Set(materiales.map(m => m.tipo)))];
  const matFiltrados = filtroMat === "todos" ? materiales : materiales.filter(m => m.tipo === filtroMat);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {showEntrada && canEdit && (
        <EntradaModal materiales={materiales} orgId={orgId} onClose={() => setShowEntrada(false)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Control de Materiales</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{materiales.length} materiales · {bajoMinimo.length > 0 ? <span style={{ color: "#ef4444" }}>{bajoMinimo.length} bajo mínimo</span> : "stock OK"}</p>
        </div>
        {canEdit && (
          <button onClick={() => setShowEntrada(true)}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl text-white shadow-sm"
            style={{ background: "#10b981" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Registrar entrada
          </button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm">
          <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wide mb-1">Valor en stock</p>
          <p className="text-2xl font-extrabold text-blue-700">{fmt(valorTotal)}</p>
          <p className="text-xs text-zinc-400 mt-0.5">costo de materiales en bodega</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm">
          <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wide mb-1">Alertas de stock</p>
          <p className="text-2xl font-extrabold" style={{ color: bajoMinimo.length > 0 ? "#ef4444" : "#10b981" }}>
            {bajoMinimo.length > 0 ? `${bajoMinimo.length} materiales` : "Sin alertas"}
          </p>
          <p className="text-xs text-zinc-400 mt-0.5">por debajo del mínimo configurado</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm">
          <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wide mb-1">Movimientos recientes</p>
          <p className="text-2xl font-extrabold text-zinc-800">{movimientos.length}</p>
          <p className="text-xs text-zinc-400 mt-0.5">últimos 50 movimientos</p>
        </div>
      </div>

      {/* Alertas */}
      {bajoMinimo.length > 0 && (
        <div className="mb-5 flex flex-col gap-2">
          {bajoMinimo.map(m => (
            <div key={m.id} className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span className="text-sm text-red-800">
                <strong>{m.tipo} {m.marca} {m.espesor}</strong> — solo <strong>{m.stock_actual} planchas</strong> (mínimo: {m.stock_minimo})
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-zinc-100 rounded-xl p-1 w-fit">
        {(["inventario", "kardex"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="text-xs font-semibold px-4 py-2 rounded-lg capitalize transition-all"
            style={{ background: tab === t ? "#fff" : "transparent", color: tab === t ? "#1a1a1a" : "#71717a", boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
            {t === "inventario" ? "Inventario" : "Kardex / Movimientos"}
          </button>
        ))}
      </div>

      {/* INVENTARIO */}
      {tab === "inventario" && (
        <>
          <div className="flex gap-2 mb-3">
            {tipos.map(t => (
              <button key={t} onClick={() => setFiltroMat(t)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors capitalize"
                style={{ background: filtroMat === t ? "#1957A6" : "#f4f4f5", color: filtroMat === t ? "#fff" : "#71717a" }}>
                {t}
              </button>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-[11px] text-zinc-400 uppercase tracking-wide">
                  <th className="text-left px-4 py-3 font-semibold">Material</th>
                  <th className="text-center px-4 py-3 font-semibold">Stock actual</th>
                  <th className="text-center px-4 py-3 font-semibold">Mínimo</th>
                  <th className="text-center px-4 py-3 font-semibold">Estado</th>
                  <th className="text-right px-4 py-3 font-semibold">Precio unit.</th>
                  <th className="text-right px-4 py-3 font-semibold">Valor total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {matFiltrados.map(m => {
                  const bajo = m.stock_actual <= m.stock_minimo;
                  const pct = Math.min((m.stock_actual / Math.max(m.stock_minimo * 2, 1)) * 100, 100);
                  return (
                    <tr key={m.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-zinc-800">{m.tipo} <span className="font-normal text-zinc-500">{m.marca}</span></p>
                        {m.espesor && <p className="text-xs text-zinc-400">{m.espesor}</p>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <p className="font-bold text-lg" style={{ color: bajo ? "#ef4444" : "#1957A6" }}>{m.stock_actual}</p>
                        <div className="w-16 h-1.5 rounded-full bg-zinc-100 mx-auto mt-1">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: bajo ? "#ef4444" : "#10b981" }} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-zinc-500 text-sm">{m.stock_minimo}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: bajo ? "#fef2f2" : "#f0fdf4", color: bajo ? "#ef4444" : "#16a34a" }}>
                          {bajo ? "⚠ Reponer" : "✓ OK"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-600 text-sm">{fmt(m.precio_unitario)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-zinc-800">{fmt(m.stock_actual * m.precio_unitario)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-zinc-200 bg-zinc-50 font-semibold text-sm">
                  <td colSpan={5} className="px-4 py-3 text-zinc-400 text-xs uppercase tracking-wide">Total en bodega</td>
                  <td className="px-4 py-3 text-right font-bold text-zinc-800">{fmt(valorTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      {/* KARDEX */}
      {tab === "kardex" && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-[11px] text-zinc-400 uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-semibold">Fecha</th>
                <th className="text-left px-4 py-3 font-semibold">Material</th>
                <th className="text-center px-4 py-3 font-semibold">Tipo</th>
                <th className="text-center px-4 py-3 font-semibold">Cantidad</th>
                <th className="text-right px-4 py-3 font-semibold">Stock resultante</th>
                <th className="text-left px-4 py-3 font-semibold">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {movimientos.map(mov => {
                const esSalida = mov.tipo === "salida";
                const esEntrada = mov.tipo === "entrada";
                return (
                  <tr key={mov.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-4 py-3 text-zinc-500 text-xs whitespace-nowrap">
                      {new Date(mov.created_at).toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "2-digit" })}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-800">
                        {mov.materiales?.tipo} <span className="text-zinc-500 font-normal">{mov.materiales?.marca}</span>
                      </p>
                      <p className="text-[10px] text-zinc-400">{mov.materiales?.espesor}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: esEntrada ? "#f0fdf4" : esSalida ? "#fef2f2" : "#fef9c3",
                          color: esEntrada ? "#16a34a" : esSalida ? "#ef4444" : "#ca8a04",
                        }}>
                        {esEntrada ? "↑ Entrada" : esSalida ? "↓ Salida" : "⟳ Ajuste"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold"
                      style={{ color: esEntrada ? "#16a34a" : esSalida ? "#ef4444" : "#ca8a04" }}>
                      {esEntrada ? "+" : "-"}{mov.cantidad}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-zinc-700">{mov.stock_resultante}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs max-w-[200px] truncate">
                      {mov.pedido_id ? <span className="text-blue-500">Pedido automático</span> : mov.notas ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
