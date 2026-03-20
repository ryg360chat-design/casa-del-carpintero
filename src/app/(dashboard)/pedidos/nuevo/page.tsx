"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const SECTION = "flex flex-col gap-4 bg-white border border-zinc-200 rounded-2xl p-6";
const STEP_NUM_STYLE = { background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" };
const STEP_NUM = "w-7 h-7 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0";
const INPUT = "w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white";
const LABEL = "block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5";

export default function NuevoPedidoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [clienteNombre, setClienteNombre] = useState("");
  const [tipoTablero, setTipoTablero] = useState<"MDF" | "Melamina" | "Triplay">("MDF");
  const [marca, setMarca] = useState("");
  const [planchas, setPlanchas] = useState("");
  const [piezas, setPiezas] = useState("");
  const [metrosCanto, setMetrosCanto] = useState("");
  const [ranuras, setRanuras] = useState(false);
  const [prioridad, setPrioridad] = useState<"normal" | "urgente" | "vip">("normal");
  const [turnoManual, setTurnoManual] = useState<"mañana" | "tarde" | "auto">("auto");
  const [notas, setNotas] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    try {
      // 1. Buscar o crear cliente
      let clienteId: string | null = null;
      if (clienteNombre.trim()) {
        const { data: existing } = await supabase
          .from("clientes")
          .select("id")
          .ilike("nombre", clienteNombre.trim())
          .maybeSingle();

        if (existing) {
          clienteId = existing.id;
        } else {
          const { data: nuevo } = await supabase
            .from("clientes")
            .insert({ nombre: clienteNombre.trim() })
            .select("id")
            .single();
          clienteId = nuevo?.id ?? null;
        }
      }

      // 2. Calcular asignación y entrega (lógica simple para MVP)
      const ahora = new Date();
      const hora = ahora.getHours();
      const turno = turnoManual === "auto" ? (hora < 12 ? "mañana" : "tarde") : turnoManual;

      // Contar pedidos por máquina
      const { count: cM1 } = await supabase
        .from("pedidos")
        .select("*", { count: "exact", head: true })
        .eq("maquina_asignada", "M1")
        .not("estado", "in", '("Listo","Cancelado")');

      const { count: cM2 } = await supabase
        .from("pedidos")
        .select("*", { count: "exact", head: true })
        .eq("maquina_asignada", "M2")
        .not("estado", "in", '("Listo","Cancelado")');

      const maquina = (cM1 ?? 0) <= (cM2 ?? 0) ? "M1" : "M2";

      const esPequeno = parseFloat(planchas || "0") <= 1.5 || parseInt(piezas || "0") <= 40;
      const entrega = new Date(ahora);

      if (esPequeno) {
        if (turno === "mañana") {
          entrega.setHours(16, 0, 0, 0);
        } else {
          entrega.setDate(entrega.getDate() + 1);
          entrega.setHours(10, 0, 0, 0);
        }
      } else {
        entrega.setDate(entrega.getDate() + 1);
        entrega.setHours(turno === "mañana" ? 10 : 16, 0, 0, 0);
      }

      if (parseFloat(metrosCanto || "0") > 0) {
        entrega.setTime(entrega.getTime() + 60 * 60 * 1000);
      }

      // Ajuste almuerzo
      if (entrega.getHours() >= 13 && entrega.getHours() < 14) {
        entrega.setHours(14, 30, 0, 0);
      }

      // 3. Insertar pedido
      const { error: insertError } = await supabase.from("pedidos").insert({
        cliente_id: clienteId,
        tipo_tablero: tipoTablero,
        marca_melamina: marca.trim() || "",
        cant_planchas: parseFloat(planchas || "0"),
        cant_piezas: parseInt(piezas || "0"),
        metros_canto: parseFloat(metrosCanto || "0"),
        ranuras,
        prioridad,
        notas: notas || null,
        turno,
        maquina_asignada: maquina,
        fecha_entrega_estimada: entrega.toISOString(),
      });

      if (insertError) throw insertError;

      router.push("/pedidos");
      router.refresh();
    } catch (err) {
      setError("Error al guardar el pedido. Intenta de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const cantPlanchas = parseFloat(planchas || "0");
  const cantPiezas = parseInt(piezas || "0");
  const esPequeno = cantPlanchas > 0 && cantPiezas > 0 && (cantPlanchas <= 1.5 || cantPiezas <= 40);
  const tieneEntrega = cantPlanchas > 0 || cantPiezas > 0;

  const hora = new Date().getHours();
  const turnoPreview = turnoManual === "auto" ? (hora < 12 ? "mañana" : "tarde") : turnoManual;
  let entregaLabel = "";
  if (tieneEntrega) {
    if (esPequeno) {
      entregaLabel = turnoPreview === "mañana" ? "Hoy 4:00 PM" : "Mañana 10:00 AM";
    } else {
      entregaLabel = turnoPreview === "mañana" ? "Mañana 10:00 AM" : "Pasado mañana 4:00 PM";
    }
    if (parseFloat(metrosCanto || "0") > 0) {
      entregaLabel += " (+1h enchape)";
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto min-h-full" style={{ background: "linear-gradient(160deg, rgba(255,237,213,0.35) 0%, rgba(244,244,245,0) 28%)" }}>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-zinc-900">Nuevo Pedido</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Configuración de corte y optimización de materiales</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* 1. Cliente */}
        <div className={SECTION}>
          <div className="flex items-center gap-3">
            <span className={STEP_NUM} style={STEP_NUM_STYLE}>1</span>
            <h2 className="font-bold text-zinc-900">Cliente</h2>
          </div>
          <div>
            <label className={LABEL}>Buscar o seleccionar cliente</label>
            <div className="relative">
              <input
                type="text"
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
                placeholder="Escribe el nombre del cliente..."
                className={INPUT}
              />
            </div>
          </div>
        </div>

        {/* 2. Material */}
        <div className={SECTION}>
          <div className="flex items-center gap-3">
            <span className={STEP_NUM} style={STEP_NUM_STYLE}>2</span>
            <h2 className="font-bold text-zinc-900">Material</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Tipo de tablero</label>
              <div className="flex">
                {(["MDF", "Melamina", "Triplay"] as const).map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => setTipoTablero(tipo)}
                    className={`flex-1 py-2.5 text-sm font-semibold border transition-colors first:rounded-l-lg last:rounded-r-lg ${
                      tipoTablero === tipo
                        ? "bg-zinc-900 text-white border-zinc-900"
                        : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50"
                    }`}
                  >
                    {tipo}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={LABEL}>Marca / Referencia</label>
              <input
                type="text"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Ej: Arauco Roble"
                className={INPUT}
              />
            </div>
          </div>
        </div>

        {/* 3. Datos del Corte */}
        <div className={SECTION}>
          <div className="flex items-center gap-3">
            <span className={STEP_NUM} style={STEP_NUM_STYLE}>3</span>
            <h2 className="font-bold text-zinc-900">Datos del Corte</h2>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className={LABEL}>Planchas</label>
              <input type="number" min="0" step="0.5" value={planchas} onChange={(e) => setPlanchas(e.target.value)} placeholder="0" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Piezas</label>
              <input type="number" min="0" value={piezas} onChange={(e) => setPiezas(e.target.value)} placeholder="0" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Metros Canto</label>
              <input type="number" min="0" step="0.1" value={metrosCanto} onChange={(e) => setMetrosCanto(e.target.value)} placeholder="0.00" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Ranuras</label>
              <div className="flex border border-zinc-200 rounded-lg overflow-hidden">
                {[{ label: "Sí", val: true }, { label: "No", val: false }].map(({ label, val }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setRanuras(val)}
                    className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                      ranuras === val ? "bg-zinc-900 text-white" : "bg-white text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Prioridad y Turno */}
        <div className={SECTION}>
          <div className="flex items-center gap-3">
            <span className={STEP_NUM} style={STEP_NUM_STYLE}>4</span>
            <h2 className="font-bold text-zinc-900">Prioridad y Turno</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Prioridad</label>
              <div className="flex gap-2">
                {(["normal", "urgente", "vip"] as const).map((p) => (
                  <label
                    key={p}
                    className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg cursor-pointer transition-colors capitalize font-medium text-sm flex-1 justify-center ${
                      prioridad === p
                        ? p === "urgente"
                          ? "border-zinc-900 bg-zinc-50 text-zinc-900"
                          : p === "vip"
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    <input type="radio" name="prioridad" value={p} checked={prioridad === p} onChange={() => setPrioridad(p)} className="sr-only" />
                    {p === "urgente" && <span>⚡</span>}
                    {p === "vip" && <span>★</span>}
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className={LABEL}>
                Turno{" "}
                {turnoManual === "auto" && (
                  <span className="text-zinc-400 font-normal normal-case tracking-normal">
                    (auto: {hora < 12 ? "mañana" : "tarde"})
                  </span>
                )}
              </label>
              <div className="flex border border-zinc-200 rounded-lg overflow-hidden">
                {([
                  { val: "auto", label: "Auto" },
                  { val: "mañana", label: "Mañana" },
                  { val: "tarde", label: "Tarde" },
                ] as const).map(({ val, label }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTurnoManual(val)}
                    className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                      turnoManual === val ? "bg-zinc-900 text-white" : "bg-white text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notas */}
        <div className={SECTION}>
          <label className={LABEL}>Notas (opcional)</label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Instrucciones especiales del cliente..."
            rows={3}
            className={INPUT + " resize-none"}
          />
        </div>

        {/* Preview entrega */}
        {tieneEntrega && (
          <div className="border-2 border-zinc-900 rounded-xl p-4 bg-zinc-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-0.5">Asignación estimada</p>
                <p className="text-sm font-bold text-zinc-900">
                  Máquina: {(cantPlanchas <= 1.5 || cantPiezas <= 40) ? "Calculando..." : "M1 o M2"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-0.5">Entrega estimada</p>
                <p className="text-sm font-bold text-zinc-900">{entregaLabel}</p>
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-3 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-all press-effect"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 text-white rounded-xl text-sm font-semibold transition-all press-effect disabled:opacity-50 flex items-center justify-center gap-2 btn-accent"
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Registrando...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Registrar Pedido
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
