import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
export type { OrgPlan, Organization } from "@/lib/org-types";
export { PLAN_LABEL, PLAN_COLOR } from "@/lib/org-types";

export const getOrganization = cache(async () => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("organization_id, organizations(id, nombre, slug, plan, max_maquinas, max_usuarios, trial_ends_at, subscribed_at, activo, features_enabled, config, roles_nombres)")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !data?.organizations) return null;
    return data.organizations as unknown as import("@/lib/org-types").Organization;
  } catch {
    return null;
  }
});

export function isTrialExpired(org: import("@/lib/org-types").Organization): boolean {
  if (org.plan !== "trial") return false;
  if (!org.trial_ends_at) return false;
  return new Date(org.trial_ends_at) < new Date();
}

export function daysLeftInTrial(org: import("@/lib/org-types").Organization): number {
  if (org.plan !== "trial" || !org.trial_ends_at) return 0;
  const diff = new Date(org.trial_ends_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
