export const TZ = "America/Lima";

export function limaTime(d: Date | string): string {
  return new Date(d).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
}

export function limaDate(d: Date | string, opts?: Intl.DateTimeFormatOptions): string {
  return new Date(d).toLocaleDateString("es", { timeZone: TZ, ...opts });
}

export function limaDateTime(d: Date | string): string {
  return new Date(d).toLocaleString("es", { dateStyle: "short", timeStyle: "short", timeZone: TZ });
}

/** Devuelve true si la fecha dada cae en el día de hoy según Lima */
export function esHoyLima(d: Date): boolean {
  const opts: Intl.DateTimeFormatOptions = { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" };
  return d.toLocaleDateString("es", opts) === new Date().toLocaleDateString("es", opts);
}

/** Devuelve true si la fecha dada cae mañana según Lima */
export function esMañanaLima(d: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const opts: Intl.DateTimeFormatOptions = { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" };
  return d.toLocaleDateString("es", opts) === tomorrow.toLocaleDateString("es", opts);
}
