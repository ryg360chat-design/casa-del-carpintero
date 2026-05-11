"use client";

import { useState } from "react";
import type { OrgPlan } from "@/lib/org-types";
import { PLAN_LABEL } from "@/lib/org-types";

type Org = {
  id: string;
  nombre: string;
  plan: OrgPlan;
  activo: boolean;
  trial_ends_at: string | null;
};

export default function SuperAdminActions({ org, inviteUrl }: { org: Org; inviteUrl: string }) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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

  async function extenderTrial() {
    setLoading(true);
    await fetch("/api/super-admin/orgs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: org.id, extend_trial_days: 7 }),
    });
    window.location.reload();
  }

  function copyInviteLink() {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const plans: OrgPlan[] = ["trial", "basico", "profesional", "empresarial"];

  return (
    <div className="flex items-center gap-2 justify-end flex-wrap">
      {/* Copiar enlace de invitación */}
      <button
        onClick={copyInviteLink}
        title="Copiar enlace de registro"
        className="text-xs px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors"
      >
        {copied ? "✓ Copiado" : "🔗 Enlace"}
      </button>

      {/* Extender trial — solo visible si está en trial */}
      {org.plan === "trial" && (
        <button
          disabled={loading}
          onClick={extenderTrial}
          title="Extender trial 7 días"
          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-colors disabled:opacity-50"
        >
          +7d
        </button>
      )}

      {/* Cambiar plan */}
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

      {/* Suspender / Activar */}
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
