"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserRole, IS_ADMIN } from "@/lib/auth";

export async function guardarRolesNombres(nombres: Record<string, string>) {
  const role = await getUserRole();
  if (!IS_ADMIN.includes(role)) return { error: "Sin permiso" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.organization_id) return { error: "Org no encontrada" };

  // Filtrar strings vacíos (si está vacío, usar el default)
  const filtrado = Object.fromEntries(
    Object.entries(nombres).filter(([, v]) => v.trim() !== "")
  );

  const { error } = await supabase
    .from("organizations")
    .update({ roles_nombres: filtrado })
    .eq("id", profile.organization_id);

  if (error) return { error: error.message };

  revalidatePath("/ajustes");
  revalidatePath("/admin/usuarios");
  return { ok: true };
}
