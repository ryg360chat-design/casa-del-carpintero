import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth";
import { getOrganization } from "@/lib/org";
import { TZ } from "@/lib/time";

function fmtFecha(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("es-PE", {
    timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function esc(val: unknown): string {
  const s = val == null ? "" : String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  const role = await getUserRole();
  const org = await getOrganization();
  if (!org) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const allowed = ["developer", "admin", "gerencia", "administracion"];
  if (!allowed.includes(role)) return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  const supabase = await createClient();
  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("*, cliente:clientes(nombre, codigo)")
    .eq("organization_id", org.id)
    .order("fecha_ingreso", { ascending: false })
    .limit(5000);

  const headers = [
    "N°", "Cliente", "Código", "N° Boleta", "Tipo Tablero", "Marca", "Planchas",
    "Piezas", "Canto Grueso", "Canto Delgado", "Máquina", "Estado", "Prioridad",
    "Fecha Ingreso", "Fecha Entrega Est.", "Fecha Entrega Real", "Notas",
  ];

  const rows = (pedidos ?? []).map((p, i) => {
    const cliente = (p.cliente as { nombre?: string; codigo?: string } | null);
    return [
      i + 1,
      cliente?.nombre ?? "",
      cliente?.codigo ?? "",
      p.numero_boleta ?? "",
      p.tipo_tablero ?? "",
      p.marca_melamina ?? "",
      p.cant_planchas ?? "",
      p.cant_piezas ?? "",
      p.canto_grueso ?? "",
      p.canto_delgado ?? "",
      p.maquina_asignada ?? "",
      p.estado ?? "",
      p.prioridad ?? "",
      fmtFecha(p.fecha_ingreso),
      fmtFecha(p.fecha_entrega_estimada),
      fmtFecha(p.fecha_entrega_real),
      p.notas ?? "",
    ].map(esc).join(",");
  });

  const csv = [headers.join(","), ...rows].join("\r\n");
  const fecha = new Date().toLocaleDateString("en-CA", { timeZone: TZ });

  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pedidos-${fecha}.csv"`,
    },
  });
}
