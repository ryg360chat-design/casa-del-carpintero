"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const SIGUIENTE_ESTADO: Record<string, string> = {
  "En cola": "En corte",
  "En corte": "En tapacantos",
  "En tapacantos": "Listo",
};

export async function avanzarEstado(pedidoId: string, estadoActual: string) {
  const siguiente = SIGUIENTE_ESTADO[estadoActual];
  if (!siguiente) return { error: "No hay siguiente estado" };

  const supabase = await createClient();

  const updates: Record<string, unknown> = { estado: siguiente };
  if (siguiente === "Listo") {
    updates.fecha_entrega_real = new Date().toISOString();
  }

  const { error } = await supabase
    .from("pedidos")
    .update(updates)
    .eq("id", pedidoId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/produccion");
  revalidatePath("/pedidos");
  return { ok: true, nuevoEstado: siguiente };
}

export async function toggleMaquina(maquinaId: string, activa: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("maquinas")
    .update({ activa })
    .eq("id", maquinaId);
  if (error) return { error: error.message };
  revalidatePath("/ajustes");
  revalidatePath("/dashboard");
  revalidatePath("/produccion");
  return { ok: true };
}

export async function cancelarPedido(pedidoId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("pedidos")
    .update({ estado: "Cancelado" })
    .eq("id", pedidoId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/produccion");
  revalidatePath("/pedidos");
  return { ok: true };
}
