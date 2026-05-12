import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/auth";
import { getOrganization } from "@/lib/org";
import { hasOrgFeature } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import FinancieroClient from "./FinancieroClient";

export default async function FinancieroPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; año?: string }>;
}) {
  const [role, org] = await Promise.all([getUserRole(), getOrganization()]);
  if (!org) redirect("/dashboard");

  const canAccess = hasOrgFeature(org.plan, org.features_enabled ?? [], "modulo_financiero", role === "developer");
  if (!canAccess) redirect("/dashboard");
  if (!["developer", "admin", "gerencia", "administracion"].includes(role)) redirect("/dashboard");

  const params = await searchParams;
  const now = new Date();
  const mes = parseInt(params.mes ?? String(now.getMonth() + 1));
  const año = parseInt(params.año ?? String(now.getFullYear()));

  const start = new Date(año, mes - 1, 1).toISOString();
  const end   = new Date(año, mes, 0, 23, 59, 59).toISOString();

  const supabase = await createClient();
  const { data: pedidos } = await supabase
    .from("pedidos")
    .select(`id, estado, precio_venta, cant_planchas, cant_piezas, metros_canto, tipo_tablero, marca_melamina, fecha_ingreso, clientes(nombre)`)
    .eq("organization_id", org.id)
    .gte("fecha_ingreso", start)
    .lte("fecha_ingreso", end)
    .order("fecha_ingreso", { ascending: false });

  const costoPlanche    = (org.config as Record<string, number>)?.costo_planche     ?? 0;
  const costoCantoMetro = (org.config as Record<string, number>)?.costo_canto_metro ?? 0;

  return (
    <FinancieroClient
      pedidos={pedidos ?? []}
      orgId={org.id}
      costoPlanche={costoPlanche}
      costoCantoMetro={costoCantoMetro}
      role={role}
      mes={mes}
      año={año}
    />
  );
}
