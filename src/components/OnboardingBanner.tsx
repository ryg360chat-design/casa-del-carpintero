import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Organization } from "@/lib/org-types";
import Link from "next/link";

interface Props {
  org: Organization;
}

async function markDone(orgId: string) {
  "use server";
  const admin = createAdminClient();
  await admin.from("organizations").update({ onboarding_done: true }).eq("id", orgId);
  revalidatePath("/", "layout");
}

export default async function OnboardingBanner({ org }: Props) {
  if (org.onboarding_done) return null;

  // Orgs con más de 7 días → auto-cerrar silenciosamente
  if (org.created_at) {
    const age = Date.now() - new Date(org.created_at).getTime();
    if (age > 7 * 24 * 60 * 60 * 1000) {
      const admin = createAdminClient();
      admin.from("organizations").update({ onboarding_done: true }).eq("id", org.id).then(() => {});
      return null;
    }
  }

  const supabase = await createClient();

  const [
    { count: clientesCount },
    { count: pedidosCount },
    { data: maquinasData },
  ] = await Promise.all([
    supabase.from("clientes").select("*", { count: "exact", head: true }),
    supabase.from("pedidos").select("*", { count: "exact", head: true }),
    supabase.from("maquinas").select("nombre"),
  ]);

  const step1 = (maquinasData ?? []).some(
    (m: { nombre: string }) => m.nombre !== "Máquina 1" && m.nombre !== "Máquina 2"
  );
  const step2 = (clientesCount ?? 0) > 0;
  const step3 = (pedidosCount ?? 0) > 0;
  const allDone = step1 && step2 && step3;

  const completed = [step1, step2, step3].filter(Boolean).length;

  const dismiss = markDone.bind(null, org.id);

  // Estado "todo listo" — banner de felicitación antes de cerrar
  if (allDone) {
    return (
      <div className="mx-4 mt-4 mb-0 rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8l4 4 6-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">¡Tu taller está configurado!</p>
              <p className="text-xs text-emerald-600 mt-0.5">Completaste los primeros pasos. Ya puedes usar Kuadra al 100%.</p>
            </div>
          </div>
          <form action={dismiss}>
            <button
              type="submit"
              className="text-xs text-emerald-600 hover:text-emerald-800 font-medium transition-colors whitespace-nowrap ml-4"
            >
              Cerrar ×
            </button>
          </form>
        </div>
      </div>
    );
  }

  const steps = [
    {
      done: step1,
      label: "Personaliza tus máquinas",
      sub: "Renombra tus máquinas en Ajustes",
      href: "/ajustes",
    },
    {
      done: step2,
      label: "Agrega tu primer cliente",
      sub: "Ve al módulo de Clientes",
      href: "/crm",
    },
    {
      done: step3,
      label: "Crea tu primer pedido",
      sub: "Registra el primer trabajo del taller",
      href: "/pedidos/nuevo",
    },
  ];

  return (
    <div className="mx-4 mt-4 mb-0 rounded-2xl border border-blue-100 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: "linear-gradient(135deg, #1957A6 0%, #267A8C 100%)" }}
          >
            {completed}
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-800 leading-none">
              Primeros pasos en Kuadra
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              {completed} de 3 completados
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="w-32 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(completed / 3) * 100}%`,
                background: "linear-gradient(90deg, #1957A6, #267A8C)",
              }}
            />
          </div>
          <form action={dismiss}>
            <button
              type="submit"
              className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors whitespace-nowrap"
            >
              Saltar →
            </button>
          </form>
        </div>

        {/* Mobile dismiss */}
        <form action={dismiss} className="sm:hidden">
          <button type="submit" className="text-xs text-zinc-400 hover:text-zinc-600">
            Saltar
          </button>
        </form>
      </div>

      {/* Steps */}
      <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-zinc-100">
        {steps.map((step, i) => (
          <Link
            key={i}
            href={step.done ? "#" : step.href}
            className={`flex-1 flex items-center gap-3 px-5 py-3.5 transition-colors group ${
              step.done
                ? "opacity-60 cursor-default"
                : "hover:bg-blue-50/60 cursor-pointer"
            }`}
          >
            {/* Circle / checkmark */}
            <div
              className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all ${
                step.done
                  ? "border-emerald-500 bg-emerald-500"
                  : "border-zinc-300 group-hover:border-blue-400"
              }`}
            >
              {step.done ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span className="text-[10px] font-bold text-zinc-400 group-hover:text-blue-500">
                  {i + 1}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <p
                className={`text-sm font-medium leading-none ${
                  step.done ? "text-zinc-400 line-through" : "text-zinc-800"
                }`}
              >
                {step.label}
              </p>
              {!step.done && (
                <p className="text-xs text-zinc-400 mt-0.5 truncate">{step.sub}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
