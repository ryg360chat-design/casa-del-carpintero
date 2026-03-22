import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type UserRole = "developer" | "admin" | "ventas" | "produccion" | "almacenes" | "viewer";

/** Roles that can create/edit orders */
export const CAN_CREATE_PEDIDO: UserRole[] = ["developer", "admin", "ventas"];
/** Roles that can advance order states and control machines */
export const CAN_ADVANCE_STATE: UserRole[] = ["developer", "admin", "produccion"];
/** Roles that can access admin pages (ajustes, invitar) */
export const IS_ADMIN: UserRole[] = ["developer", "admin"];
/** Only the developer — diagnostic and system pages */
export const IS_DEVELOPER: UserRole[] = ["developer"];

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
