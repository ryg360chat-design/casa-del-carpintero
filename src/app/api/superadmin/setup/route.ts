import { NextRequest, NextResponse } from "next/server";
import { generateTOTPUri } from "@/lib/totp";

export async function GET(req: NextRequest) {
  const key = req.headers.get("x-superadmin-key");
  if (key !== process.env.SUPERADMIN_KEY) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const secret = process.env.SUPERADMIN_TOTP_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "SUPERADMIN_TOTP_SECRET no configurado" }, { status: 400 });
  }

  const uri = generateTOTPUri(secret, "Kuadra", "superadmin");
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uri)}`;
  return NextResponse.json({ qr, secret, uri });
}
