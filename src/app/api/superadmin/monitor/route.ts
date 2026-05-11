import { NextRequest, NextResponse } from "next/server";

function requireSuperAdmin(req: NextRequest) {
  const key = req.headers.get("x-superadmin-key");
  if (!process.env.SUPERADMIN_KEY || key !== process.env.SUPERADMIN_KEY) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return null;
}

// In-memory event log (se resetea al reiniciar servidor)
export const securityEvents: {
  ts: string; ip: string; tipo: "success" | "failed" | "blocked"; detalle: string;
}[] = [];

export function logSecurityEvent(
  ip: string,
  tipo: "success" | "failed" | "blocked",
  detalle: string
) {
  securityEvents.unshift({ ts: new Date().toISOString(), ip, tipo, detalle });
  if (securityEvents.length > 200) securityEvents.length = 200;
}

export async function GET(req: NextRequest) {
  const deny = requireSuperAdmin(req);
  if (deny) return deny;

  const last24h = Date.now() - 24 * 60 * 60 * 1000;
  const recent = securityEvents.filter(e => new Date(e.ts).getTime() > last24h);

  const kpis = {
    exitosos: recent.filter(e => e.tipo === "success").length,
    fallidos:  recent.filter(e => e.tipo === "failed").length,
    bloqueados: recent.filter(e => e.tipo === "blocked").length,
  };

  return NextResponse.json({ kpis, events: recent.slice(0, 50) });
}
