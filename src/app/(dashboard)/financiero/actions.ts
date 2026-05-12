"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setPrecioVenta(pedidoId: string, precio: number) {
  const supabase = await createClient();
  await supabase
    .from("pedidos")
    .update({ precio_venta: precio })
    .eq("id", pedidoId);
  revalidatePath("/financiero");
}
