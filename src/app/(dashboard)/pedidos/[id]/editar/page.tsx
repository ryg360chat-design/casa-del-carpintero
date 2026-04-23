"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PROD, TZ } from "@/lib/productividad";

// ─── Estilos compartidos ──────────────────────────────────────────
const SECTION = "flex flex-col gap-4 bg-white border border-zinc-200 rounded-2xl p-6";
const STEP_NUM_STYLE = { background: "linear-gradient(135deg, #1957A6 0%, #267A8C 100%)" };
const STEP_NUM = "w-7 h-7 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0";
const INPUT    = "w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white";
const LABEL    = "block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5";

// ─── Constantes de materiales ─────────────────────────────────────
const TIPOS_TABLERO = ["Melamina", "MDF", "Triplay", "OSB", "Laminados", "Aglomerado", "Otros"] as const;
type TipoTablero = typeof TIPOS_TABLERO[number];

const MARCAS_POR_TIPO: Record<TipoTablero, string[]> = {
  "Melamina":   ["Masisa", "Pelikano", "Tas", "Kronospan", "Duraplac", "Finss", "Merino"],
  "MDF":        ["Masisa", "Pelikano", "Kronospan"],
  "Triplay":    [], "OSB": [], "Laminados": [], "Aglomerado": [], "Otros": [],
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

// ─── Tipos ────────────────────────────────────────────────────────
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

// ─── MaterialLineCard ─────────────────────────────────────────────
function MaterialLineCard({ line, index, total, onChange, onRemove }: {
  line: MaterialLine; index: number; total: number;
  onChange: (u: MaterialLine) => void; onRemove: () => void;
}) {
  const set = (f: Partial<MaterialLine>) => onChange({ ...line, ...f });
  const marcas = MARCAS_POR_TIPO[line.tipoTablero];

  return (
    <div className="border border-zinc-200 rounded-xl bg-zinc-50/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-100/70 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full text-[10px] font-black text-white flex items-center justify-center" style={{ background: "#1957A6" }}>
            {index + 1}
          </span>
          <span className="text-xs font-bold text-zinc-600">
            {line.tipoTablero}{line.espesor ? ` · ${line.espesor}mm` : ""}{line.marca ? ` · ${line.marca}` : ""}{line.colorMaterial ? ` · ${line.colorMaterial}` : ""}
          </span>
        </div>
        {total > 1 && (
          <button type="button" onClick={onRemove}
            className="text-[10px] font-bold text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors">
            Eliminar
          </button>
        )}
      </div>

      <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className={LABEL}>Tipo</label>
          <select value={line.tipoTablero}
            onChange={(e) => set({ tipoTablero: e.target.value as TipoTablero, marca: "", espesor: "" })}
            className={INPUT}>
            {TIPOS_TABLERO.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        {marcas.length > 0 ? (
          <div>
            <label className={LABEL}>Marca</label>
            <select value={line.marca} onChange={(e) => set({ marca: e.target.value })} className={INPUT}>
              <option value="">— Marca —</option>
              {marcas.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
        ) : (
          <div>
            <label className={LABEL}>Marca / Ref.</label>
            <input type="text" value={line.marca} onChange={(e) => set({ marca: e.target.value })}
              placeholder="Opcional" className={INPUT} />
          </div>
        )}

        <div>
          <label className={LABEL}>Espesor (mm)</label>
          <select value={line.espesor} onChange={(e) => set({ espesor: e.target.value })} className={INPUT}>
            <option value="">— mm —</option>
            {ESPESORES.map((e) => <option key={e}>{e}</option>)}
          </select>
        </div>

        <div>
          <label className={LABEL}>Color / Referencia</label>
          <input type="text" value={line.colorMaterial} onChange={(e) => set({ colorMaterial: e.target.value })}
            placeholder="Color o código" className={INPUT} />
        </div>

        <div>
          <label className={LABEL}>Planchas</label>
          <input type="number" min="0" step="0.25" value={line.planchas}
            onChange={(e) => set({ planchas: e.target.value })} placeholder="0" className={INPUT} />
        </div>

        <div>
          <label className={LABEL}>Piezas</label>
          <input type="number" min="0" value={line.piezas}
            onChange={(e) => set({ piezas: e.target.value })} placeholder="0" className={INPUT} />
        </div>

        <div>
          <label className={LABEL}>Canto delgado (m)</label>
          <input type="number" min="0" step="0.1" value={line.metrosDelgado}
            onChange={(e) => set({ metrosDelgado: e.target.value })} placeholder="0" className={INPUT} />
        </div>

        <div>
          <label className={LABEL}>Canto grueso (m)</label>
          <input type="number" min="0" step="0.1" value={line.metrosGrueso}
            onChange={(e) => set({ metrosGrueso: e.target.value })} placeholder="0" className={INPUT} />
        </div>
      </div>
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex border border-zinc-200 rounded-lg overflow-hidden">
      {[{ label: "Sí", val: true }, { label: "No", val: false }].map(({ label, val }) => (
        <button key={label} type="button" onClick={() => onChange(val)}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            value === val ? "bg-zinc-900 text-white" : "bg-white text-zinc-600 hover:bg-zinc-50"
          }`}>
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────
export default function EditarPedidoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  // Estado de carga inicial
  const [dataLoading, setDataLoading] = useState(true);
  const [notFound, setNotFound]       = useState(false);
  const [estadoActual, setEstadoActual] = useState("");
  const [canDelete, setCanDelete]       = useState(false);
  const [canAssignMaquina, setCanAssignMaquina] = useState(false);

  // Estado del formulario
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteCodigo, setClienteCodigo] = useState<string | null>(null);
  const [area, setArea]                   = useState<Area>("Ventas");
  const [lineas, setLineas]               = useState<MaterialLine[]>([newLine()]);
  const [ranuras, setRanuras]             = useState(false);
  const [perforaciones, setPerforaciones] = useState(false);
  const [corte45, setCorte45]             = useState(false);
  const [cortesEspeciales, setCortesEspeciales] = useState(false);
  const [prioridad, setPrioridad]         = useState<"normal" | "urgente" | "vip">("normal");
  const [turnoManual, setTurnoManual]     = useState<"mañana" | "tarde" | "auto">("auto");
  const [maquinaManual, setMaquinaManual] = useState<"auto" | "M1" | "M2" | "M3">("auto");
  const [cargaMaquinas, setCargaMaquinas] = useState<Record<string, number>>({});
  const [fechaProgramada, setFechaProgramada] = useState("");
  const [notas, setNotas]                 = useState("");

  // Cargar datos del pedido al montar
  useEffect(() => {
    async function load() {
      const sb = createClient();

      // Verificar rol del usuario
      const { data: { user } } = await sb.auth.getUser();
      if (user) {
        const { data: profile } = await sb.from("profiles").select("rol").eq("id", user.id).maybeSingle();
        const rol = (profile?.rol as string) ?? "";
        setCanDelete(["developer", "admin", "gerencia", "ventas"].includes(rol));
        setCanAssignMaquina(["developer", "admin", "gerencia", "ventas", "produccion"].includes(rol));
      }

      // Cargar pedido
      const { data: p } = await sb.from("pedidos")
        .select("*, cliente:clientes(nombre, codigo)")
        .eq("id", id).maybeSingle();

      if (!p) { setNotFound(true); setDataLoading(false); return; }

      const clienteInfo = p.cliente as Record<string, unknown> | null;
      setEstadoActual(p.estado as string);
      setClienteNombre((clienteInfo?.nombre as string) ?? "");
      setClienteCodigo((clienteInfo?.codigo as string | null) ?? null);
      setArea((p.area as Area) ?? "Ventas");
      setRanuras(!!p.ranuras);
      setPerforaciones(!!p.perforaciones);
      setCorte45(!!p.corte_45);
      setCortesEspeciales(!!p.cortes_especiales && p.cortes_especiales !== "false");
      setPrioridad((p.prioridad as "normal" | "urgente" | "vip") ?? "normal");
      setTurnoManual((p.turno as "mañana" | "tarde" | "auto") ?? "auto");
      setMaquinaManual((p.maquina_asignada as "auto" | "M1" | "M2" | "M3") ?? "auto");
      setFechaProgramada(p.fecha_inicio_programada ? (p.fecha_inicio_programada as string).split("T")[0] : "");
      setNotas((p.notas as string) ?? "");

      // Cargar líneas de material
      const { data: ls } = await sb.from("pedido_lineas")
        .select("*").eq("pedido_id", id).order("orden");
      if (ls && ls.length > 0) {
        setLineas(ls.map((l: Record<string, unknown>) => ({
          id: Math.random().toString(36).slice(2),
          tipoTablero: (l.tipo_tablero as TipoTablero) ?? "Melamina",
          marca:        (l.marca_melamina as string) ?? "",
          espesor:      (l.espesor as string) ?? "",
          colorMaterial:(l.color_material as string) ?? "",
          planchas:     String(l.cant_planchas ?? 0),
          piezas:       String(l.cant_piezas ?? 0),
          metrosDelgado:String(l.metros_canto_delgado ?? 0),
          metrosGrueso: String(l.metros_canto_grueso ?? 0),
        })));
      }

      // Carga de máquinas (excluyendo este pedido)
      const EXCLUIR = '("Listo","Despachado","Vendido","Cancelado")';
      const [r1, r2, r3] = await Promise.all([
        sb.from("pedidos").select("*", { count: "exact", head: true }).eq("maquina_asignada", "M1").not("estado", "in", EXCLUIR).neq("id", id),
        sb.from("pedidos").select("*", { count: "exact", head: true }).eq("maquina_asignada", "M2").not("estado", "in", EXCLUIR).neq("id", id),
        sb.from("pedidos").select("*", { count: "exact", head: true }).eq("maquina_asignada", "M3").not("estado", "in", EXCLUIR).neq("id", id),
      ]);
      setCargaMaquinas({ M1: r1.count ?? 0, M2: r2.count ?? 0, M3: r3.count ?? 0 });
      setDataLoading(false);
    }
    load();
  }, [id]);

  // Totales calculados
  const totalPlanchas = lineas.reduce((s, l) => s + parseFloat(l.planchas || "0"), 0);
  const totalPiezas   = lineas.reduce((s, l) => s + parseInt(l.piezas || "0"), 0);
  const totalCanto    = lineas.reduce((s, l) => s + parseFloat(l.metrosDelgado || "0") + parseFloat(l.metrosGrueso || "0"), 0);

  function updateLinea(idx: number, u: MaterialLine) { setLineas(prev => prev.map((l, i) => i === idx ? u : l)); }
  function removeLinea(idx: number) { setLineas(prev => prev.filter((_, i) => i !== idx)); }
  function addLinea() { setLineas(prev => [...prev, newLine()]); }

  const hora = new Date().getHours();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (lineas.length === 0) { setError("Agrega al menos un material."); return; }
    setLoading(true); setError("");
    const sb = createClient();

    try {
      // 1. Buscar o crear cliente
      let clienteId: string | null = null;
      if (clienteNombre.trim()) {
        const { data: existing, error: lookupError } = await sb
          .from("clientes").select("id").ilike("nombre", clienteNombre.trim()).maybeSingle();
        if (existing) {
          clienteId = existing.id;
        } else if (!lookupError) {
          const { data: nuevo } = await sb.from("clientes").insert({ nombre: clienteNombre.trim() }).select("id").single();
          clienteId = nuevo?.id ?? null;
        } else {
          const { data: exacto } = await sb.from("clientes").select("id").ilike("nombre", clienteNombre.trim()).limit(1).single();
          clienteId = exacto?.id ?? null;
        }
      }

      // 2. Recalcular máquina y entrega (excluir pedido actual)
      const ahora  = new Date();
      const EXCLUIR = '("Listo","Despachado","Vendido","Cancelado")';
      const [{ count: cM1 }, { count: cM2 }, { count: cM3 }] = await Promise.all([
        sb.from("pedidos").select("*", { count: "exact", head: true }).eq("maquina_asignada", "M1").not("estado", "in", EXCLUIR).neq("id", id),
        sb.from("pedidos").select("*", { count: "exact", head: true }).eq("maquina_asignada", "M2").not("estado", "in", EXCLUIR).neq("id", id),
        sb.from("pedidos").select("*", { count: "exact", head: true }).eq("maquina_asignada", "M3").not("estado", "in", EXCLUIR).neq("id", id),
      ]);

      let maquina: string;
      if (maquinaManual !== "auto") {
        maquina = maquinaManual;
      } else {
        maquina = (cM1 ?? 0) <= (cM2 ?? 0) ? "M1" : "M2";
      }

      // Helpers de horario laboral
      const INICIO = 8.25;
      function hFrac(d: Date) { return d.getHours() + d.getMinutes() / 60; }
      function setHFrac(d: Date, h: number) { d.setHours(Math.floor(h), Math.round((h % 1) * 60), 0, 0); }
      function skipWeekend(d: Date) { while (d.getDay() === 0 || d.getDay() === 6) { d.setDate(d.getDate() + 1); setHFrac(d, INICIO); } }
      function finDia(d: Date) { return d.toLocaleDateString("en-US", { timeZone: TZ, weekday: "short" }) === "Sat" ? 13.25 : 17.25; }
      function alIn(d: Date)  { return d.toLocaleDateString("en-US", { timeZone: TZ, weekday: "short" }) === "Sat" ? 99 : 12; }
      function alOut(d: Date) { return d.toLocaleDateString("en-US", { timeZone: TZ, weekday: "short" }) === "Sat" ? 99 : 13; }
      function addWorkHours(base: Date, horas: number): Date {
        const r = new Date(base);
        let rem = (!isFinite(horas) || isNaN(horas) || horas < 0) ? 0.5 : horas;
        const h0 = hFrac(r); const fd0 = finDia(r);
        if (h0 < INICIO) setHFrac(r, INICIO);
        else if (h0 >= fd0) { r.setDate(r.getDate() + 1); setHFrac(r, INICIO); }
        else if (h0 >= alIn(r) && h0 < alOut(r)) setHFrac(r, alOut(r));
        skipWeekend(r);
        let safety = 0;
        while (rem > 0.001 && safety < 500) {
          safety++;
          const h = hFrac(r); const FD = finDia(r); const AI = alIn(r); const AO = alOut(r);
          if (h >= FD) { r.setDate(r.getDate() + 1); setHFrac(r, INICIO); skipWeekend(r); continue; }
          if (h >= AI && h < AO) { setHFrac(r, AO); continue; }
          const tope = h < AI ? Math.min(AI, h + rem) : Math.min(FD, h + rem);
          const av = tope - h;
          if (av <= 0) { r.setDate(r.getDate() + 1); setHFrac(r, INICIO); skipWeekend(r); continue; }
          rem -= av; setHFrac(r, tope);
        }
        return r;
      }

      // Base de tiempo: donde termina el último pedido en cola (excluyendo este pedido)
      const { data: lastInQueue } = await sb
        .from("pedidos")
        .select("fecha_entrega_estimada")
        .eq("maquina_asignada", maquina)
        .not("estado", "in", EXCLUIR)
        .not("fecha_entrega_estimada", "is", null)
        .neq("id", id)
        .order("fecha_entrega_estimada", { ascending: false })
        .limit(1)
        .maybeSingle();

      const lastEnd = lastInQueue?.fecha_entrega_estimada ? new Date(lastInQueue.fecha_entrega_estimada as string) : null;
      let baseTime = lastEnd && lastEnd > ahora ? new Date(lastEnd) : new Date(ahora);

      // Ajustar baseTime según turno elegido manualmente
      if (turnoManual === "tarde") {
        const h = hFrac(baseTime);
        const fd = finDia(baseTime);
        if (h >= fd) {
          baseTime.setDate(baseTime.getDate() + 1);
          skipWeekend(baseTime);
          setHFrac(baseTime, 13);
        } else if (h < 13) {
          setHFrac(baseTime, 13);
        }
      } else if (turnoManual === "mañana") {
        const h = hFrac(baseTime);
        if (h >= 12) {
          baseTime.setDate(baseTime.getDate() + 1);
          skipWeekend(baseTime);
          setHFrac(baseTime, INICIO);
        }
      }

      const horasCorte = totalPlanchas > 0 ? totalPlanchas / PROD.PL_POR_HORA : 0.5;
      const horasExtra = (ranuras ? 1 : 0) + (totalCanto > 0 ? 1 : 0) + ((corte45 || cortesEspeciales) ? 0.5 : 0);
      const entrega = addWorkHours(baseTime, horasCorte + horasExtra);
      if (isNaN(entrega.getTime())) throw new Error("No se pudo calcular la fecha de entrega");

      // Turno: si fue manual, respetar; si auto, deducir de la hora de entrega real
      const turno = turnoManual === "auto" ? (entrega.getHours() < 12 ? "mañana" : "tarde") : turnoManual;

      // 3. Actualizar pedido
      const primera = lineas[0];
      const { error: upErr } = await sb.from("pedidos").update({
        cliente_id:              clienteId,
        area,
        tipo_tablero:            primera.tipoTablero,
        marca_melamina:          primera.marca.trim() || "",
        color_material:          primera.colorMaterial.trim() || null,
        espesor:                 primera.espesor || null,
        cant_planchas:           totalPlanchas,
        cant_piezas:             totalPiezas,
        metros_canto:            totalCanto,
        tipo_canto:              parseFloat(primera.metrosGrueso || "0") > 0 ? "grueso" : "delgado",
        ranuras, perforaciones, corte_45: corte45, cortes_especiales: cortesEspeciales,
        prioridad, notas: notas || null, turno,
        maquina_asignada:        maquina,
        fecha_entrega_estimada:  entrega.toISOString(),
        fecha_inicio_programada: fechaProgramada || null,
      }).eq("id", id);
      if (upErr) throw upErr;

      // 4. Reemplazar líneas de material
      await sb.from("pedido_lineas").delete().eq("pedido_id", id);
      if (lineas.length > 0) {
        const payload = lineas.map((l, idx) => ({
          pedido_id:            id,
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
        const { error: lErr } = await sb.from("pedido_lineas").insert(payload);
        if (lErr) throw new Error(lErr.message);
      }

      router.push(`/pedidos/${id}`);
      router.refresh();
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar este pedido permanentemente?\n\nEsta acción NO se puede deshacer.")) return;
    setLoading(true);
    const sb = createClient();
    await sb.from("pedido_lineas").delete().eq("pedido_id", id);
    const { error } = await sb.from("pedidos").delete().eq("id", id);
    if (error) { setError("Error al eliminar: " + error.message); setLoading(false); return; }
    router.push("/pedidos");
    router.refresh();
  }

  // ─── Estados de carga ────────────────────────────────────────────
  if (dataLoading) {
    return (
      <div className="p-8 flex items-center gap-3 text-zinc-400 text-sm">
        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        Cargando pedido...
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="p-8 text-center">
        <p className="text-zinc-500 text-sm mb-3">Pedido no encontrado.</p>
        <Link href="/pedidos" className="text-sm text-blue-600 font-medium hover:underline">← Volver a pedidos</Link>
      </div>
    );
  }

  const estaEnProduccion = ["En corte", "En tapacantos", "Listo"].includes(estadoActual);

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
      {/* Encabezado */}
      <div className="mb-7">
        <Link href={`/pedidos/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-900 transition-colors mb-3 group">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className="transition-transform group-hover:-translate-x-0.5">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Volver al pedido
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900">Editar Pedido</h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          Los cambios reprogramarán automáticamente la máquina y fecha de entrega según los nuevos materiales.
        </p>
      </div>

      {/* Advertencia si ya está en producción */}
      {estaEnProduccion && (
        <div className="mb-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" className="shrink-0 mt-0.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Este pedido ya está en producción — estado actual: <span className="font-black">{estadoActual}</span>
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Editarlo recalculará su máquina y fecha de entrega. El estado no cambiará.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* 1. Cliente y Área */}
        <div className={SECTION}>
          <div className="flex items-center gap-3">
            <span className={STEP_NUM} style={STEP_NUM_STYLE}>1</span>
            <h2 className="font-bold text-zinc-900">Cliente</h2>
          </div>

          <div>
            <label className={LABEL}>Nombre del cliente</label>
            <input type="text" value={clienteNombre}
              onChange={(e) => setClienteNombre(e.target.value)}
              placeholder="Nombre del cliente..."
              className={INPUT}
            />
            {clienteCodigo && (
              <div className="mt-2 flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  {clienteCodigo}
                </span>
                <span className="text-xs text-emerald-600 font-medium">✓ Cliente registrado</span>
              </div>
            )}
          </div>

          <div>
            <label className={LABEL}>Área</label>
            <div className="flex flex-wrap gap-2">
              {AREAS.map((a) => (
                <button key={a} type="button" onClick={() => setArea(a)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    area === a
                      ? AREA_COLORS[a] + " ring-1 ring-offset-1 ring-current"
                      : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
                  }`}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Materiales */}
        <div className={SECTION}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={STEP_NUM} style={STEP_NUM_STYLE}>2</span>
              <div>
                <h2 className="font-bold text-zinc-900">Materiales</h2>
                {lineas.length > 1 && (
                  <p className="text-xs text-zinc-400">
                    {lineas.length} materiales · {totalPlanchas.toFixed(1)} planchas · {totalPiezas} piezas
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {lineas.map((line, idx) => (
              <MaterialLineCard key={line.id} line={line} index={idx} total={lineas.length}
                onChange={(u) => updateLinea(idx, u)} onRemove={() => removeLinea(idx)} />
            ))}
          </div>

          <button type="button" onClick={addLinea}
            className="w-full py-2.5 border-2 border-dashed border-zinc-200 rounded-xl text-sm font-semibold text-zinc-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Prioridad</label>
              <div className="flex border border-zinc-200 rounded-lg overflow-hidden">
                {(["normal", "urgente", "vip"] as const).map((p) => (
                  <button key={p} type="button" onClick={() => setPrioridad(p)}
                    className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                      prioridad === p
                        ? p === "vip" ? "bg-orange-500 text-white" : "bg-zinc-900 text-white"
                        : "bg-white text-zinc-600 hover:bg-zinc-50"
                    }`}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={LABEL}>
                Turno{turnoManual === "auto" && (
                  <span className="text-zinc-400 font-normal normal-case tracking-normal">
                    {" "}(auto: {hora < 12 ? "mañana" : "tarde"})
                  </span>
                )}
              </label>
              <div className="flex border border-zinc-200 rounded-lg overflow-hidden">
                {([{ val: "auto", label: "Auto" }, { val: "mañana", label: "Mañana" }, { val: "tarde", label: "Tarde" }] as const).map(({ val, label }) => (
                  <button key={val} type="button" onClick={() => setTurnoManual(val)}
                    className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                      turnoManual === val ? "bg-zinc-900 text-white" : "bg-white text-zinc-600 hover:bg-zinc-50"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className={LABEL}>
              Inicio programado{" "}
              <span className="text-zinc-400 font-normal normal-case tracking-normal">(opcional)</span>
            </label>
            <input type="date" value={fechaProgramada}
              onChange={(e) => setFechaProgramada(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className={INPUT + " text-zinc-700 max-w-[220px]"}
            />
          </div>
        </div>

        {/* 5. Máquina */}
        {canAssignMaquina && (
          <div className={SECTION}>
            <div className="flex items-center gap-3">
              <span className={STEP_NUM} style={STEP_NUM_STYLE}>5</span>
              <div>
                <h2 className="font-bold text-zinc-900">Máquina asignada</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Auto elige la menos cargada — este pedido ya no cuenta en el total
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["auto", "M1", "M2", "M3"] as const).map((m) => {
                const carga      = m === "auto" ? null : (cargaMaquinas[m] ?? 0);
                const saturada   = carga !== null && carga > 15;
                const advertencia = carga !== null && carga > 10 && carga <= 15;
                const sel        = maquinaManual === m;
                return (
                  <button key={m} type="button" onClick={() => setMaquinaManual(m)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                      sel
                        ? saturada    ? "bg-red-600 text-white border-red-600"
                          : advertencia ? "bg-amber-500 text-white border-amber-500"
                          : "bg-zinc-900 text-white border-zinc-900"
                        : saturada    ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                          : advertencia ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                          : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                    }`}>
                    {m === "auto" ? (
                      <span className="flex items-center gap-1.5">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                        </svg>
                        Auto
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        {m}
                        {carga !== null && (
                          <span className={`font-normal ${sel ? "opacity-70" : "text-zinc-400"}`}>
                            · {carga} activos
                          </span>
                        )}
                        {saturada && <span className="ml-0.5">⚠</span>}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Notas */}
        <div className={SECTION}>
          <label className={LABEL}>Notas (opcional)</label>
          <textarea value={notas} onChange={(e) => setNotas(e.target.value)}
            placeholder="Instrucciones especiales del cliente..."
            rows={3} className={INPUT + " resize-none"} />
        </div>

        {error && <p className="text-sm text-red-600 text-center font-medium">{error}</p>}

        {/* Botones principales */}
        <div className="flex gap-3">
          <Link href={`/pedidos/${id}`}
            className="flex-1 py-3 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-all text-center press-effect">
            Cancelar
          </Link>
          <button type="submit" disabled={loading}
            className="flex-1 py-3 bg-zinc-900 text-white rounded-xl text-sm font-semibold transition-all press-effect disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-zinc-800">
            {loading ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Guardar cambios
              </>
            )}
          </button>
        </div>

        {/* Zona de peligro — solo para roles con permiso */}
        {canDelete && (
          <div className="border border-red-100 rounded-xl p-4 bg-red-50/50 mt-2">
            <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-3">Zona de peligro</p>
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-red-500">
                Eliminar permanentemente este pedido de la base de datos. No se puede deshacer.
              </p>
              <button type="button" onClick={handleDelete} disabled={loading}
                className="shrink-0 px-4 py-2 border border-red-300 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 hover:border-red-400 transition-all disabled:opacity-50 press-effect">
                Eliminar pedido
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
