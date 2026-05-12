import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth";
import { getOrganization } from "@/lib/org";
import { hasOrgFeature } from "@/lib/plans";
import { TZ } from "@/lib/time";

function esc(val: unknown): string {
  const s = val == null ? "" : String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: Request) {
  const role = await getUserRole();
  const org = await getOrganization();
  if (!org) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const canAccess = hasOrgFeature(org.plan, org.features_enabled ?? [], "control_materiales", role === "developer");
  if (!canAccess) return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo") ?? "inventario"; // "inventario" | "kardex"

  const supabase = await createClient();

  if (tipo === "kardex") {
    const { data: movs } = await supabase
      .from("movimientos_material")
      .select("*, materiales(tipo, marca, espesor)")
      .eq("organization_id", org.id)
      .order("created_at", { ascending: false })
      .limit(5000);

    const headers = ["Fecha", "Material", "Marca", "Espesor", "Tipo Movimiento", "Cantidad", "Stock Resultante", "Pedido ID", "Notas"];
    const rows = (movs ?? []).map(m => {
      const mat = m.materiales as { tipo?: string; marca?: string; espesor?: string } | null;
      return [
        new Date(m.created_at).toLocaleString("es-PE", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        mat?.tipo ?? "",
        mat?.marca ?? "",
        mat?.espesor ?? "",
        m.tipo ?? "",
        m.cantidad ?? "",
        m.stock_resultante ?? "",
        m.pedido_id ?? "",
        m.notas ?? "",
      ].map(esc).join(",");
    });

    const csv = [headers.join(","), ...rows].join("\r\n");
    const fecha = new Date().toLocaleDateString("en-CA", { timeZone: TZ });
    return new NextResponse("﻿" + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="kardex-${fecha}.csv"`,
      },
    });
  }

  // Inventario actual
  const { data: mats } = await supabase
    .from("materiales")
    .select("*")
    .eq("organization_id", org.id)
    .eq("activo", true)
    .order("tipo").order("marca");

  const headers = ["Tipo", "Marca", "Espesor", "Stock Actual", "Stock Mínimo", "Precio Unitario", "Valor Total", "Estado"];
  const rows = (mats ?? []).map(m => {
    const valorTotal = (m.stock_actual ?? 0) * (m.precio_unitario ?? 0);
    const estado = (m.stock_actual ?? 0) <= 0 ? "SIN STOCK" : (m.stock_actual ?? 0) <= (m.stock_minimo ?? 0) ? "BAJO MÍNIMO" : "OK";
    return [
      m.tipo ?? "", m.marca ?? "", m.espesor ?? "",
      m.stock_actual ?? 0, m.stock_minimo ?? 0,
      m.precio_unitario ?? 0, valorTotal.toFixed(2), estado,
    ].map(esc).join(",");
  });

  const csv = [headers.join(","), ...rows].join("\r\n");
  const fecha = new Date().toLocaleDateString("en-CA", { timeZone: TZ });
  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inventario-${fecha}.csv"`,
    },
  });
}
