import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/auth";
import { getOrganization } from "@/lib/org";
import { hasOrgFeature } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import { TZ } from "@/lib/time";
import Link from "next/link";
import NuevoClienteModal from "./NuevoClienteModal";

function fmtFecha(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-PE", { timeZone: TZ, day: "2-digit", month: "short" });
}

type PedidoSub = { id: string; precio_venta: number | null; estado: string | null; fecha_ingreso: string | null };
type ClienteRow = { id: string; nombre: string; codigo?: string | null; telefono?: string | null; pedidos: PedidoSub[] };
type CrmCard = ClienteRow & { totalPedidos: number; totalFacturado: number; pedidosActivos: PedidoSub[]; ultimoPedido: string | null; columna: string };

const COLUMNAS = [
  { key: "cola",       label: "En cola",              color: "text-orange-600", bg: "bg-orange-50",  border: "border-orange-200", dot: "bg-orange-400" },
  { key: "produccion", label: "En producción",         color: "text-blue-600",   bg: "bg-blue-50",    border: "border-blue-200",   dot: "bg-blue-500" },
  { key: "listo",      label: "Listo para entregar",   color: "text-green-600",  bg: "bg-green-50",   border: "border-green-200",  dot: "bg-green-500" },
  { key: "sin_activos",label: "Sin pedidos activos",   color: "text-zinc-400",   bg: "bg-zinc-50",    border: "border-zinc-200",   dot: "bg-zinc-400" },
];

function getColumna(peds: PedidoSub[]): string {
  const activos = peds.filter(p => !["Cancelado", "Despachado"].includes(p.estado ?? ""));
  if (activos.some(p => p.estado === "Listo")) return "listo";
  if (activos.some(p => p.estado === "En tapacantos" || p.estado === "En corte")) return "produccion";
  if (activos.some(p => p.estado === "En cola")) return "cola";
  return "sin_activos";
}

export default async function CrmPage() {
  const [role, org] = await Promise.all([getUserRole(), getOrganization()]);
  if (!org) redirect("/dashboard");

  const canAccess = hasOrgFeature(org.plan, org.features_enabled ?? [], "crm_clientes", role === "developer");
  if (!canAccess) redirect("/dashboard");
  if (!["developer", "admin", "gerencia", "administracion", "ventas"].includes(role)) redirect("/dashboard");

  const supabase = await createClient();
  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, nombre, codigo, telefono, pedidos(id, precio_venta, estado, fecha_ingreso)")
    .eq("organization_id", org.id)
    .order("nombre");

  const cards: CrmCard[] = (clientes ?? [] as ClienteRow[]).map((c: ClienteRow): CrmCard => {
    const peds = c.pedidos ?? [];
    const pedidosActivos = peds.filter(p => !["Cancelado", "Despachado"].includes(p.estado ?? ""));
    const totalFacturado = peds.reduce((s, p) => s + (p.precio_venta ?? 0), 0);
    const ultimoPedido = peds.map(p => p.fecha_ingreso).filter(Boolean).sort().at(-1) ?? null;
    return { ...c, totalPedidos: peds.length, totalFacturado, pedidosActivos, ultimoPedido, columna: getColumna(peds) };
  });

  const byCol = (key: string) => cards.filter(c => c.columna === key);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">CRM de Clientes</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{cards.length} clientes · {cards.filter(c => c.columna !== "sin_activos").length} con pedidos activos</p>
        </div>
        <NuevoClienteModal />
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNAS.map((col) => {
          const colCards = byCol(col.key);
          return (
            <div key={col.key} className="flex flex-col gap-3">
              {/* Column header */}
              <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${col.border} ${col.bg}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <span className={`text-xs font-semibold ${col.color}`}>{col.label}</span>
                </div>
                <span className={`text-xs font-bold ${col.color}`}>{colCards.length}</span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2">
                {colCards.length === 0 && (
                  <div className="border border-dashed border-zinc-200 rounded-xl p-4 text-center text-zinc-400 text-xs">
                    Sin clientes
                  </div>
                )}
                {colCards.map((c) => (
                  <Link key={c.id} href={`/crm/${c.id}`} className="block border border-zinc-200 rounded-xl p-4 bg-white hover:shadow-sm hover:border-zinc-300 transition-all group">
                    {/* Avatar + nombre */}
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[12px] font-bold shrink-0">
                        {c.nombre[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-zinc-900 text-sm truncate group-hover:text-blue-700 transition-colors">{c.nombre}</div>
                        {c.telefono && <div className="text-xs text-zinc-400">{c.telefono}</div>}
                      </div>
                    </div>

                    {/* Pedidos activos badges */}
                    {c.pedidosActivos.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {c.pedidosActivos.map((p) => (
                          <span key={p.id} className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${
                            p.estado === "En cola"        ? "bg-orange-50 text-orange-600 border-orange-200" :
                            p.estado === "En corte"       ? "bg-blue-50 text-blue-600 border-blue-200" :
                            p.estado === "En tapacantos"  ? "bg-purple-50 text-purple-600 border-purple-200" :
                            p.estado === "Listo"          ? "bg-green-50 text-green-700 border-green-200" :
                            "bg-zinc-50 text-zinc-500 border-zinc-200"
                          }`}>
                            {p.estado}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Stats footer */}
                    <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-100">
                      <span>{c.totalPedidos} pedido{c.totalPedidos !== 1 ? "s" : ""}</span>
                      <span className="font-semibold text-zinc-600">
                        {c.totalFacturado > 0 ? `S/ ${c.totalFacturado.toFixed(0)}` : "—"}
                      </span>
                      <span>{fmtFecha(c.ultimoPedido)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
