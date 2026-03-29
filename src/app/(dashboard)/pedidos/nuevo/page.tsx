"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const SECTION  = "flex flex-col gap-4 bg-white border border-zinc-200 rounded-2xl p-6";
const STEP_NUM_STYLE = { background: "linear-gradient(135deg, #1957A6 0%, #267A8C 100%)" };
const STEP_NUM = "w-7 h-7 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0";
const INPUT    = "w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white";
const LABEL    = "block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5";

const TIPOS_TABLERO = ["Melamina", "MDF", "Triplay", "OSB", "Laminados", "Aglomerado", "Otros"] as const;
type TipoTablero = typeof TIPOS_TABLERO[number];

const MARCAS_POR_TIPO: Record<TipoTablero, string[]> = {
  "Melamina":   ["Masisa", "Pelikano", "Tas", "Kronospan", "Duraplac", "Finss", "Merino"],
  "MDF":        ["Masisa", "Pelikano", "Kronospan"],
  "Triplay":    [], "OSB": [], "Laminados": [], "Aglomerado": [], "Otros": [],
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
  "Triplay": ["1.22×2.44"], "OSB": ["1.22×2.44"],
};

const ESPESORES = ["2.5", "3", "4", "5.5", "9", "12", "15", "18", "25", "30"] as const;

const AREAS = ["Ventas", "Produccion", "Almacenes", "Cortes especiales", "Administracion", "Logistica"] as const;
type Area = typeof AREAS[number];

const AREA_COLORS: Record<Area, string> = {
  "Ventas":            "bg-blue-50 text-blue-700 border-blue-200",
  "Produccion":        "bg-orange-50 text-orange-700 border-orange-200",
  "Almacenes":         "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Cortes especiales": "bg-purple-50 text-purple-700 border-purple-200",
  "Administracion":    "bg-zinc-50 text-zinc-700 border-zinc-300",
  "Logistica":         "bg-emerald-50 text-emerald-700 border-emerald-200",
};

// ─── Tipo de línea de material ───────────────────────────────────
type MaterialLine = {
  id: string;
  tipoTablero: TipoTablero;
  marca: string;
  espesor: string;
  colorMaterial: string;
  planchas: string;
  piezas: string;
  metrosDelgado: string;
  metrosGrueso: string;
};

function newLine(): MaterialLine {
  return {
    id: Math.random().toString(36).slice(2),
    tipoTablero: "Melamina", marca: "", espesor: "",
    colorMaterial: "", planchas: "", piezas: "",
    metrosDelgado: "", metrosGrueso: "",
  };
}

// ─── Componente de una línea de material ─────────────────────────
function MaterialLineCard({
  line, index, total, onChange, onRemove,
}: {
  line: MaterialLine;
  index: number;
  total: number;
  onChange: (updated: MaterialLine) => void;
  onRemove: () => void;
}) {
  const set = (field: Partial<MaterialLine>) => onChange({ ...line, ...field });
  const marcas = MARCAS_POR_TIPO[line.tipoTablero];

  return (
    <div className="border border-zinc-200 rounded-xl bg-zinc-50/40 overflow-hidden">
      {/* Header de la línea */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-100/70 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full text-[10px] font-black text-white flex items-center justify-center" style={{ background: "#1957A6" }}>
            {index + 1}
          </span>
          <span className="text-xs font-bold text-zinc-600">
            {line.tipoTablero || "Material"}{line.espesor ? ` · ${line.espesor}mm` : ""}
            {line.marca ? ` · ${line.marca}` : ""}
            {line.colorMaterial ? ` · ${line.colorMaterial}` : ""}
          </span>
        </div>
        {total > 1 && (
          <button
            type="button"
            onClick={onRemove}
            className="text-zinc-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
            title="Eliminar material"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3">
        {/* Tipo de tablero */}
        <div>
          <label className={LABEL}>Tipo de tablero</label>
          <div className="flex flex-wrap gap-1.5">
            {TIPOS_TABLERO.map((tipo) => (
              <button
                key={tipo} type="button"
                onClick={() => set({ tipoTablero: tipo, marca: "", espesor: "" })}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  line.tipoTablero === tipo
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                }`}
              >
                {tipo}
              </button>
            ))}
          </div>
        </div>

        {/* Marca */}
        {marcas.length > 0 && (
          <div>
            <label className={LABEL}>Marca</label>
            <div className="flex flex-wrap gap-1.5">
              {marcas.map((m) => (
                <button
                  key={m} type="button"
                  onClick={() => set({ marca: line.marca === m ? "" : m })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    line.marca === m
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  {m}
                  {FORMATOS_MARCA[m] && line.marca !== m && (
                    <span className="text-zinc-400 font-normal">{FORMATOS_MARCA[m][0]}</span>
                  )}
                </button>
              ))}
            </div>
            {line.marca && FORMATOS_MARCA[line.marca] && (
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Formatos:</span>
                <div className="flex gap-1">
                  {FORMATOS_MARCA[line.marca].map((f) => (
                    <span key={f} className="text-[11px] font-bold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Formato fijo */}
        {FORMATOS_TIPO[line.tipoTablero] && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Formato estándar:</span>
            {FORMATOS_TIPO[line.tipoTablero].map((f) => (
              <span key={f} className="text-[11px] font-bold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">{f}</span>
            ))}
          </div>
        )}

        {/* Espesor */}
        <div>
          <label className={LABEL}>Espesor</label>
          <div className="flex flex-wrap gap-1.5">
            {ESPESORES.map((e) => (
              <button
                key={e} type="button"
                onClick={() => set({ espesor: line.espesor === e ? "" : e })}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  line.espesor === e
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                }`}
              >
                {e} mm
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div>
          <label className={LABEL}>Color del material</label>
          <input
            type="text"
            value={line.colorMaterial}
            onChange={(e) => set({ colorMaterial: e.target.value })}
            placeholder="Ej: Blanco Nieve, Roble Natural..."
            className={INPUT}
          />
        </div>

        {/* Cantidades */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div>
            <label className={LABEL}>Planchas</label>
            <input type="number" min="0" step="0.5" value={line.planchas}
              onChange={(e) => set({ planchas: e.target.value })}
              placeholder="0" className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Piezas</label>
            <input type="number" min="0" value={line.piezas}
              onChange={(e) => set({ piezas: e.target.value })}
              placeholder="0" className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Canto Delgado (m)</label>
            <input type="number" min="0" step="0.1" value={line.metrosDelgado}
              onChange={(e) => set({ metrosDelgado: e.target.value })}
              placeholder="0.00" className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Canto Grueso (m)</label>
            <input type="number" min="0" step="0.1" value={line.metrosGrueso}
              onChange={(e) => set({ metrosGrueso: e.target.value })}
              placeholder="0.00" className={INPUT} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Toggle Sí/No ────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex border border-zinc-200 rounded-lg overflow-hidden">
      {[{ label: "Sí", val: true }, { label: "No", val: false }].map(({ label, val }) => (
        <button
          key={label} type="button" onClick={() => onChange(val)}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            value === val ? "bg-zinc-900 text-white" : "bg-white text-zinc-600 hover:bg-zinc-50"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────
export default function NuevoPedidoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // Cliente
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteCodigo, setClienteCodigo] = useState<string | null>(null);
  const [clienteStatus, setClienteStatus] = useState<"idle" | "found" | "new">("idle");
  const [area, setArea] = useState<Area>("Ventas");

  // Búsqueda de cliente con debounce
  useEffect(() => {
    setClienteCodigo(null);
    setClienteStatus("idle");
    if (!clienteNombre.trim() || clienteNombre.trim().length < 2) return;
    const timer = setTimeout(async () => {
      const sb = createClient();
      const { data } = await sb
        .from("clientes").select("id, codigo")
        .ilike("nombre", `%${clienteNombre.trim()}%`).maybeSingle();
      if (data) { setClienteCodigo(data.codigo ?? null); setClienteStatus("found"); }
      else       { setClienteStatus("new"); }
    }, 400);
    return () => clearTimeout(timer);
  }, [clienteNombre]);

  // Líneas de material
  const [lineas, setLineas] = useState<MaterialLine[]>([newLine()]);

  function updateLinea(idx: number, updated: MaterialLine) {
    setLineas(prev => prev.map((l, i) => i === idx ? updated : l));
  }
  function removeLinea(idx: number) {
    setLineas(prev => prev.filter((_, i) => i !== idx));
  }
  function addLinea() {
    setLineas(prev => [...prev, newLine()]);
  }

  // Servicios (globales del pedido)
  const [ranuras, setRanuras]                   = useState(false);
  const [perforaciones, setPerforaciones]       = useState(false);
  const [corte45, setCorte45]                   = useState(false);
  const [cortesEspeciales, setCortesEspeciales] = useState(false);
  const [prioridad, setPrioridad]               = useState<"normal" | "urgente" | "vip">("normal");
  const [turnoManual, setTurnoManual]           = useState<"mañana" | "tarde" | "auto">("auto");
  const [notas, setNotas]                       = useState("");

  // Totales calculados de todas las líneas
  const totalPlanchas = lineas.reduce((s, l) => s + parseFloat(l.planchas || "0"), 0);
  const totalPiezas   = lineas.reduce((s, l) => s + parseInt(l.piezas || "0"), 0);
  const totalCanto    = lineas.reduce((s, l) =>
    s + parseFloat(l.metrosDelgado || "0") + parseFloat(l.metrosGrueso || "0"), 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (lineas.length === 0) { setError("Agrega al menos un material."); return; }
    setLoading(true);
    setError("");

    const supabase = createClient();

    try {
      // 1. Buscar o crear cliente
      let clienteId: string | null = null;
      if (clienteNombre.trim()) {
        const { data: existing } = await supabase
          .from("clientes").select("id")
          .ilike("nombre", clienteNombre.trim()).maybeSingle();
        if (existing) {
          clienteId = existing.id;
        } else {
          const { data: nuevo } = await supabase
            .from("clientes").insert({ nombre: clienteNombre.trim() })
            .select("id").single();
          clienteId = nuevo?.id ?? null;
        }
      }

      // 2. Asignación de máquina
      const ahora = new Date();
      const hora  = ahora.getHours();
      const turno = turnoManual === "auto" ? (hora < 12 ? "mañana" : "tarde") : turnoManual;

      const { count: cM1 } = await supabase
        .from("pedidos").select("*", { count: "exact", head: true })
        .eq("maquina_asignada", "M1").not("estado", "in", '("Listo","Cancelado")');
      const { count: cM2 } = await supabase
        .from("pedidos").select("*", { count: "exact", head: true })
        .eq("maquina_asignada", "M2").not("estado", "in", '("Listo","Cancelado")');

      const cMaquina = (cM1 ?? 0) <= (cM2 ?? 0) ? cM1 ?? 0 : cM2 ?? 0;
      const maquina  = (cM1 ?? 0) <= (cM2 ?? 0) ? "M1" : "M2";

      // 3. Cálculo de entrega (usa totalPlanchas sumado de todas las líneas)
      const horasCorte  = totalPlanchas > 0 ? totalPlanchas / 6 : 0.5;
      const horasExtra  =
        (ranuras ? 1 : 0) +
        (totalCanto > 0 ? 1 : 0) +
        ((corte45 || cortesEspeciales) ? 0.5 : 0);
      const horasEspera = cMaquina * 2;
      const totalHoras  = horasCorte + horasExtra + horasEspera;

      const INICIO = 8, ALMUERZO_IN = 12, ALMUERZO_OUT = 13, FIN = 17.5;
      function hFrac(d: Date) { return d.getHours() + d.getMinutes() / 60; }
      function setHFrac(d: Date, h: number) { d.setHours(Math.floor(h), Math.round((h % 1) * 60), 0, 0); }
      function skipWeekend(d: Date) {
        while (d.getDay() === 0 || d.getDay() === 6) { d.setDate(d.getDate() + 1); setHFrac(d, INICIO); }
      }
      function addWorkHours(base: Date, horas: number): Date {
        const result = new Date(base);
        let remaining = horas;
        const h0 = hFrac(result);
        if (h0 < INICIO) setHFrac(result, INICIO);
        else if (h0 >= FIN) { result.setDate(result.getDate() + 1); setHFrac(result, INICIO); }
        else if (h0 >= ALMUERZO_IN && h0 < ALMUERZO_OUT) setHFrac(result, ALMUERZO_OUT);
        skipWeekend(result);
        while (remaining > 0) {
          const h = hFrac(result);
          const tope = h < ALMUERZO_IN ? Math.min(ALMUERZO_IN, h + remaining) : Math.min(FIN, h + remaining);
          remaining -= tope - h;
          setHFrac(result, tope);
          if (remaining > 0) {
            const hNow = hFrac(result);
            if (hNow >= ALMUERZO_IN && hNow < ALMUERZO_OUT) setHFrac(result, ALMUERZO_OUT);
            else { result.setDate(result.getDate() + 1); setHFrac(result, INICIO); skipWeekend(result); }
          }
        }
        return result;
      }
      const entrega = addWorkHours(ahora, totalHoras);

      // 4. Insertar pedido (columnas legacy = primera línea para backwards compat)
      const primera = lineas[0];
      const { data: pedidoData, error: insertError } = await supabase.from("pedidos").insert({
        cliente_id:             clienteId,
        area,
        tipo_tablero:           primera.tipoTablero,
        marca_melamina:         primera.marca.trim() || "",
        color_material:         primera.colorMaterial.trim() || null,
        espesor:                primera.espesor || null,
        cant_planchas:          totalPlanchas,
        cant_piezas:            totalPiezas,
        metros_canto:           totalCanto,
        tipo_canto:             (parseFloat(primera.metrosDelgado || "0") > 0 && parseFloat(primera.metrosGrueso || "0") > 0)
                                  ? "ambos"
                                  : parseFloat(primera.metrosGrueso || "0") > 0 ? "grueso" : "delgado",
        ranuras,
        perforaciones,
        corte_45:               corte45,
        cortes_especiales:      cortesEspeciales,
        prioridad,
        notas:                  notas || null,
        turno,
        maquina_asignada:       maquina,
        fecha_entrega_estimada: entrega.toISOString(),
      }).select("id").single();

      if (insertError) throw insertError;

      // 5. Insertar líneas de material
      if (pedidoData?.id && lineas.length > 0) {
        const lineasPayload = lineas.map((l, idx) => ({
          pedido_id:            pedidoData.id,
          orden:                idx + 1,
          tipo_tablero:         l.tipoTablero,
          marca_melamina:       l.marca.trim(),
          espesor:              l.espesor,
          color_material:       l.colorMaterial.trim(),
          cant_planchas:        parseFloat(l.planchas || "0"),
          cant_piezas:          parseInt(l.piezas || "0"),
          metros_canto_delgado: parseFloat(l.metrosDelgado || "0"),
          metros_canto_grueso:  parseFloat(l.metrosGrueso || "0"),
        }));
        const { error: lineasError } = await supabase.from("pedido_lineas").insert(lineasPayload);
        if (lineasError) console.warn("pedido_lineas insert error:", lineasError.message);
      }

      router.push("/pedidos");
      router.refresh();
    } catch (err) {
      setError("Error al guardar el pedido. Intenta de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const tieneEntrega = totalPlanchas > 0;
  const hora = new Date().getHours();

  let entregaLabel = "";
  if (tieneEntrega) {
    const hCorte   = totalPlanchas / 6;
    const hExtras  = (ranuras ? 1 : 0) + (totalCanto > 0 ? 1 : 0) + ((corte45 || cortesEspeciales) ? 0.5 : 0);
    const total    = hCorte + hExtras;
    const hD       = Math.floor(total);
    const mD       = Math.round((total - hD) * 60);
    const partes: string[] = [];
    if (hD > 0) partes.push(`${hD}h`);
    if (mD > 0) partes.push(`${mD}min`);
    entregaLabel = `~${partes.join(" ")} de proceso`;
    if (ranuras) entregaLabel += " · +1h ranuras";
    if (totalCanto > 0) entregaLabel += " · +1h enchape";
    if (corte45 || cortesEspeciales) entregaLabel += " · +30min especiales";
  }

  return (
    <div className="p-8 max-w-2xl mx-auto min-h-full" style={{ background: "linear-gradient(160deg, rgba(219,234,254,0.3) 0%, rgba(244,244,245,0) 28%)" }}>
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
              type="text" value={clienteNombre}
              onChange={(e) => setClienteNombre(e.target.value)}
              placeholder="Escribe el nombre del cliente..."
              className={INPUT}
            />
            {clienteStatus === "found" && (
              <div className="mt-2 flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  {clienteCodigo ?? "—"}
                </span>
                <span className="text-xs text-emerald-600 font-medium">✓ Cliente existente</span>
              </div>
            )}
            {clienteStatus === "new" && clienteNombre.trim().length >= 2 && (
              <p className="mt-2 text-xs text-blue-600 font-medium">✦ Se registrará como nuevo cliente</p>
            )}
          </div>
          <div>
            <label className={LABEL}>Área responsable</label>
            <div className="flex flex-wrap gap-2">
              {AREAS.map((a) => (
                <button key={a} type="button" onClick={() => setArea(a)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    area === a ? AREA_COLORS[a] : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Materiales (multi-línea) */}
        <div className={SECTION}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={STEP_NUM} style={STEP_NUM_STYLE}>2</span>
              <div>
                <h2 className="font-bold text-zinc-900">Materiales</h2>
                {lineas.length > 1 && (
                  <p className="text-xs text-zinc-400">{lineas.length} materiales · {totalPlanchas.toFixed(1)} planchas · {totalPiezas} piezas</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {lineas.map((line, idx) => (
              <MaterialLineCard
                key={line.id}
                line={line}
                index={idx}
                total={lineas.length}
                onChange={(updated) => updateLinea(idx, updated)}
                onRemove={() => removeLinea(idx)}
              />
            ))}
          </div>

          {/* Botón añadir material */}
          <button
            type="button"
            onClick={addLinea}
            className="w-full py-2.5 border-2 border-dashed border-zinc-200 rounded-xl text-sm font-semibold text-zinc-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Agregar material
          </button>
        </div>

        {/* 3. Servicios adicionales */}
        <div className={SECTION}>
          <div className="flex items-center gap-3">
            <span className={STEP_NUM} style={STEP_NUM_STYLE}>3</span>
            <h2 className="font-bold text-zinc-900">Servicios Adicionales</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div><label className={LABEL}>Ranuras</label><Toggle value={ranuras} onChange={setRanuras} /></div>
            <div><label className={LABEL}>Perforaciones</label><Toggle value={perforaciones} onChange={setPerforaciones} /></div>
            <div><label className={LABEL}>Corte 45°</label><Toggle value={corte45} onChange={setCorte45} /></div>
            <div><label className={LABEL}>Corte especial</label><Toggle value={cortesEspeciales} onChange={setCortesEspeciales} /></div>
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
                  <label key={p} className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg cursor-pointer transition-colors capitalize font-medium text-sm flex-1 justify-center ${
                    prioridad === p
                      ? p === "urgente" ? "border-zinc-900 bg-zinc-50 text-zinc-900"
                        : p === "vip"   ? "border-orange-500 bg-orange-50 text-orange-700"
                                        : "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                  }`}>
                    <input type="radio" name="prioridad" value={p} checked={prioridad === p} onChange={() => setPrioridad(p)} className="sr-only" />
                    {p === "urgente" && <span>⚡</span>}
                    {p === "vip"     && <span>★</span>}
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
                {([{ val: "auto", label: "Auto" }, { val: "mañana", label: "Mañana" }, { val: "tarde", label: "Tarde" }] as const).map(({ val, label }) => (
                  <button key={val} type="button" onClick={() => setTurnoManual(val)}
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
            value={notas} onChange={(e) => setNotas(e.target.value)}
            placeholder="Instrucciones especiales del cliente..."
            rows={3} className={INPUT + " resize-none"}
          />
        </div>

        {/* Preview entrega */}
        {tieneEntrega && (
          <div className="border-2 border-zinc-900 rounded-xl p-4 bg-zinc-50">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Tiempo de proceso estimado</p>
              <p className="text-sm font-bold text-zinc-900">{entregaLabel}</p>
              {lineas.length > 1 && (
                <p className="text-xs text-blue-600 font-medium">
                  {lineas.length} materiales · {totalPlanchas.toFixed(1)} planchas totales · {totalPiezas} piezas
                </p>
              )}
              <p className="text-[11px] text-zinc-400">Base: 6 planchas/hora · La entrega final se calcula al registrar (incluye cola de máquina)</p>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()}
            className="flex-1 py-3 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-all press-effect"
          >
            Cancelar
          </button>
          <button type="submit" disabled={loading}
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
