import { NextRequest, NextResponse } from "next/server";
import { verifyTOTP } from "@/lib/totp";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  const { key, totp } = await req.json().catch(() => ({ key: null, totp: null }));
  const ip = getClientIp(req);

  if (key !== process.env.SUPERADMIN_KEY) {
    // Solo cuenta intentos fallidos
    const rl = await checkRateLimit(`superadmin:${ip}`);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Demasiados intentos. Intenta en ${rl.retryAfterSecs}s.` },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: "Clave incorrecta" }, { status: 401 });
  }

  const secret = process.env.SUPERADMIN_TOTP_SECRET;
  if (secret) {
    if (!totp || !verifyTOTP(secret, totp)) {
      return NextResponse.json({ error: "Código TOTP inválido o expirado" }, { status: 401 });
    }
  }

  return NextResponse.json({ ok: true });
}
