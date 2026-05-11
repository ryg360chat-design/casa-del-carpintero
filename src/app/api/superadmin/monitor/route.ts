import { NextRequest, NextResponse } from "next/server";
import { securityEvents } from "@/lib/security-events";

function requireSuperAdmin(req: NextRequest) {
  const key = req.headers.get("x-superadmin-key");
  if (!process.env.SUPERADMIN_KEY || key !== process.env.SUPERADMIN_KEY) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const deny = requireSuperAdmin(req);
  if (deny) return deny;

  const last24h = Date.now() - 24 * 60 * 60 * 1000;
  const recent = securityEvents.filter(e => new Date(e.ts).getTime() > last24h);

  const kpis = {
    exitosos:   recent.filter(e => e.tipo === "success").length,
    fallidos:   recent.filter(e => e.tipo === "failed").length,
    bloqueados: recent.filter(e => e.tipo === "blocked").length,
  };

  return NextResponse.json({ kpis, events: recent.slice(0, 50) });
}
