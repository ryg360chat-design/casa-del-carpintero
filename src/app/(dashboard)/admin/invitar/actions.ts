"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function invitarUsuario(email: string) {
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
    return { error: "Error del servidor. Verificá la configuración del service role key." };
  }
}
