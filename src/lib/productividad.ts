export const TZ = "America/Lima";

// ── Horarios reales de la cortadora ─────────────────────────────────────────
// Lunes-Viernes: limpieza/setup 8:00-8:15, corte 8:15-12:00, almuerzo 12:00-13:00,
//               corte 13:00-17:15, limpieza/apagado 17:15-17:30
// Sábado:        limpieza/setup 8:00-8:15, corte 8:15-13:15, limpieza 13:15-13:30
//               (sin almuerzo en sábado → 5h productivas exactas)
export const PROD = {
  INICIO:       8.25,   // 8:15
  ALMUERZO_IN:  12,     // 12:00
  ALMUERZO_OUT: 13,     // 13:00
  FIN_LV:       17.25,  // 17:15
  FIN_SAB:      13.25,  // 13:15
  PL_POR_HORA:  5,      // planchas/hora ideal
  PZ_POR_HORA:  120,    // piezas/hora ideal  (960 pzas / 8h)
  HORAS_DIA_LV: 8,
  HORAS_DIA_SAB: 5,
} as const;

export type JornadaInfo = {
  horas:          number;   // horas productivas transcurridas hasta ahora
  esSabado:       boolean;
  esDomingo:      boolean;
  finJornada:     number;   // fracción decimal de la hora fin
  inicioJornada:  number;
  horasTotal:     number;   // horas productivas del día completo
};

/** Devuelve horas productivas transcurridas hasta `ahora` (en Lima). */
export function horasProductivasHasta(ahora: Date): JornadaInfo {
  const dayName = ahora.toLocaleDateString("en-US", {
    timeZone: TZ, weekday: "short",
  }); // "Mon", "Tue", ..., "Sat", "Sun"

  const esSabado  = dayName === "Sat";
  const esDomingo = dayName === "Sun";

  const base: Omit<JornadaInfo, "horas"> = {
    esSabado,
    esDomingo,
    finJornada:    esSabado ? PROD.FIN_SAB : PROD.FIN_LV,
    inicioJornada: PROD.INICIO,
    horasTotal:    esSabado ? PROD.HORAS_DIA_SAB : PROD.HORAS_DIA_LV,
  };

  if (esDomingo) return { ...base, horas: 0 };

  // Hora actual en Lima como fracción decimal
  const timeStr = ahora.toLocaleTimeString("en-US", {
    timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false,
  });
  const [h, m] = timeStr.split(":").map(Number);
  const horaActual = h + m / 60;

  const FIN = esSabado ? PROD.FIN_SAB : PROD.FIN_LV;

  if (horaActual <= PROD.INICIO) return { ...base, horas: 0 };

  const current = Math.min(horaActual, FIN);
  let horas = 0;

  if (esSabado) {
    // Sábado: sin almuerzo → tiempo lineal
    horas = current - PROD.INICIO;
  } else {
    if (current <= PROD.ALMUERZO_IN) {
      horas = current - PROD.INICIO;
    } else if (current <= PROD.ALMUERZO_OUT) {
      horas = PROD.ALMUERZO_IN - PROD.INICIO; // 3.75h (antes del almuerzo)
    } else {
      horas = (PROD.ALMUERZO_IN - PROD.INICIO) + (current - PROD.ALMUERZO_OUT);
    }
  }

  return {
    ...base,
    horas: Math.max(0, Math.min(horas, base.horasTotal)),
  };
}

/** Convierte fracción decimal de hora a string "HH:MM" */
export function fracToHHMM(frac: number): string {
  const h = Math.floor(frac);
  const m = Math.round((frac - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
