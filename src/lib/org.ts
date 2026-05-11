import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type OrgPlan = "trial" | "basico" | "profesional" | "empresarial";

export type Organization = {
  id: string;
  nombre: string;
  slug: string;
  plan: OrgPlan;
  max_maquinas: number;
  max_usuarios: number;
  trial_ends_at: string | null;
  subscribed_at: string | null;
  stripe_customer_id: string | null;
  activo: boolean;
};

export const getOrganization = cache(async (): Promise<Organization | null> => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("organization_id, organizations(id, nombre, slug, plan, max_maquinas, max_usuarios, trial_ends_at, subscribed_at, activo)")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !data?.organizations) return null;
    return data.organizations as unknown as Organization;
  } catch {
    return null;
  }
});

export function isTrialExpired(org: Organization): boolean {
  if (org.plan !== "trial") return false;
  if (!org.trial_ends_at) return false;
  return new Date(org.trial_ends_at) < new Date();
}

export function daysLeftInTrial(org: Organization): number {
  if (org.plan !== "trial" || !org.trial_ends_at) return 0;
  const diff = new Date(org.trial_ends_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export const PLAN_LABEL: Record<OrgPlan, string> = {
  trial:        "Trial",
  basico:       "Básico",
  profesional:  "Profesional",
  empresarial:  "Empresarial",
};

export const PLAN_COLOR: Record<OrgPlan, string> = {
  trial:        "#6b7280",
  basico:       "#1957A6",
  profesional:  "#7c3aed",
  empresarial:  "#CC5238",
};
