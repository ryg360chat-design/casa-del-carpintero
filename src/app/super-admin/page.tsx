import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserRole } from "@/lib/auth";
import { PLAN_LABEL } from "@/lib/org";
import type { OrgPlan } from "@/lib/org";
import { PLAN_PRICE_MENSUAL } from "@/lib/plans";
import SuperAdminActions from "./SuperAdminActions";

type OrgRaw = {
  id: string;
  nombre: string;
  slug: string;
  plan: OrgPlan;
  max_maquinas: number;
  max_usuarios: number;
  trial_ends_at: string | null;
  subscribed_at: string | null;
  activo: boolean;
  created_at: string;
};

type EnrichedOrg = OrgRaw & {
  _profiles_count: number;
  _pedidos_total: number;
  _pedidos_mes: number;
  _last_activity: string | null;
};

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtRelative(iso: string | null) {
  if (!iso) return "Sin actividad";
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days}d`;
  return fmtDate(iso);
}

const PLAN_COLOR: Record<OrgPlan | string, string> = {
  trial:        "bg-zinc-700 text-zinc-300",
  basico:       "bg-blue-900/60 text-blue-300",
  profesional:  "bg-violet-900/60 text-violet-300",
  empresarial:  "bg-orange-900/60 text-orange-300",
};

export default async function SuperAdminPage() {
  const role = await getUserRole();
  if (role !== "developer") redirect("/dashboard");

  const admin = createAdminClient();

  const [{ data: orgs }, { data: profileCounts }, { data: pedidosData }] = await Promise.all([
    admin.from("organizations").select("*").order("created_at", { ascending: false }),
    admin.from("profiles").select("organization_id").not("organization_id", "is", null),
    admin.from("pedidos").select("organization_id, fecha_ingreso").order("fecha_ingreso", { ascending: false }),
  ]);

  // Usuarios por org
  const countByOrg: Record<string, number> = {};
  (profileCounts ?? []).forEach((p: { organization_id: string }) => {
    countByOrg[p.organization_id] = (countByOrg[p.organization_id] ?? 0) + 1;
  });

  // Pedidos por org
  const mesActual = new Date();
  mesActual.setDate(1); mesActual.setHours(0, 0, 0, 0);

  const pedidosByOrg: Record<string, { total: number; mes: number; last: string | null }> = {};
  (pedidosData ?? []).forEach((p: { organization_id: string; fecha_ingreso: string }) => {
    if (!pedidosByOrg[p.organization_id]) {
      pedidosByOrg[p.organization_id] = { total: 0, mes: 0, last: p.fecha_ingreso };
    }
    pedidosByOrg[p.organization_id].total++;
    if (new Date(p.fecha_ingreso) >= mesActual) {
      pedidosByOrg[p.organization_id].mes++;
    }
  });

  const enrichedOrgs: EnrichedOrg[] = (orgs ?? []).map((o: OrgRaw) => ({
    ...o,
    _profiles_count: countByOrg[o.id] ?? 0,
    _pedidos_total:  pedidosByOrg[o.id]?.total ?? 0,
    _pedidos_mes:    pedidosByOrg[o.id]?.mes   ?? 0,
    _last_activity:  pedidosByOrg[o.id]?.last  ?? null,
  }));

  // MRR
  const mrr = enrichedOrgs
    .filter(o => o.activo && o.plan !== "trial")
    .reduce((sum, o) => sum + (PLAN_PRICE_MENSUAL[o.plan] ?? 0), 0);

  const trialsActivos   = enrichedOrgs.filter(o => o.plan === "trial" && o.activo && o.trial_ends_at && new Date(o.trial_ends_at) > new Date()).length;
  const trialsVencidos  = enrichedOrgs.filter(o => o.plan === "trial" && o.trial_ends_at && new Date(o.trial_ends_at) <= new Date()).length;
  const orgsPagadas     = enrichedOrgs.filter(o => o.plan !== "trial" && o.activo).length;

  const inviteBase = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuadra.app";
  const inviteToken = process.env.REGISTRATION_SECRET ?? "";

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-red-400">Super Admin</span>
            </div>
            <h1 className="text-2xl font-bold">Organizaciones</h1>
            <p className="text-zinc-400 text-sm mt-1">{enrichedOrgs.length} talleres registrados</p>
          </div>
          <a
            href={`/registro?token=${encodeURIComponent(inviteToken)}`}
            className="bg-white text-zinc-900 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            + Nueva org
          </a>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">MRR</p>
            <p className="text-3xl font-bold text-green-400">${mrr.toLocaleString()}</p>
            <p className="text-[11px] text-zinc-600 mt-1">{orgsPagadas} orgs activas de pago</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Trials activos</p>
            <p className="text-3xl font-bold text-amber-400">{trialsActivos}</p>
            <p className="text-[11px] text-zinc-600 mt-1">{trialsVencidos} vencidos</p>
          </div>
          {(["profesional", "empresarial"] as OrgPlan[]).map((plan) => {
            const count = enrichedOrgs.filter(o => o.plan === plan && o.activo).length;
            return (
              <div key={plan} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">{PLAN_LABEL[plan]}</p>
                <p className="text-3xl font-bold">{count}</p>
                <p className="text-[11px] text-zinc-600 mt-1">${PLAN_PRICE_MENSUAL[plan] * count}/mes</p>
              </div>
            );
          })}
        </div>

        {/* Por plan (mini breakdown) */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {(["trial", "basico", "profesional", "empresarial"] as OrgPlan[]).map((plan) => {
            const count = enrichedOrgs.filter(o => o.plan === plan).length;
            return (
              <div key={plan} className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full ${PLAN_COLOR[plan]}`}>
                <span>{count}</span>
                <span className="opacity-60">·</span>
                <span>{PLAN_LABEL[plan]}</span>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-zinc-500">Taller</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-zinc-500">Plan</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-zinc-500">Usuarios</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-zinc-500">Pedidos</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-zinc-500">Actividad</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-zinc-500">Trial / Suscrito</th>
                  <th className="text-right px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-zinc-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {enrichedOrgs.map((org) => {
                  const trialExpired = org.plan === "trial" && org.trial_ends_at && new Date(org.trial_ends_at) < new Date();
                  const daysLeft = org.trial_ends_at
                    ? Math.max(0, Math.ceil((new Date(org.trial_ends_at).getTime() - Date.now()) / 86400000))
                    : null;

                  return (
                    <tr key={org.id} className={`border-b border-zinc-800/60 hover:bg-zinc-800/30 transition-colors ${!org.activo ? "opacity-50" : ""}`}>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">{org.nombre}</p>
                        <p className="text-xs text-zinc-500 font-mono">{org.slug}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${PLAN_COLOR[org.plan] ?? PLAN_COLOR.trial}`}>
                          {PLAN_LABEL[org.plan] ?? org.plan}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-zinc-300">
                        <span className={org._profiles_count >= org.max_usuarios ? "text-red-400" : ""}>
                          {org._profiles_count}
                        </span>
                        <span className="text-zinc-600"> / {org.max_usuarios}</span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-zinc-200 font-semibold">{org._pedidos_total}</p>
                        {org._pedidos_mes > 0 && (
                          <p className="text-[11px] text-emerald-500">+{org._pedidos_mes} este mes</p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs">
                        <span className={org._last_activity ? "text-zinc-300" : "text-zinc-600"}>
                          {fmtRelative(org._last_activity)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs">
                        {org.plan === "trial" && org.trial_ends_at ? (
                          <span className={trialExpired ? "text-red-400" : "text-amber-400"}>
                            {trialExpired ? "⚠ Trial vencido" : `${daysLeft}d restantes`}
                          </span>
                        ) : org.subscribed_at ? (
                          <span className="text-green-400">
                            desde {new Date(org.subscribed_at).toLocaleDateString("es-EC")}
                          </span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <SuperAdminActions
                          org={org}
                          inviteUrl={`${inviteBase}/registro?token=${encodeURIComponent(inviteToken)}`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
