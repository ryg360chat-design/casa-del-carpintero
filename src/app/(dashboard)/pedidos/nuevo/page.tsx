"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const SECTION = "flex flex-col gap-4 bg-white border border-zinc-200 rounded-2xl p-6";
const STEP_NUM_STYLE = { background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" };
const STEP_NUM = "w-7 h-7 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0";
const INPUT = "w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white";
const LABEL = "block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5";

const TIPOS_TABLERO = ["Melamina", "MDF", "Triplay", "OSB", "Laminados", "Aglomerado", "Otros"] as const;
type TipoTablero = typeof TIPOS_TABLERO[number];

const MARCAS_POR_TIPO: Record<TipoTablero, string[]> = {
  "Melamina":   ["Masisa", "Pelikano", "Tas", "Kronospan", "Duraplac", "Finss", "Merino"],
  "MDF":        ["Masisa", "Pelikano", "Kronospan"],
  "Triplay":    [],
  "OSB":        [],
  "Laminados":  [],
  "Aglomerado": [],
  "Otros":      [],
};

const FORMATOS_MARCA: Record<string, string[]> = {
  "Masisa":    ["6×8", "7×8"],
  "Pelikano":  ["2.44×2.44"],
  "Tas":       ["2.135×2.44", "1.22×2.44"],
  "Kronospan": ["2.07×2.80"],
  "Duraplac":  ["2.15×2.44"],
  "Finss":     ["2.15×2.44"],
  "Merino":    ["1.23×2.745"],
};

const FORMATOS_TIPO: Record<string, string[]> = {
  "Triplay": ["1.22×2.44"],
  "OSB":     ["1.22×2.44"],
};

const ESPESORES = ["2.5", "3", "4", "5.5", "9", "12", "15", "18", "25", "30"] as const;

const AREAS = ["Ventas", "Produccion", "Almacenes", "Cortes especiales", "Administracion", "Logistica"] as const;
type Area = typeof AREAS[number];

const AREA_COLORS: Record<Area, string> = {
  "Ventas":           "bg-blue-50 text-blue-700 border-blue-200",
  "Produccion":       "bg-orange-50 text-orange-700 border-orange-200",
  "Almacenes":        "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Cortes especiales":"bg-purple-50 text-purple-700 border-purple-200",
  "Administracion":   "bg-zinc-50 text-zinc-700 border-zinc-300",
  "Logistica":        "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <div className="flex border border-zinc-200 rounded-lg overflow-hidden">
      {[{ label: "Sí", val: true }, { label: "No", val: false }].map(({ label: l, val }) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(val)}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            value === val ? "bg-zinc-900 text-white" : "bg-white text-zinc-600 hover:bg-zinc-50"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export default function NuevoPedidoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [clienteNombre, setClienteNombre] = useState("");
  const [area, setArea] = useState<Area>("Ventas");
  const [tipoTablero, setTipoTablero] = useState<TipoTablero>("Melamina");
  const [marca, setMarca] = useState("");
  const [espesor, setEspesor] = useState("");
  const [planchas, setPlanchas] = useState("");
  const [piezas, setPiezas] = useState("");
  const [metrosDelgado, setMetrosDelgado] = useState("");
  const [metrosGrueso, setMetrosGrueso] = useState("");
  const [ranuras, setRanuras] = useState(false);
  const [perforaciones, setPerforaciones] = useState(false);
  const [corte45, setCorte45] = useState(false);
  const [cortesEspeciales, setCortesEspeciales] = useState("");
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

      // 2. Calcular asignación y entrega
      const ahora = new Date();
      const hora = ahora.getHours();
      const turno = turnoManual === "auto" ? (hora < 12 ? "mañana" : "tarde") : turnoManual;

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

      const cMaquina = (cM1 ?? 0) <= (cM2 ?? 0) ? cM1 ?? 0 : cM2 ?? 0;
      const maquina = (cM1 ?? 0) <= (cM2 ?? 0) ? "M1" : "M2";

      // === Algoritmo de tiempo real ===
      // Base: 6 planchas/hora
      // +1h si ranuras, +1h si enchape, +30min si corte45/especiales
      // +2h por cada pedido en cola en la misma máquina
      const cantPlanchasNum = parseFloat(planchas || "0");
      const horasCorte = cantPlanchasNum > 0 ? cantPlanchasNum / 6 : 0.5;
      const horasExtra =
        (ranuras ? 1 : 0) +
        ((parseFloat(metrosDelgado || "0") + parseFloat(metrosGrueso || "0")) > 0 ? 1 : 0) +
        ((corte45 || cortesEspeciales.trim()) ? 0.5 : 0);
      const horasEspera = cMaquina * 2; // 2h promedio por pedido en cola
      const totalHoras = horasCorte + horasExtra + horasEspera;

      // Horario laboral real: 8:00-12:00, refrigerio 12:00-13:00, 13:00-17:30
      const INICIO       = 8;     // 8:00 AM
      const ALMUERZO_IN  = 12;    // 12:00 PM
      const ALMUERZO_OUT = 13;    // 1:00 PM
      const FIN          = 17.5;  // 5:30 PM
      // Horas efectivas por día: 4h mañana + 4.5h tarde = 8.5h

      function hFrac(d: Date) { return d.getHours() + d.getMinutes() / 60; }
      function setHFrac(d: Date, h: number) {
        d.setHours(Math.floor(h), Math.round((h % 1) * 60), 0, 0);
      }
      function skipWeekend(d: Date) {
        while (d.getDay() === 0 || d.getDay() === 6) {
          d.setDate(d.getDate() + 1);
          setHFrac(d, INICIO);
        }
      }

      function addWorkHours(base: Date, horas: number): Date {
        const result = new Date(base);
        let remaining = horas;

        // Snap al próximo periodo laboral si estamos fuera
        const h0 = hFrac(result);
        if (h0 < INICIO) {
          setHFrac(result, INICIO);
        } else if (h0 >= FIN) {
          result.setDate(result.getDate() + 1);
          setHFrac(result, INICIO);
        } else if (h0 >= ALMUERZO_IN && h0 < ALMUERZO_OUT) {
          setHFrac(result, ALMUERZO_OUT);
        }
        skipWeekend(result);

        while (remaining > 0) {
          const h = hFrac(result);
          // Avanzar hasta el próximo tope (almuerzo o fin de jornada)
          const tope = h < ALMUERZO_IN ? Math.min(ALMUERZO_IN, h + remaining) : Math.min(FIN, h + remaining);
          const avance = tope - h;
          remaining -= avance;
          setHFrac(result, tope);

          if (remaining > 0) {
            const hNow = hFrac(result);
            if (hNow >= ALMUERZO_IN && hNow < ALMUERZO_OUT) {
              // Reanudar tras el refrigerio
              setHFrac(result, ALMUERZO_OUT);
            } else {
              // Fin de jornada → siguiente día hábil
              result.setDate(result.getDate() + 1);
              setHFrac(result, INICIO);
              skipWeekend(result);
            }
          }
        }
        return result;
      }

      const entrega = addWorkHours(ahora, totalHoras);

      // 3. Insertar pedido
      const { error: insertError } = await supabase.from("pedidos").insert({
        cliente_id: clienteId,
        area,
        tipo_tablero: tipoTablero,
        marca_melamina: marca.trim() || "",
        espesor: espesor || null,
        cant_planchas: parseFloat(planchas || "0"),
        cant_piezas: parseInt(piezas || "0"),
        metros_canto: parseFloat(metrosDelgado || "0") + parseFloat(metrosGrueso || "0"),
        tipo_canto: (parseFloat(metrosDelgado || "0") > 0 && parseFloat(metrosGrueso || "0") > 0)
          ? "ambos"
          : parseFloat(metrosGrueso || "0") > 0 ? "grueso" : "delgado",
        ranuras,
        perforaciones,
        corte_45: corte45,
        cortes_especiales: cortesEspeciales.trim() || null,
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
  const tieneEntrega = cantPlanchas > 0;
  const hora = new Date().getHours();

  // Preview del tiempo estimado (sin contar la cola — se actualiza al guardar)
  let entregaLabel = "";
  if (tieneEntrega) {
    const horasCortePreview = cantPlanchas / 6;
    const extrasPreview =
      (ranuras ? 1 : 0) +
      ((parseFloat(metrosDelgado || "0") + parseFloat(metrosGrueso || "0")) > 0 ? 1 : 0) +
      ((corte45 || cortesEspeciales.trim()) ? 0.5 : 0);
    const totalPreview = horasCortePreview + extrasPreview;
    const hDecimal = Math.floor(totalPreview);
    const mDecimal = Math.round((totalPreview - hDecimal) * 60);
    const partes: string[] = [];
    if (hDecimal > 0) partes.push(`${hDecimal}h`);
    if (mDecimal > 0) partes.push(`${mDecimal}min`);
    entregaLabel = `~${partes.join(" ")} de proceso`;
    if (ranuras) entregaLabel += " · +1h ranuras";
    if ((parseFloat(metrosDelgado || "0") + parseFloat(metrosGrueso || "0")) > 0) entregaLabel += " · +1h enchape";
    if (corte45 || cortesEspeciales.trim()) entregaLabel += " · +30min especiales";
  }

  return (
    <div className="p-8 max-w-2xl mx-auto min-h-full" style={{ background: "linear-gradient(160deg, rgba(255,237,213,0.35) 0%, rgba(244,244,245,0) 28%)" }}>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-zinc-900">Nuevo Pedido</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Configuración de corte y optimización de materiales</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* 1. Cliente + Área */}
        <div className={SECTION}>
          <div className="flex items-center gap-3">
            <span className={STEP_NUM} style={STEP_NUM_STYLE}>1</span>
            <h2 className="font-bold text-zinc-900">Cliente y Área</h2>
          </div>
          <div>
            <label className={LABEL}>Nombre del cliente</label>
            <input
              type="text"
              value={clienteNombre}
              onChange={(e) => setClienteNombre(e.target.value)}
              placeholder="Escribe el nombre del cliente..."
              className={INPUT}
            />
          </div>
          <div>
            <label className={LABEL}>Área responsable</label>
            <div className="flex flex-wrap gap-2">
              {AREAS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setArea(a)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    area === a
                      ? AREA_COLORS[a]
                      : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Material */}
        <div className={SECTION}>
          <div className="flex items-center gap-3">
            <span className={STEP_NUM} style={STEP_NUM_STYLE}>2</span>
            <h2 className="font-bold text-zinc-900">Material</h2>
          </div>

          {/* Tipo de tablero */}
          <div>
            <label className={LABEL}>Tipo de tablero</label>
            <div className="flex flex-wrap gap-2">
              {TIPOS_TABLERO.map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => { setTipoTablero(tipo); setMarca(""); setEspesor(""); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    tipoTablero === tipo
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </div>

          {/* Marca (solo si el tipo tiene marcas) */}
          {MARCAS_POR_TIPO[tipoTablero].length > 0 && (
            <div>
              <label className={LABEL}>Marca</label>
              <div className="flex flex-wrap gap-2">
                {MARCAS_POR_TIPO[tipoTablero].map((m) => {
                  const formatos = FORMATOS_MARCA[m];
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMarca(marca === m ? "" : m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                        marca === m
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      {m}
                      {formatos && marca !== m && (
                        <span className="text-zinc-400 font-normal">{formatos[0]}</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {/* Formato info */}
              {marca && FORMATOS_MARCA[marca] && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Formatos disponibles:</span>
                  <div className="flex gap-1.5">
                    {FORMATOS_MARCA[marca].map((f) => (
                      <span key={f} className="text-[11px] font-bold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Formatos fijos para Triplay/OSB */}
          {FORMATOS_TIPO[tipoTablero] && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Formato estándar:</span>
              {FORMATOS_TIPO[tipoTablero].map((f) => (
                <span key={f} className="text-[11px] font-bold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">{f}</span>
              ))}
            </div>
          )}

          {/* Espesor */}
          <div>
            <label className={LABEL}>Espesor</label>
            <div className="flex flex-wrap gap-2">
              {ESPESORES.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEspesor(espesor === e ? "" : e)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    espesor === e
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  {e} mm
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Datos del Corte */}
        <div className={SECTION}>
          <div className="flex items-center gap-3">
            <span className={STEP_NUM} style={STEP_NUM_STYLE}>3</span>
            <h2 className="font-bold text-zinc-900">Datos del Corte</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className={LABEL}>Planchas</label>
              <input type="number" min="0" step="0.5" value={planchas} onChange={(e) => setPlanchas(e.target.value)} placeholder="0" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Piezas</label>
              <input type="number" min="0" value={piezas} onChange={(e) => setPiezas(e.target.value)} placeholder="0" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Canto Delgado (m)</label>
              <input type="number" min="0" step="0.1" value={metrosDelgado} onChange={(e) => setMetrosDelgado(e.target.value)} placeholder="0.00" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Canto Grueso (m)</label>
              <input type="number" min="0" step="0.1" value={metrosGrueso} onChange={(e) => setMetrosGrueso(e.target.value)} placeholder="0.00" className={INPUT} />
            </div>
          </div>
        </div>

        {/* 4. Servicios adicionales */}
        <div className={SECTION}>
          <div className="flex items-center gap-3">
            <span className={STEP_NUM} style={STEP_NUM_STYLE}>4</span>
            <h2 className="font-bold text-zinc-900">Servicios Adicionales</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={LABEL}>Ranuras</label>
              <Toggle value={ranuras} onChange={setRanuras} />
            </div>
            <div>
              <label className={LABEL}>Perforaciones</label>
              <Toggle value={perforaciones} onChange={setPerforaciones} />
            </div>
            <div>
              <label className={LABEL}>Corte 45°</label>
              <Toggle value={corte45} onChange={setCorte45} />
            </div>
          </div>
          <div>
            <label className={LABEL}>Cortes especiales (descripción)</label>
            <input
              type="text"
              value={cortesEspeciales}
              onChange={(e) => setCortesEspeciales(e.target.value)}
              placeholder="Ej: Radio en esquinas, corte en L..."
              className={INPUT}
            />
          </div>
        </div>

        {/* 5. Prioridad y Turno */}
        <div className={SECTION}>
          <div className="flex items-center gap-3">
            <span className={STEP_NUM} style={STEP_NUM_STYLE}>5</span>
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
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Tiempo de proceso estimado</p>
              <p className="text-sm font-bold text-zinc-900">{entregaLabel}</p>
              <p className="text-[11px] text-zinc-400">Base: 6 planchas/hora · La entrega final se calcula al registrar (incluye cola de máquina)</p>
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
