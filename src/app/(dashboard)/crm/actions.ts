"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth";
import { getOrganization } from "@/lib/org";
import { revalidatePath } from "next/cache";

export async function crearCliente(data: { nombre: string; telefono?: string; email?: string }) {
  const [role, org] = await Promise.all([getUserRole(), getOrganization()]);
  if (!org) return { error: "No autorizado" };
  if (!["developer", "admin", "gerencia", "administracion", "ventas"].includes(role)) return { error: "Sin permisos" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("clientes")
    .insert({ nombre: data.nombre, telefono: data.telefono || null, email: data.email || null, organization_id: org.id });

  if (error) return { error: error.message };
  revalidatePath("/crm");
  return { ok: true };
}

export async function editarCliente(clienteId: string, data: { nombre: string; telefono: string; email: string }) {
  const [role, org] = await Promise.all([getUserRole(), getOrganization()]);
  if (!org) return { error: "No autorizado" };
  if (!["developer", "admin", "gerencia", "administracion", "ventas"].includes(role)) return { error: "Sin permisos" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("clientes")
    .update({ nombre: data.nombre, telefono: data.telefono || null, email: data.email || null })
    .eq("id", clienteId)
    .eq("organization_id", org.id);

  if (error) return { error: error.message };
  revalidatePath("/crm");
  revalidatePath(`/crm/${clienteId}`);
  return { ok: true };
}

export async function guardarNotasCliente(clienteId: string, notas: string) {
  const [role, org] = await Promise.all([getUserRole(), getOrganization()]);
  if (!org) return { error: "No autorizado" };
  if (!["developer", "admin", "gerencia", "administracion", "ventas"].includes(role)) return { error: "Sin permisos" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("clientes")
    .update({ notas })
    .eq("id", clienteId)
    .eq("organization_id", org.id);

  if (error) return { error: error.message };
  return { ok: true };
}
