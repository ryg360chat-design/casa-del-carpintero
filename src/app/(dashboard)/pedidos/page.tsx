import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import PedidosFiltros from "@/components/PedidosFiltros";
import { limaDate, limaTime, limaStartOfToday, limaEndOfToday, TZ } from "@/lib/time";

const ESTADO_STYLE: Record<string, { bg: string; dot: string }> = {
  "En cola":       { bg: "bg-slate-100 text-slate-600 border border-slate-200", dot: "bg-slate-400" },
  "En corte":      { bg: "bg-blue-500 text-white", dot: "bg-blue-200" },
  "En tapacantos": { bg: "bg-violet-500 text-white", dot: "bg-violet-200" },
  "Listo":         { bg: "bg-emerald-500 text-white", dot: "bg-emerald-200" },
  "Vendido":       { bg: "bg-teal-600 text-white", dot: "bg-teal-200" },
  "Cancelado":     { bg: "bg-red-100 text-red-600 border border-red-200", dot: "bg-red-400" },
  "Pausado":       { bg: "bg-amber-100 text-amber-700 border border-amber-200", dot: "bg-amber-400" },
};

const EN_PRODUCCION = ["En cola", "En corte", "En tapacantos"];
const ENTREGADOS    = ["Listo", "Vendido"];

const PAGE_SIZE = 40;

// ── Helpers de fecha Lima ──────────────────────────────────────────
function hoyLima() {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ }); // "YYYY-MM-DD"
}
function ayerLima() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString("en-CA", { timeZone: TZ });
}
function fechaLimaDePedido(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ });
}
function labelDia(key: string): string {
  const hoy  = hoyLima();
  const ayer = ayerLima();
  if (key === hoy)  return "Hoy";
  if (key === ayer) return "Ayer";
  // "YYYY-MM-DD" → día legible
  const [y, m, d] = key.split("-").map(Number);
  const fecha = new Date(y, m - 1, d);
  return fecha.toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" });
}

type Pedido = Record<string, unknown>;

// ── Fila de tabla compacta ─────────────────────────────────────────
function PedidoRow({ p, num }: { p: Pedido; num: number }) {
  const estadoPedido = p.estado as string;
  const style = ESTADO_STYLE[estadoPedido];
  const entregaDate = p.fecha_entrega_estimada ? new Date(p.fecha_entrega_estimada as string) : null;
  const entrega = entregaDate ? limaDate(entregaDate, { day: "2-digit", month: "2-digit" }) : "—";
  const hora    = entregaDate ? limaTime(entregaDate) : null;
  const cliente = (p.cliente as Record<string, unknown>)?.nombre as string ?? "—";
  const clienteCodigo = (p.cliente as Record<string, unknown>)?.codigo as string | null;
  const isUrgente = p.prioridad === "urgente";

  return (
    <tr className="border-b border-zinc-50 hover:bg-zinc-50/80 transition-colors group">
      <td className="px-3 py-3 text-xs text-zinc-400 font-mono">{String(num).padStart(3, "0")}</td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-zinc-900 text-sm">{cliente}</span>
          {clienteCodigo && (
            <span className="font-mono text-[9px] font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">{clienteCodigo}</span>
          )}
          {isUrgente && (
            <span className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded" style={{ background: "linear-gradient(135deg,#f97316,#dc2626)" }}>⚡</span>
          )}
        </div>
      </td>
      <td className="hidden md:table-cell px-3 py-3 text-sm text-zinc-500">
        <span className="font-medium text-zinc-700">{p.tipo_tablero as string}</span>
        {p.marca_melamina ? <span className="text-zinc-400"> · {p.marca_melamina as string}</span> : null}
      </td>
      <td className="hidden sm:table-cell px-3 py-3 text-sm font-semibold text-zinc-700 text-center tabular-nums">{p.cant_planchas as string}</td>
      <td className="hidden sm:table-cell px-3 py-3">
        <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-2 py-1 rounded-md">{(p.maquina_asignada as string) ?? "—"}</span>
      </td>
      <td className="px-3 py-3">
        {style ? (
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${style.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
            <span className="truncate max-w-[70px] sm:max-w-none">{estadoPedido}</span>
          </span>
        ) : (
          <span className="text-xs text-zinc-500">{estadoPedido}</span>
        )}
      </td>
      <td className="px-3 py-3">
        {hora ? (
          <div>
            <p className="text-xs font-semibold text-zinc-700">{entrega}</p>
            <p className="text-[10px] text-zinc-400">{hora}</p>
          </div>
        ) : <span className="text-sm text-zinc-400">—</span>}
      </td>
      <td className="px-3 py-3">
        <Link
          href={`/pedidos/${p.id as string}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-zinc-900 transition-colors px-2 py-1.5 rounded-lg hover:bg-zinc-100"
        >
          Ver
          <svg className="transition-transform group-hover:translate-x-0.5" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </td>
    </tr>
  );
}

// ── Tabla por grupo (día) ──────────────────────────────────────────
function TablaGrupo({
  pedidos, titulo, acento, from,
}: {
  pedidos: Pedido[];
  titulo: string;
  acento: string;
  from: number;
}) {
  if (pedidos.length === 0) return null;
  return (
    <div className="mb-1">
      <div className={`px-3 py-1.5 flex items-center gap-2 border-b ${acento}`}>
        <span className="text-[10px] font-bold uppercase tracking-wider">{titulo}</span>
        <span className="text-[10px] font-semibold opacity-70">{pedidos.length} pedido{pedidos.length !== 1 ? "s" : ""}</span>
      </div>
      <table className="w-full">
        <tbody>
          {pedidos.map((p, i) => (
            <PedidoRow key={p.id as string} p={p} num={from + i + 1} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string; maquina?: string; page?: string; vista?: string }>;
}) {
  const { q, estado, maquina, page: pageParam, vista } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1"));
  const vistaActual = vista === "lista" ? "lista" : "dias"; // default: días
  const supabase = await createClient();

  const startOfToday = limaStartOfToday();
  const endOfToday   = limaEndOfToday();

  const from = (currentPage - 1) * PAGE_SIZE;
  const to   = from + PAGE_SIZE - 1;

  const busquedaSegura = q
    ? q.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9 ]/g, "").trim().slice(0, 80)
    : "";

  const [clienteMatch, { count: total }, { count: enProduccion }, { count: listosHoy }] =
    await Promise.all([
      busquedaSegura
        ? supabase.from("clientes").select("id").ilike("nombre", `%${busquedaSegura}%`).limit(100)
        : Promise.resolve({ data: null as null }),
      supabase.from("pedidos").select("*", { count: "exact", head: true }),
      supabase.from("pedidos").select("*", { count: "exact", head: true })
        .in("estado", EN_PRODUCCION),
      supabase.from("pedidos").select("*", { count: "exact", head: true })
        .in("estado", ENTREGADOS)
        .gte("updated_at", startOfToday)
        .lte("updated_at", endOfToday),
    ]);

  const clienteIds = (clienteMatch?.data ?? []).map((c: { id: string }) => c.id);

  let dataQuery = supabase
    .from("pedidos")
    .select("*, cliente:clientes(nombre, codigo)", { count: "exact" })
    .order("fecha_ingreso", { ascending: false })
    .range(from, to);

  if (estado) dataQuery = dataQuery.eq("estado", estado);
  if (maquina) dataQuery = dataQuery.eq("maquina_asignada", maquina);
  if (busquedaSegura) {
    const parts = [
      `tipo_tablero.ilike.%${busquedaSegura}%`,
      `marca_melamina.ilike.%${busquedaSegura}%`,
      ...(clienteIds.length > 0 ? [`cliente_id.in.(${clienteIds.join(",")})`] : []),
    ];
    dataQuery = dataQuery.or(parts.join(","));
  }

  const { data: pedidosFiltrados, count: filteredCount } = await dataQuery;
  const pedidos = pedidosFiltrados ?? [];
  const totalPages = Math.ceil((filteredCount ?? 0) / PAGE_SIZE);

  const buildUrl = (p: number, v?: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (estado) params.set("estado", estado);
    if (maquina) params.set("maquina", maquina);
    params.set("vista", v ?? vistaActual);
    if (p > 1) params.set("page", String(p));
    return `/pedidos?${params.toString()}`;
  };

  // ── Agrupar por día Lima ──────────────────────────────────────────
  type DayGroup = {
    key: string;
    enProduccion: Pedido[];
    entregados: Pedido[];
    otros: Pedido[];
    offset: number;
  };

  const dayMap = new Map<string, DayGroup>();
  let offsetAcum = from;

  for (const p of pedidos) {
    const fechaISO = (p.fecha_ingreso as string) ?? (p.created_at as string) ?? "";
    const dayKey = fechaISO ? fechaLimaDePedido(fechaISO) : "sin-fecha";
    if (!dayMap.has(dayKey)) {
      dayMap.set(dayKey, { key: dayKey, enProduccion: [], entregados: [], otros: [], offset: offsetAcum });
    }
    const grp = dayMap.get(dayKey)!;
    const estado = p.estado as string;
    if (EN_PRODUCCION.includes(estado))   grp.enProduccion.push(p);
    else if (ENTREGADOS.includes(estado)) grp.entregados.push(p);
    else                                   grp.otros.push(p);
    offsetAcum++;
  }

  const dayGroups = Array.from(dayMap.values());

  const hayFiltros = !!(busquedaSegura || estado || maquina);

  const TABLE_HEAD = (
    <thead>
      <tr className="border-b border-zinc-100 bg-zinc-50/40">
        {[
          { label: "#" },
          { label: "Cliente" },
          { label: "Material", cls: "hidden md:table-cell" },
          { label: "Planchas", center: true, cls: "hidden sm:table-cell" },
          { label: "Máquina", cls: "hidden sm:table-cell" },
          { label: "Estado" },
          { label: "Entrega" },
          { label: "" },
        ].map((h) => (
          <th
            key={h.label}
            className={`px-3 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap ${h.center ? "text-center" : "text-left"} ${h.cls ?? ""}`}
          >
            {h.label}
          </th>
        ))}
      </tr>
    </thead>
  );

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-5 min-h-full animate-fade-in" style={{ background: "linear-gradient(160deg, rgba(255,237,213,0.45) 0%, rgba(244,244,245,0) 30%)" }}>

      {/* Header */}
      <div className="animate-fade-in-down flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="text-xl font-bold text-zinc-900">Pedidos</h1>
          <span className="text-sm font-semibold text-zinc-400 tabular-nums">{total ?? 0} en total</span>
          {enProduccion ? (
            <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
              {enProduccion} en producción
            </span>
          ) : null}
          {listosHoy ? (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              {listosHoy} entregados hoy
            </span>
          ) : null}
        </div>

        {/* Toggle vista */}
        <div className="flex items-center gap-1 bg-zinc-100 rounded-lg p-1">
          <Link
            href={buildUrl(1, "dias")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              vistaActual === "dias" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Por día
          </Link>
          <Link
            href={buildUrl(1, "lista")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              vistaActual === "lista" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <circle cx="3" cy="6" r="1" fill="currentColor"/><circle cx="3" cy="12" r="1" fill="currentColor"/><circle cx="3" cy="18" r="1" fill="currentColor"/>
            </svg>
            Lista
          </Link>
        </div>
      </div>

      {/* Contenedor principal */}
      <div className="animate-fade-in-up delay-100 bg-white border border-zinc-200 rounded-xl overflow-hidden flex-1">

        {/* Filtros */}
        <div className="px-5 py-3.5 border-b border-zinc-100 bg-zinc-50/60">
          <Suspense fallback={null}>
            <PedidosFiltros />
          </Suspense>
        </div>

        {/* ══ VISTA: POR DÍA ══ */}
        {vistaActual === "dias" && (
          <div className="overflow-x-auto">
            {pedidos.length === 0 ? (
              <div className="text-center py-20 text-zinc-400 text-sm">
                {hayFiltros ? "Sin resultados para los filtros aplicados." : "No hay pedidos aún."}
              </div>
            ) : (
              dayGroups.map((grp) => {
                const total = grp.enProduccion.length + grp.entregados.length + grp.otros.length;
                return (
                  <div key={grp.key} className="border-b border-zinc-100 last:border-0">
                    {/* Encabezado del día */}
                    <div className="px-5 py-3 flex items-center justify-between bg-zinc-50/80 border-b border-zinc-100 sticky top-0 z-10">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-zinc-900 capitalize">{labelDia(grp.key)}</span>
                        <span className="text-xs text-zinc-400 font-mono">{grp.key}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {grp.enProduccion.length > 0 && (
                          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                            {grp.enProduccion.length} en producción
                          </span>
                        )}
                        {grp.entregados.length > 0 && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            {grp.entregados.length} entregados
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-400">{total} total</span>
                      </div>
                    </div>

                    {/* Tabla del día */}
                    <table className="w-full">
                      {TABLE_HEAD}
                      <tbody>
                        {/* En producción primero */}
                        {grp.enProduccion.length > 0 && (
                          <tr>
                            <td colSpan={8} className="px-3 pt-2 pb-0">
                              <span className="inline-block text-[9px] font-bold uppercase tracking-widest text-orange-500 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                                En producción
                              </span>
                            </td>
                          </tr>
                        )}
                        {grp.enProduccion.map((p, i) => (
                          <PedidoRow key={p.id as string} p={p} num={grp.offset + i + 1} />
                        ))}

                        {/* Entregados */}
                        {grp.entregados.length > 0 && (
                          <tr>
                            <td colSpan={8} className={`px-3 pt-${grp.enProduccion.length > 0 ? "3" : "2"} pb-0`}>
                              <span className="inline-block text-[9px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                Entregados
                              </span>
                            </td>
                          </tr>
                        )}
                        {grp.entregados.map((p, i) => (
                          <PedidoRow key={p.id as string} p={p} num={grp.offset + grp.enProduccion.length + i + 1} />
                        ))}

                        {/* Otros (cancelado, pausado) */}
                        {grp.otros.map((p, i) => (
                          <PedidoRow key={p.id as string} p={p} num={grp.offset + grp.enProduccion.length + grp.entregados.length + i + 1} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ══ VISTA: LISTA CLÁSICA ══ */}
        {vistaActual === "lista" && (
          <div className="overflow-x-auto">
            <table className="w-full">
              {TABLE_HEAD}
              <tbody>
                {pedidos.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-20 text-zinc-400 text-sm">
                      {hayFiltros ? "Sin resultados para los filtros aplicados." : (
                        <span>No hay pedidos aún.{" "}<Link href="/pedidos/nuevo" className="text-zinc-900 font-semibold underline underline-offset-2">Crear el primero</Link></span>
                      )}
                    </td>
                  </tr>
                )}
                {pedidos.map((p: Pedido, i: number) => (
                  <PedidoRow key={p.id as string} p={p} num={from + i + 1} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer paginación */}
        <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <p className="text-xs text-zinc-400">
            {pedidos.length > 0
              ? `${from + 1}–${from + pedidos.length} de ${filteredCount ?? "?"} pedidos`
              : "Sin resultados"}
            {hayFiltros ? " · filtrado" : ""}
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Link
                href={buildUrl(currentPage - 1)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs transition-all ${
                  currentPage <= 1 ? "text-zinc-300 pointer-events-none" : "text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
              </Link>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === "..." ? (
                    <span key={`dots-${idx}`} className="w-7 h-7 flex items-center justify-center text-xs text-zinc-400">…</span>
                  ) : (
                    <Link
                      key={p}
                      href={buildUrl(p as number)}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                        p === currentPage ? "text-white" : "text-zinc-600 hover:bg-zinc-200"
                      }`}
                      style={p === currentPage ? { background: "#1957A6" } : {}}
                    >
                      {p}
                    </Link>
                  )
                )}

              <Link
                href={buildUrl(currentPage + 1)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs transition-all ${
                  currentPage >= totalPages ? "text-zinc-300 pointer-events-none" : "text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
