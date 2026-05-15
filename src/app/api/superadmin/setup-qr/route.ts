import { NextRequest, NextResponse } from "next/server";
import { generateTOTPUri } from "@/lib/totp";

// Devuelve el QR validando solo la clave maestra (sin TOTP) — para setup inicial
export async function POST(req: NextRequest) {
  const { key } = await req.json().catch(() => ({ key: null }));

  if (!process.env.SUPERADMIN_KEY || key !== process.env.SUPERADMIN_KEY) {
    return NextResponse.json({ error: "Clave incorrecta" }, { status: 401 });
  }

  const secret = process.env.SUPERADMIN_TOTP_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "SUPERADMIN_TOTP_SECRET no configurado" }, { status: 400 });
  }

  const uri = generateTOTPUri(secret, "Kuadra", "superadmin");
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(uri)}`;
  return NextResponse.json({ qr });
}
