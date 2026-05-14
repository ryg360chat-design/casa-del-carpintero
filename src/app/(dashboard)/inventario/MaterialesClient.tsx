"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { registrarEntrada, crearMaterial, editarMaterial } from "./actions";

type Material = {
  id: string; tipo: string; marca: string; espesor: string;
  stock_actual: number; stock_minimo: number; precio_unitario: number;
};

type Movimiento = {
  id: string; tipo: string; cantidad: number; stock_resultante: number;
  notas: string | null; created_at: string; pedido_id: string | null;
  material_id: string;
  materiales: { tipo: string; marca: string; espesor: string } | null;
};

function fmt(n: number) {
  return "$" + n.toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const FIELD = "w-full px-3 py-2 text-sm border border-zinc-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900";

function XBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg hover:bg-zinc-100">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  );
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold text-zinc-900 text-sm">{title}</p>
          <XBtn onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
}

function EntradaModal({ materiales, onClose }: { materiales: Material[]; onClose: () => void }) {
  const [materialId, setMaterialId] = useState(materiales[0]?.id ?? "");
  const [cantidad, setCantidad] = useState("");
  const [notas, setNotas] = useState("");
  const [saving, setSaving] = useState(false);
  const [, startTransition] = useTransition();

  function handleSave() {
    const cant = parseFloat(cantidad);
    if (!materialId || isNaN(cant) || cant <= 0) return;
    setSaving(true);
    startTransition(async () => { await registrarEntrada(materialId, cant, notas); onClose(); });
  }

  return (
    <ModalShell title="Registrar entrada de material" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Material</label>
          <select value={materialId} onChange={e => setMaterialId(e.target.value)} className={FIELD}>
            {materiales.map(m => <option key={m.id} value={m.id}>{m.tipo} {m.marca} {m.espesor}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Cantidad (planchas)</label>
          <input type="number" min="0.5" step="0.5" value={cantidad} onChange={e => setCantidad(e.target.value)} placeholder="50" className={FIELD} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Notas (opcional)</label>
          <input type="text" value={notas} onChange={e => setNotas(e.target.value)} placeholder="Ej: Compra proveedor XYZ, factura #123" className={FIELD} />
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-4">
        <button onClick={onClose} className="text-sm text-zinc-500 px-3 py-2 rounded-xl hover:bg-zinc-100">Cancelar</button>
        <button onClick={handleSave} disabled={saving || !cantidad}
          className="text-sm font-semibold px-4 py-2 rounded-xl text-white flex items-center gap-1.5 disabled:opacity-50"
          style={{ background: "#10b981" }}>
          {saving ? "Registrando..." : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Registrar entrada</>}
        </button>
      </div>
    </ModalShell>
  );
}

function NuevoMaterialModal({ onClose }: { onClose: () => void }) {
  const [tipo, setTipo] = useState("");
  const [marca, setMarca] = useState("");
  const [espesor, setEspesor] = useState("");
  const [stock, setStock] = useState("0");
  const [minimo, setMinimo] = useState("10");
  const [precio, setPrecio] = useState("");
  const [saving, setSaving] = useState(false);
  const [, startTransition] = useTransition();

  function handleSave() {
    if (!tipo.trim() || !marca.trim()) return;
    setSaving(true);
    startTransition(async () => {
      await crearMaterial(tipo, marca, espesor, parseFloat(stock) || 0, parseFloat(minimo) || 10, parseFloat(precio) || 0);
      onClose();
    });
  }

  return (
    <ModalShell title="Nuevo material" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Tipo *</label>
            <input value={tipo} onChange={e => setTipo(e.target.value)} placeholder="Melamina" className={FIELD} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Marca *</label>
            <input value={marca} onChange={e => setMarca(e.target.value)} placeholder="Pelikano" className={FIELD} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Espesor</label>
          <input value={espesor} onChange={e => setEspesor(e.target.value)} placeholder="15mm" className={FIELD} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Stock inicial</label>
            <input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} className={FIELD} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Mínimo</label>
            <input type="number" min="0" value={minimo} onChange={e => setMinimo(e.target.value)} className={FIELD} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Precio/u</label>
            <input type="number" min="0" step="0.01" value={precio} onChange={e => setPrecio(e.target.value)} placeholder="22.50" className={FIELD} />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-4">
        <button onClick={onClose} className="text-sm text-zinc-500 px-3 py-2 rounded-xl hover:bg-zinc-100">Cancelar</button>
        <button onClick={handleSave} disabled={saving || !tipo.trim() || !marca.trim()}
          className="text-sm font-semibold px-4 py-2 rounded-xl text-white disabled:opacity-50"
          style={{ background: "#1957A6" }}>
          {saving ? "Guardando..." : "Crear material"}
        </button>
      </div>
    </ModalShell>
  );
}

function EditarModal({ material, onClose }: { material: Material; onClose: () => void }) {
  const [minimo, setMinimo] = useState(String(material.stock_minimo));
  const [precio, setPrecio] = useState(String(material.precio_unitario));
  const [saving, setSaving] = useState(false);
  const [, startTransition] = useTransition();

  function handleSave() {
    setSaving(true);
    startTransition(async () => {
      await editarMaterial(material.id, parseFloat(minimo) || material.stock_minimo, parseFloat(precio) || material.precio_unitario);
      onClose();
    });
  }

  return (
    <ModalShell title={`${material.tipo} ${material.marca} ${material.espesor}`} onClose={onClose}>
      <div className="flex flex-col gap-3">
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Stock mínimo (planchas)</label>
          <input type="number" min="0" value={minimo} onChange={e => setMinimo(e.target.value)} className={FIELD} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Precio unitario ($)</label>
          <input type="number" min="0" step="0.01" value={precio} onChange={e => setPrecio(e.target.value)} className={FIELD} />
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-4">
        <button onClick={onClose} className="text-sm text-zinc-500 px-3 py-2 rounded-xl hover:bg-zinc-100">Cancelar</button>
        <button onClick={handleSave} disabled={saving}
          className="text-sm font-semibold px-4 py-2 rounded-xl text-white disabled:opacity-50"
          style={{ background: "#1957A6" }}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </ModalShell>
  );
}

export default function MaterialesClient({ materiales, movimientos, orgId, role }: {
  materiales: Material[]; movimientos: Movimiento[]; orgId: string; role: string;
}) {
  const canEdit = ["developer", "admin", "gerencia", "almacen_tableros"].includes(role);
  const router = useRouter();
  const [tab, setTab] = useState<"inventario" | "kardex" | "reporte">("inventario");
  const [showEntrada, setShowEntrada] = useState(false);
  const [showNuevo, setShowNuevo] = useState(false);
  const [editando, setEditando] = useState<Material | null>(null);
  const [filtroMat, setFiltroMat] = useState("todos");

  const bajoMinimo = materiales.filter(m => m.stock_actual <= m.stock_minimo);
  const valorTotal = materiales.reduce((s, m) => s + m.stock_actual * m.precio_unitario, 0);
  const tipos = ["todos", ...Array.from(new Set(materiales.map(m => m.tipo)))];
  const matFiltrados = filtroMat === "todos" ? materiales : materiales.filter(m => m.tipo === filtroMat);

  // Cálculos para reporte
  const hace30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const consumoPorMat: Record<string, number> = {};
  movimientos.forEach(mov => {
    if (mov.tipo === "salida" && new Date(mov.created_at) > hace30) {
      consumoPorMat[mov.material_id] = (consumoPorMat[mov.material_id] || 0) + mov.cantidad;
    }
  });
  const consumoTotal30d = Object.values(consumoPorMat).reduce((s, v) => s + v, 0);
  const reporteMat = materiales.map(m => {
    const consumo30 = consumoPorMat[m.id] || 0;
    const consumoDiario = consumo30 / 30;
    const diasRestantes = consumoDiario > 0 ? Math.floor(m.stock_actual / consumoDiario) : null;
    return { ...m, consumo30, consumoDiario, diasRestantes };
  }).sort((a, b) => {
    const aAlerta = a.stock_actual <= a.stock_minimo ? 0 : 1;
    const bAlerta = b.stock_actual <= b.stock_minimo ? 0 : 1;
    if (aAlerta !== bAlerta) return aAlerta - bAlerta;
    return (a.diasRestantes ?? 999) - (b.diasRestantes ?? 999);
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {showEntrada && canEdit && <EntradaModal materiales={materiales} onClose={() => setShowEntrada(false)} />}
      {showNuevo && canEdit && <NuevoMaterialModal onClose={() => setShowNuevo(false)} />}
      {editando && canEdit && <EditarModal material={editando} onClose={() => setEditando(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">Inventario</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {materiales.length} materiales ·{" "}
            {bajoMinimo.length > 0
              ? <span style={{ color: "#ef4444" }}>{bajoMinimo.length} bajo mínimo</span>
              : "stock OK"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a href="/api/exportar/inventario" className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 border border-zinc-200 bg-white hover:bg-zinc-50 px-3 py-2 rounded-lg transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span className="hidden sm:inline">Inventario</span> CSV
          </a>
          <a href="/api/exportar/inventario?tipo=kardex" className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 border border-zinc-200 bg-white hover:bg-zinc-50 px-3 py-2 rounded-lg transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span className="hidden sm:inline">Kardex</span><span className="sm:hidden">Kárdex</span> CSV
          </a>
          {canEdit && (
            <>
              <button onClick={() => setShowNuevo(true)}
                className="flex items-center gap-2 text-sm font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 shadow-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span className="hidden sm:inline">Nuevo material</span>
                <span className="sm:hidden">Material</span>
              </button>
              <button onClick={() => setShowEntrada(true)}
                className="flex items-center gap-2 text-sm font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-white shadow-sm"
                style={{ background: "#10b981" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span className="hidden sm:inline">Registrar entrada</span>
                <span className="sm:hidden">Entrada</span>
              </button>
            </>
          )}
        </div>
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
          <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wide mb-1">Consumo 30 días</p>
          <p className="text-2xl font-extrabold text-zinc-800">{consumoTotal30d > 0 ? `${consumoTotal30d} u` : "—"}</p>
          <p className="text-xs text-zinc-400 mt-0.5">planchas salidas últimos 30 días</p>
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
        {(["inventario", "kardex", "reporte"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="text-xs font-semibold px-4 py-2 rounded-lg capitalize transition-all"
            style={{
              background: tab === t ? "#fff" : "transparent",
              color: tab === t ? "#1a1a1a" : "#71717a",
              boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}>
            {t === "inventario" ? "Inventario" : t === "kardex" ? "Kardex / Movimientos" : "Reporte"}
          </button>
        ))}
      </div>

      {/* ── INVENTARIO ── */}
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
                  {canEdit && <th className="px-4 py-3" />}
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
                      {canEdit && (
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => setEditando(m)}
                            className="text-xs text-zinc-400 hover:text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                            Editar
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-zinc-200 bg-zinc-50 font-semibold text-sm">
                  <td colSpan={canEdit ? 6 : 5} className="px-4 py-3 text-zinc-400 text-xs uppercase tracking-wide">Total en bodega</td>
                  <td className="px-4 py-3 text-right font-bold text-zinc-800">{fmt(valorTotal)}</td>
                  {canEdit && <td />}
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      {/* ── KARDEX ── */}
      {tab === "kardex" && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          {movimientos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              <p className="text-sm font-medium">Sin movimientos aún</p>
              <p className="text-xs mt-1">Los movimientos aparecerán aquí cuando registres entradas o salidas</p>
            </div>
          ) : (
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
                  const esEntrada = mov.tipo === "entrada";
                  const esSalida = mov.tipo === "salida";
                  return (
                    <tr key={mov.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="px-4 py-3 text-zinc-500 text-xs whitespace-nowrap">
                        {new Date(mov.created_at).toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "2-digit" })}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-zinc-800">{mov.materiales?.tipo} <span className="text-zinc-500 font-normal">{mov.materiales?.marca}</span></p>
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
                        {esEntrada ? "+" : "−"}{mov.cantidad}
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
          )}
        </div>
      )}

      {/* ── REPORTE ── */}
      {tab === "reporte" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-zinc-500">Análisis de consumo — últimos 30 días</p>
            <button onClick={() => router.push("/inventario-pdf")}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-600 flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Ver PDF
            </button>
          </div>

          {/* KPIs reporte */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm">
              <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wide mb-1">Consumo 30 días</p>
              <p className="text-2xl font-extrabold text-zinc-800">{consumoTotal30d > 0 ? `${consumoTotal30d} u` : "Sin datos"}</p>
              <p className="text-xs text-zinc-400 mt-0.5">planchas consumidas</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm">
              <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wide mb-1">Valor en bodega</p>
              <p className="text-2xl font-extrabold text-blue-700">{fmt(valorTotal)}</p>
              <p className="text-xs text-zinc-400 mt-0.5">costo total inventario</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm">
              <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wide mb-1">Materiales a reponer</p>
              <p className="text-2xl font-extrabold" style={{ color: bajoMinimo.length > 0 ? "#ef4444" : "#10b981" }}>
                {bajoMinimo.length > 0 ? `${bajoMinimo.length} material${bajoMinimo.length > 1 ? "es" : ""}` : "Todo OK"}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">bajo mínimo configurado</p>
            </div>
          </div>

          {/* Tabla análisis */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-[11px] text-zinc-400 uppercase tracking-wide">
                  <th className="text-left px-4 py-3 font-semibold">Material</th>
                  <th className="text-center px-4 py-3 font-semibold">Stock</th>
                  <th className="text-center px-4 py-3 font-semibold">Consumo 30d</th>
                  <th className="text-center px-4 py-3 font-semibold">Promedio / día</th>
                  <th className="text-center px-4 py-3 font-semibold">Días restantes</th>
                  <th className="text-right px-4 py-3 font-semibold">Valor stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {reporteMat.map(m => {
                  const bajo = m.stock_actual <= m.stock_minimo;
                  const diasColor = m.diasRestantes === null ? "#a1a1aa"
                    : m.diasRestantes < 7 ? "#ef4444"
                    : m.diasRestantes < 14 ? "#f59e0b"
                    : "#10b981";
                  return (
                    <tr key={m.id} className="hover:bg-zinc-50/60 transition-colors"
                      style={{ background: bajo ? "#fff8f8" : undefined }}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-zinc-800">{m.tipo} <span className="font-normal text-zinc-500">{m.marca}</span></p>
                        {m.espesor && <p className="text-xs text-zinc-400">{m.espesor}</p>}
                        {bajo && <span className="text-[10px] font-bold text-red-500">⚠ REPONER</span>}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-lg"
                        style={{ color: bajo ? "#ef4444" : "#1957A6" }}>
                        {m.stock_actual}
                      </td>
                      <td className="px-4 py-3 text-center text-zinc-600">
                        {m.consumo30 > 0 ? `${m.consumo30} u` : <span className="text-zinc-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center text-zinc-500 text-xs">
                        {m.consumoDiario > 0 ? `${m.consumoDiario.toFixed(1)}/día` : <span className="text-zinc-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {m.diasRestantes !== null ? (
                          <span className="font-bold text-base" style={{ color: diasColor }}>
                            {m.diasRestantes} días
                          </span>
                        ) : <span className="text-zinc-300 text-xs">sin datos</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-zinc-700">
                        {fmt(m.stock_actual * m.precio_unitario)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {consumoTotal30d === 0 && (
              <div className="px-4 py-4 text-center text-xs text-zinc-400 border-t border-zinc-100">
                Los días restantes se calculan con datos de consumo. Registra movimientos para ver proyecciones.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
