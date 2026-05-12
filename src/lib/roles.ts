export const ROL_KEYS = [
  "admin",
  "gerencia",
  "administracion",
  "ventas",
  "logistica",
  "produccion",
  "almacen_tableros",
  "almacen_cantos",
  "corte_especial",
  "viewer",
] as const;

export type RolKey = typeof ROL_KEYS[number];

export const ROL_DEFAULT_LABELS: Record<string, string> = {
  developer:        "Desarrollador",
  admin:            "Admin sistema",
  gerencia:         "Gerencia",
  administracion:   "Administración",
  ventas:           "Ventas",
  logistica:        "Logística",
  produccion:       "Producción",
  almacen_tableros: "Almacén Tableros",
  almacen_cantos:   "Almacén Cantos",
  corte_especial:   "Corte Especial",
  viewer:           "Visualizador",
};

export function getRolLabel(rol: string, rolesNombres?: Record<string, string>): string {
  return rolesNombres?.[rol] || ROL_DEFAULT_LABELS[rol] || rol;
}
