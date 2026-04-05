"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserRole, IS_ADMIN, IS_DEVELOPER } from "@/lib/auth";

export type UserRole = "developer" | "admin" | "ventas" | "produccion" | "almacenes" | "viewer";

export async function cambiarRol(targetUserId: string, nuevoRol: UserRole) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const role = await getUserRole();
  if (!IS_ADMIN.includes(role)) return { error: "Sin permisos." };

  // No puede cambiarse el propio rol
  if (user.id === targetUserId) return { error: "No podés cambiar tu propio rol." };

  // Solo developer puede asignar rol developer
  if (nuevoRol === "developer" && !IS_DEVELOPER.includes(role)) {
    return { error: "Solo un desarrollador puede asignar ese rol." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ rol: nuevoRol })
    .eq("id", targetUserId);

  if (error) return { error: error.message };

  revalidatePath("/admin/usuarios");
  return { ok: true };
}

export async function desactivarUsuario(targetUserId: string, banear: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const role = await getUserRole();
  if (!IS_ADMIN.includes(role)) return { error: "Sin permisos." };

  if (user.id === targetUserId) return { error: "No podés desactivarte a vos mismo." };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(targetUserId, {
    ban_duration: banear ? "876600h" : "none", // 100 años ≈ permanente
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/usuarios");
  return { ok: true };
}
