"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrganization } from "@/lib/org";
import { getUserRole } from "@/lib/auth";

const INVENTARIO_ROLES = ["developer", "admin", "gerencia", "almacen_tableros"] as const;

export async function registrarEntrada(materialId: string, cantidad: number, notas: string) {
  const role = await getUserRole();
  if (!INVENTARIO_ROLES.includes(role as typeof INVENTARIO_ROLES[number])) return { error: "Sin permisos" };

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

  revalidatePath("/inventario");
  return { ok: true };
}

export async function crearMaterial(
  tipo: string, marca: string, espesor: string,
  stockInicial: number, stockMinimo: number, precioUnitario: number,
) {
  const role = await getUserRole();
  if (!INVENTARIO_ROLES.includes(role as typeof INVENTARIO_ROLES[number])) return { error: "Sin permisos" };

  const supabase = await createClient();
  const org = await getOrganization();
  if (!org) return { error: "Sin organización" };

  const { data: mat, error } = await supabase.from("materiales").insert({
    organization_id: org.id,
    tipo: tipo.trim(), marca: marca.trim(), espesor: espesor.trim(),
    stock_actual: stockInicial,
    stock_minimo: stockMinimo,
    precio_unitario: precioUnitario,
    activo: true,
  }).select("id").single();

  if (error) return { error: error.message };

  if (stockInicial > 0 && mat) {
    await supabase.from("movimientos_material").insert({
      organization_id: org.id,
      material_id: mat.id,
      tipo: "entrada",
      cantidad: stockInicial,
      stock_resultante: stockInicial,
      notas: "Stock inicial",
    });
  }

  revalidatePath("/inventario");
  return { ok: true };
}

export async function editarMaterial(materialId: string, stockMinimo: number, precioUnitario: number) {
  const role = await getUserRole();
  if (!INVENTARIO_ROLES.includes(role as typeof INVENTARIO_ROLES[number])) return { error: "Sin permisos" };

  const supabase = await createClient();
  const org = await getOrganization();
  if (!org) return { error: "Sin organización" };

  await supabase.from("materiales")
    .update({ stock_minimo: stockMinimo, precio_unitario: precioUnitario, updated_at: new Date().toISOString() })
    .eq("id", materialId)
    .eq("organization_id", org.id);

  revalidatePath("/inventario");
  return { ok: true };
}

export async function registrarSalidaPedido(
  _orgId: string,
  pedidoId: string,
  tipoTablero: string,
  marcaMelamina: string,
  cantPlanchas: number,
) {
  const supabase = await createClient();
  const org = await getOrganization();
  if (!org) return;

  const { data: mat } = await supabase
    .from("materiales")
    .select("id, stock_actual")
    .eq("organization_id", org.id)
    .ilike("tipo", tipoTablero)
    .ilike("marca", marcaMelamina || "%")
    .eq("activo", true)
    .maybeSingle();

  if (!mat || cantPlanchas <= 0) return;

  const nuevoStock = Math.max(mat.stock_actual - cantPlanchas, 0);
  await supabase.from("materiales").update({ stock_actual: nuevoStock, updated_at: new Date().toISOString() }).eq("id", mat.id);
  await supabase.from("movimientos_material").insert({
    organization_id: org.id,
    material_id: mat.id,
    tipo: "salida",
    cantidad: cantPlanchas,
    stock_resultante: nuevoStock,
    pedido_id: pedidoId,
    notas: null,
  });
}
