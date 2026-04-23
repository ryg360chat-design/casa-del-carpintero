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
  "Despachado":    { bg: "bg-teal-600 text-white", dot: "bg-teal-200" },
  "Vendido":       { bg: "bg-teal-600 text-white", dot: "bg-teal-200" },
  "Cancelado":     { bg: "bg-red-100 text-red-600 border border-red-200", dot: "bg-red-400" },
  "Pausado":       { bg: "bg-amber-100 text-amber-700 border border-amber-200", dot: "bg-amber-400" },
};

const EN_PRODUCCION = ["En cola", "En corte", "En tapacantos"];
const ENTREGADOS    = ["Listo", "Despachado", "Vendido"];
const PAGE_SIZE = 40;

// ── Helpers Lima ──────────────────────────────────────────────────
function hoyLima() {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}
function fechaLimaDePedido(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ });
}
/** Añade días a una fecha YYYY-MM-DD y devuelve YYYY-MM-DD */
function addDays(dateKey: string, n: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + n);
  return date.toLocaleDateString("en-CA");
}
function labelDiaCorto(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const fecha = new Date(y, m - 1, d);
  return fecha.toLocaleDateString("es", { weekday: "short" });
}
function labelDia(key: string): string {
  const hoy  = hoyLima();
  const ayer = addDays(hoy, -1);
  if (key === hoy)  return "Hoy";
  if (key === ayer) return "Ayer";
  const [y, m, d] = key.split("-").map(Number);
  const fecha = new Date(y, m - 1, d);
  return fecha.toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" });
}
function mesAnio(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const fecha = new Date(y, m - 1, d);
  return fecha.toLocaleDateString("es", { month: "long", year: "numeric" });
}

type Pedido = Record<string, unknown>;

// ── Fila de tabla ─────────────────────────────────────────────────
function PedidoRow({ p, num }: { p: Pedido; num: number }) {
  const estadoPedido = p.estado as string;
  const style = ESTADO_STYLE[estadoPedido];
  const entregaDate = p.fecha_entrega_estimada ? new Date(p.fecha_entrega_estimada as string) : null;
  const entrega = entregaDate ? limaDate(entregaDate, { day: "2-digit", month: "2-digit" }) : "—";
  const hora    = entregaDate ? limaTime(entregaDate) : null;
  const cliente = (p.cliente as Record<string, unknown>)?.nombre as string ?? "—";
  const clienteCodigo  = (p.cliente as Record<string, unknown>)?.codigo as string | null;
  const numeroBoleta   = p.numero_boleta as string | null;
  const codigoDisplay  = numeroBoleta || clienteCodigo;
  const esBoleta       = !!numeroBoleta;
  const isUrgente = p.prioridad === "urgente";

  return (
    <tr className="border-b border-zinc-50 hover:bg-zinc-50/80 transition-colors group">
      <td className="px-3 py-3 text-xs text-zinc-400 font-mono">{String(num).padStart(3, "0")}</td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-zinc-900 text-sm">{cliente}</span>
          {codigoDisplay && (
            <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded ${esBoleta ? "text-blue-700 bg-blue-50" : "text-zinc-400 bg-zinc-100"}`}>
              {codigoDisplay}
            </span>
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

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string; maquina?: string; page?: string; vista?: string; dia?: string; semana?: string; diaPage?: string }>;
}) {
  const { q, estado, maquina, page: pageParam, vista, dia, semana, diaPage: diaPageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1"));
  const vistaActual = vista === "lista" ? "lista" : "dias";
  const DIA_PAGE_SIZE = 10;
  const diaCurrentPage = Math.max(1, parseInt(diaPageParam ?? "1"));
  const diaFrom = (diaCurrentPage - 1) * DIA_PAGE_SIZE;
  const diaTo = diaFrom + DIA_PAGE_SIZE - 1;
  const supabase = await createClient();

  const startOfToday = limaStartOfToday();
  const endOfToday   = limaEndOfToday();
  const hoy = hoyLima();

  // Día seleccionado (vista por día)
  const diaSeleccionado = (dia && /^\d{4}-\d{2}-\d{2}$/.test(dia)) ? dia : hoy;

  // Semana: lunes de la semana mostrada
  const semanaBase = (semana && /^\d{4}-\d{2}-\d{2}$/.test(semana)) ? semana : (() => {
    // calcular lunes de la semana del día seleccionado
    const [y, m, d] = diaSeleccionado.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const dow = date.getDay(); // 0=dom
    const diff = dow === 0 ? -6 : 1 - dow;
    date.setDate(date.getDate() + diff);
    return date.toLocaleDateString("en-CA");
  })();

  // Los 7 días de la semana
  const diasSemana = Array.from({ length: 7 }, (_, i) => addDays(semanaBase, i));

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
      supabase.from("pedidos").select("*", { count: "exact", head: true }).in("estado", EN_PRODUCCION),
      supabase.from("pedidos").select("*", { count: "exact", head: true })
        .in("estado", ENTREGADOS)
        .gte("updated_at", startOfToday)
        .lte("updated_at", endOfToday),
    ]);

  const clienteIds = (clienteMatch?.data ?? []).map((c: { id: string }) => c.id);

  // ── Query principal ────────────────────────────────────────────
  // En vista días: filtrar por fecha_ingreso del día seleccionado
  const diaStart = `${diaSeleccionado}T00:00:00-05:00`;
  const diaEnd   = `${diaSeleccionado}T23:59:59-05:00`;

  let dataQuery = supabase
    .from("pedidos")
    .select("*, cliente:clientes(nombre, codigo)", { count: "exact" })
    .order("fecha_ingreso", { ascending: false });

  if (vistaActual === "dias") {
    // Solo pedidos del día seleccionado
    dataQuery = dataQuery
      .gte("fecha_ingreso", diaStart)
      .lte("fecha_ingreso", diaEnd)
      .range(diaFrom, diaTo);
  } else {
    dataQuery = dataQuery.range(from, to);
  }

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
  const diaTotalPages = Math.ceil((filteredCount ?? 0) / DIA_PAGE_SIZE);

  // Conteo por día de la semana (para los puntos del selector)
  const { data: pedidosSemana } = await supabase
    .from("pedidos")
    .select("fecha_ingreso, estado")
    .gte("fecha_ingreso", `${semanaBase}T00:00:00-05:00`)
    .lte("fecha_ingreso", `${addDays(semanaBase, 6)}T23:59:59-05:00`);

  const conteoSemana: Record<string, { prod: number; ent: number; total: number }> = {};
  for (const p of pedidosSemana ?? []) {
    const key = fechaLimaDePedido(p.fecha_ingreso as string);
    if (!conteoSemana[key]) conteoSemana[key] = { prod: 0, ent: 0, total: 0 };
    conteoSemana[key]!.total++;
    if (EN_PRODUCCION.includes(p.estado as string)) conteoSemana[key]!.prod++;
    if (ENTREGADOS.includes(p.estado as string))    conteoSemana[key]!.ent++;
  }

  // Separar pedidos del día en grupos
  const enProd = pedidos.filter((p: Pedido) => EN_PRODUCCION.includes(p.estado as string));
  const entregados = pedidos.filter((p: Pedido) => ENTREGADOS.includes(p.estado as string));
  const otros = pedidos.filter((p: Pedido) => !EN_PRODUCCION.includes(p.estado as string) && !ENTREGADOS.includes(p.estado as string));

  const buildUrl = (params: Record<string, string>) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (estado) p.set("estado", estado);
    if (maquina) p.set("maquina", maquina);
    p.set("vista", params.vista ?? vistaActual);
    if (params.dia) p.set("dia", params.dia);
    if (params.semana) p.set("semana", params.semana);
    if (params.page && params.page !== "1") p.set("page", params.page);
    if (params.diaPage && params.diaPage !== "1") p.set("diaPage", params.diaPage);
    return `/pedidos?${p.toString()}`;
  };

  const hayFiltros = !!(busquedaSegura || estado || maquina);

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
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              {listosHoy} entregados hoy
            </span>
          ) : null}
        </div>

        {/* Toggle vista */}
        <div className="flex items-center gap-1 bg-zinc-100 rounded-lg p-1">
          <Link
            href={buildUrl({ vista: "dias", dia: diaSeleccionado, semana: semanaBase })}
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
            href={buildUrl({ vista: "lista" })}
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

      {/* ══ VISTA: POR DÍA ══ */}
      {vistaActual === "dias" && (
        <>
          {/* Navegador de semana — como el calendario */}
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            {/* Header semana con navegación */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 bg-zinc-50/60">
              <Link
                href={buildUrl({ vista: "dias", dia: addDays(semanaBase, -7), semana: addDays(semanaBase, -7) })}
                className="flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-900 px-2 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
                Anterior
              </Link>
              <span className="text-sm font-bold text-zinc-900 capitalize">{mesAnio(semanaBase)}</span>
              <Link
                href={buildUrl({ vista: "dias", dia: addDays(semanaBase, 7), semana: addDays(semanaBase, 7) })}
                className="flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-900 px-2 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                Siguiente
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
              </Link>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7">
              {diasSemana.map((dayKey) => {
                const isSelected = dayKey === diaSeleccionado;
                const isHoy = dayKey === hoy;
                const conteo = conteoSemana[dayKey];
                const [, , d] = dayKey.split("-");
                return (
                  <Link
                    key={dayKey}
                    href={buildUrl({ vista: "dias", dia: dayKey, semana: semanaBase })}
                    className={`flex flex-col items-center py-3 gap-1 border-r border-zinc-100 last:border-0 transition-colors relative ${
                      isSelected
                        ? "bg-zinc-900 text-white"
                        : "hover:bg-zinc-50 text-zinc-600"
                    }`}
                  >
                    <span className={`text-[10px] font-semibold uppercase tracking-wide ${isSelected ? "text-zinc-400" : "text-zinc-400"}`}>
                      {labelDiaCorto(dayKey)}
                    </span>
                    <span className={`text-base font-bold leading-none ${isHoy && !isSelected ? "text-blue-600" : ""}`}>
                      {d!.replace(/^0/, "")}
                    </span>
                    {/* Puntos indicadores */}
                    {conteo && conteo.total > 0 ? (
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {conteo.prod > 0 && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-orange-400" : "bg-orange-400"}`} />
                        )}
                        {conteo.ent > 0 && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-emerald-400" : "bg-emerald-500"}`} />
                        )}
                        {conteo.total > 0 && (
                          <span className={`text-[9px] font-bold ml-0.5 ${isSelected ? "text-zinc-400" : "text-zinc-400"}`}>
                            {conteo.total}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="h-3.5" />
                    )}
                    {isHoy && (
                      <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase tracking-wide ${isSelected ? "text-zinc-500" : "text-blue-500"}`}>
                        hoy
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Contenido del día seleccionado */}
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden flex-1">
            {/* Header del día */}
            <div className="px-5 py-3 flex items-center justify-between border-b border-zinc-100 bg-zinc-50/60">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-zinc-900 capitalize">{labelDia(diaSeleccionado)}</span>
                <span className="text-xs text-zinc-400 font-mono">{diaSeleccionado}</span>
              </div>
              <div className="flex items-center gap-2">
                {enProd.length > 0 && (
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                    {enProd.length} en producción
                  </span>
                )}
                {entregados.length > 0 && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {entregados.length} entregados
                  </span>
                )}
                {pedidos.length > 0 && (
                  <span className="text-[10px] text-zinc-400">{pedidos.length} total</span>
                )}
              </div>
            </div>

            {/* Filtros */}
            <div className="px-5 py-3 border-b border-zinc-100">
              <Suspense fallback={null}>
                <PedidosFiltros />
              </Suspense>
            </div>

            {pedidos.length === 0 ? (
              <div className="text-center py-20 text-zinc-400 text-sm">
                <svg className="mx-auto mb-3 text-zinc-300" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                {hayFiltros ? "Sin resultados para los filtros aplicados." : "No hay pedidos registrados este día."}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    {TABLE_HEAD}
                    <tbody>
                      {/* En producción */}
                      {enProd.length > 0 && (
                        <tr>
                          <td colSpan={8} className="px-3 pt-3 pb-1">
                            <span className="inline-block text-[9px] font-bold uppercase tracking-widest text-orange-500 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                              En producción
                            </span>
                          </td>
                        </tr>
                      )}
                      {enProd.map((p: Pedido, i: number) => (
                        <PedidoRow key={p.id as string} p={p} num={diaFrom + i + 1} />
                      ))}
                      {/* Entregados */}
                      {entregados.length > 0 && (
                        <tr>
                          <td colSpan={8} className="px-3 pt-3 pb-1">
                            <span className="inline-block text-[9px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              Entregados
                            </span>
                          </td>
                        </tr>
                      )}
                      {entregados.map((p: Pedido, i: number) => (
                        <PedidoRow key={p.id as string} p={p} num={diaFrom + enProd.length + i + 1} />
                      ))}
                      {/* Otros */}
                      {otros.map((p: Pedido, i: number) => (
                        <PedidoRow key={p.id as string} p={p} num={diaFrom + enProd.length + entregados.length + i + 1} />
                      ))}
                    </tbody>
                  </table>
                </div>
                {diaTotalPages > 1 && (
                  <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                    <p className="text-xs text-zinc-400">
                      {diaFrom + 1}–{diaFrom + pedidos.length} de {filteredCount ?? "?"} pedidos
                    </p>
                    <div className="flex items-center gap-1">
                      <Link
                        href={buildUrl({ vista: "dias", dia: diaSeleccionado, semana: semanaBase, diaPage: String(diaCurrentPage - 1) })}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs transition-all ${diaCurrentPage <= 1 ? "text-zinc-300 pointer-events-none" : "text-zinc-600 hover:bg-zinc-200"}`}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
                      </Link>
                      <span className="text-xs font-semibold text-zinc-600 px-2">{diaCurrentPage} / {diaTotalPages}</span>
                      <Link
                        href={buildUrl({ vista: "dias", dia: diaSeleccionado, semana: semanaBase, diaPage: String(diaCurrentPage + 1) })}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs transition-all ${diaCurrentPage >= diaTotalPages ? "text-zinc-300 pointer-events-none" : "text-zinc-600 hover:bg-zinc-200"}`}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* ══ VISTA: LISTA CLÁSICA ══ */}
      {vistaActual === "lista" && (
        <div className="animate-fade-in-up delay-100 bg-white border border-zinc-200 rounded-xl overflow-hidden flex-1">
          <div className="px-5 py-3.5 border-b border-zinc-100 bg-zinc-50/60">
            <Suspense fallback={null}>
              <PedidosFiltros />
            </Suspense>
          </div>
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
          {/* Paginación solo en lista */}
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
                  href={buildUrl({ vista: "lista", page: String(currentPage - 1) })}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs transition-all ${currentPage <= 1 ? "text-zinc-300 pointer-events-none" : "text-zinc-600 hover:bg-zinc-200"}`}
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
                        href={buildUrl({ vista: "lista", page: String(p) })}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${p === currentPage ? "text-white" : "text-zinc-600 hover:bg-zinc-200"}`}
                        style={p === currentPage ? { background: "#1957A6" } : {}}
                      >
                        {p}
                      </Link>
                    )
                  )}
                <Link
                  href={buildUrl({ vista: "lista", page: String(currentPage + 1) })}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs transition-all ${currentPage >= totalPages ? "text-zinc-300 pointer-events-none" : "text-zinc-600 hover:bg-zinc-200"}`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
