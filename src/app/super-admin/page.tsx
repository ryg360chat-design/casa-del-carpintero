import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserRole } from "@/lib/auth";
import { PLAN_LABEL } from "@/lib/org";
import type { OrgPlan } from "@/lib/org";
import SuperAdminActions from "./SuperAdminActions";

type Org = {
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
  _profiles_count?: number;
};

export default async function SuperAdminPage() {
  const role = await getUserRole();
  if (role !== "developer") redirect("/dashboard");

  const admin = createAdminClient();

  const { data: orgs } = await admin
    .from("organizations")
    .select("*")
    .order("created_at", { ascending: false });

  // Contar usuarios por org
  const { data: profileCounts } = await admin
    .from("profiles")
    .select("organization_id")
    .not("organization_id", "is", null);

  const countByOrg: Record<string, number> = {};
  (profileCounts ?? []).forEach((p: { organization_id: string }) => {
    countByOrg[p.organization_id] = (countByOrg[p.organization_id] ?? 0) + 1;
  });

  const enrichedOrgs: Org[] = (orgs ?? []).map((o: Org) => ({
    ...o,
    _profiles_count: countByOrg[o.id] ?? 0,
  }));

  const PLAN_COLOR: Record<OrgPlan | string, string> = {
    trial:        "bg-zinc-100 text-zinc-600",
    basico:       "bg-blue-100 text-blue-700",
    profesional:  "bg-violet-100 text-violet-700",
    empresarial:  "bg-orange-100 text-orange-700",
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-red-400">Super Admin</span>
            </div>
            <h1 className="text-2xl font-bold">Organizaciones</h1>
            <p className="text-zinc-400 text-sm mt-1">{enrichedOrgs.length} talleres registrados</p>
          </div>
          <a
            href="/registro"
            className="bg-white text-zinc-900 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            + Nueva org
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {(["trial", "basico", "profesional", "empresarial"] as OrgPlan[]).map((plan) => {
            const count = enrichedOrgs.filter((o) => o.plan === plan).length;
            return (
              <div key={plan} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">{PLAN_LABEL[plan]}</p>
                <p className="text-3xl font-bold">{count}</p>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-zinc-500">Taller</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-zinc-500">Plan</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-zinc-500">Usuarios</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-zinc-500">Trial / Suscrito</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-zinc-500">Estado</th>
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
                  <tr key={org.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">{org.nombre}</p>
                      <p className="text-xs text-zinc-500 font-mono">{org.slug}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${PLAN_COLOR[org.plan] ?? PLAN_COLOR.trial}`}>
                        {PLAN_LABEL[org.plan] ?? org.plan}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-zinc-300">
                      {org._profiles_count} / {org.max_usuarios}
                    </td>
                    <td className="px-5 py-4 text-xs text-zinc-400">
                      {org.plan === "trial" && org.trial_ends_at ? (
                        <span className={trialExpired ? "text-red-400" : "text-amber-400"}>
                          {trialExpired ? "Trial vencido" : `${daysLeft}d restantes`}
                        </span>
                      ) : org.subscribed_at ? (
                        <span className="text-green-400">
                          Activo desde {new Date(org.subscribed_at).toLocaleDateString("es-EC")}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold uppercase tracking-wider ${org.activo ? "text-green-400" : "text-red-400"}`}>
                        {org.activo ? "● Activo" : "● Suspendido"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <SuperAdminActions org={org} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
