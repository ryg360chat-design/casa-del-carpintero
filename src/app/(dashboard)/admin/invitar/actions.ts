"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getUserRole, IS_ADMIN } from "@/lib/auth";

export async function invitarUsuario(email: string) {
  const role = await getUserRole();
  if (!IS_ADMIN.includes(role)) {
    return { error: "Sin permisos para invitar usuarios." };
  }

  if (!email || !email.includes("@")) {
    return { error: "Correo inválido." };
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/confirm`,
    });

    if (error) {
      if (error.message.includes("already been registered")) {
        return { error: "Este correo ya tiene una cuenta registrada." };
      }
      return { error: `Error al enviar invitación: ${error.message}` };
    }

    return { success: true };
  } catch {
    return { error: "Error del servidor. Contacta al administrador." };
  }
}
