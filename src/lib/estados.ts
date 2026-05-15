export const SIGUIENTE_ESTADO: Record<string, string> = {
  "En cola":       "En corte",
  "En corte":      "En tapacantos",
  "En tapacantos": "Listo",
};

export const ESTADO_BADGE: Record<string, string> = {
  "En cola":       "bg-slate-100 text-slate-600 border border-slate-200",
  "En corte":      "bg-blue-500 text-white",
  "En tapacantos": "bg-violet-500 text-white",
  "Listo":         "bg-emerald-500 text-white",
  "Despachado":    "bg-teal-600 text-white",
  "Vendido":       "bg-teal-600 text-white",
  "Cancelado":     "bg-red-100 text-red-600 border border-red-200",
  "Pausado":       "bg-amber-100 text-amber-700 border border-amber-200",
};

export const ESTADO_DOT: Record<string, string> = {
  "En cola":       "bg-slate-400",
  "En corte":      "bg-blue-200",
  "En tapacantos": "bg-violet-200",
  "Listo":         "bg-emerald-200",
  "Despachado":    "bg-teal-200",
  "Vendido":       "bg-teal-200",
  "Cancelado":     "bg-red-400",
  "Pausado":       "bg-amber-400",
};
