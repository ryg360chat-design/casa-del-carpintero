import { createClient } from "@/lib/supabase/server";
import ImprimirBtn from "@/components/ImprimirBtn";
import GuardarReporteBtn from "@/components/GuardarReporteBtn";
import { limaTime, limaDate } from "@/lib/time";
import Link from "next/link";

const ESTADO_LABEL: Record<string, string> = {
  "En cola":       "En Cola",
  "En corte":      "En Corte",
  "En tapacantos": "En Tapacantos",
  "Listo":         "Listo",
  "Cancelado":     "Cancelado",
  "Pausado":       "Pausado",
};

export default async function ReportePage() {
  const supabase = await createClient();

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);

  const [
    { data: pedidosHoy },
    { data: todosActivos },
    { count: enCola },
    { count: enCorte },
    { count: enTapacantos },
    { count: listos },
    { count: cancelados },
  ] = await Promise.all([
    supabase
      .from("pedidos")
      .select("*, cliente:clientes(nombre, telefono)")
      .gte("created_at", hoy.toISOString())
      .lt("created_at", manana.toISOString())
      .order("prioridad", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("pedidos")
      .select("*, cliente:clientes(nombre)")
      .not("estado", "in", '("Listo","Cancelado")')
      .order("prioridad", { ascending: true })
      .order("fecha_ingreso", { ascending: true }),
    supabase.from("pedidos").select("*", { count: "exact", head: true }).eq("estado", "En cola"),
    supabase.from("pedidos").select("*", { count: "exact", head: true }).eq("estado", "En corte"),
    supabase.from("pedidos").select("*", { count: "exact", head: true }).eq("estado", "En tapacantos"),
    supabase.from("pedidos").select("*", { count: "exact", head: true }).eq("estado", "Listo").gte("updated_at", hoy.toISOString()),
    supabase.from("pedidos").select("*", { count: "exact", head: true }).eq("estado", "Cancelado").gte("updated_at", hoy.toISOString()),
  ]);

  const fechaHoy = hoy.toLocaleDateString("es", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const horaGenera = limaTime(new Date());

  const totalPlanchas = (pedidosHoy ?? []).reduce((acc: number, p: Record<string, unknown>) => acc + (p.cant_planchas as number ?? 0), 0);
  const totalPiezas = (pedidosHoy ?? []).reduce((acc: number, p: Record<string, unknown>) => acc + (p.cant_piezas as number ?? 0), 0);
  const totalMetros = (pedidosHoy ?? []).reduce((acc: number, p: Record<string, unknown>) => acc + ((p.metros_canto as number) ?? 0), 0);

  const statsHoy = {
    pedidosHoy: pedidosHoy?.length ?? 0,
    enCola: enCola ?? 0,
    enCorte: enCorte ?? 0,
    enTapacantos: enTapacantos ?? 0,
    listos: listos ?? 0,
    cancelados: cancelados ?? 0,
    totalPlanchas,
    totalPiezas,
    totalMetros,
  };

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          @page { margin: 20mm; size: A4; }
        }
      `}</style>

      <div className="p-8 max-w-5xl mx-auto animate-fade-in" style={{ background: "linear-gradient(160deg, rgba(219,234,254,0.3) 0%, rgba(244,244,245,0) 30%)" }}>

        {/* Toolbar (se oculta en PDF) */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Reporte Diario</h1>
            <p className="text-zinc-500 text-sm mt-0.5 capitalize">{fechaHoy}</p>
          </div>
          <div className="flex items-center gap-2">
            <GuardarReporteBtn stats={statsHoy} />
            <Link
              href="/reporte/historial"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/>
              </svg>
              Ver historial
            </Link>
            <ImprimirBtn />
          </div>
        </div>

        {/* ── ENCABEZADO DEL REPORTE (visible en PDF) ── */}
        <div className="bg-zinc-900 text-white rounded-2xl p-8 mb-6 relative overflow-hidden print:rounded-none print:mb-4">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #f97316, transparent 70%)", transform: "translate(30%, -30%)" }} />
          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-white text-base leading-tight">Casa del Carpintero</p>
                    <p className="text-[11px] text-orange-400">RyG SaaS · Reporte de producción</p>
                  </div>
                </div>
              </div>
              <div className="text-right text-sm text-zinc-400">
                <p className="capitalize font-medium text-white">{fechaHoy}</p>
                <p>Generado: {horaGenera}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4">
              {[
                { label: "Hoy", value: pedidosHoy?.length ?? 0, color: "text-blue-400" },
                { label: "En cola", value: enCola ?? 0, color: "text-orange-400" },
                { label: "En corte", value: enCorte ?? 0, color: "text-zinc-300" },
                { label: "Listos", value: listos ?? 0, color: "text-emerald-400" },
                { label: "Cancelados", value: cancelados ?? 0, color: "text-red-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white/10 rounded-xl p-3 sm:p-4 text-center">
                  <p className={`text-2xl sm:text-3xl font-bold ${color}`}>{value}</p>
                  <p className="text-[10px] sm:text-xs text-zinc-400 mt-1 font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resumen de volumen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[
            {
              label: "Total planchas hoy",
              value: totalPlanchas.toFixed(1),
              icon: "M4 7h16M4 12h16M4 17h10",
              color: "rgba(59,130,246,0.1)",
              iconColor: "#3b82f6",
            },
            {
              label: "Total piezas hoy",
              value: totalPiezas,
              icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
              color: "rgba(249,115,22,0.1)",
              iconColor: "#f97316",
            },
            {
              label: "Órdenes activas ahora",
              value: (enCola ?? 0) + (enCorte ?? 0) + (enTapacantos ?? 0),
              icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2",
              color: "rgba(34,197,94,0.1)",
              iconColor: "#22c55e",
            },
          ].map(({ label, value, icon, color, iconColor }) => (
            <div key={label} className="bg-white border border-zinc-200 rounded-xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: color }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
                  <path d={icon} />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-zinc-900">{value}</p>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabla de pedidos de hoy */}
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
            <h2 className="font-bold text-zinc-900">Pedidos ingresados hoy</h2>
            <span className="text-xs font-semibold text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-full">
              {pedidosHoy?.length ?? 0} pedidos
            </span>
          </div>

          {(pedidosHoy ?? []).length === 0 ? (
            <div className="py-16 text-center text-zinc-400 text-sm">
              No se ingresaron pedidos hoy
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50">
                  {["#", "Cliente", "Material", "Planchas", "Piezas", "Mts. Canto", "Máquina", "Estado", "Prioridad"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(pedidosHoy ?? []).map((p: Record<string, unknown>, idx: number) => {
                  const estado = p.estado as string;
                  const prioridad = p.prioridad as string;
                  const cliente = (p.cliente as Record<string, unknown>)?.nombre as string ?? "—";
                  const numeroOrden = `#${String(p.id as string).slice(-4).toUpperCase()}`;
                  return (
                    <tr key={p.id as string} className={`border-b border-zinc-50 last:border-0 ${idx % 2 === 0 ? "bg-white" : "bg-zinc-50/50"}`}>
                      <td className="px-4 py-3 font-bold text-zinc-700">{numeroOrden}</td>
                      <td className="px-4 py-3 font-semibold text-zinc-900">{cliente}</td>
                      <td className="px-4 py-3 text-zinc-600">{p.tipo_tablero as string} {p.marca_melamina as string || ""}</td>
                      <td className="px-4 py-3 font-bold text-zinc-900">{p.cant_planchas as string}</td>
                      <td className="px-4 py-3 font-bold text-zinc-900">{p.cant_piezas as string}</td>
                      <td className="px-4 py-3 text-zinc-600">{p.metros_canto as string} m</td>
                      <td className="px-4 py-3">
                        <span className="bg-zinc-100 text-zinc-700 text-xs font-bold px-2 py-0.5 rounded">{p.maquina_asignada as string ?? "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          estado === "Listo" ? "bg-emerald-100 text-emerald-700" :
                          estado === "Cancelado" ? "bg-red-100 text-red-600" :
                          estado === "En corte" ? "bg-zinc-900 text-white" :
                          "bg-zinc-100 text-zinc-600"
                        }`}>
                          {ESTADO_LABEL[estado] ?? estado}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {prioridad === "urgente" && <span className="text-xs font-bold text-zinc-900">⚡ Urgente</span>}
                        {prioridad === "vip" && <span className="text-xs font-bold text-orange-600">★ VIP</span>}
                        {prioridad === "normal" && <span className="text-xs text-zinc-400">Normal</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-zinc-50 border-t-2 border-zinc-200">
                  <td colSpan={3} className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wide">Totales del día</td>
                  <td className="px-4 py-3 font-bold text-zinc-900">{totalPlanchas.toFixed(1)}</td>
                  <td className="px-4 py-3 font-bold text-zinc-900">{totalPiezas}</td>
                  <td colSpan={4} />
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        {/* Cola activa */}
        {(todosActivos ?? []).length > 0 && (
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="font-bold text-zinc-900">Cola activa de producción</h2>
              <span className="text-xs font-semibold text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-full">
                {todosActivos?.length ?? 0} en proceso
              </span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50">
                  {["#", "Cliente", "Material", "Planchas", "Máquina", "Estado", "Entrega est."].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(todosActivos ?? []).map((p: Record<string, unknown>, idx: number) => {
                  const estado = p.estado as string;
                  const cliente = (p.cliente as Record<string, unknown>)?.nombre as string ?? "—";
                  const numeroOrden = `#${String(p.id as string).slice(-4).toUpperCase()}`;
                  const entrega = p.fecha_entrega_estimada
                    ? new Date(p.fecha_entrega_estimada as string).toLocaleString("es", { dateStyle: "short", timeStyle: "short" })
                    : "—";
                  return (
                    <tr key={p.id as string} className={`border-b border-zinc-50 last:border-0 ${idx % 2 === 0 ? "bg-white" : "bg-zinc-50/50"}`}>
                      <td className="px-4 py-3 font-bold text-zinc-700">{numeroOrden}</td>
                      <td className="px-4 py-3 font-semibold text-zinc-900">{cliente}</td>
                      <td className="px-4 py-3 text-zinc-600">{p.tipo_tablero as string}</td>
                      <td className="px-4 py-3 font-bold text-zinc-900">{p.cant_planchas as string}</td>
                      <td className="px-4 py-3">
                        <span className="bg-zinc-900 text-white text-xs font-bold px-2 py-0.5 rounded">{p.maquina_asignada as string ?? "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          estado === "En corte" ? "bg-zinc-900 text-white" :
                          estado === "En tapacantos" ? "bg-zinc-700 text-white" :
                          "bg-zinc-100 text-zinc-600"
                        }`}>
                          {ESTADO_LABEL[estado] ?? estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500">{entrega}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pie de reporte */}
        <div className="mt-6 pt-4 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-400 print:block">
          <span>© 2026 RyG SaaS · Casa del Carpintero</span>
          <span className="print:block">Generado el {fechaHoy} a las {horaGenera}</span>
        </div>

      </div>
    </>
  );
}
