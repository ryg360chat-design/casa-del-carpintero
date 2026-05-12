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

function fmtFecha(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-PE", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric" });
}

export async function GET(req: Request) {
  const role = await getUserRole();
  const org = await getOrganization();
  if (!org) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const canAccess = hasOrgFeature(org.plan, org.features_enabled ?? [], "modulo_financiero", role === "developer");
  if (!canAccess) return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const now = new Date();
  const mes = parseInt(searchParams.get("mes") ?? String(now.getMonth() + 1));
  const año = parseInt(searchParams.get("año") ?? String(now.getFullYear()));

  const start = new Date(año, mes - 1, 1).toISOString();
  const end   = new Date(año, mes, 0, 23, 59, 59).toISOString();

  const costoPlanche    = (org.config as Record<string, number>)?.costo_planche     ?? 0;
  const costoCantoMetro = (org.config as Record<string, number>)?.costo_canto_metro ?? 0;

  const supabase = await createClient();
  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("id, estado, precio_venta, cant_planchas, cant_piezas, metros_canto, tipo_tablero, marca_melamina, fecha_ingreso, clientes(nombre)")
    .eq("organization_id", org.id)
    .gte("fecha_ingreso", start)
    .lte("fecha_ingreso", end)
    .order("fecha_ingreso", { ascending: false });

  type FinRow = {
    estado: string; precio_venta: number | null; cant_planchas: number | null;
    metros_canto: number | null; tipo_tablero: string | null; marca_melamina: string | null;
    fecha_ingreso: string | null; clientes: { nombre?: string } | null;
  };

  const headers = [
    "Fecha", "Cliente", "Tipo Tablero", "Marca", "Planchas", "Metros Canto",
    "Estado", "Precio Venta", "Costo Tablero", "Costo Canto", "Costo Total", "Margen", "Margen %",
  ];

  const rows = (pedidos ?? [] as FinRow[]).map((p: FinRow) => {
    const cliente = (p.clientes as { nombre?: string } | null)?.nombre ?? "";
    const precioVenta   = p.precio_venta ?? 0;
    const costoTablero  = (p.cant_planchas ?? 0) * costoPlanche;
    const costoCanto    = (p.metros_canto ?? 0) * costoCantoMetro;
    const costoTotal    = costoTablero + costoCanto;
    const margen        = precioVenta - costoTotal;
    const margenPct     = precioVenta > 0 ? ((margen / precioVenta) * 100).toFixed(1) + "%" : "—";
    return [
      fmtFecha(p.fecha_ingreso),
      cliente,
      p.tipo_tablero ?? "",
      p.marca_melamina ?? "",
      p.cant_planchas ?? 0,
      p.metros_canto ?? 0,
      p.estado ?? "",
      precioVenta.toFixed(2),
      costoTablero.toFixed(2),
      costoCanto.toFixed(2),
      costoTotal.toFixed(2),
      margen.toFixed(2),
      margenPct,
    ].map(esc).join(",");
  });

  const csv = [headers.join(","), ...rows].join("\r\n");
  const mesNombre = new Date(año, mes - 1).toLocaleDateString("es", { month: "long", year: "numeric" });

  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="financiero-${año}-${String(mes).padStart(2,"0")}.csv"`,
    },
  });
}
