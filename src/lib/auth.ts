import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type UserRole =
  | "developer"
  | "admin"
  | "gerencia"
  | "administracion"
  | "ventas"
  | "logistica"
  | "produccion"
  | "almacen_tableros"
  | "almacen_cantos"
  | "almacenes"       // rol legacy, mantener por compatibilidad
  | "corte_especial"
  | "viewer";

// ── Crear / editar pedidos ───────────────────────────────────────────
export const CAN_CREATE_PEDIDO: UserRole[] = [
  "developer", "admin", "gerencia", "ventas",
];

// ── Avanzar estados de producción (En cola → Listo) ─────────────────
export const CAN_ADVANCE_STATE: UserRole[] = [
  "developer", "admin", "gerencia", "produccion",
];

// ── Marcar como Despachado (cierra el ciclo) ─────────────────────────
export const CAN_DESPACHAR: UserRole[] = [
  "developer", "admin", "gerencia", "almacen_tableros", "logistica",
];

// ── Controlar máquinas (encender/apagar, ajustes) ────────────────────
export const CAN_CONTROL_MAQUINAS: UserRole[] = [
  "developer", "admin", "gerencia", "produccion",
];

// ── Asignar máquina a un pedido ──────────────────────────────────────
export const CAN_ASSIGN_MAQUINA: UserRole[] = [
  "developer", "admin", "gerencia", "ventas", "produccion",
];

// ── Acceso a páginas de admin (usuarios, invitar, ajustes) ───────────
export const IS_ADMIN: UserRole[] = [
  "developer", "admin", "gerencia",
];

// ── Ver reportes ─────────────────────────────────────────────────────
export const CAN_VIEW_REPORTE: UserRole[] = [
  "developer", "admin", "gerencia", "administracion", "produccion",
];

// ── Solo developer ───────────────────────────────────────────────────
export const IS_DEVELOPER: UserRole[] = ["developer"];

// ── Roles de solo lectura (sin botones de acción) ────────────────────
export const READ_ONLY_ROLES: UserRole[] = [
  "administracion", "almacen_cantos", "corte_especial", "viewer",
];

export const getUserRole = cache(async (): Promise<UserRole> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "viewer";
  const { data } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .maybeSingle();
  return (data?.rol as UserRole) ?? "viewer";
});
