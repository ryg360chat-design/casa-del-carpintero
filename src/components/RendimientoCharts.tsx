"use client";

import { useState } from "react";

export type MaquinaRendimiento = {
  id: string;
  label: string;
  activa: boolean;
  planchasReal: number;
  piezasReal: number;
  planchasProgramadas: number;
  piezasProgramadas: number;
};

export type TimelineEvent = {
  horaFrac: number;   // fracción decimal de la hora en Lima (ej. 10.5 = 10:30)
  maquina: string;
  planchas: number;
};

type Props = {
  maquinas: MaquinaRendimiento[];
  idealPlanchas: number;
  idealPiezas: number;
  horasElapsed: number;
  horasTotal: number;
  finJornada: number;
  inicioJornada: number;
  esSabado: boolean;
  timelineEvents: TimelineEvent[];
  ahoraFrac: number;  // hora actual Lima como fracción
};

type View = "barras" | "donuts" | "timeline";

// ── Helpers ──────────────────────────────────────────────────────────────────
function pct(real: number, ideal: number) {
  if (ideal <= 0) return 0;
  return Math.min(Math.round((real / ideal) * 100), 150);
}

function colorPct(p: number) {
  if (p >= 85) return { bar: "#22c55e", text: "text-emerald-600", bg: "bg-emerald-500" };
  if (p >= 60) return { bar: "#f59e0b", text: "text-amber-500", bg: "bg-amber-400" };
  return { bar: "#ef4444", text: "text-red-500", bg: "bg-red-500" };
}

function fracToHHMM(frac: number) {
  const h = Math.floor(frac);
  const m = Math.round((frac - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ── Sub-views ────────────────────────────────────────────────────────────────

function BarrasView({ maquinas, idealPlanchas, idealPiezas }: Pick<Props, "maquinas" | "idealPlanchas" | "idealPiezas">) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {maquinas.map((m) => {
        const pPl = pct(m.planchasReal, idealPlanchas);
        const pPz = pct(m.piezasReal, idealPiezas);
        const colPl = colorPct(pPl);
        const colPz = colorPct(pPz);
        const promedio = Math.round((pPl + pPz) / 2);
        const colProm = colorPct(promedio);
        return (
          <div key={m.id} className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.activa ? "bg-zinc-900" : "bg-zinc-100"}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={m.activa ? "white" : "#a1a1aa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className={m.activa ? "animate-spin" : ""} style={m.activa ? { animationDuration: "4s" } : undefined}>
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-zinc-900 text-sm">{m.label}</p>
                  <p className={`text-[10px] font-semibold ${m.activa ? "text-emerald-500" : "text-zinc-400"}`}>{m.activa ? "Operativa" : "Pausada"}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-black ${colProm.text}`}>{promedio}%</p>
                <p className="text-[10px] text-zinc-400 font-medium">productividad</p>
              </div>
            </div>

            {/* Barra planchas */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">Planchas cortadas</span>
                <span className="text-[11px] font-bold text-zinc-700">{m.planchasReal} <span className="text-zinc-400 font-normal">/ {idealPlanchas.toFixed(1)} ideal</span></span>
              </div>
              <div className="relative h-4 bg-zinc-100 rounded-full overflow-hidden">
                {/* Ideal background */}
                <div className="absolute inset-0 bg-amber-100 rounded-full" style={{ width: `${Math.min(idealPlanchas / 40 * 100, 100)}%` }} />
                {/* Real */}
                <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(m.planchasReal / 40 * 100, 100)}%`, background: colPl.bar }} />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-zinc-600">{pPl}%</span>
              </div>
            </div>

            {/* Barra piezas */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">Piezas cortadas</span>
                <span className="text-[11px] font-bold text-zinc-700">{m.piezasReal} <span className="text-zinc-400 font-normal">/ {idealPiezas.toFixed(0)} ideal</span></span>
              </div>
              <div className="relative h-4 bg-zinc-100 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-amber-100 rounded-full" style={{ width: `${Math.min(idealPiezas / 960 * 100, 100)}%` }} />
                <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(m.piezasReal / 960 * 100, 100)}%`, background: colPz.bar }} />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-zinc-600">{pPz}%</span>
              </div>
            </div>

            {/* Footer stats */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-100">
              <div className="bg-zinc-50 rounded-lg px-3 py-2">
                <p className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wide">En cola</p>
                <p className="text-base font-black text-zinc-900">{m.planchasProgramadas.toFixed(2)} <span className="text-[10px] text-zinc-400 font-normal">pl</span></p>
              </div>
              <div className="bg-zinc-50 rounded-lg px-3 py-2">
                <p className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wide">Piezas cola</p>
                <p className="text-base font-black text-zinc-900">{m.piezasProgramadas} <span className="text-[10px] text-zinc-400 font-normal">pzs</span></p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DonutView({ maquinas, idealPlanchas }: Pick<Props, "maquinas" | "idealPlanchas">) {
  const R = 40, C = 2 * Math.PI * R;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {maquinas.map((m) => {
        const p = pct(m.planchasReal, idealPlanchas);
        const col = colorPct(p);
        const dash = (Math.min(p, 100) / 100) * C;
        return (
          <div key={m.id} className="bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col items-center gap-4">
            <p className="font-extrabold text-zinc-900 text-sm uppercase tracking-wider">{m.label}</p>
            <div className="relative">
              <svg width="110" height="110" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r={R} fill="none" stroke="#f4f4f5" strokeWidth="12" />
                <circle cx="55" cy="55" r={R} fill="none" stroke={col.bar} strokeWidth="12"
                  strokeDasharray={`${dash} ${C}`} strokeLinecap="round"
                  transform="rotate(-90 55 55)" style={{ transition: "stroke-dasharray 0.7s ease" }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-black ${col.text}`}>{p}%</span>
                <span className="text-[9px] text-zinc-400 font-semibold uppercase">productividad</span>
              </div>
            </div>
            <div className="w-full grid grid-cols-2 gap-2">
              <div className="text-center bg-zinc-50 rounded-xl p-2.5">
                <p className="text-xl font-black text-zinc-900">{m.planchasReal}</p>
                <p className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wide">pl. reales</p>
              </div>
              <div className="text-center bg-zinc-50 rounded-xl p-2.5">
                <p className="text-xl font-black text-zinc-900">{idealPlanchas.toFixed(1)}</p>
                <p className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wide">pl. ideal</p>
              </div>
            </div>
            <div className="w-full text-center">
              <p className="text-[11px] text-zinc-400">{m.planchasProgramadas.toFixed(2)} pl. en cola · {m.piezasProgramadas} pzs.</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TimelineView({ maquinas, idealPlanchas, finJornada, inicioJornada, esSabado, timelineEvents, ahoraFrac }: Omit<Props, "idealPiezas" | "horasElapsed" | "horasTotal">) {
  const W = 700; const H = 240;
  const PAD = { l: 40, r: 20, t: 16, b: 36 };
  const cw = W - PAD.l - PAD.r;
  const ch = H - PAD.t - PAD.b;

  const maxPl = Math.max(idealPlanchas * 1.1, 5);
  const dur = finJornada - inicioJornada;
  const almuerzoIn = esSabado ? 99 : 12;
  const almuerzoOut = esSabado ? 99 : 13;

  function xOf(hora: number) {
    return PAD.l + ((hora - inicioJornada) / dur) * cw;
  }
  function yOf(pl: number) {
    return PAD.t + ch - (pl / maxPl) * ch;
  }

  // Línea ideal (respeta almuerzo)
  const idealPoints: [number, number][] = [];
  let acum = 0;
  const step = 0.25;
  for (let h = inicioJornada; h <= finJornada + 0.01; h += step) {
    if (!esSabado && h > almuerzoIn && h <= almuerzoOut) { idealPoints.push([h, acum]); continue; }
    acum += (PROD_PL_POR_HORA * step);
    idealPoints.push([h, Math.min(acum, idealPlanchas * (finJornada - inicioJornada) / dur * 1.05)]);
  }

  // Línea real (step function acumulada por máquina)
  const maquinaColors: Record<string, string> = { M1: "#3b82f6", M2: "#8b5cf6", M3: "#f97316" };

  const realBySeries: Record<string, { h: number; pl: number }[]> = {};
  for (const m of maquinas) {
    const evs = timelineEvents.filter(e => e.maquina === m.id).sort((a, b) => a.horaFrac - b.horaFrac);
    let acc = 0;
    const pts: { h: number; pl: number }[] = [{ h: inicioJornada, pl: 0 }];
    for (const ev of evs) {
      pts.push({ h: ev.horaFrac, pl: acc });
      acc += ev.planchas;
      pts.push({ h: ev.horaFrac, pl: acc });
    }
    pts.push({ h: Math.min(ahoraFrac, finJornada), pl: acc });
    realBySeries[m.id] = pts;
  }

  function polyline(pts: [number, number][]) {
    return pts.map(([x, y]) => `${xOf(x).toFixed(1)},${yOf(y).toFixed(1)}`).join(" ");
  }
  function polylineR(pts: { h: number; pl: number }[]) {
    return pts.map(p => `${xOf(Math.max(inicioJornada, Math.min(p.h, finJornada))).toFixed(1)},${yOf(p.pl).toFixed(1)}`).join(" ");
  }

  // Y axis ticks
  const yTicks = [0, Math.round(maxPl * 0.25), Math.round(maxPl * 0.5), Math.round(maxPl * 0.75), Math.round(maxPl)];
  // X axis ticks (every hour)
  const xTicks: number[] = [];
  for (let h = Math.ceil(inicioJornada); h <= finJornada; h++) xTicks.push(h);

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <p className="text-sm font-bold text-zinc-900">Planchas cortadas vs. ideal — hoy</p>
        <div className="flex items-center gap-3 flex-wrap text-[10px] font-semibold">
          <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-amber-400 inline-block rounded" />Ideal</span>
          {maquinas.map(m => (
            <span key={m.id} className="flex items-center gap-1.5">
              <span className="w-5 h-0.5 inline-block rounded" style={{ background: maquinaColors[m.id] }} />{m.label}
            </span>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 340 }}>
        {/* Grid lines */}
        {yTicks.map(v => (
          <g key={v}>
            <line x1={PAD.l} y1={yOf(v)} x2={W - PAD.r} y2={yOf(v)} stroke="#f4f4f5" strokeWidth="1" />
            <text x={PAD.l - 4} y={yOf(v) + 3.5} textAnchor="end" fontSize="8" fill="#a1a1aa">{v}</text>
          </g>
        ))}
        {/* Almuerzo zona */}
        {!esSabado && (
          <rect x={xOf(almuerzoIn)} y={PAD.t} width={xOf(almuerzoOut) - xOf(almuerzoIn)} height={ch}
            fill="#fef9c3" opacity="0.6" />
        )}
        {/* X axis ticks */}
        {xTicks.map(h => (
          <g key={h}>
            <line x1={xOf(h)} y1={PAD.t} x2={xOf(h)} y2={PAD.t + ch} stroke="#f4f4f5" strokeWidth="1" strokeDasharray="3 3" />
            <text x={xOf(h)} y={H - PAD.b + 14} textAnchor="middle" fontSize="8" fill="#a1a1aa">{h}:00</text>
          </g>
        ))}
        {/* Línea ideal */}
        <polyline points={polyline(idealPoints.map(p => [p[0], p[1]] as [number, number]))}
          fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5 3" />
        {/* Líneas reales por máquina */}
        {maquinas.map(m => (
          <polyline key={m.id}
            points={polylineR(realBySeries[m.id] ?? [])}
            fill="none" stroke={maquinaColors[m.id]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {/* Línea de tiempo actual */}
        {ahoraFrac >= inicioJornada && ahoraFrac <= finJornada && (
          <g>
            <line x1={xOf(ahoraFrac)} y1={PAD.t} x2={xOf(ahoraFrac)} y2={PAD.t + ch}
              stroke="#18181b" strokeWidth="1.5" strokeDasharray="4 2" />
            <text x={xOf(ahoraFrac) + 3} y={PAD.t + 10} fontSize="8" fill="#18181b" fontWeight="600">
              {fracToHHMM(ahoraFrac)}
            </text>
          </g>
        )}
        {/* Axes */}
        <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t + ch} stroke="#e4e4e7" strokeWidth="1" />
        <line x1={PAD.l} y1={PAD.t + ch} x2={W - PAD.r} y2={PAD.t + ch} stroke="#e4e4e7" strokeWidth="1" />
      </svg>
    </div>
  );
}

const PROD_PL_POR_HORA = 5;

// ── Main component ────────────────────────────────────────────────────────────
export default function RendimientoCharts(props: Props) {
  const [view, setView] = useState<View>("barras");

  const TAB = (v: View, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setView(v)}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
        view === v ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"
      }`}
    >
      {icon}{label}
    </button>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Toggle */}
      <div className="flex items-center gap-1 flex-wrap bg-zinc-50 border border-zinc-200 p-1 rounded-2xl w-fit">
        {TAB("barras", "Barras", <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="12" width="5" height="9" rx="1"/><rect x="10" y="7" width="5" height="14" rx="1"/><rect x="17" y="3" width="5" height="18" rx="1"/></svg>)}
        {TAB("donuts", "Donuts", <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>)}
        {TAB("timeline", "Timeline", <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>)}
      </div>

      {/* Content */}
      {view === "barras"   && <BarrasView {...props} />}
      {view === "donuts"   && <DonutView  {...props} />}
      {view === "timeline" && <TimelineView {...props} />}
    </div>
  );
}
