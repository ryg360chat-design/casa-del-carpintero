"use client";

import { useState } from "react";
import type { OrgPlan } from "@/lib/org";
import { PLAN_LABEL } from "@/lib/org";

type Org = {
  id: string;
  nombre: string;
  plan: OrgPlan;
  activo: boolean;
};

export default function SuperAdminActions({ org }: { org: Org }) {
  const [loading, setLoading] = useState(false);

  async function updatePlan(plan: OrgPlan) {
    setLoading(true);
    await fetch("/api/super-admin/orgs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: org.id, plan }),
    });
    window.location.reload();
  }

  async function toggleActivo() {
    setLoading(true);
    await fetch("/api/super-admin/orgs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: org.id, activo: !org.activo }),
    });
    window.location.reload();
  }

  const plans: OrgPlan[] = ["trial", "basico", "profesional", "empresarial"];

  return (
    <div className="flex items-center gap-2 justify-end">
      <select
        disabled={loading}
        value={org.plan}
        onChange={(e) => updatePlan(e.target.value as OrgPlan)}
        className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none focus:border-zinc-500 disabled:opacity-50"
      >
        {plans.map((p) => (
          <option key={p} value={p}>{PLAN_LABEL[p]}</option>
        ))}
      </select>

      <button
        disabled={loading}
        onClick={toggleActivo}
        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
          org.activo
            ? "bg-red-500/15 text-red-400 hover:bg-red-500/25"
            : "bg-green-500/15 text-green-400 hover:bg-green-500/25"
        }`}
      >
        {org.activo ? "Suspender" : "Activar"}
      </button>
    </div>
  );
}
