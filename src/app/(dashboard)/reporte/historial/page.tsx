import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { limaDate } from "@/lib/time";

const PAGE_SIZE = 20;

export default async function ReporteHistorialPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1"));
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const { data: reportes, count } = await supabase
    .from("reportes_guardados")
    .select("id, fecha, stats, created_at", { count: "exact" })
    .order("fecha", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/reporte/historial${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/reporte" className="text-xs text-zinc-400 font-medium hover:text-zinc-700 transition-colors">
              Reporte
            </Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
            <span className="text-xs font-semibold text-zinc-700">Historial</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Historial de Reportes</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{count ?? 0} reportes guardados</p>
        </div>
        <Link
          href="/reporte"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Volver al reporte
        </Link>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
        {(reportes ?? []).length === 0 ? (
          <div className="py-20 text-center text-zinc-400 text-sm">
            <svg className="mx-auto mb-3 text-zinc-300" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            No hay reportes guardados aún.<br />
            <span className="text-xs mt-1 inline-block">Ve a <Link href="/reporte" className="underline font-medium">Reporte</Link> y haz clic en "Guardar reporte" al final del día.</span>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50">
                  {["Fecha", "Ingresados", "En cola", "En corte", "Listos", "Cancelados", "Planchas", "Piezas", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider last:text-right">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(reportes ?? []).map((r: Record<string, unknown>, idx: number) => {
                  const s = r.stats as Record<string, number>;
                  const fechaStr = limaDate(r.fecha as string + "T12:00:00", {
                    weekday: "long", day: "numeric", month: "long", year: "numeric",
                  });
                  const fechaParam = r.fecha as string; // YYYY-MM-DD
                  return (
                    <tr key={r.id as string} className={`border-b border-zinc-50 last:border-0 ${idx % 2 === 0 ? "bg-white" : "bg-zinc-50/40"} hover:bg-zinc-50 transition-colors`}>
                      <td className="px-4 py-3.5 font-semibold text-zinc-800 capitalize text-xs">{fechaStr}</td>
                      <td className="px-4 py-3.5 font-bold text-zinc-900">{s.pedidosHoy ?? 0}</td>
                      <td className="px-4 py-3.5 text-orange-600 font-semibold">{s.enCola ?? 0}</td>
                      <td className="px-4 py-3.5 text-zinc-600 font-semibold">{s.enCorte ?? 0}</td>
                      <td className="px-4 py-3.5 text-emerald-600 font-semibold">{s.listos ?? 0}</td>
                      <td className="px-4 py-3.5 text-red-500 font-semibold">{s.cancelados ?? 0}</td>
                      <td className="px-4 py-3.5 text-zinc-600">{(s.totalPlanchas ?? 0).toFixed(1)}</td>
                      <td className="px-4 py-3.5 text-zinc-600">{s.totalPiezas ?? 0}</td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/reporte-pdf?fecha=${fechaParam}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 6 2 18 2 18 9"/>
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                            <rect width="12" height="8" x="6" y="14"/>
                          </svg>
                          Ver PDF
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                <p className="text-xs text-zinc-400">
                  {from + 1}–{from + (reportes?.length ?? 0)} de {count} reportes
                </p>
                <div className="flex items-center gap-1">
                  <Link href={buildUrl(currentPage - 1)} className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs transition-all ${currentPage <= 1 ? "text-zinc-300 pointer-events-none" : "text-zinc-600 hover:bg-zinc-200"}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
                  </Link>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link key={p} href={buildUrl(p)} className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${p === currentPage ? "text-white" : "text-zinc-600 hover:bg-zinc-200"}`} style={p === currentPage ? { background: "#f97316" } : {}}>
                      {p}
                    </Link>
                  ))}
                  <Link href={buildUrl(currentPage + 1)} className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs transition-all ${currentPage >= totalPages ? "text-zinc-300 pointer-events-none" : "text-zinc-600 hover:bg-zinc-200"}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
