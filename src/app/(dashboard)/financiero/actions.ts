"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth";
import { getOrganization } from "@/lib/org";

export async function setPrecioVenta(pedidoId: string, precio: number) {
  const role = await getUserRole();
  if (!["developer", "admin", "gerencia"].includes(role)) return { error: "Sin permisos" };

  const org = await getOrganization();
  if (!org) return { error: "Sin organización" };

  const supabase = await createClient();
  await supabase
    .from("pedidos")
    .update({ precio_venta: precio })
    .eq("id", pedidoId)
    .eq("organization_id", org.id);
  revalidatePath("/financiero");
}

export async function updateCostosConfig(costoPlanche: number, costoCantoMetro: number) {
  const role = await getUserRole();
  if (!["developer", "admin", "gerencia"].includes(role)) return { error: "Sin permisos" };

  const org = await getOrganization();
  if (!org) return { error: "Sin organización" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({ config: { ...(org.config as object), costo_planche: costoPlanche, costo_canto_metro: costoCantoMetro } })
    .eq("id", org.id);

  if (error) return { error: error.message };
  revalidatePath("/financiero");
  return { ok: true };
}
