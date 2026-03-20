import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AvanzarEstadoBtn from "@/components/AvanzarEstadoBtn";
import RealtimeRefresh from "@/components/RealtimeRefresh";

const ESTADO_BADGE: Record<string, string> = {
  "En cola": "border border-zinc-300 text-zinc-600 bg-transparent text-xs font-semibold px-3 py-1 rounded-full",
  "En corte": "bg-zinc-900 text-white text-xs font-semibold px-3 py-1 rounded-full",
  "En tapacantos": "bg-zinc-800 text-white text-xs font-semibold px-3 py-1 rounded-full",
};

function PedidoCard({ pedido }: { pedido: Record<string, unknown> }) {
  const estado = pedido.estado as string;
  const prioridad = pedido.prioridad as string;
  const isUrgente = prioridad === "urgente";
  const badgeClass = ESTADO_BADGE[estado] ?? ESTADO_BADGE["En cola"];

  const fechaEntrega = pedido.fecha_entrega_estimada
    ? new Date(pedido.fecha_entrega_estimada as string)
    : null;

  const esHoy = fechaEntrega
    ? fechaEntrega.toDateString() === new Date().toDateString()
    : false;

  const horaEntrega = fechaEntrega
    ? fechaEntrega.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })
    : null;

  const numeroOrden = `#${String(pedido.id as string).slice(-4).toUpperCase()}`;

  return (
    <div className={`bg-white border border-zinc-200 rounded-xl p-5 ${isUrgente ? "border-l-4 border-l-zinc-900" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-zinc-900 text-base">{numeroOrden}</span>
        <span className={badgeClass}>{estado.toUpperCase()}</span>
      </div>

      <div className="mb-3">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-0.5">Cliente</p>
        <p className="font-bold text-zinc-900 text-sm">
          {(pedido.cliente as Record<string, unknown>)?.nombre as string ?? "—"}
          {isUrgente && (
            <span className="ml-2 text-xs font-bold text-zinc-500 border border-zinc-300 rounded px-1.5">URGENTE</span>
          )}
        </p>
      </div>

      <div className="mb-4">
        <span className="border border-zinc-300 text-zinc-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          {pedido.tipo_tablero as string ?? "—"} {pedido.marca_melamina as string ?? ""}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "PLANCHAS", value: pedido.cant_planchas },
          { label: "PIEZAS", value: pedido.cant_piezas },
          { label: "MTS CANTO", value: pedido.metros_canto },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <p className="text-xs text-zinc-500 font-medium mb-0.5">{label}</p>
            <p className="text-2xl font-bold text-zinc-900">{value as string}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-zinc-500">
          {isUrgente ? (
            <span className="text-sm font-bold text-zinc-900">⚡ Prioritario</span>
          ) : horaEntrega ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span className="text-sm">Entrega: {esHoy ? "Hoy" : "Mañana"} {horaEntrega}</span>
            </>
          ) : (
            <span className="text-sm text-zinc-400">Sin fecha estimada</span>
          )}
        </div>
        <AvanzarEstadoBtn pedidoId={pedido.id as string} estadoActual={estado} />
      </div>
    </div>
  );
}

export default async function ProduccionPage() {
  const supabase = await createClient();

  const [
    { data: pedidosM1, error: e1 },
    { data: pedidosM2, error: e2 },
    { data: maquinas },
  ] = await Promise.all([
    supabase
      .from("pedidos")
      .select("*, cliente:clientes(nombre)")
      .eq("maquina_asignada", "M1")
      .not("estado", "in", '("Listo","Cancelado")')
      .order("prioridad", { ascending: true })
      .order("fecha_ingreso", { ascending: true }),
    supabase
      .from("pedidos")
      .select("*, cliente:clientes(nombre)")
      .eq("maquina_asignada", "M2")
      .not("estado", "in", '("Listo","Cancelado")')
      .order("prioridad", { ascending: true })
      .order("fecha_ingreso", { ascending: true }),
    supabase.from("maquinas").select("*"),
  ]);

  const m1 = maquinas?.find((m: { id: string; activa: boolean }) => m.id === "M1");
  const m2 = maquinas?.find((m: { id: string; activa: boolean }) => m.id === "M2");

  const ahora = new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="p-8 min-h-full" style={{ background: "linear-gradient(160deg, rgba(220,252,231,0.45) 0%, rgba(244,244,245,0) 32%)" }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Producción en Tiempo Real</h1>
          <p className="text-zinc-500 text-sm mt-0.5 flex items-center gap-2">
            Última actualización: {ahora}
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-zinc-600 uppercase">En vivo</span>
            </span>
          </p>
        </div>
        <Link
          href="/pedidos/nuevo"
          className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-zinc-800 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5v14"/>
          </svg>
          Nueva Orden
        </Link>
      </div>

      {/* Columnas de máquinas */}
      <div className="grid grid-cols-2 gap-8">
        {[
          { maquina: m1, id: "M1", pedidos: pedidosM1 ?? [], label: "MÁQUINA 1" },
          { maquina: m2, id: "M2", pedidos: pedidosM2 ?? [], label: "MÁQUINA 2" },
        ].map(({ maquina, id, pedidos, label }) => {
          const activa = maquina?.activa ?? false;
          return (
            <div key={id}>
              <div className="flex items-center justify-between mb-5 pb-4 border-b-2 border-zinc-900">
                <h2 className="text-base font-extrabold text-zinc-900 uppercase tracking-wider">{label}</h2>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${activa ? "bg-zinc-900 text-white" : "border border-zinc-300 text-zinc-500"}`}>
                  {activa ? "ACTIVA" : "INACTIVA"}
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {pedidos.length === 0 ? (
                  <div className="text-center py-12 text-zinc-400 text-sm border border-dashed border-zinc-300 rounded-xl">
                    Sin pedidos en cola
                  </div>
                ) : (
                  pedidos.map((p: Record<string, unknown>) => (
                    <PedidoCard key={p.id as string} pedido={p} />
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
