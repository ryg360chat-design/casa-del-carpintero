import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import PedidosFiltros from "@/components/PedidosFiltros";
import { limaDate, limaTime } from "@/lib/time";

const ESTADO_STYLE: Record<string, { bg: string; dot: string }> = {
  "En cola":       { bg: "bg-slate-100 text-slate-600 border border-slate-200", dot: "bg-slate-400" },
  "En corte":      { bg: "bg-blue-500 text-white", dot: "bg-blue-200" },
  "En tapacantos": { bg: "bg-violet-500 text-white", dot: "bg-violet-200" },
  "Listo":         { bg: "bg-emerald-500 text-white", dot: "bg-emerald-200" },
  "Cancelado":     { bg: "bg-red-100 text-red-600 border border-red-200", dot: "bg-red-400" },
  "Pausado":       { bg: "bg-amber-100 text-amber-700 border border-amber-200", dot: "bg-amber-400" },
};

const PAGE_SIZE = 15;

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string; maquina?: string; page?: string }>;
}) {
  const { q, estado, maquina, page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1"));
  const supabase = await createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Build data query
  let dataQuery = supabase
    .from("pedidos")
    .select("*, cliente:clientes(nombre, codigo)", { count: "exact" })
    .order("fecha_ingreso", { ascending: false })
    .range(from, to);
  if (estado) dataQuery = dataQuery.eq("estado", estado);
  if (maquina) dataQuery = dataQuery.eq("maquina_asignada", maquina);

  const [
    { data: pedidosRaw, count: filteredCount },
    { count: total },
    { count: enProduccion },
    { count: listosHoy },
  ] = await Promise.all([
    dataQuery,
    supabase.from("pedidos").select("*", { count: "exact", head: true }),
    supabase.from("pedidos").select("*", { count: "exact", head: true })
      .in("estado", ["En cola", "En corte", "En tapacantos"]),
    supabase.from("pedidos").select("*", { count: "exact", head: true })
      .eq("estado", "Listo")
      .gte("updated_at", today.toISOString())
      .lt("updated_at", tomorrow.toISOString()),
  ]).catch(() => [
    { data: [], count: 0 },
    { count: 0 },
    { count: 0 },
    { count: 0 },
  ] as const);

  const busqueda = q?.toLowerCase().trim() ?? "";
  const pedidosFiltrados = busqueda
    ? (pedidosRaw ?? []).filter((p: Record<string, unknown>) => {
        const nombreCliente = ((p.cliente as Record<string, unknown>)?.nombre as string ?? "").toLowerCase();
        const material = `${p.tipo_tablero} ${p.marca_melamina}`.toLowerCase();
        return nombreCliente.includes(busqueda) || material.includes(busqueda);
      })
    : (pedidosRaw ?? []);

  const totalPages = Math.ceil((filteredCount ?? 0) / PAGE_SIZE);

  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (estado) params.set("estado", estado);
    if (maquina) params.set("maquina", maquina);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/pedidos${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="p-6 flex flex-col gap-5 min-h-full animate-fade-in" style={{ background: "linear-gradient(160deg, rgba(255,237,213,0.45) 0%, rgba(244,244,245,0) 30%)" }}>
      {/* Header row with inline count */}
      <div className="animate-fade-in-down flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-bold text-zinc-900">Pedidos</h1>
          <span className="text-sm font-semibold text-zinc-400 tabular-nums">{total ?? 0} en total</span>
          {enProduccion ? <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">{enProduccion} en producción</span> : null}
        </div>
        <div className="flex items-center gap-2">
          {listosHoy ? <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">{listosHoy} listos hoy</span> : null}
        </div>
      </div>

      {/* Table */}
      <div className="animate-fade-in-up delay-100 bg-white border border-zinc-200 rounded-xl overflow-hidden flex-1">
        {/* Filters */}
        <div className="px-5 py-3.5 border-b border-zinc-100 bg-zinc-50/60">
          <Suspense fallback={null}>
            <PedidosFiltros />
          </Suspense>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/40">
                {[
                  { label: "#", cls: "" },
                  { label: "Cliente", cls: "" },
                  { label: "Material", cls: "hidden md:table-cell" },
                  { label: "Planchas", center: true, cls: "hidden sm:table-cell" },
                  { label: "Piezas", center: true, cls: "hidden sm:table-cell" },
                  { label: "Máquina", cls: "hidden sm:table-cell" },
                  { label: "Estado", cls: "" },
                  { label: "Entrega", cls: "" },
                  { label: "", cls: "" },
                ].map((h) => (
                  <th
                    key={h.label}
                    className={`px-3 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap ${h.center ? "text-center" : "text-left"} ${h.cls}`}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-20 text-zinc-400 text-sm">
                    <svg className="mx-auto mb-3 text-zinc-300" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                      <rect width="6" height="4" x="9" y="3" rx="1"/>
                      <path d="M9 12h6M9 16h4"/>
                    </svg>
                    {busqueda || estado || maquina
                      ? "Sin resultados para los filtros aplicados."
                      : <span>No hay pedidos aún.{" "}<Link href="/pedidos/nuevo" className="text-zinc-900 font-semibold underline underline-offset-2">Crear el primero</Link></span>
                    }
                  </td>
                </tr>
              )}
              {pedidosFiltrados.map((p: Record<string, unknown>, i: number) => {
                const estadoPedido = p.estado as string;
                const style = ESTADO_STYLE[estadoPedido];
                const entregaDate = p.fecha_entrega_estimada ? new Date(p.fecha_entrega_estimada as string) : null;
                const entrega = entregaDate ? limaDate(entregaDate, { day: "2-digit", month: "2-digit" }) : "—";
                const hora = entregaDate ? limaTime(entregaDate) : null;
                const numero = String(from + i + 101).padStart(3, "0");
                const cliente = (p.cliente as Record<string, unknown>)?.nombre as string ?? "—";
                const clienteCodigo = (p.cliente as Record<string, unknown>)?.codigo as string | null;
                const isUrgente = p.prioridad === "urgente";

                return (
                  <tr key={p.id as string} className="border-b border-zinc-50 hover:bg-zinc-50/80 transition-colors group">
                    <td className="px-3 py-3.5 text-xs text-zinc-400 font-mono">{numero}</td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-zinc-900 text-sm">{cliente}</span>
                        {clienteCodigo && (
                          <span className="font-mono text-[9px] font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">{clienteCodigo}</span>
                        )}
                        {isUrgente && (
                          <span className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded tracking-wide" style={{ background: "linear-gradient(135deg,#f97316,#dc2626)" }}>⚡</span>
                        )}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-3 py-3.5 text-sm text-zinc-500">
                      <span className="font-medium text-zinc-700">{p.tipo_tablero as string}</span>
                      {p.marca_melamina ? <span className="text-zinc-400"> · {p.marca_melamina as string}</span> : null}
                    </td>
                    <td className="hidden sm:table-cell px-3 py-3.5 text-sm font-semibold text-zinc-700 text-center tabular-nums">{p.cant_planchas as string}</td>
                    <td className="hidden sm:table-cell px-3 py-3.5 text-sm font-semibold text-zinc-700 text-center tabular-nums">{p.cant_piezas as string}</td>
                    <td className="hidden sm:table-cell px-3 py-3.5">
                      <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-2 py-1 rounded-md">{(p.maquina_asignada as string) ?? "—"}</span>
                    </td>
                    <td className="px-3 py-3.5">
                      {style ? (
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${style.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
                          <span className="truncate max-w-[70px] sm:max-w-none">{estadoPedido}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-500">{estadoPedido}</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5">
                      {hora ? (
                        <div>
                          <p className="text-xs font-semibold text-zinc-700">{entrega}</p>
                          <p className="text-[10px] text-zinc-400">{hora}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5">
                      <Link
                        href={`/pedidos/${p.id as string}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-zinc-900 transition-colors group-hover:text-zinc-600 px-2 py-1.5 rounded-lg hover:bg-zinc-100"
                      >
                        Ver
                        <svg className="transition-transform group-hover:translate-x-0.5" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer: count + pagination */}
        <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <p className="text-xs text-zinc-400">
            {pedidosFiltrados.length > 0
              ? `${from + 1}–${from + pedidosFiltrados.length} de ${filteredCount ?? "?"} pedidos`
              : "Sin resultados"}
            {(busqueda || estado || maquina) ? " · filtrado" : ""}
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Link
                href={buildUrl(currentPage - 1)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs transition-all ${
                  currentPage <= 1
                    ? "text-zinc-300 pointer-events-none"
                    : "text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
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
                        p === currentPage
                          ? "text-white"
                          : "text-zinc-600 hover:bg-zinc-200"
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
                  currentPage >= totalPages
                    ? "text-zinc-300 pointer-events-none"
                    : "text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
