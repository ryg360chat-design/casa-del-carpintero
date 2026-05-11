import { NextRequest, NextResponse } from "next/server";
import { getResend, getFromEmail, resolveToEmail } from "@/lib/resend";

function requireSuperAdmin(req: NextRequest) {
  const key = req.headers.get("x-superadmin-key");
  if (key !== process.env.SUPERADMIN_KEY) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return null;
}

export async function POST(req: NextRequest) {
  const authError = requireSuperAdmin(req);
  if (authError) return authError;

  const fromEmail = getFromEmail();
  const toEmail = resolveToEmail("rygingenieria1@gmail.com");

  console.log(`[test-email] from=${fromEmail} to=${toEmail}`);

  try {
    const result = await getResend().emails.send({
      from: fromEmail,
      to: toEmail,
      subject: "Test email Kuadra — funcionando ✓",
      html: `
        <h2>Test de email desde el superadmin de Kuadra</h2>
        <p>Si ves este correo, Resend está configurado correctamente.</p>
        <p><strong>From:</strong> ${fromEmail}</p>
        <p><strong>To:</strong> ${toEmail}</p>
        <p style="color:#999;font-size:12px">Enviado desde kuadra-ryg.vercel.app/superadmin</p>
      `,
    });
    console.log(`[test-email] result:`, JSON.stringify(result));
    return NextResponse.json({ ok: true, from: fromEmail, to: toEmail, result });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[test-email] ERROR:`, e);
    return NextResponse.json({ ok: false, error: msg, from: fromEmail, to: toEmail }, { status: 500 });
  }
}
