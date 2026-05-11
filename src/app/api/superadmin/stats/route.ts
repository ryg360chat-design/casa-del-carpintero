import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLAN_PRICE_MENSUAL } from "@/lib/plans";
import type { OrgPlan } from "@/lib/org-types";

function requireSuperAdmin(req: NextRequest) {
  const key = req.headers.get("x-superadmin-key");
  if (!process.env.SUPERADMIN_KEY || key !== process.env.SUPERADMIN_KEY) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const deny = requireSuperAdmin(req);
  if (deny) return deny;

  const admin = createAdminClient();

  const [
    { data: orgs },
    { data: profiles },
    { data: recentPedidos },
    { data: pedidosMes },
  ] = await Promise.all([
    admin.from("organizations").select("*").order("created_at", { ascending: false }),
    admin.from("profiles").select("id, nombre, rol, organization_id").not("organization_id", "is", null),
    admin.from("pedidos").select("organization_id, estado, created_at, fecha_ingreso")
         .order("created_at", { ascending: false }).limit(50),
    admin.from("pedidos").select("organization_id")
         .gte("fecha_ingreso", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]),
  ]);

  const orgList = orgs ?? [];
  const profileList = profiles ?? [];

  // KPIs
  const activos = orgList.filter(o => o.activo && o.plan !== "trial").length;
  const totalOrgs = orgList.length;
  const mrr = orgList
    .filter(o => o.activo && o.plan !== "trial")
    .reduce((sum, o) => sum + (PLAN_PRICE_MENSUAL[o.plan as OrgPlan] ?? 0), 0);
  const arr = mrr * 12;
  const totalUsuarios = profileList.filter(p => p.rol !== "developer").length;
  const pedidosMesTotal = (pedidosMes ?? []).length;

  // Alertas
  const countByOrg: Record<string, { users: number; pedidosMes: number }> = {};
  profileList.forEach(p => {
    if (!countByOrg[p.organization_id]) countByOrg[p.organization_id] = { users: 0, pedidosMes: 0 };
    countByOrg[p.organization_id].users++;
  });
  (pedidosMes ?? []).forEach((p: { organization_id: string }) => {
    if (!countByOrg[p.organization_id]) countByOrg[p.organization_id] = { users: 0, pedidosMes: 0 };
    countByOrg[p.organization_id].pedidosMes++;
  });

  const alertas: { orgId: string; nombre: string; tipo: string }[] = [];
  orgList.forEach(o => {
    const uso = countByOrg[o.id];
    if (!uso) return;
    const usoPct = o.max_usuarios > 0 ? uso.users / o.max_usuarios : 0;
    if (usoPct >= 0.95) alertas.push({ orgId: o.id, nombre: o.nombre, tipo: "usuarios_al_limite" });
  });

  // Actividad reciente (últimos 7 eventos)
  const recentActivity = (recentPedidos ?? []).slice(0, 7).map((p: Record<string, unknown>) => ({
    orgId: p.organization_id as string,
    orgNombre: orgList.find(o => o.id === p.organization_id)?.nombre ?? "—",
    estado: p.estado as string,
    fecha: p.created_at as string,
  }));

  // Enrich orgs
  const enrichedOrgs = orgList.map(o => ({
    ...o,
    _usuarios: countByOrg[o.id]?.users ?? 0,
    _pedidos_mes: countByOrg[o.id]?.pedidosMes ?? 0,
  }));

  // Usuarios para tab usuarios
  const usuariosList = profileList
    .filter(p => p.rol !== "developer")
    .map(p => ({
      id: p.id,
      nombre: p.nombre,
      rol: p.rol,
      organization_id: p.organization_id,
      orgNombre: orgList.find(o => o.id === p.organization_id)?.nombre ?? "—",
    }));

  return NextResponse.json({
    kpis: { activos, totalOrgs, mrr, arr, totalUsuarios, pedidosMes: pedidosMesTotal },
    alertas,
    orgs: enrichedOrgs,
    usuarios: usuariosList,
    recentActivity,
  });
}
