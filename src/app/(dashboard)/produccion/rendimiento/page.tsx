import { createClient } from "@/lib/supabase/server";
import { horasProductivasHasta, PROD, TZ } from "@/lib/productividad";
import { limaStartOfToday } from "@/lib/time";
import RendimientoCharts, {
  MaquinaRendimiento,
  TimelineEvent,
} from "@/components/RendimientoCharts";
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

export default async function RendimientoPage() {
  const ahora = new Date();
  const jornada = horasProductivasHasta(ahora);

  const supabase = await createClient();
  const todayStart = limaStartOfToday();

  const [
    { data: maquinasDB },
    { data: historialHoy },
    { data: enCola },
  ] = await Promise.all([
    supabase.from("maquinas").select("id, activa"),

    // Orders that entered "En corte" today → actual production
    supabase
      .from("pedido_historial")
      .select("pedido_id, created_at")
      .eq("estado_nuevo", "En corte")
      .gte("created_at", todayStart),

    // Orders still in queue per machine
    supabase
      .from("pedidos")
      .select("maquina_asignada, cant_planchas, cant_piezas")
      .eq("estado", "En cola")
      .in("maquina_asignada", [...MAQUINAS]),
  ]);

  type PedidoRow = { id: string; maquina_asignada: string; cant_planchas: number; cant_piezas: number };
  type HistorialRow = { pedido_id: string; created_at: string };

  // Fetch pedido details for the historial events
  const historialRows = (historialHoy ?? []) as HistorialRow[];
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

  // Accumulate real production and timeline events
  const realPorMaquina: Record<string, { planchas: number; piezas: number }> = {};
  const timelineEvents: TimelineEvent[] = [];

  for (const h of historialRows) {
    const p = pedidoMap.get(h.pedido_id);
    if (!p?.maquina_asignada || !MAQUINAS.includes(p.maquina_asignada as typeof MAQUINAS[number])) continue;
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

  type EnColaRow = { maquina_asignada: string | null; cant_planchas: number; cant_piezas: number };

  // Accumulate queue
  const programadosPorMaquina: Record<string, { planchas: number; piezas: number }> = {};
  for (const p of ((enCola ?? []) as EnColaRow[])) {
    if (!p.maquina_asignada) continue;
    if (!programadosPorMaquina[p.maquina_asignada])
      programadosPorMaquina[p.maquina_asignada] = { planchas: 0, piezas: 0 };
    programadosPorMaquina[p.maquina_asignada].planchas += p.cant_planchas;
    programadosPorMaquina[p.maquina_asignada].piezas += p.cant_piezas;
  }

  // Build machines array
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
      planchasProgramadas: prog.planchas,
      piezasProgramadas: prog.piezas,
    };
  });

  // Per-machine ideal (not total)
  const idealPlanchas = jornada.horas * PROD.PL_POR_HORA;
  const idealPiezas = jornada.horas * PROD.PZ_POR_HORA;

  // Current time as Lima fraction
  const nowStr = ahora.toLocaleTimeString("en-US", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const [hh, mm] = nowStr.split(":").map(Number);
  const ahoraFrac = hh + mm / 60;

  const ahora_str = ahora.toLocaleTimeString("es", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  });

  return (
    <div
      className="p-4 sm:p-8 min-h-full"
      style={{
        background:
          "linear-gradient(160deg, rgba(220,252,231,0.45) 0%, rgba(244,244,245,0) 32%)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Rendimiento del día</h1>
          <p className="text-zinc-500 text-sm mt-0.5 flex items-center gap-2">
            Última actualización: {ahora_str}
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-zinc-600 uppercase">En vivo</span>
            </span>
          </p>
        </div>

        {/* Jornada info pill */}
        <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-4 py-2.5">
          <div className="text-center">
            <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wide">Horas trabajadas</p>
            <p className="text-lg font-black text-zinc-900">
              {jornada.horas.toFixed(1)}
              <span className="text-xs text-zinc-400 font-normal"> / {jornada.horasTotal}h</span>
            </p>
          </div>
          <div className="w-px h-8 bg-zinc-200" />
          <div className="text-center">
            <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wide">Ideal por máq.</p>
            <p className="text-lg font-black text-zinc-900">
              {idealPlanchas.toFixed(1)}
              <span className="text-xs text-zinc-400 font-normal"> pl</span>
            </p>
          </div>
        </div>
      </div>

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
        ahoraFrac={ahoraFrac}
      />

      <RealtimeRefresh />
    </div>
  );
}
