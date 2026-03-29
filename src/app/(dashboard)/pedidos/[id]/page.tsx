import { createClient } from "@/lib/supabase/server";
import { getUserRole, CAN_ADVANCE_STATE, CAN_CREATE_PEDIDO } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import AvanzarEstadoBtn from "@/components/AvanzarEstadoBtn";
import CancelarPedidoBtn from "@/components/CancelarPedidoBtn";

const ESTADO_STYLE: Record<string, string> = {
  "En cola":       "bg-slate-100 text-slate-600 border border-slate-200",
  "En corte":      "bg-blue-500 text-white",
  "En tapacantos": "bg-violet-500 text-white",
  "Listo":         "bg-emerald-500 text-white",
  "Cancelado":     "bg-red-100 text-red-600 border border-red-200",
  "Pausado":       "bg-amber-100 text-amber-700 border border-amber-200",
};

const AREA_COLORS: Record<string, string> = {
  "Ventas":           "bg-blue-50 text-blue-700 border-blue-200",
  "Produccion":       "bg-orange-50 text-orange-700 border-orange-200",
  "Almacenes":        "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Cortes especiales":"bg-purple-50 text-purple-700 border-purple-200",
  "Administracion":   "bg-zinc-50 text-zinc-600 border-zinc-200",
  "Logistica":        "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const ESTADOS_FLUJO = ["En cola", "En corte", "En tapacantos", "Listo"];

export default async function PedidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const role = await getUserRole();
  const canAdvance = CAN_ADVANCE_STATE.includes(role);
  const canCancel = CAN_CREATE_PEDIDO.includes(role);

  const { data: pedido } = await supabase
    .from("pedidos")
    .select("*, cliente:clientes(nombre, telefono, email, codigo)")
    .eq("id", id)
    .maybeSingle();

  if (!pedido) notFound();

  const [{ data: historial }, { data: lineas }] = await Promise.all([
    supabase
      .from("pedido_historial")
      .select("*")
      .eq("pedido_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("pedido_lineas")
      .select("*")
      .eq("pedido_id", id)
      .order("orden", { ascending: true }),
  ]);

  const estado = pedido.estado as string;
  const badgeClass = ESTADO_STYLE[estado] ?? "bg-zinc-100 text-zinc-600";
  const prioridad = pedido.prioridad as string;
  const area = pedido.area as string | null;
  const estaActivo = ["En cola", "En corte", "En tapacantos"].includes(estado);
  const cliente = pedido.cliente as Record<string, unknown> | null;

  const fechaIngreso = new Date(pedido.fecha_ingreso).toLocaleDateString("es", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const horaIngreso = new Date(pedido.fecha_ingreso).toLocaleTimeString("es", {
    hour: "2-digit", minute: "2-digit",
  });

  const pasoActual = ESTADOS_FLUJO.indexOf(estado);
  const esListo = estado === "Listo";
  const esCancelado = estado === "Cancelado";

  // Servicios adicionales activos
  const servicios = [
    pedido.ranuras && "Ranuras",
    pedido.perforaciones && "Perforaciones",
    pedido.corte_45 && "Corte 45°",
  ].filter(Boolean) as string[];

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Back */}
      <Link
        href="/pedidos"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-900 transition-colors mb-6 group animate-fade-in-down"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:-translate-x-0.5">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Volver a Pedidos
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h1 className="text-2xl font-bold text-zinc-900">
              {cliente?.nombre as string ?? "Sin cliente"}
            </h1>
            {(cliente?.codigo as string | null) && (
              <span className="font-mono text-xs font-bold bg-zinc-100 text-zinc-500 border border-zinc-200 px-2 py-0.5 rounded-full">
                {cliente!.codigo as string}
              </span>
            )}
            {prioridad === "urgente" && (
              <span className="animate-badge-pop text-xs font-bold text-white px-2.5 py-0.5 rounded-md tracking-wide" style={{ background: "linear-gradient(135deg,#f97316,#dc2626)", boxShadow: "0 0 10px rgba(249,115,22,0.4)" }}>
                ⚡ URGENTE
              </span>
            )}
            {prioridad === "vip" && (
              <span className="animate-badge-pop text-xs font-bold text-white px-2.5 py-0.5 rounded-md tracking-wide" style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", boxShadow: "0 0 10px rgba(245,158,11,0.4)" }}>
                ★ VIP
              </span>
            )}
            {area && (
              <span className={`animate-badge-pop text-[10px] font-bold border px-2 py-0.5 rounded-md tracking-wide uppercase ${AREA_COLORS[area] ?? "bg-zinc-50 text-zinc-600 border-zinc-200"}`}>
                {area}
              </span>
            )}
          </div>
          <p className="text-zinc-400 text-sm">
            <span className="capitalize">{fechaIngreso}</span>
            {" · "}
            <span>{horaIngreso}</span>
            {" · "}
            <span className="font-medium text-zinc-500">{pedido.maquina_asignada ?? "Sin máquina"}</span>
          </p>
        </div>
        <span className={`animate-badge-pop text-sm font-bold px-3 py-1.5 rounded-full ${badgeClass}`}>
          {estado}
        </span>
      </div>

      {/* Progress stepper */}
      {!esCancelado && (
        <div className="animate-fade-in-up delay-100 bg-white border border-zinc-200 rounded-xl p-6 mb-5">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-5">Progreso del pedido</p>

          <div className="flex items-center">
            {ESTADOS_FLUJO.map((s, idx) => {
              const done = esListo ? true : idx < pasoActual;
              const current = !esListo && idx === pasoActual;
              const isLast = idx === ESTADOS_FLUJO.length - 1;

              return (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      done
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                        : current
                        ? "bg-white border-blue-500 text-blue-600 shadow-[0_0_0_4px_rgba(59,130,246,0.12)]"
                        : "bg-white border-zinc-200 text-zinc-300"
                    }`}>
                      {done ? (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    <span className={`text-xs mt-2 font-medium whitespace-nowrap ${done || current ? "text-zinc-700" : "text-zinc-400"}`}>
                      {s}
                    </span>
                    {current && (
                      <span className="text-[10px] text-zinc-400 mt-0.5 font-medium">Actual</span>
                    )}
                  </div>

                  {!isLast && (
                    <div className="flex-1 relative h-0.5 mx-2 mb-5 bg-zinc-100 overflow-hidden rounded-full">
                      {done && <div className="absolute inset-0 bg-zinc-900 rounded-full" />}
                      {current && <div className="absolute inset-0 bg-zinc-900 rounded-full" style={{ width: "50%" }} />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {estaActivo && (canAdvance || canCancel) && (
            <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between">
              {canCancel && <CancelarPedidoBtn pedidoId={pedido.id} />}
              <AvanzarEstadoBtn pedidoId={pedido.id} estadoActual={estado} showLabel canAdvance={canAdvance} />
            </div>
          )}
        </div>
      )}

      {esCancelado && (
        <div className="animate-fade-in-up delay-100 bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex items-center gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <p className="text-sm font-semibold text-red-700">Pedido cancelado</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Material y Corte */}
        <div className="animate-fade-in-up delay-150 bg-white border border-zinc-200 rounded-xl p-5 card-hover">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
              {lineas && lineas.length > 0 ? "Materiales" : "Material y Corte"}
            </p>
            {lineas && lineas.length > 1 && (
              <span className="text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full">
                {lineas.length} materiales
              </span>
            )}
          </div>

          {/* Multi-line materials (new orders) */}
          {lineas && lineas.length > 0 ? (
            <div className="flex flex-col gap-3">
              {lineas.map((linea: Record<string, unknown>, idx: number) => (
                <div key={linea.id as string} className={`${lineas.length > 1 ? "border border-zinc-100 rounded-lg p-3 bg-zinc-50/50" : ""}`}>
                  {lineas.length > 1 && (
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                      Material {idx + 1}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    {[
                      { label: "Tipo", value: linea.tipo_tablero as string },
                      { label: "Marca", value: (linea.marca_melamina as string) || "—" },
                      { label: "Espesor", value: (linea.espesor as string) || "—" },
                      { label: "Color", value: (linea.color_material as string) || "—" },
                      { label: "Planchas", value: String(linea.cant_planchas) },
                      { label: "Piezas", value: String(linea.cant_piezas) },
                      { label: "Canto delgado", value: `${linea.metros_canto_delgado} m` },
                      { label: "Canto grueso", value: `${linea.metros_canto_grueso} m` },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">{label}</p>
                        <p className="text-sm font-bold text-zinc-900">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Totals row when multi-line */}
              {lineas.length > 1 && (
                <div className="border-t border-zinc-200 pt-3 grid grid-cols-3 gap-3">
                  {[
                    { label: "Total planchas", value: lineas.reduce((s, l) => s + Number((l as Record<string,unknown>).cant_planchas ?? 0), 0) },
                    { label: "Total piezas", value: lineas.reduce((s, l) => s + Number((l as Record<string,unknown>).cant_piezas ?? 0), 0) },
                    { label: "Total canto", value: `${lineas.reduce((s, l) => s + Number((l as Record<string,unknown>).metros_canto_delgado ?? 0) + Number((l as Record<string,unknown>).metros_canto_grueso ?? 0), 0).toFixed(1)} m` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-zinc-100 rounded-lg p-2 text-center">
                      <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">{label}</p>
                      <p className="text-sm font-black text-zinc-900 mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Legacy single-material (old orders) */
            <div className="grid grid-cols-2 gap-y-4 gap-x-4">
              {[
                { label: "Tipo", value: pedido.tipo_tablero },
                { label: "Marca", value: pedido.marca_melamina || "—" },
                { label: "Planchas", value: pedido.cant_planchas },
                { label: "Piezas", value: pedido.cant_piezas },
                { label: "Mts. canto", value: `${pedido.metros_canto} m` },
                { label: "Tipo canto", value: pedido.tipo_canto ? (pedido.tipo_canto === "grueso" ? "Grueso" : "Delgado") : "—" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-sm font-bold text-zinc-900">{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Servicios adicionales */}
          {(servicios.length > 0 || pedido.cortes_especiales) && (
            <div className="mt-4 pt-4 border-t border-zinc-100">
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Servicios adicionales</p>
              <div className="flex flex-wrap gap-1.5">
                {servicios.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
                    {s === "Corte 45°" && "◇ "}
                    {s === "Ranuras" && "≡ "}
                    {s === "Perforaciones" && "● "}
                    {s}
                  </span>
                ))}
                {pedido.cortes_especiales && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                    ✦ {pedido.cortes_especiales}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Cliente + Fechas */}
        <div className="flex flex-col gap-5">
          <div className="animate-fade-in-up delay-200 bg-white border border-zinc-200 rounded-xl p-5 card-hover">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Cliente</p>
            <p className="font-bold text-zinc-900 text-sm">{cliente?.nombre as string ?? "—"}</p>
            {(cliente?.telefono as string) && (
              <p className="text-sm text-zinc-500 mt-1.5 flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                {cliente?.telefono as string}
              </p>
            )}
            {(cliente?.email as string) && (
              <p className="text-sm text-zinc-500 mt-1 flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                {cliente?.email as string}
              </p>
            )}
          </div>

          <div className="animate-fade-in-up delay-250 bg-white border border-zinc-200 rounded-xl p-5 card-hover">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Fechas</p>
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Ingreso</span>
                <span className="text-xs font-semibold text-zinc-900">
                  {new Date(pedido.fecha_ingreso).toLocaleDateString("es", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Entrega estimada</span>
                <span className="text-xs font-semibold text-zinc-900">
                  {pedido.fecha_entrega_estimada
                    ? new Date(pedido.fecha_entrega_estimada).toLocaleString("es", { dateStyle: "short", timeStyle: "short" })
                    : "—"}
                </span>
              </div>
              {pedido.fecha_entrega_real && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Entrega real</span>
                  <span className="text-xs font-semibold text-emerald-700">
                    {new Date(pedido.fecha_entrega_real).toLocaleString("es", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Turno</span>
                <span className="text-xs font-semibold text-zinc-900 capitalize">{pedido.turno ?? "—"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notas */}
      {pedido.notas && (
        <div className="animate-fade-in-up delay-300 bg-amber-50 border border-amber-200 rounded-xl p-5 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-widest">Notas</p>
          </div>
          <p className="text-sm text-amber-900 whitespace-pre-wrap leading-relaxed">{pedido.notas}</p>
        </div>
      )}

      {/* Historial */}
      {(historial ?? []).length > 0 && (
        <div className="animate-fade-in-up delay-300 bg-white border border-zinc-200 rounded-xl p-5">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">Historial de cambios</p>
          <div className="flex flex-col gap-0">
            {(historial ?? []).map((h: Record<string, unknown>, idx: number) => (
              <div
                key={h.id as string}
                className="flex items-center gap-3 py-2.5 border-b border-zinc-50 last:border-0"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 shrink-0" />
                <span className="text-xs text-zinc-400 whitespace-nowrap min-w-[100px]">
                  {new Date(h.created_at as string).toLocaleString("es", { dateStyle: "short", timeStyle: "short" })}
                </span>
                <span className="text-xs font-medium text-zinc-400 line-through">{h.estado_anterior as string}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                <span className="text-xs font-bold text-zinc-900">{h.estado_nuevo as string}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
