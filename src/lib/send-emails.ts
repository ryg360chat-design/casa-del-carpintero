import { getResend, getFromEmail, resolveToEmail } from "@/lib/resend";
import {
  emailBienvenida,
  emailBienvenidaPlan,
  emailTrialWarning,
  emailTrialExpired,
} from "@/lib/email-templates";
import { createAdminClient } from "@/lib/supabase/admin";

async function send(to: string, subject: string, html: string) {
  const resend = getResend();
  await resend.emails.send({
    from: getFromEmail(),
    to: resolveToEmail(to),
    subject,
    html,
  });
}

async function markOrgFlag(orgId: string, flag: "email_trial_warning_sent" | "email_trial_expired_sent") {
  const admin = createAdminClient();
  await admin.from("organizations").update({ [flag]: true }).eq("id", orgId);
}

export async function sendBienvenidaEmail(to: string, orgNombre: string, userName: string) {
  const { subject, html } = emailBienvenida(orgNombre, userName);
  await send(to, subject, html);
}

export async function sendBienvenidaPlanEmail(orgId: string, orgNombre: string, plan: string) {
  const admin = createAdminClient();

  // Buscar el admin/gerente de la org
  const { data: profile } = await admin
    .from("profiles")
    .select("id, nombre")
    .eq("organization_id", orgId)
    .in("rol", ["admin", "gerencia", "developer"])
    .limit(1)
    .single();

  if (!profile) return;

  // Obtener su email desde Supabase Auth
  const { data: { user: authUser } } = await admin.auth.admin.getUserById(profile.id);
  if (!authUser?.email) return;

  const userName = profile.nombre ?? authUser.email.split("@")[0];
  const { subject, html } = emailBienvenidaPlan(orgNombre, userName, plan);
  await send(authUser.email, subject, html);
}

export async function sendTrialWarningEmail(
  to: string,
  orgId: string,
  orgNombre: string,
  daysLeft: number
) {
  const { subject, html } = emailTrialWarning(orgNombre, daysLeft);
  await send(to, subject, html);
  await markOrgFlag(orgId, "email_trial_warning_sent");
}

export async function sendTrialExpiredEmail(
  to: string,
  orgId: string,
  orgNombre: string
) {
  const { subject, html } = emailTrialExpired(orgNombre);
  await send(to, subject, html);
  await markOrgFlag(orgId, "email_trial_expired_sent");
}
