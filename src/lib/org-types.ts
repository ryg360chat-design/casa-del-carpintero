// Tipos y constantes de org — sin imports de servidor, usable en client components

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
  features_enabled: string[];
  config: Record<string, unknown>;
  roles_nombres: Record<string, string>;
  email_trial_warning_sent: boolean;
  email_trial_expired_sent: boolean;
  onboarding_done: boolean;
  created_at: string | null;
};

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
