import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/auth";
import { getOrganization } from "@/lib/org";
import { hasOrgFeature } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import MaterialesClient from "./MaterialesClient";

export default async function MaterialesPage() {
  const [role, org] = await Promise.all([getUserRole(), getOrganization()]);
  if (!org) redirect("/dashboard");

  const canAccess = hasOrgFeature(org.plan, org.features_enabled ?? [], "control_materiales", role === "developer");
  if (!canAccess) redirect("/dashboard");
  if (!["developer", "admin", "gerencia", "administracion", "almacen_tableros"].includes(role)) redirect("/dashboard");

  const supabase = await createClient();

  const { data: materiales } = await supabase
    .from("materiales")
    .select("*")
    .eq("organization_id", org.id)
    .eq("activo", true)
    .order("tipo").order("marca");

  const { data: movimientos } = await supabase
    .from("movimientos_material")
    .select("*, materiales(tipo, marca, espesor)")
    .eq("organization_id", org.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <MaterialesClient
      materiales={materiales ?? []}
      movimientos={movimientos ?? []}
      orgId={org.id}
      role={role}
    />
  );
}
