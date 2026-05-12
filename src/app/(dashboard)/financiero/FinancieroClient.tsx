"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setPrecioVenta, updateCostosConfig } from "./actions";

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
  clientes: { nombre: string } | null;
};

const ESTADO_COLOR: Record<string, string> = {
  "En cola":       "#f59e0b",
  "En corte":      "#3b82f6",
  "En tapacantos": "#8b5cf6",
  "Listo":         "#10b981",
  "Despachado":    "#0ea5e9",
  "Cancelado":     "#6b7280",
  "Pausado":       "#ef4444",
};

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function ConfigPanel({
  costoPlanche, costoCantoMetro, onClose,
}: { costoPlanche: number; costoCantoMetro: number; onClose: () => void }) {
  const [planche, setPlanche] = useState(String(costoPlanche));
  const [canto, setCanto] = useState(String(costoCantoMetro));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [, startTransition] = useTransition();

  function handleSave() {
    const p = parseFloat(planche);
    const c = parseFloat(canto);
    if (isNaN(p) || isNaN(c) || p < 0 || c < 0) return;
    setSaving(true);
    startTransition(async () => {
      await updateCostosConfig(p, c);
      setSaving(false);
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 1200);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold text-zinc-900 text-sm">Configurar costos</p>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg hover:bg-zinc-100 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Costo por planche ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
              <input type="number" min="0" step="0.5" value={planche}
                onChange={(e) => setPlanche(e.target.value)}
                className="w-full pl-7 pr-3 py-2 text-sm border border-zinc-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900"
                placeholder="22.00" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Costo por metro de canto ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
              <input type="number" min="0" step="0.05" value={canto}
                onChange={(e) => setCanto(e.target.value)}
                className="w-full pl-7 pr-3 py-2 text-sm border border-zinc-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900"
                placeholder="0.80" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-4">
          <button onClick={onClose} className="text-sm text-zinc-500 px-3 py-2 rounded-xl hover:bg-zinc-100 transition-colors">Cancelar</button>
          <button onClick={handleSave} disabled={saving || saved}
            className="text-sm font-semibold px-4 py-2 rounded-xl text-white transition-all disabled:opacity-60 flex items-center gap-1.5"
            style={{ background: saved ? "#10b981" : "#1957A6" }}>
            {saved ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Guardado</> :
             saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

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
    <div className="relative inline-flex items-center">
      <span className="absolute left-2.5 text-zinc-400 text-xs">$</span>
      <input
        type="number" min="0" step="0.01"
        value={val}
        onChange={(e) => { setVal(e.target.value); setSaved(false); }}
        onBlur={handleBlur}
        placeholder="0.00"
        className="w-28 pl-6 pr-6 py-1.5 text-xs border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 transition-colors"
        style={{ borderColor: saved ? "#10b981" : "#e4e4e7" }}
      />
      {saved && <span className="absolute right-2 text-emerald-500 text-xs">✓</span>}
    </div>
  );
}

function MiniChart({ pedidos, costoPlanche, costoCantoMetro }: { pedidos: Pedido[]; costoPlanche: number; costoCantoMetro: number }) {
  if (pedidos.length === 0) return null;

  const byWeek: Record<number, { ingresos: number; costo: number }> = { 1: { ingresos: 0, costo: 0 }, 2: { ingresos: 0, costo: 0 }, 3: { ingresos: 0, costo: 0 }, 4: { ingresos: 0, costo: 0 } };
  pedidos.forEach((p) => {
    const d = new Date(p.fecha_ingreso).getDate();
    const w = Math.min(Math.ceil(d / 7), 4);
    byWeek[w].ingresos += p.precio_venta ?? 0;
    byWeek[w].costo += p.cant_planchas * costoPlanche + p.metros_canto * costoCantoMetro;
  });

  const maxVal = Math.max(...Object.values(byWeek).map((v) => v.ingresos), 1);
  const H = 90; const barW = 40; const gap = 28; const padX = 16;
  const VW = 4 * barW + 3 * gap + padX * 2;

  return (
    <svg width={VW} height={H + 24} viewBox={`0 0 ${VW} ${H + 24}`} style={{ overflow: "visible", display: "block" }}>
      {[1, 2, 3, 4].map((w, i) => {
        const x = padX + i * (barW + gap);
        const hI = (byWeek[w].ingresos / maxVal) * H;
        const hC = (byWeek[w].costo / maxVal) * H;
        const hasData = byWeek[w].ingresos > 0;
        return (
          <g key={w}>
            <rect x={x} y={H - Math.max(hI, 2)} width={barW} height={Math.max(hI, 2)} rx="4"
              fill={hasData ? "#1957A6" : "#e4e4e7"} opacity={hasData ? "0.85" : "0.4"} />
            {hC > 0 && <rect x={x} y={H - hC} width={barW} height={hC} rx="4" fill="#f59e0b" opacity="0.5" />}
            <text x={x + barW / 2} y={H + 16} textAnchor="middle" fontSize="11" fill="#9ca3af" fontWeight="500">S{w}</text>
            {hasData && (
              <text x={x + barW / 2} y={H - hI - 5} textAnchor="middle" fontSize="10" fill="#1957A6" fontWeight="700">
                {fmt(byWeek[w].ingresos)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

const PAGE_SIZE = 10;

export default function FinancieroClient({
  pedidos, orgId, costoPlanche, costoCantoMetro, role, mes, año,
}: {
  pedidos: Pedido[]; orgId: string; costoPlanche: number; costoCantoMetro: number;
  role: string; mes: number; año: number;
}) {
  const router = useRouter();
  const canEdit = ["developer", "admin", "gerencia"].includes(role);
  const [filtro, setFiltro] = useState<"todos" | "con_precio" | "sin_precio">("todos");
  const [page, setPage] = useState(0);
  const [showConfig, setShowConfig] = useState(false);

  function navMes(delta: number) {
    let m = mes + delta; let y = año;
    if (m > 12) { m = 1; y++; }
    if (m < 1)  { m = 12; y--; }
    router.push(`/financiero?mes=${m}&año=${y}`);
  }

  const pedidosFiltrados = pedidos.filter((p) => {
    if (filtro === "con_precio") return p.precio_venta !== null;
    if (filtro === "sin_precio") return p.precio_venta === null;
    return true;
  });

  const totalPages = Math.ceil(pedidosFiltrados.length / PAGE_SIZE);
  const paginated  = pedidosFiltrados.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const ingresos      = pedidos.reduce((s, p) => s + (p.precio_venta ?? 0), 0);
  const costoTotal    = pedidos.reduce((s, p) => s + p.cant_planchas * costoPlanche + p.metros_canto * costoCantoMetro, 0);
  const margen        = ingresos - costoTotal;
  const tasaMargen    = ingresos > 0 ? Math.round((margen / ingresos) * 100) : 0;
  const ticketProm    = pedidos.filter(p => p.precio_venta).length > 0
    ? ingresos / pedidos.filter(p => p.precio_venta).length : 0;
  const sinPrecio     = pedidos.filter((p) => p.precio_venta === null).length;
  const listos        = pedidos.filter((p) => ["Listo","Despachado"].includes(p.estado)).length;

  const clienteMap: Record<string, number> = {};
  pedidos.forEach((p) => {
    if (p.precio_venta && p.clientes?.nombre) {
      clienteMap[p.clientes.nombre] = (clienteMap[p.clientes.nombre] ?? 0) + p.precio_venta;
    }
  });
  const topCliente = Object.entries(clienteMap).sort((a, b) => b[1] - a[1])[0];

  const isCurrentMonth = mes === new Date().getMonth() + 1 && año === new Date().getFullYear();

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {showConfig && canEdit && (
        <ConfigPanel
          costoPlanche={costoPlanche}
          costoCantoMetro={costoCantoMetro}
          onClose={() => setShowConfig(false)}
        />
      )}

      {/* Header + nav mes */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Módulo Financiero</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{pedidos.length} pedidos registrados</p>
        </div>
        <div className="flex items-center gap-2">
        {canEdit && (
          <button onClick={() => setShowConfig(v => !v)}
            title="Configurar costos"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-zinc-200 bg-white shadow-sm hover:bg-zinc-50 transition-colors text-zinc-600"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            Configurar costos
          </button>
        )}
        <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-3 py-2 shadow-sm">
          <button onClick={() => navMes(-1)} className="p-1 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-500 hover:text-zinc-800">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span className="text-sm font-bold text-zinc-800 w-36 text-center capitalize">
            {MESES[mes - 1]} {año}
          </span>
          <button
            onClick={() => navMes(1)}
            disabled={isCurrentMonth}
            className="p-1 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-500 hover:text-zinc-800 disabled:opacity-30"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
        </div>
      </div>


      {/* KPIs principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {[
          { label: "Ingresos del mes", value: fmt(ingresos), sub: `${pedidos.filter(p => p.precio_venta !== null).length} pedidos con precio`, color: "#10b981", icon: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
          { label: "Costo estimado",   value: fmt(costoTotal), sub: costoPlanche ? `$${costoPlanche}/planche · $${costoCantoMetro}/m canto` : "Sin costo configurado", color: "#f59e0b", icon: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" },
          { label: "Margen bruto",     value: fmt(margen), sub: `${tasaMargen}% sobre ventas`, color: margen >= 0 ? "#1957A6" : "#ef4444", icon: "M22 12h-4l-3 9L9 3l-3 9H2" },
          { label: "Ticket promedio",  value: ticketProm > 0 ? fmt(ticketProm) : "–", sub: `${listos} pedidos listos/despachados`, color: "#7c3aed", icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wide">{kpi.label}</p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: kpi.color + "18" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={kpi.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={kpi.icon}/>
                </svg>
              </div>
            </div>
            <p className="text-2xl font-extrabold tracking-tight" style={{ color: kpi.color }}>{kpi.value}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Segunda fila: gráfico + top cliente */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2 bg-white rounded-2xl border border-zinc-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Ingresos por semana</p>
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-700 opacity-85 inline-block"/><span>Ingresos</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400 opacity-50 inline-block"/><span>Costo est.</span></div>
            </div>
          </div>
          <div className="w-full">
            <MiniChart pedidos={pedidos} costoPlanche={costoPlanche} costoCantoMetro={costoCantoMetro} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 flex flex-col gap-3">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Top cliente del mes</p>
          {topCliente ? (
            <>
              <div>
                <p className="font-bold text-zinc-900 text-sm leading-tight">{topCliente[0]}</p>
                <p className="text-xl font-extrabold mt-1" style={{ color: "#10b981" }}>{fmt(topCliente[1])}</p>
              </div>
              <div className="mt-auto space-y-2">
                {Object.entries(clienteMap).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([nombre, total]) => (
                  <div key={nombre}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-zinc-600 truncate max-w-[120px]">{nombre}</span>
                      <span className="font-semibold text-zinc-800">{fmt(total)}</span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(total / (topCliente[1] || 1)) * 100}%`, background: "#1957A6" }}/>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-zinc-400 mt-2">Sin datos aún — agrega precios de venta.</p>
          )}
        </div>
      </div>

      {/* Alerta sin precio */}
      {sinPrecio > 0 && (
        <div className="mb-4 flex items-center gap-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-2.5 text-sm">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span><strong>{sinPrecio} pedido{sinPrecio > 1 ? "s" : ""}</strong> sin precio de venta — el margen no los incluye.</span>
        </div>
      )}

      {/* Filtros */}
      <div className="flex items-center gap-2 mb-3">
        {(["todos", "con_precio", "sin_precio"] as const).map((f) => (
          <button key={f} onClick={() => { setFiltro(f); setPage(0); }}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: filtro === f ? "#1957A6" : "#f4f4f5", color: filtro === f ? "#fff" : "#71717a" }}>
            {f === "todos" ? `Todos (${pedidos.length})` : f === "con_precio" ? `Con precio (${pedidos.filter(p=>p.precio_venta!==null).length})` : `Sin precio (${sinPrecio})`}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-[11px] text-zinc-400 uppercase tracking-wide">
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
              {paginated.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-zinc-400 text-sm">No hay pedidos para este filtro.</td></tr>
              )}
              {paginated.map((p) => {
                const costoEst  = p.cant_planchas * costoPlanche + p.metros_canto * costoCantoMetro;
                const precio    = p.precio_venta;
                const margenPed = precio !== null ? precio - costoEst : null;
                const margenPct = precio && precio > 0 ? Math.round(((precio - costoEst) / precio) * 100) : null;

                return (
                  <tr key={p.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-800">{p.clientes?.nombre ?? <span className="text-zinc-400">Sin cliente</span>}</p>
                      <p className="text-[10px] text-zinc-400">{new Date(p.fecha_ingreso).toLocaleDateString("es-EC", { day: "2-digit", month: "short" })}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 text-sm">
                      {p.tipo_tablero}{p.marca_melamina && <span className="text-zinc-400"> · {p.marca_melamina}</span>}
                    </td>
                    <td className="px-4 py-3 text-center text-zinc-700 font-medium">{p.cant_planchas}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: (ESTADO_COLOR[p.estado] ?? "#6b7280") + "20", color: ESTADO_COLOR[p.estado] ?? "#6b7280" }}>
                        {p.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-500 text-xs">
                      {costoPlanche > 0 ? fmt(costoEst) : <span className="text-zinc-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {canEdit
                        ? <PrecioInput pedidoId={p.id} inicial={p.precio_venta} />
                        : <span className="font-semibold text-zinc-800">{precio !== null ? fmt(precio) : <span className="text-zinc-300">—</span>}</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {margenPed !== null ? (
                        <div>
                          <span className="font-bold text-sm" style={{ color: margenPed >= 0 ? "#10b981" : "#ef4444" }}>{fmt(margenPed)}</span>
                          {margenPct !== null && <p className="text-[10px]" style={{ color: margenPed >= 0 ? "#10b981" : "#ef4444" }}>{margenPct}%</p>}
                        </div>
                      ) : <span className="text-zinc-300">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {pedidosFiltrados.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-zinc-200 bg-zinc-50 font-semibold text-sm">
                  <td colSpan={4} className="px-4 py-3 text-zinc-400 text-xs uppercase tracking-wide">Totales del período</td>
                  <td className="px-4 py-3 text-right text-zinc-600">{fmt(costoTotal)}</td>
                  <td className="px-4 py-3 text-right text-zinc-800 font-bold">{fmt(ingresos)}</td>
                  <td className="px-4 py-3 text-right font-bold" style={{ color: margen >= 0 ? "#10b981" : "#ef4444" }}>{fmt(margen)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 bg-zinc-50/50">
            <p className="text-xs text-zinc-400">
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, pedidosFiltrados.length)} de {pedidosFiltrados.length} pedidos
            </p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 transition-colors">
                ← Anterior
              </button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 transition-colors">
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>

      {costoPlanche === 0 && (
        <p className="mt-3 text-xs text-zinc-400 text-center">
          Configura el costo por planche en ajustes para ver el margen estimado automáticamente.
        </p>
      )}
    </div>
  );
}
