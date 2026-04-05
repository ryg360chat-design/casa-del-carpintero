"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getUserRole, IS_ADMIN, IS_DEVELOPER } from "@/lib/auth";

const ROLES_VALIDOS = ["admin", "ventas", "produccion", "almacenes", "viewer"] as const;
type RolInvitacion = typeof ROLES_VALIDOS[number];

export async function invitarUsuario(email: string, rolDeseado: RolInvitacion = "viewer") {
  const role = await getUserRole();
  if (!IS_ADMIN.includes(role)) {
    return { error: "Sin permisos para invitar usuarios." };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Correo inválido." };
  }

  // Solo developer puede invitar con rol admin
  if (rolDeseado === "admin" && !IS_DEVELOPER.includes(role)) {
    return { error: "Solo un desarrollador puede invitar administradores." };
  }

  if (!ROLES_VALIDOS.includes(rolDeseado)) {
    return { error: "Rol no válido." };
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/confirm`,
      data: { rol: rolDeseado }, // se guarda en user_metadata → trigger lo copia a profiles
    });

    if (error) {
      if (error.message.includes("already been registered")) {
        return { error: "Este correo ya tiene una cuenta registrada." };
      }
      return { error: `Error al enviar invitación: ${error.message}` };
    }

    // Si ya existe un profile (re-invitación), actualizamos el rol directamente
    if (data?.user?.id) {
      await supabase
        .from("profiles")
        .upsert({ id: data.user.id, rol: rolDeseado }, { onConflict: "id", ignoreDuplicates: false });
    }

    return { success: true };
  } catch {
    return { error: "Error del servidor. Contacta al administrador." };
  }
}
