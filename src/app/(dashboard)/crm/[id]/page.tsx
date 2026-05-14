import { redirect, notFound } from "next/navigation";
import { getUserRole } from "@/lib/auth";
import { getOrganization } from "@/lib/org";
import { hasOrgFeature } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import { TZ } from "@/lib/time";
import Link from "next/link";
import NotasForm from "./NotasForm";
import EditarClienteForm from "./EditarClienteForm";

function fmtFecha(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-PE", { timeZone: TZ, day: "2-digit", month: "short", year: "numeric" });
}

const ESTADO_COLOR: Record<string, string> = {
  "En cola":       "bg-orange-100 text-orange-700",
  "En corte":      "bg-blue-100 text-blue-700",
  "En tapacantos": "bg-purple-100 text-purple-700",
  "Listo":         "bg-green-100 text-green-700",
  "Despachado":    "bg-zinc-100 text-zinc-600",
  "Cancelado":     "bg-red-100 text-red-600",
};

export default async function ClienteDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [role, org] = await Promise.all([getUserRole(), getOrganization()]);
  if (!org) redirect("/dashboard");

  const canAccess = hasOrgFeature(org.plan, org.features_enabled ?? [], "crm_clientes", role === "developer");
  if (!canAccess) redirect("/dashboard");
  if (!["developer", "admin", "gerencia", "administracion", "ventas"].includes(role)) redirect("/dashboard");

  const supabase = await createClient();

  const { data: cliente } = await supabase
    .from("clientes")
    .select("id, nombre, codigo, telefono, email, notas")
    .eq("id", id)
    .eq("organization_id", org.id)
    .maybeSingle();

  if (!cliente) notFound();

  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("id, numero_boleta, tipo_tablero, marca_melamina, cant_planchas, cant_piezas, estado, precio_venta, fecha_ingreso")
    .eq("cliente_id", id)
    .eq("organization_id", org.id)
    .order("fecha_ingreso", { ascending: false });

  type PedidoRow = {
    id: string; numero_boleta: string | null; tipo_tablero: string | null;
    marca_melamina: string | null; cant_planchas: number | null; cant_piezas: number | null;
    estado: string | null; precio_venta: number | null; fecha_ingreso: string | null;
  };

  const peds = (pedidos ?? [] as PedidoRow[]) as PedidoRow[];
  const totalFacturado = peds.reduce((s, p) => s + (p.precio_venta ?? 0), 0);
  const activos = peds.filter(p => !["Cancelado", "Despachado"].includes(p.estado ?? "")).length;
  const primerPedido = peds.at(-1)?.fecha_ingreso ?? null;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/crm" className="text-zinc-400 hover:text-zinc-700 transition-colors">Clientes</Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        <span className="font-semibold text-zinc-800">{cliente.nombre as string}</span>
      </div>

      {/* Header con edición inline */}
      <div className="border border-zinc-200 rounded-xl p-5 flex gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg shrink-0">
          {(cliente.nombre as string)[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          {cliente.codigo && <p className="text-xs text-zinc-400 mb-1">Código: {cliente.codigo as string}</p>}
          <EditarClienteForm
            clienteId={id}
            nombre={(cliente.nombre as string)}
            telefono={(cliente.telefono as string | null) ?? ""}
            email={(cliente.email as string | null) ?? ""}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total pedidos", value: peds.length, color: "text-zinc-900" },
          { label: "En proceso", value: activos, color: activos > 0 ? "text-blue-600" : "text-zinc-900" },
          { label: "Total facturado", value: totalFacturado > 0 ? `S/ ${totalFacturado.toFixed(2)}` : "—", color: "text-green-700" },
          { label: "Cliente desde", value: fmtFecha(primerPedido), color: "text-zinc-900" },
        ].map((stat) => (
          <div key={stat.label} className="border border-zinc-200 rounded-xl p-4">
            <p className="text-xs text-zinc-400 font-medium">{stat.label}</p>
            <p className={`text-lg font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Notas */}
      <div className="border border-zinc-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-700 mb-3">Notas internas</h2>
        <NotasForm clienteId={id} notasIniciales={(cliente.notas as string | null) ?? ""} />
      </div>

      {/* Historial */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-700 mb-3">Historial de pedidos ({peds.length})</h2>
        {peds.length === 0 ? (
          <div className="border border-dashed border-zinc-200 rounded-xl py-10 px-4 text-center animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.5">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect width="6" height="4" x="9" y="3" rx="1"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-zinc-600 mb-1">Sin pedidos aún</p>
            <p className="text-xs text-zinc-400">Cuando este cliente tenga pedidos aparecerán aquí.</p>
          </div>
        ) : (
          <div className="border border-zinc-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100 text-xs text-zinc-500 uppercase tracking-wide">
                  <th className="text-left px-4 py-3 font-semibold">Fecha</th>
                  <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Material</th>
                  <th className="text-right px-4 py-3 font-semibold hidden md:table-cell">Planchas</th>
                  <th className="text-right px-4 py-3 font-semibold hidden md:table-cell">Piezas</th>
                  <th className="text-left px-4 py-3 font-semibold">Estado</th>
                  <th className="text-right px-4 py-3 font-semibold">Precio</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {peds.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3 text-zinc-500 text-xs">{fmtFecha(p.fecha_ingreso)}</td>
                    <td className="px-4 py-3 text-zinc-600 hidden sm:table-cell">
                      {p.tipo_tablero ?? "—"}
                      {p.marca_melamina && <span className="text-zinc-400 ml-1 text-xs">· {p.marca_melamina}</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-600 hidden md:table-cell">{p.cant_planchas ?? "—"}</td>
                    <td className="px-4 py-3 text-right text-zinc-600 hidden md:table-cell">{p.cant_piezas ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLOR[p.estado ?? ""] ?? "bg-zinc-100 text-zinc-600"}`}>
                        {p.estado ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-zinc-800">
                      {p.precio_venta != null ? `S/ ${p.precio_venta.toFixed(2)}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/pedidos/${p.id}`} className="text-xs text-blue-600 hover:text-blue-800">Ver</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
              {totalFacturado > 0 && (
                <tfoot>
                  <tr className="border-t border-zinc-200 bg-zinc-50">
                    <td colSpan={5} className="px-4 py-3 text-xs text-zinc-500 font-medium hidden md:table-cell">Total</td>
                    <td colSpan={5} className="px-4 py-3 md:hidden" />
                    <td className="px-4 py-3 text-right font-bold text-zinc-900">S/ {totalFacturado.toFixed(2)}</td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
