import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/auth";
import { getOrganization } from "@/lib/org";
import { hasOrgFeature } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import { TZ } from "@/lib/time";
import Link from "next/link";
import NuevoClienteModal from "./NuevoClienteModal";
import EtapaBtn from "./EtapaBtn";

function fmtFecha(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-PE", { timeZone: TZ, day: "2-digit", month: "short", year: "numeric" });
}

function fmtFechaCorta(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-PE", { timeZone: TZ, day: "2-digit", month: "short" });
}

type PedidoSub = { id: string; precio_venta: number | null; estado: string | null; fecha_ingreso: string | null };
type ClienteRow = { id: string; nombre: string; codigo?: string | null; telefono?: string | null; etapa_crm?: string | null; pedidos: PedidoSub[] };

const ETAPAS = [
  { key: "prospecto",  label: "Prospecto",  color: "text-zinc-600",   bg: "bg-zinc-50",    border: "border-zinc-200",   dot: "bg-zinc-400",   badge: "bg-zinc-100 text-zinc-600 border-zinc-200" },
  { key: "contactado", label: "Contactado", color: "text-sky-600",    bg: "bg-sky-50",     border: "border-sky-200",    dot: "bg-sky-500",    badge: "bg-sky-50 text-sky-700 border-sky-200" },
  { key: "activo",     label: "Activo",     color: "text-green-600",  bg: "bg-green-50",   border: "border-green-200",  dot: "bg-green-500",  badge: "bg-green-50 text-green-700 border-green-200" },
  { key: "frecuente",  label: "Frecuente",  color: "text-violet-600", bg: "bg-violet-50",  border: "border-violet-200", dot: "bg-violet-500", badge: "bg-violet-50 text-violet-700 border-violet-200" },
  { key: "inactivo",   label: "Inactivo",   color: "text-red-400",    bg: "bg-red-50",     border: "border-red-200",    dot: "bg-red-400",    badge: "bg-red-50 text-red-500 border-red-200" },
];

function getEtapa(etapa_crm: string | null | undefined) {
  return ETAPAS.find(e => e.key === etapa_crm) ?? ETAPAS[2]; // default: activo
}

const PER_PAGE = 15;
const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

export default async function CrmPage({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string; pagina?: string; mes?: string; año?: string }>;
}) {
  const [role, org, params] = await Promise.all([getUserRole(), getOrganization(), searchParams]);
  if (!org) redirect("/dashboard");

  const canAccess = hasOrgFeature(org.plan, org.features_enabled ?? [], "crm_clientes", role === "developer");
  if (!canAccess) redirect("/dashboard");
  if (!["developer", "admin", "gerencia", "administracion", "ventas"].includes(role)) redirect("/dashboard");

  const vista = params.vista ?? "lista";
  const pagina = Math.max(1, parseInt(params.pagina ?? "1"));
  const filtroMes = params.mes ? parseInt(params.mes) : null;
  const filtroAño = params.año ? parseInt(params.año) : null;
  const añoActual = new Date().getFullYear();

  const supabase = await createClient();
  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, nombre, codigo, telefono, etapa_crm, pedidos(id, precio_venta, estado, fecha_ingreso)")
    .eq("organization_id", org.id)
    .order("nombre");

  type CrmCard = ClienteRow & {
    totalPedidos: number; totalFacturado: number;
    pedidosActivos: PedidoSub[]; ultimoPedido: string | null;
  };

  const cards: CrmCard[] = (clientes ?? [] as ClienteRow[]).map((c: ClienteRow): CrmCard => {
    const peds = c.pedidos ?? [];
    const pedsFiltrados = (filtroMes && filtroAño)
      ? peds.filter(p => {
          if (!p.fecha_ingreso) return false;
          const d = new Date(p.fecha_ingreso);
          return d.getMonth() + 1 === filtroMes && d.getFullYear() === filtroAño;
        })
      : peds;
    const pedidosActivos = peds.filter(p => !["Cancelado", "Despachado"].includes(p.estado ?? ""));
    const totalFacturado = pedsFiltrados.reduce((s, p) => s + (p.precio_venta ?? 0), 0);
    const ultimoPedido = pedsFiltrados.map(p => p.fecha_ingreso).filter(Boolean).sort().at(-1) ?? null;
    return { ...c, totalPedidos: pedsFiltrados.length, totalFacturado, pedidosActivos, ultimoPedido };
  });

  // Para lista: ordenar por facturado desc, paginar
  const cardsSorted = [...cards].sort((a, b) => b.totalFacturado - a.totalFacturado);
  const totalPaginas = Math.ceil(cardsSorted.length / PER_PAGE);
  const paginados = cardsSorted.slice((pagina - 1) * PER_PAGE, pagina * PER_PAGE);

  // URL helpers
  function buildUrl(overrides: Record<string, string | null>) {
    const p = new URLSearchParams();
    if (vista !== "lista" || overrides.vista !== undefined) p.set("vista", overrides.vista ?? vista);
    if (filtroMes && overrides.mes !== null) p.set("mes", overrides.mes ?? String(filtroMes));
    if (filtroAño && overrides.año !== null) p.set("año", overrides.año ?? String(filtroAño));
    if (overrides.mes && overrides.año) { p.set("mes", overrides.mes); p.set("año", overrides.año); }
    if (overrides.pagina) p.set("pagina", overrides.pagina);
    const str = p.toString();
    return str ? `/crm?${str}` : "/crm";
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-zinc-900">CRM de Clientes</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {cards.length} clientes · {cards.filter(c => c.pedidosActivos.length > 0).length} con pedidos activos
          </p>
        </div>

        {/* Filtro mes/año */}
        <form method="GET" action="/crm" className="flex items-center gap-2">
          {vista === "kanban" && <input type="hidden" name="vista" value="kanban" />}
          <select name="mes" defaultValue={filtroMes ?? ""} className="text-xs border border-zinc-200 rounded-lg px-2 py-1.5 bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
            <option value="">Todos los meses</option>
            {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select name="año" defaultValue={filtroAño ?? ""} className="text-xs border border-zinc-200 rounded-lg px-2 py-1.5 bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
            <option value="">Todos los años</option>
            {[añoActual, añoActual - 1, añoActual - 2].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button type="submit" className="text-xs px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg font-medium transition-colors">Filtrar</button>
          {(filtroMes || filtroAño) && (
            <Link href={buildUrl({ mes: null, año: null })} className="text-xs text-zinc-400 hover:text-zinc-700">Limpiar</Link>
          )}
        </form>

        {/* Toggle vista */}
        <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden text-xs font-medium">
          <Link href={buildUrl({ vista: "lista" })} className={`px-3 py-1.5 transition-colors ${vista !== "kanban" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-50"}`}>Lista</Link>
          <Link href={buildUrl({ vista: "kanban" })} className={`px-3 py-1.5 transition-colors ${vista === "kanban" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-50"}`}>Kanban</Link>
        </div>

        <NuevoClienteModal />
      </div>

      {/* Filtro activo badge */}
      {filtroMes && filtroAño && (
        <div className="mb-4 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 inline-flex items-center gap-2">
          Mostrando: {MESES[filtroMes - 1]} {filtroAño}
          <Link href={buildUrl({ mes: null, año: null })} className="text-blue-500 hover:text-blue-800 font-semibold">× Quitar</Link>
        </div>
      )}

      {/* VISTA LISTA */}
      {vista !== "kanban" && (
        <div className="space-y-4">
          <div className="border border-zinc-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100 text-xs text-zinc-500 uppercase tracking-wide">
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
                {paginados.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-zinc-400 text-sm">Sin clientes en este período</td></tr>
                )}
                {paginados.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                          {c.nombre[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-zinc-900">{c.nombre}</div>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${getEtapa(c.etapa_crm).badge}`}>
                            {getEtapa(c.etapa_crm).label}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 hidden sm:table-cell">{c.telefono ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-semibold text-zinc-700">{c.totalPedidos}</td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      {c.pedidosActivos.length > 0
                        ? <span className="inline-flex items-center gap-1 text-blue-600 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />{c.pedidosActivos.length}</span>
                        : <span className="text-zinc-400">0</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-zinc-800">
                      {c.totalFacturado > 0 ? `S/ ${c.totalFacturado.toFixed(2)}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-400 text-xs hidden lg:table-cell">{fmtFecha(c.ultimoPedido)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/crm/${c.id}`} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Ver / Editar →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Página {pagina} de {totalPaginas} · {cards.length} clientes</span>
              <div className="flex gap-1">
                {pagina > 1 && (
                  <Link href={buildUrl({ pagina: String(pagina - 1) })} className="px-3 py-1.5 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors font-medium">← Anterior</Link>
                )}
                {pagina < totalPaginas && (
                  <Link href={buildUrl({ pagina: String(pagina + 1) })} className="px-3 py-1.5 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors font-medium">Siguiente →</Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VISTA KANBAN — etapas manuales de CRM */}
      {vista === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ marginLeft: "-24px", marginRight: "-24px", paddingLeft: "24px", paddingRight: "24px" }}>
          {ETAPAS.map((etapa, etapaIdx) => {
            const colCards = cards.filter(c => (c.etapa_crm ?? "activo") === etapa.key);
            const prevEtapa = ETAPAS[etapaIdx - 1] ?? null;
            const nextEtapa = ETAPAS[etapaIdx + 1] ?? null;
            return (
              <div key={etapa.key} className="flex-shrink-0 w-72 flex flex-col gap-3">
                {/* Header columna */}
                <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border ${etapa.border} ${etapa.bg}`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${etapa.dot}`} />
                    <span className={`text-sm font-semibold ${etapa.color}`}>{etapa.label}</span>
                  </div>
                  <span className={`text-sm font-bold ${etapa.color} bg-white/60 px-2 py-0.5 rounded-full`}>{colCards.length}</span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2.5">
                  {colCards.length === 0 && (
                    <div className="border-2 border-dashed border-zinc-200 rounded-xl p-6 text-center text-zinc-400 text-xs">Sin clientes aquí</div>
                  )}
                  {colCards.map((c) => (
                    <div key={c.id} className="border border-zinc-200 rounded-xl bg-white shadow-sm hover:shadow-md hover:border-zinc-300 transition-all group overflow-hidden">
                      {/* Info del cliente — clickable */}
                      <Link href={`/crm/${c.id}`} className="block px-4 pt-4 pb-3">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {c.nombre[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-zinc-900 text-sm truncate group-hover:text-blue-700 transition-colors">{c.nombre}</div>
                            {c.telefono && <div className="text-xs text-zinc-400 truncate">{c.telefono}</div>}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-2.5 border-t border-zinc-100">
                          <span className="text-zinc-400">{c.totalPedidos} pedido{c.totalPedidos !== 1 ? "s" : ""}</span>
                          <span className="font-semibold text-zinc-700">{c.totalFacturado > 0 ? `S/ ${c.totalFacturado.toFixed(0)}` : "—"}</span>
                          {c.pedidosActivos.length > 0
                            ? <span className="text-blue-500 font-medium">{c.pedidosActivos.length} activo{c.pedidosActivos.length !== 1 ? "s" : ""}</span>
                            : <span className="text-zinc-300">sin activos</span>
                          }
                        </div>
                      </Link>

                      {/* Botones mover etapa */}
                      <div className={`flex gap-2 px-4 py-2.5 border-t border-zinc-100 bg-zinc-50`}>
                        <span className="text-[10px] text-zinc-400 self-center mr-1 shrink-0">Mover a:</span>
                        {prevEtapa && (
                          <EtapaBtn clienteId={c.id} etapaDestino={prevEtapa.key} label={`← ${prevEtapa.label}`} variant="prev" />
                        )}
                        {nextEtapa && (
                          <EtapaBtn clienteId={c.id} etapaDestino={nextEtapa.key} label={`${nextEtapa.label} →`} variant="next" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
