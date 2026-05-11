export function getResend() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Resend } = require("resend");
  return new Resend(process.env.RESEND_API_KEY);
}

export function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
}

export function resolveToEmail(real: string) {
  return process.env.RESEND_TO_OVERRIDE ?? real;
}
