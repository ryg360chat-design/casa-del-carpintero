import Link from "next/link";
import { redirect } from "next/navigation";
import { getOrganization, PLAN_LABEL, daysLeftInTrial } from "@/lib/org";
import { PLAN_FEATURES_LIST, PLAN_PRICE_MENSUAL } from "@/lib/plans";
import type { OrgPlan } from "@/lib/org";

export default async function UpgradePage() {
  const org = await getOrganization();
  if (!org) redirect("/login");

  const currentPlan = org.plan;
  const daysLeft = daysLeftInTrial(org);

  const plans: { plan: OrgPlan; recommended?: boolean }[] = [
    { plan: "basico" },
    { plan: "profesional", recommended: true },
    { plan: "empresarial" },
  ];

  const WHATSAPP = "593969000486";

  return (
    <div className="min-h-screen bg-[#f8f9fb] px-6 py-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors inline-flex items-center gap-1 mb-6">
            ← Volver al dashboard
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Actualizar plan</h1>
          {currentPlan === "trial" && daysLeft > 0 && (
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-2 rounded-lg">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              Te quedan <strong>{daysLeft} días</strong> de trial gratuito
            </div>
          )}
          {currentPlan === "trial" && daysLeft === 0 && (
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              Tu trial venció. Selecciona un plan para continuar.
            </div>
          )}
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {plans.map(({ plan, recommended }) => {
            const isCurrent = plan === currentPlan;
            const price = PLAN_PRICE_MENSUAL[plan];
            const features = PLAN_FEATURES_LIST[plan];

            return (
              <div
                key={plan}
                className={`relative bg-white rounded-2xl border p-6 flex flex-col ${
                  recommended
                    ? "border-violet-400 shadow-lg shadow-violet-100 ring-2 ring-violet-200"
                    : isCurrent
                    ? "border-blue-300 bg-blue-50/30"
                    : "border-zinc-200"
                }`}
              >
                {recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full">
                    Popular
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full">
                    Plan actual
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">{PLAN_LABEL[plan]}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-zinc-900">${price}</span>
                    <span className="text-sm text-zinc-400 mb-1">/mes</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">+ $1,300 activación única</p>
                </div>

                <ul className="flex-1 space-y-2.5 mb-6">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-zinc-700">
                      <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div className="w-full py-2.5 rounded-xl text-center text-sm font-medium bg-zinc-100 text-zinc-400 cursor-default">
                    Plan actual
                  </div>
                ) : (
                  <a
                    href={`https://wa.me/${WHATSAPP}?text=Hola,%20quiero%20actualizar%20al%20plan%20${PLAN_LABEL[plan]}%20para%20${org.nombre}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-2.5 rounded-xl text-center text-sm font-semibold transition-colors block ${
                      recommended
                        ? "bg-violet-600 text-white hover:bg-violet-700"
                        : "bg-zinc-900 text-white hover:bg-zinc-700"
                    }`}
                  >
                    Solicitar {PLAN_LABEL[plan]} →
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {/* Nota */}
        <p className="text-center text-xs text-zinc-400">
          Los cambios de plan se activan en menos de 24 h · 7 días de prueba incluidos en todos los planes ·{" "}
          <a
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 underline hover:text-zinc-700"
          >
            Contactar soporte por WhatsApp
          </a>
        </p>
      </div>
    </div>
  );
}
