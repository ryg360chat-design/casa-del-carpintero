"use client";

import { useState } from "react";
import Link from "next/link";

const ESTADO_STYLE: Record<string, string> = {
  "En cola": "bg-zinc-100 text-zinc-700",
  "En corte": "bg-zinc-800 text-white",
  "En tapacantos": "bg-zinc-600 text-white",
  "Listo": "bg-zinc-100 text-zinc-400",
  "Cancelado": "bg-red-100 text-red-400",
  "Pausado": "bg-yellow-100 text-yellow-700",
};

type Pedido = Record<string, unknown>;

function formatDayLabel(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return {
    label: date.toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" }),
    esHoy: date.toDateString() === today.toDateString(),
    esManana: date.toDateString() === tomorrow.toDateString(),
  };
}

function getWeekDays(offset: number): string[] {
  const days: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + offset * 7 + i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function DiaLista({ fecha, pedidos, atrasado = false }: { fecha: string; pedidos: Pedido[]; atrasado?: boolean }) {
  const { label, esHoy, esManana } = formatDayLabel(fecha);
  const pendientes = pedidos.filter((p) => !["Listo", "Cancelado"].includes(p.estado as string)).length;

  return (
    <div className={`bg-white border rounded-xl overflow-hidden ${atrasado ? "border-red-200" : "border-zinc-200"}`}>
      <div className={`px-4 py-3 border-b flex items-center justify-between ${
        esHoy ? "bg-zinc-900 border-zinc-900" : atrasado ? "bg-red-50 border-red-100" : "bg-zinc-50 border-zinc-100"
      }`}>
        <div className="flex items-center gap-2">
          {esHoy && <span className="text-xs font-bold bg-white text-zinc-900 px-2 py-0.5 rounded">HOY</span>}
          {esManana && <span className="text-xs font-bold border border-zinc-300 text-zinc-600 px-2 py-0.5 rounded">MAÑANA</span>}
          {atrasado && !esHoy && <span className="text-xs font-bold text-red-500">ATRASADO</span>}
          <span className={`text-sm font-semibold capitalize ${esHoy ? "text-white" : atrasado ? "text-red-700" : "text-zinc-900"}`}>
            {label}
          </span>
        </div>
        <span className={`text-xs font-bold ${esHoy ? "text-zinc-300" : atrasado ? "text-red-400" : "text-zinc-400"}`}>
          {pendientes} pendiente{pendientes !== 1 ? "s" : ""}
        </span>
      </div>
      <div>
        {pedidos.map((p, i) => {
          const estado = p.estado as string;
          const cliente = ((p.cliente as Record<string, unknown>)?.nombre as string) ?? "—";
          const hora = p.fecha_entrega_estimada
            ? new Date(p.fecha_entrega_estimada as string).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })
            : null;
          return (
            <div
              key={p.id as string}
              className={`flex items-center justify-between px-4 py-3 ${i < pedidos.length - 1 ? "border-b border-zinc-50" : ""} ${estado === "Listo" ? "opacity-40" : ""}`}
            >
              <div className="flex items-center gap-3">
                {hora && <span className="text-xs font-mono text-zinc-400 w-10 shrink-0">{hora}</span>}
                <span className="text-xs font-bold text-zinc-400 w-6 shrink-0">{p.maquina_asignada as string ?? "—"}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-900 text-sm">{cliente}</span>
                    {p.prioridad === "urgente" && (
                      <span className="text-xs font-bold border border-zinc-900 px-1.5 py-0.5 rounded leading-none">URGENTE</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {p.tipo_tablero as string} {p.marca_melamina as string} · {p.cant_planchas as string} planchas · {p.cant_piezas as string} piezas
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ESTADO_STYLE[estado] ?? "bg-zinc-100 text-zinc-600"}`}>
                  {estado}
                </span>
                <Link href={`/pedidos/${p.id as string}`} className="text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors">
                  Ver →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CalendarioInteractivo({
  grupos,
  sinFecha,
  todayStr,
}: {
  grupos: Record<string, Pedido[]>;
  sinFecha: Pedido[];
  todayStr: string;
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);
  const semana = getWeekDays(weekOffset);

  const fechasOrdenadas = Object.keys(grupos).sort();
  const atrasados = fechasOrdenadas.filter((f) => f < todayStr);
  const proximas = fechasOrdenadas.filter((f) => f >= todayStr);

  // Si hay día seleccionado, mostrar solo ese día
  const fechasAMostrar = diaSeleccionado
    ? (grupos[diaSeleccionado] ? [diaSeleccionado] : [])
    : proximas;

  const mostrarAtrasados = !diaSeleccionado;

  return (
    <div>
      {/* Grilla semanal interactiva */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Semana</p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setWeekOffset((o) => o - 1); setDiaSeleccionado(null); }}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors text-zinc-500"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            {weekOffset !== 0 && (
              <button
                onClick={() => { setWeekOffset(0); setDiaSeleccionado(null); }}
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 px-2 py-1 rounded border border-zinc-200 hover:bg-zinc-50 transition-colors"
              >
                Hoy
              </button>
            )}
            <button
              onClick={() => { setWeekOffset((o) => o + 1); setDiaSeleccionado(null); }}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors text-zinc-500"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {semana.map((diaStr) => {
            const date = new Date(diaStr + "T00:00:00");
            const esHoy = diaStr === todayStr;
            const seleccionado = diaSeleccionado === diaStr;
            const pedidosDia = grupos[diaStr] ?? [];
            const pendientesDia = pedidosDia.filter((p) => !["Listo", "Cancelado"].includes(p.estado as string));
            const tieneUrgente = pendientesDia.some((p) => p.prioridad === "urgente");
            const diaNombre = date.toLocaleDateString("es", { weekday: "short" });
            const diaNum = date.getDate();
            const esAtrasado = diaStr < todayStr;

            return (
              <button
                key={diaStr}
                onClick={() => setDiaSeleccionado(seleccionado ? null : diaStr)}
                className={`rounded-xl p-2 text-center border transition-all cursor-pointer ${
                  seleccionado
                    ? "bg-zinc-900 border-zinc-900 text-white shadow-lg scale-105"
                    : esHoy
                    ? "bg-zinc-900 border-zinc-900 text-white"
                    : esAtrasado && pendientesDia.length > 0
                    ? "border-red-200 bg-red-50 hover:border-red-300"
                    : pendientesDia.length > 0
                    ? "border-zinc-300 bg-zinc-50 hover:border-zinc-400 hover:bg-zinc-100"
                    : "border-zinc-100 bg-white hover:bg-zinc-50"
                }`}
              >
                <p className={`text-xs font-semibold uppercase tracking-wide ${seleccionado || esHoy ? "text-zinc-300" : esAtrasado && pendientesDia.length > 0 ? "text-red-400" : "text-zinc-400"}`}>
                  {diaNombre}
                </p>
                <p className={`text-lg font-bold mt-0.5 ${seleccionado || esHoy ? "text-white" : esAtrasado && pendientesDia.length > 0 ? "text-red-700" : "text-zinc-900"}`}>
                  {diaNum}
                </p>
                <div className="flex items-center justify-center gap-0.5 mt-1 min-h-[12px]">
                  {pendientesDia.slice(0, 4).map((p, idx) => (
                    <span
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full ${
                        seleccionado || esHoy
                          ? "bg-white"
                          : tieneUrgente
                          ? "bg-zinc-900"
                          : "bg-zinc-400"
                      }`}
                    />
                  ))}
                  {pendientesDia.length > 4 && (
                    <span className={`text-xs font-bold ml-0.5 ${seleccionado || esHoy ? "text-zinc-300" : "text-zinc-400"}`}>+</span>
                  )}
                </div>
                {pendientesDia.length > 0 && (
                  <p className={`text-xs mt-0.5 font-semibold ${seleccionado || esHoy ? "text-zinc-300" : "text-zinc-500"}`}>
                    {pendientesDia.length}
                  </p>
                )}
              </button>
            );
          })}
        </div>
        {diaSeleccionado && (
          <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between">
            <p className="text-xs text-zinc-500">
              Mostrando: <span className="font-semibold text-zinc-900 capitalize">{formatDayLabel(diaSeleccionado).label}</span>
            </p>
            <button
              onClick={() => setDiaSeleccionado(null)}
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              Ver todos →
            </button>
          </div>
        )}
      </div>

      {/* Lista de días */}
      <div className="flex flex-col gap-8">
        {/* Atrasados */}
        {mostrarAtrasados && atrasados.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-red-200" />
              <span className="text-xs font-bold text-red-500 uppercase tracking-wide px-2">Atrasados</span>
              <div className="h-px flex-1 bg-red-200" />
            </div>
            <div className="flex flex-col gap-4">
              {atrasados.map((fecha) => (
                <DiaLista key={fecha} fecha={fecha} pedidos={grupos[fecha]!} atrasado />
              ))}
            </div>
          </div>
        )}

        {/* Días seleccionados / próximos */}
        {fechasAMostrar.length > 0 ? (
          <div className="flex flex-col gap-4">
            {fechasAMostrar.map((fecha) => (
              <DiaLista key={fecha} fecha={fecha} pedidos={grupos[fecha]!} />
            ))}
          </div>
        ) : diaSeleccionado ? (
          <div className="text-center py-12 text-zinc-400 text-sm border border-dashed border-zinc-300 rounded-xl">
            Sin pedidos para este día.
          </div>
        ) : null}

        {!diaSeleccionado && fechasOrdenadas.length === 0 && sinFecha.length === 0 && (
          <div className="text-center py-20 text-zinc-400 text-sm border border-dashed border-zinc-300 rounded-xl">
            No hay pedidos con fecha de entrega asignada.
          </div>
        )}

        {/* Sin fecha */}
        {!diaSeleccionado && sinFecha.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-zinc-200" />
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide px-2">Sin fecha asignada</span>
              <div className="h-px flex-1 bg-zinc-200" />
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
              {sinFecha.map((p, i) => {
                const estado = p.estado as string;
                const cliente = ((p.cliente as Record<string, unknown>)?.nombre as string) ?? "—";
                return (
                  <div
                    key={p.id as string}
                    className={`flex items-center justify-between px-4 py-3 ${i < sinFecha.length - 1 ? "border-b border-zinc-50" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-zinc-400">{p.maquina_asignada as string ?? "—"}</span>
                      <span className="font-semibold text-zinc-900 text-sm">{cliente}</span>
                      <span className="text-zinc-400 text-xs">{p.tipo_tablero as string} {p.marca_melamina as string}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ESTADO_STYLE[estado] ?? "bg-zinc-100 text-zinc-600"}`}>
                        {estado}
                      </span>
                      <Link href={`/pedidos/${p.id as string}`} className="text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors">
                        Ver →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
