"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrganization } from "@/lib/org";

export async function registrarEntrada(materialId: string, cantidad: number, notas: string) {
  const supabase = await createClient();
  const org = await getOrganization();
  if (!org) return { error: "Sin organización" };

  const { data: mat } = await supabase
    .from("materiales")
    .select("stock_actual")
    .eq("id", materialId)
    .single();

  if (!mat) return { error: "Material no encontrado" };

  const nuevoStock = mat.stock_actual + cantidad;

  await supabase.from("materiales").update({ stock_actual: nuevoStock, updated_at: new Date().toISOString() }).eq("id", materialId);
  await supabase.from("movimientos_material").insert({
    organization_id: org.id,
    material_id: materialId,
    tipo: "entrada",
    cantidad,
    stock_resultante: nuevoStock,
    notas: notas || null,
  });

  revalidatePath("/materiales");
  return { ok: true };
}

export async function registrarSalidaPedido(
  orgId: string,
  pedidoId: string,
  tipoTablero: string,
  marcaMelamina: string,
  cantPlanchas: number,
) {
  const supabase = await createClient();

  const { data: mat } = await supabase
    .from("materiales")
    .select("id, stock_actual")
    .eq("organization_id", orgId)
    .ilike("tipo", tipoTablero)
    .ilike("marca", marcaMelamina || "%")
    .eq("activo", true)
    .maybeSingle();

  if (!mat || cantPlanchas <= 0) return;

  const nuevoStock = Math.max(mat.stock_actual - cantPlanchas, 0);
  await supabase.from("materiales").update({ stock_actual: nuevoStock, updated_at: new Date().toISOString() }).eq("id", mat.id);
  await supabase.from("movimientos_material").insert({
    organization_id: orgId,
    material_id: mat.id,
    tipo: "salida",
    cantidad: cantPlanchas,
    stock_resultante: nuevoStock,
    pedido_id: pedidoId,
    notas: null,
  });
}
