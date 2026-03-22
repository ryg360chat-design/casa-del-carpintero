import { createClient } from "@/lib/supabase/server";
import AvanzarEstadoBtn from "@/components/AvanzarEstadoBtn";
import RealtimeRefresh from "@/components/RealtimeRefresh";
import GreetingHeader from "@/components/GreetingHeader";
import Link from "next/link";
import React from "react";

const ESTADO_PROGRESS: Record<string, number> = {
  "En cola": 20,
  "En corte": 50,
  "En tapacantos": 78,
  "Listo": 100,
};

const ESTADO_BADGE: Record<string, string> = {
  "En cola":       "border border-zinc-700 text-zinc-400 bg-transparent",
  "En corte":      "bg-zinc-100 text-zinc-900",
  "En tapacantos": "bg-zinc-200 text-zinc-700",
  "Listo":         "bg-zinc-900 text-white",
  "Cancelado":     "bg-red-100 text-red-600",
  "Pausado":       "bg-yellow-100 text-yellow-700",
};

function StatCard({
  label,
  value,
  delay = 0,
  icon,
  iconBg,
  sub,
}: {
  label: string;
  value: number | string;
  delay?: number;
  icon?: React.ReactNode;
  iconBg?: string;
  sub?: string;
}) {
  return (
    <div
      className="animate-fade-in-up bg-white border border-zinc-200 rounded-xl p-5 flex flex-col gap-3 card-hover"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{label}</span>
        {icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: iconBg }}>
            {icon}
          </div>
        )}
      </div>
      <div>
        <span className="text-4xl font-bold tabular-nums text-zinc-900">
          {String(value).padStart(2, "0")}
        </span>
        {sub && <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function OrderCard({ pedido, delay = 0 }: { pedido: Record<string, unknown>; delay?: number }) {
  const estado = pedido.estado as string;
  const prioridad = pedido.prioridad as string;
  const badgeClass = ESTADO_BADGE[estado] ?? "bg-zinc-100 text-zinc-600";
  const isUrgente = prioridad === "urgente";
  const cliente = (pedido.cliente as Record<string, unknown>)?.nombre as string ?? "—";

  const entregaDate = pedido.fecha_entrega_estimada
    ? new Date(pedido.fecha_entrega_estimada as string)
    : null;

  const esHoy = entregaDate
    ? entregaDate.toDateString() === new Date().toDateString()
    : false;

  const entregaStr = entregaDate
    ? `${esHoy ? "Hoy" : "Mañana"} ${entregaDate.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}`
    : null;

  return (
    <div
      className={`animate-fade-in-up bg-white border rounded-xl p-4 relative card-hover ${
        isUrgente
          ? "border-zinc-300 ring-1 ring-zinc-200"
          : "border-zinc-200"
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Urgente stripe */}
      {isUrgente && (
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: "linear-gradient(90deg, #f97316, #fb923c)" }} />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-bold text-zinc-900 text-sm truncate">{cliente}</p>
            {isUrgente && (
              <span className="animate-badge-pop shrink-0 text-[9px] font-bold text-white px-1.5 py-0.5 rounded tracking-wide" style={{ background: "#f97316" }}>
                ⚡ URGENTE
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500">
            {pedido.tipo_tablero as string} {pedido.marca_melamina as string ?? ""}
          </p>
        </div>
        <span className={`shrink-0 ml-2 text-[10px] font-bold px-2 py-1 rounded-md tracking-wide ${badgeClass}`}>
          {estado === "En cola" ? "COLA" : estado === "En corte" ? "CORTE" : estado === "En tapacantos" ? "ENCHAPE" : estado.toUpperCase()}
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {[
          { label: "Planchas", value: pedido.cant_planchas },
          { label: "Piezas", value: pedido.cant_piezas },
          { label: "Mts. canto", value: pedido.metros_canto },
        ].map(({ label, value }) => (
          <div key={label} className="bg-zinc-50 rounded-lg px-2 py-2 text-center">
            <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wide">{label}</p>
            <p className="text-lg font-bold text-zinc-900 leading-tight">{value as string}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {estado !== "Cancelado" && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wide">Progreso</span>
            <span className="text-[9px] font-bold text-zinc-500">{ESTADO_PROGRESS[estado] ?? 0}%</span>
          </div>
          <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${ESTADO_PROGRESS[estado] ?? 0}%`,
                background: estado === "Listo" ? "#22c55e" : "linear-gradient(90deg, #f97316, #fb923c)",
              }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <span className="text-xs font-medium">
            {isUrgente ? "⚡ Prioritario" : entregaStr ?? "Sin fecha"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Link
            href={`/pedidos/${pedido.id as string}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-all px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 group/link"
          >
            Detalle
            <svg className="transition-transform group-hover/link:translate-x-0.5" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
          <AvanzarEstadoBtn pedidoId={pedido.id as string} estadoActual={estado} />
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    { count: pedidosHoy },
    { count: enCola },
    { count: enCorte },
    { count: listos },
    { data: pedidosM1 },
    { data: pedidosM2 },
    { data: maquinas },
  ] = await Promise.all([
    supabase.from("pedidos").select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString())
      .lt("created_at", tomorrow.toISOString()),
    supabase.from("pedidos").select("*", { count: "exact", head: true }).eq("estado", "En cola"),
    supabase.from("pedidos").select("*", { count: "exact", head: true }).eq("estado", "En corte"),
    supabase.from("pedidos").select("*", { count: "exact", head: true }).eq("estado", "Listo")
      .gte("updated_at", today.toISOString()),
    supabase.from("pedidos")
      .select("*, cliente:clientes(nombre)")
      .eq("maquina_asignada", "M1")
      .not("estado", "in", '("Listo","Cancelado")')
      .order("prioridad", { ascending: true })
      .order("fecha_ingreso", { ascending: true })
      .limit(5),
    supabase.from("pedidos")
      .select("*, cliente:clientes(nombre)")
      .eq("maquina_asignada", "M2")
      .not("estado", "in", '("Listo","Cancelado")')
      .order("prioridad", { ascending: true })
      .order("fecha_ingreso", { ascending: true })
      .limit(5),
    supabase.from("maquinas").select("*").order("id"),
  ]);

  const maquinaMap = Object.fromEntries(
    (maquinas ?? []).map((m: { id: number; activa: boolean }) => [m.id === 1 ? "M1" : "M2", m.activa])
  );

  const stats = [
    {
      label: "Ingresados hoy", value: pedidosHoy ?? 0, delay: 0, sub: "pedidos nuevos",
      iconBg: "rgba(59,130,246,0.12)",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
    },
    {
      label: "En cola", value: enCola ?? 0, delay: 60, sub: "esperando corte",
      iconBg: "rgba(249,115,22,0.12)",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    },
    {
      label: "En corte", value: enCorte ?? 0, delay: 120, sub: "en proceso ahora",
      iconBg: "rgba(113,113,122,0.10)",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" x2="8.12" y1="4" y2="15.88"/><line x1="14.47" x2="20" y1="14.48" y2="20"/><line x1="8.12" x2="12" y1="8.12" y2="12"/></svg>,
    },
    {
      label: "Listos hoy", value: listos ?? 0, delay: 180, sub: "para retirar",
      iconBg: "rgba(34,197,94,0.12)",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    },
  ];

  const maquinasData = [
    { id: "M1", label: "Máquina 1", pedidos: pedidosM1 ?? [] },
    { id: "M2", label: "Máquina 2", pedidos: pedidosM2 ?? [] },
  ];

  return (
    <div className="p-6 animate-fade-in min-h-full" style={{ background: "linear-gradient(160deg, rgba(219,234,254,0.45) 0%, rgba(244,244,245,0) 35%)" }}>
      <GreetingHeader />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} delay={s.delay} icon={s.icon} iconBg={s.iconBg} sub={s.sub} />
        ))}
      </div>

      {/* Machines */}
      <div className="grid grid-cols-2 gap-6">
        {maquinasData.map(({ id, label, pedidos }, colIdx) => {
          const activa = maquinaMap[id] !== false;
          return (
            <div key={id} className="animate-fade-in-up" style={{ animationDelay: `${200 + colIdx * 80}ms` }}>
              {/* Machine header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activa ? "bg-zinc-900" : "bg-zinc-100"}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={activa ? "white" : "#71717a"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-bold text-zinc-900 text-sm">{label}</h2>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">{id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activa && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                  )}
                  <span className={`text-xs font-semibold ${activa ? "text-green-600" : "text-zinc-400"}`}>
                    {activa ? "Operativa" : "Pausada"}
                  </span>
                  <span className="text-zinc-300">·</span>
                  <span className="text-xs text-zinc-400 font-medium">{pedidos.length} activos</span>
                </div>
              </div>

              {/* Orders */}
              <div className="flex flex-col gap-3">
                {pedidos.length === 0 ? (
                  <div className="text-center py-12 text-zinc-400 text-sm border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                    <svg className="mx-auto mb-2 text-zinc-300" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                      <rect width="6" height="4" x="9" y="3" rx="1"/>
                    </svg>
                    Sin pedidos activos
                  </div>
                ) : (
                  pedidos.map((p: Record<string, unknown>, idx: number) => (
                    <OrderCard
                      key={p.id as string}
                      pedido={p as Record<string, unknown>}
                      delay={300 + colIdx * 80 + idx * 50}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
      <RealtimeRefresh />
    </div>
  );
}
