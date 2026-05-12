import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth";
import { getOrganization } from "@/lib/org";
import { hasOrgFeature } from "@/lib/plans";
import FinancieroClient from "./FinancieroClient";

export default async function FinancieroPage() {
  const [role, org] = await Promise.all([getUserRole(), getOrganization()]);

  if (!org) redirect("/dashboard");

  const canAccess = hasOrgFeature(org.plan, org.features_enabled ?? [], "modulo_financiero", role === "developer");
  if (!canAccess) redirect("/dashboard");

  if (!["developer", "admin", "gerencia", "administracion"].includes(role)) {
    redirect("/dashboard");
  }

  const supabase = await createClient();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  const { data: pedidos } = await supabase
    .from("pedidos")
    .select(`
      id,
      estado,
      precio_venta,
      cant_planchas,
      cant_piezas,
      metros_canto,
      tipo_tablero,
      marca_melamina,
      fecha_ingreso,
      fecha_entrega_real,
      clientes(nombre)
    `)
    .eq("organization_id", org.id)
    .gte("fecha_ingreso", startOfMonth)
    .lte("fecha_ingreso", endOfMonth)
    .order("fecha_ingreso", { ascending: false });

  const costoPlanche = (org.config as Record<string, number>)?.costo_planche ?? 0;
  const costoCantoMetro = (org.config as Record<string, number>)?.costo_canto_metro ?? 0;

  return (
    <FinancieroClient
      pedidos={pedidos ?? []}
      orgId={org.id}
      costoPlanche={costoPlanche}
      costoCantoMetro={costoCantoMetro}
      role={role}
    />
  );
}
