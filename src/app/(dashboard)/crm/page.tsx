import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/auth";
import { getOrganization } from "@/lib/org";
import { hasOrgFeature } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import { TZ } from "@/lib/time";
import Link from "next/link";

function fmtFecha(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-PE", { timeZone: TZ, day: "2-digit", month: "short", year: "numeric" });
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
    .select("id, nombre, codigo, telefono, email, pedidos(id, precio_venta, estado, fecha_ingreso)")
    .eq("organization_id", org.id)
    .order("nombre");

  type PedidoSub = { id: string; precio_venta: number | null; estado: string | null; fecha_ingreso: string | null };
  type ClienteRow = {
    id: string; nombre: string; codigo?: string | null; telefono?: string | null;
    email?: string | null; pedidos: PedidoSub[];
  };

  const rows = (clientes ?? [] as ClienteRow[]).map((c: ClienteRow) => {
    const peds = c.pedidos ?? [];
    const totalFacturado = peds.reduce((s, p) => s + (p.precio_venta ?? 0), 0);
    const activos = peds.filter(p => !["Cancelado", "Despachado"].includes(p.estado ?? "")).length;
    const ultimoPedido = peds.map(p => p.fecha_ingreso).filter(Boolean).sort().at(-1) ?? null;
    return { ...c, total: peds.length, totalFacturado, activos, ultimoPedido };
  }).sort((a, b) => b.totalFacturado - a.totalFacturado);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">CRM de Clientes</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{rows.length} clientes registrados</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="border border-dashed border-zinc-200 rounded-xl p-12 text-center">
          <p className="text-zinc-400 text-sm">No hay clientes aún. Se crean automáticamente al ingresar pedidos.</p>
        </div>
      ) : (
        <div className="border border-zinc-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-xs text-zinc-500 uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-semibold">Cliente</th>
                <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Teléfono</th>
                <th className="text-right px-4 py-3 font-semibold">Pedidos</th>
                <th className="text-right px-4 py-3 font-semibold hidden md:table-cell">Activos</th>
                <th className="text-right px-4 py-3 font-semibold">Facturado</th>
                <th className="text-right px-4 py-3 font-semibold hidden lg:table-cell">Último pedido</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                        {c.nombre[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-zinc-900">{c.nombre}</div>
                        {c.codigo && <div className="text-xs text-zinc-400">{c.codigo}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 hidden sm:table-cell">{c.telefono ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-semibold text-zinc-700">{c.total}</td>
                  <td className="px-4 py-3 text-right hidden md:table-cell">
                    {c.activos > 0 ? (
                      <span className="inline-flex items-center gap-1 text-blue-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                        {c.activos}
                      </span>
                    ) : <span className="text-zinc-400">0</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-zinc-800">
                    {c.totalFacturado > 0 ? `S/ ${c.totalFacturado.toFixed(2)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-400 text-xs hidden lg:table-cell">
                    {fmtFecha(c.ultimoPedido)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/crm/${c.id}`} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
