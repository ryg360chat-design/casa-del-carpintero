import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ totpEnabled: !!process.env.SUPERADMIN_TOTP_SECRET });
}
