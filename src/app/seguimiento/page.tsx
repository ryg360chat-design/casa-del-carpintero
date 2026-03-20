import { createClient } from "@/lib/supabase/server";
import BuscarForm from "./BuscarForm";

const ESTADO_CONFIG: Record<string, { label: string; icon: string; className: string; desc: string }> = {
  "En cola": {
    label: "En cola",
    icon: "⏳",
    className: "bg-zinc-100 text-zinc-700",
    desc: "Tu pedido está en la fila esperando ser procesado.",
  },
  "En corte": {
    label: "En corte",
    icon: "⚙️",
    className: "bg-zinc-800 text-white",
    desc: "Tu pedido está siendo cortado ahora mismo.",
  },
  "En tapacantos": {
    label: "En tapacantos",
    icon: "🔧",
    className: "bg-zinc-600 text-white",
    desc: "Se están aplicando los tapacantos a tus piezas.",
  },
  "Listo": {
    label: "Listo para retirar",
    icon: "✅",
    className: "bg-zinc-900 text-white",
    desc: "Tu pedido está listo. ¡Podés pasar a retirarlo!",
  },
  "Cancelado": {
    label: "Cancelado",
    icon: "❌",
    className: "bg-red-100 text-red-600",
    desc: "Este pedido fue cancelado. Consultá con el taller.",
  },
  "Pausado": {
    label: "Pausado",
    icon: "⏸️",
    className: "bg-yellow-100 text-yellow-700",
    desc: "El pedido está momentáneamente pausado.",
  },
};


export default async function SeguimientoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const busqueda = q?.trim() ?? "";

  let pedidos: Record<string, unknown>[] = [];

  if (busqueda) {
    const supabase = await createClient();

    // Buscar por cada palabra del nombre (ej: "Samuel" o "Cadena" o "Samuel Cadena")
    const palabras = busqueda.split(/\s+/).filter(Boolean);
    const condiciones = [
      ...palabras.map((p) => `nombre.ilike.%${p}%`),
      `telefono.ilike.%${busqueda}%`,
    ].join(",");

    const { data: clientes } = await supabase
      .from("clientes")
      .select("id, nombre, telefono")
      .or(condiciones);

    if (clientes && clientes.length > 0) {
      const clienteIds = clientes.map((c: { id: string }) => c.id);
      const { data } = await supabase
        .from("pedidos")
        .select("*, cliente:clientes(nombre, telefono)")
        .in("cliente_id", clienteIds)
        .not("estado", "eq", "Cancelado")
        .order("fecha_ingreso", { ascending: false })
        .limit(20);

      pedidos = (data ?? []) as Record<string, unknown>[];
    }
  }

  const PASOS = ["Recibido", "En corte", "En tapacantos", "Listo"];
  const PASO_IDX: Record<string, number> = {
    "En cola": 0,
    "En corte": 1,
    "En tapacantos": 2,
    "Listo": 3,
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #fff7ed 0%, #fafaf9 40%)" }}>
      {/* Header */}
      <header className="border-b border-orange-100/80" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm" style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
              <span className="text-white font-black text-[13px] tracking-tight">CC</span>
            </div>
            <div>
              <p className="text-zinc-900 text-sm font-bold leading-tight">Casa del Carpintero</p>
              <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "#f97316" }}>Seguimiento</p>
            </div>
          </div>
          <nav className="hidden sm:flex items-center gap-5">
            {["Pedidos", "Servicios", "Contacto"].map((item) => (
              <span key={item} className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer">{item}</span>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8">
        {/* Buscador */}
        <div className="bg-white border border-orange-100 rounded-2xl p-6 mb-6 shadow-sm shadow-orange-100/50">
          <div className="flex items-center gap-2 mb-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect width="6" height="4" x="9" y="3" rx="1"/>
              <path d="M9 12h6M9 16h4"/>
            </svg>
            <h2 className="font-bold text-zinc-900">¿Cómo va tu pedido?</h2>
          </div>
          <p className="text-zinc-500 text-sm mb-4 ml-6">Ingresá tu nombre o número de teléfono para ver el estado.</p>
          <BuscarForm defaultValue={busqueda} />
        </div>

        {/* Sin resultados */}
        {busqueda && pedidos.length === 0 && (
          <div className="text-center py-14 text-zinc-400 text-sm bg-white rounded-2xl border border-zinc-100">
            <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-zinc-50">
              <svg className="text-zinc-300" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            No encontramos pedidos para <strong className="text-zinc-700">&ldquo;{busqueda}&rdquo;</strong>.
            <br />
            <span className="text-xs mt-2 block text-zinc-400">Verificá que el nombre o teléfono esté bien escrito.</span>
          </div>
        )}

        {/* Resultados */}
        {pedidos.length > 0 && (
          <div className="flex flex-col gap-5">
            <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
              {pedidos.length} pedido{pedidos.length !== 1 ? "s" : ""} encontrado{pedidos.length !== 1 ? "s" : ""}
            </p>

            {pedidos.map((p) => {
              const estado = p.estado as string;
              const cfg = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG["En cola"];
              const cliente = ((p.cliente as Record<string, unknown>)?.nombre as string) ?? "—";
              const pasoActual = PASO_IDX[estado] ?? 0;
              const isCancelado = estado === "Cancelado";
              const isListo = estado === "Listo";
              const numeroOrden = `#${String(p.id as string).slice(-4).toUpperCase()}`;

              const entregaFecha = p.fecha_entrega_estimada
                ? new Date(p.fecha_entrega_estimada as string)
                : null;
              const entregaStr = entregaFecha
                ? entregaFecha.toLocaleString("es", {
                    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
                  })
                : null;

              // SVG icons for each step
              const PASO_ICONS = [
                // Recibido — inbox/check
                <svg key="rec" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
                // En corte — scissors
                <svg key="cor" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>,
                // En tapacantos — layers
                <svg key="tap" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
                // Listo — truck
                <svg key="lst" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
              ];

              return (
                <div key={p.id as string} className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm">
                  {/* Orange top accent */}
                  <div className="h-1 w-full" style={{ background: isCancelado ? "#ef4444" : isListo ? "#22c55e" : "linear-gradient(90deg, #f97316, #fb923c)" }} />

                  {/* Header */}
                  <div className="px-5 pt-4 pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-2xl font-black text-zinc-900 tracking-tight">{numeroOrden}</span>
                          {(p.prioridad === "urgente" || p.prioridad === "vip") && (
                            <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-lg" style={{ background: p.prioridad === "vip" ? "#f97316" : "#18181b" }}>
                              {p.prioridad === "vip" ? "★ VIP" : "⚡ URGENTE"}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-zinc-900">{cfg.label}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{cfg.desc}</p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.className}`}>{cfg.label.toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Progress stepper */}
                  {!isCancelado && (
                    <div className="px-5 pb-4">
                      <div className="flex items-center gap-0">
                        {PASOS.map((paso, idx) => {
                          const done = idx <= pasoActual;
                          const current = idx === pasoActual;
                          const completed = done && idx < pasoActual;
                          return (
                            <div key={paso} className="flex items-center flex-1 last:flex-none">
                              <div className="flex flex-col items-center gap-1 shrink-0">
                                <div
                                  className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                                  style={{
                                    background: done ? (isListo ? "#22c55e" : "#f97316") : "#f4f4f5",
                                    color: done ? "white" : "#a1a1aa",
                                    boxShadow: current ? "0 0 0 3px rgba(249,115,22,0.2)" : "none",
                                  }}
                                >
                                  {completed ? (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                  ) : (
                                    PASO_ICONS[idx]
                                  )}
                                </div>
                                <p className={`text-[9px] font-semibold whitespace-nowrap ${done ? "text-zinc-700" : "text-zinc-400"}`}>{paso}</p>
                              </div>
                              {idx < PASOS.length - 1 && (
                                <div className="flex-1 h-0.5 mb-4 mx-1" style={{ background: idx < pasoActual ? (isListo ? "#22c55e" : "#f97316") : "#e4e4e7" }} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Info message */}
                  {!isCancelado && (
                    <div className="mx-5 mb-4 px-3.5 py-2.5 rounded-xl text-sm" style={{ background: isListo ? "rgba(34,197,94,0.08)" : "rgba(249,115,22,0.08)", border: `1px solid ${isListo ? "rgba(34,197,94,0.2)" : "rgba(249,115,22,0.2)"}` }}>
                      <p className="font-semibold" style={{ color: isListo ? "#16a34a" : "#ea580c" }}>
                        {isListo ? "¡Tu pedido está listo para retirar!" : `En proceso · ${cfg.label}`}
                      </p>
                      {entregaStr && !isListo && (
                        <p className="text-xs text-zinc-500 mt-0.5 capitalize">Entrega estimada: {entregaStr}</p>
                      )}
                    </div>
                  )}

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3 px-5 pb-4">
                    <div className="bg-zinc-50 rounded-xl p-3.5">
                      <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Material</p>
                      <p className="text-sm font-bold text-zinc-900">{p.tipo_tablero as string}</p>
                      {(p.marca_melamina as string) && <p className="text-xs text-zinc-500">{p.marca_melamina as string}</p>}
                    </div>
                    <div className="bg-zinc-50 rounded-xl p-3.5">
                      <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Entrega</p>
                      {entregaStr ? (
                        <p className="text-sm font-bold text-zinc-900 capitalize leading-snug">{entregaStr}</p>
                      ) : (
                        <p className="text-sm text-zinc-400">Sin fecha</p>
                      )}
                    </div>
                  </div>

                  {/* Action cards */}
                  <div className="grid grid-cols-3 gap-2 px-5 pb-4">
                    {[
                      {
                        label: "Ver Factura",
                        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
                      },
                      {
                        label: "Ubicación",
                        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                      },
                      {
                        label: "Modificar",
                        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
                      },
                    ].map(({ label, icon }) => (
                      <button
                        key={label}
                        className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-white hover:border-zinc-300 transition-all text-zinc-600"
                      >
                        {icon}
                        <span className="text-[10px] font-semibold">{label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Footer client + support */}
                  <div className="px-5 py-3 border-t border-zinc-100 flex items-center justify-between">
                    <p className="text-xs text-zinc-500 font-medium">{cliente}</p>
                    <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:bg-orange-50" style={{ color: "#f97316", borderColor: "rgba(249,115,22,0.3)" }}>
                      Contactar Soporte
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Hero / empty state */}
        {!busqueda && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.12), rgba(249,115,22,0.06))" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect width="6" height="4" x="9" y="3" rx="1"/>
                <path d="M9 12h6M9 16h4"/>
              </svg>
            </div>
            <p className="text-zinc-500 text-sm">Ingresá tu nombre para ver el estado de tu pedido.</p>
            <p className="text-zinc-400 text-xs mt-1">Casa del Carpintero · Corte y melamina</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-100 mt-8 py-6 px-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <p className="text-xs text-zinc-400">© 2026 RyG SaaS</p>
          <p className="text-xs text-zinc-400">Corte y melamina a medida</p>
        </div>
      </footer>
    </div>
  );
}
