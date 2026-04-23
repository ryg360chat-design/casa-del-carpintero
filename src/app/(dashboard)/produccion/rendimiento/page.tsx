import { createClient } from "@/lib/supabase/server";
import { horasProductivasHasta, PROD, TZ, JornadaInfo } from "@/lib/productividad";
import { limaTime } from "@/lib/time";
import RendimientoCharts, {
  MaquinaRendimiento,
  TimelineEvent,
} from "@/components/RendimientoCharts";
import RendimientoFechaNav from "@/components/RendimientoFechaNav";
import RealtimeRefresh from "@/components/RealtimeRefresh";

const MAQUINAS = ["M1", "M2", "M3"] as const;
const MAQUINA_LABEL: Record<string, string> = {
  M1: "Máquina 1",
  M2: "Máquina 2",
  M3: "Máquina 3",
};

function toHoraFrac(iso: string): number {
  const d = new Date(iso);
  const t = d.toLocaleTimeString("en-US", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const [h, m] = t.split(":").map(Number);
  return h + m / 60;
}

function jornadaParaFecha(fecha: string, esHoy: boolean, ahora: Date): JornadaInfo {
  if (esHoy) return horasProductivasHasta(ahora);

  const d = new Date(`${fecha}T12:00:00-05:00`);
  const dayName = d.toLocaleDateString("en-US", { weekday: "short", timeZone: TZ });
  const esSabado  = dayName === "Sat";
  const esDomingo = dayName === "Sun";
  const horasTotal = esSabado ? PROD.HORAS_DIA_SAB : PROD.HORAS_DIA_LV;

  return {
    horas:         esDomingo ? 0 : horasTotal,
    esSabado,
    esDomingo,
    finJornada:    esSabado ? PROD.FIN_SAB : PROD.FIN_LV,
    inicioJornada: PROD.INICIO,
    horasTotal,
  };
}

export default async function RendimientoPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>;
}) {
  const { fecha: fechaParam } = await searchParams;
  const ahora = new Date();
  const todayLima = ahora.toLocaleDateString("en-CA", { timeZone: TZ });
  const fechaSeleccionada = fechaParam ?? todayLima;
  const esHoy = fechaSeleccionada === todayLima;

  const jornada = jornadaParaFecha(fechaSeleccionada, esHoy, ahora);

  const dayStart = new Date(`${fechaSeleccionada}T00:00:00-05:00`).toISOString();
  const dayEnd   = new Date(`${fechaSeleccionada}T23:59:59-05:00`).toISOString();

  const supabase = await createClient();

  const [
    { data: maquinasDB },
    { data: historialDia },
    { data: enCola },
  ] = await Promise.all([
    supabase.from("maquinas").select("id, activa"),

    supabase
      .from("pedido_historial")
      .select("pedido_id, created_at")
      .eq("estado_nuevo", "En corte")
      .gte("created_at", dayStart)
      .lte("created_at", dayEnd),

    supabase
      .from("pedidos")
      .select("maquina_asignada, cant_planchas, cant_piezas")
      .eq("estado", "En cola")
      .in("maquina_asignada", [...MAQUINAS]),
  ]);

  type PedidoRow = {
    id: string;
    maquina_asignada: string;
    cant_planchas: number;
    cant_piezas: number;
  };
  type HistorialRow = { pedido_id: string; created_at: string };
  type EnColaRow = {
    maquina_asignada: string | null;
    cant_planchas: number;
    cant_piezas: number;
  };

  const historialRows = (historialDia ?? []) as HistorialRow[];
  const pedidoIds = [...new Set(historialRows.map((h) => h.pedido_id))];

  const { data: pedidosDetalle } = pedidoIds.length
    ? await supabase
        .from("pedidos")
        .select("id, maquina_asignada, cant_planchas, cant_piezas")
        .in("id", pedidoIds)
    : { data: [] as PedidoRow[] };

  const pedidoMap = new Map<string, PedidoRow>(
    ((pedidosDetalle ?? []) as PedidoRow[]).map((p) => [p.id, p])
  );

  const realPorMaquina: Record<string, { planchas: number; piezas: number }> = {};
  const timelineEvents: TimelineEvent[] = [];

  for (const h of historialRows) {
    const p = pedidoMap.get(h.pedido_id);
    if (
      !p?.maquina_asignada ||
      !MAQUINAS.includes(p.maquina_asignada as (typeof MAQUINAS)[number])
    )
      continue;
    const maq = p.maquina_asignada;
    if (!realPorMaquina[maq]) realPorMaquina[maq] = { planchas: 0, piezas: 0 };
    realPorMaquina[maq].planchas += p.cant_planchas;
    realPorMaquina[maq].piezas += p.cant_piezas;
    timelineEvents.push({
      horaFrac: toHoraFrac(h.created_at),
      maquina: maq,
      planchas: p.cant_planchas,
    });
  }

  const programadosPorMaquina: Record<string, { planchas: number; piezas: number }> = {};
  for (const p of (enCola ?? []) as EnColaRow[]) {
    if (!p.maquina_asignada) continue;
    if (!programadosPorMaquina[p.maquina_asignada])
      programadosPorMaquina[p.maquina_asignada] = { planchas: 0, piezas: 0 };
    programadosPorMaquina[p.maquina_asignada].planchas += p.cant_planchas;
    programadosPorMaquina[p.maquina_asignada].piezas += p.cant_piezas;
  }

  const maquinas: MaquinaRendimiento[] = MAQUINAS.map((id) => {
    const db = maquinasDB?.find((m: { id: string; activa: boolean }) => m.id === id);
    const real = realPorMaquina[id] ?? { planchas: 0, piezas: 0 };
    const prog = programadosPorMaquina[id] ?? { planchas: 0, piezas: 0 };
    return {
      id,
      label: MAQUINA_LABEL[id],
      activa: db?.activa ?? false,
      planchasReal: real.planchas,
      piezasReal: real.piezas,
      planchasProgramadas: esHoy ? prog.planchas : 0,
      piezasProgramadas: esHoy ? prog.piezas : 0,
    };
  });

  const idealPlanchas = jornada.horasTotal * PROD.PL_POR_HORA;
  const idealPiezas   = jornada.horasTotal * PROD.PZ_POR_HORA;

  const nowStr = ahora.toLocaleTimeString("en-US", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const [hh, mm] = nowStr.split(":").map(Number);
  const ahoraFrac = hh + mm / 60;

  // Label de fecha para el header
  const fechaLabel = esHoy
    ? "hoy"
    : new Date(`${fechaSeleccionada}T12:00:00-05:00`).toLocaleDateString("es", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: TZ,
      });

  const totalReal = maquinas.reduce((a, m) => a + m.planchasReal, 0);
  const totalIdeal = idealPlanchas * maquinas.filter((m) => m.activa).length;

  return (
    <div
      className="p-4 sm:p-8 min-h-full"
      style={{
        background:
          "linear-gradient(160deg, rgba(220,252,231,0.45) 0%, rgba(244,244,245,0) 32%)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            Rendimiento — <span className="capitalize">{fechaLabel}</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5 flex items-center gap-2">
            {esHoy ? (
              <>
                Última actualización: {limaTime(ahora)}
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-semibold text-zinc-600 uppercase">En vivo</span>
                </span>
              </>
            ) : (
              <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wide">
                Datos del día completo
              </span>
            )}
          </p>
        </div>

        {/* Pill resumen */}
        <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-4 py-2.5 shrink-0">
          <div className="text-center">
            <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wide">
              {esHoy ? "Horas trabajadas" : "Horas jornada"}
            </p>
            <p className="text-lg font-black text-zinc-900">
              {jornada.horas.toFixed(1)}
              <span className="text-xs text-zinc-400 font-normal"> / {jornada.horasTotal}h</span>
            </p>
          </div>
          <div className="w-px h-8 bg-zinc-200" />
          <div className="text-center">
            <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wide">
              Total cortado
            </p>
            <p className="text-lg font-black text-zinc-900">
              {totalReal.toFixed(1)}
              <span className="text-xs text-zinc-400 font-normal"> / {totalIdeal.toFixed(0)} pl</span>
            </p>
          </div>
        </div>
      </div>

      {/* Selector de fecha */}
      <div className="mb-6">
        <RendimientoFechaNav todayLima={todayLima} />
      </div>

      {jornada.esDomingo ? (
        <div className="text-center py-16 text-zinc-400 text-sm border border-dashed border-zinc-300 rounded-2xl">
          Domingo — día sin jornada productiva
        </div>
      ) : (
        <RendimientoCharts
          maquinas={maquinas}
          idealPlanchas={idealPlanchas}
          idealPiezas={idealPiezas}
          horasElapsed={jornada.horas}
          horasTotal={jornada.horasTotal}
          finJornada={jornada.finJornada}
          inicioJornada={jornada.inicioJornada}
          esSabado={jornada.esSabado}
          timelineEvents={timelineEvents}
          ahoraFrac={esHoy ? ahoraFrac : jornada.finJornada}
        />
      )}

      {esHoy && <RealtimeRefresh />}
    </div>
  );
}
