"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserRole, IS_ADMIN, CAN_ADVANCE_STATE } from "@/lib/auth";

const SIGUIENTE_ESTADO: Record<string, string> = {
  "En cola": "En corte",
  "En corte": "En tapacantos",
  "En tapacantos": "Listo",
};

export async function avanzarEstado(pedidoId: string, estadoActual: string) {
  const role = await getUserRole();
  if (!CAN_ADVANCE_STATE.includes(role)) return { error: "Sin permisos" };

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
  const role = await getUserRole();
  if (!IS_ADMIN.includes(role)) return { error: "Sin permisos" };

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

export async function guardarReporte(stats: {
  pedidosHoy: number;
  enCola: number;
  enCorte: number;
  enTapacantos: number;
  listos: number;
  cancelados: number;
  totalPlanchas: number;
  totalPiezas: number;
  totalMetros: number;
}) {
  const role = await getUserRole();
  if (!IS_ADMIN.includes(role)) return { error: "Sin permisos" };

  // Validar que los valores sean números no negativos
  const values = Object.values(stats);
  if (values.some((v) => typeof v !== "number" || v < 0 || !isFinite(v))) {
    return { error: "Datos inválidos" };
  }

  const supabase = await createClient();
  const fecha = new Date().toISOString().split("T")[0];
  const { error } = await supabase
    .from("reportes_guardados")
    .upsert({ fecha, stats }, { onConflict: "fecha" });
  if (error) return { error: error.message };
  revalidatePath("/reporte");
  return { ok: true };
}

export async function marcarVendido(pedidoId: string) {
  const role = await getUserRole();
  if (!IS_ADMIN.includes(role)) return { error: "Sin permisos" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("pedidos")
    .update({ estado: "Vendido", fecha_cierre: new Date().toISOString() })
    .eq("id", pedidoId)
    .eq("estado", "Listo"); // solo desde Listo

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/produccion");
  revalidatePath("/pedidos");
  revalidatePath(`/pedidos/${pedidoId}`);
  return { ok: true };
}

export async function cancelarPedido(pedidoId: string) {
  const role = await getUserRole();
  if (!IS_ADMIN.includes(role)) return { error: "Sin permisos" };

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
