import { createClient } from "@/lib/supabase/server";
import PrintButton from "@/components/PrintButton";
import { limaTime } from "@/lib/time";

export const metadata = {
  title: "Reporte Diario — Casa del Carpintero",
};

const STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #f8f8f8;
    color: #18181b;
    -webkit-font-smoothing: antialiased;
  }
  .page {
    max-width: 900px;
    margin: 24px auto;
    background: white;
    min-height: 100vh;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  }
  .header {
    background: #18181b;
    color: white;
    padding: 32px 40px 28px;
  }
  .header-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 28px;
  }
  .logo { display: flex; align-items: center; gap: 12px; }
  .logo-icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: linear-gradient(135deg, #1957A6, #267A8C);
    display: flex; align-items: center; justify-content: center;
  }
  .logo-name { font-size: 17px; font-weight: 700; }
  .logo-sub { font-size: 11px; color: #CC5238; margin-top: 1px; }
  .header-date { text-align: right; }
  .header-date .label { font-size: 11px; color: #71717a; }
  .header-date .value { font-size: 14px; font-weight: 600; text-transform: capitalize; margin-top: 2px; }
  .header-date .time { font-size: 11px; color: #71717a; margin-top: 2px; }
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
  }
  .stat-box {
    background: rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 14px;
    text-align: center;
  }
  .stat-value { font-size: 28px; font-weight: 700; }
  .stat-label { font-size: 10px; color: #a1a1aa; margin-top: 4px; font-weight: 500; }
  .c-blue { color: #60a5fa; }
  .c-orange { color: #fb923c; }
  .c-zinc { color: #d4d4d8; }
  .c-green { color: #4ade80; }
  .c-red { color: #f87171; }
  .body { padding: 32px 40px; }
  .vol-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 28px;
  }
  .vol-card {
    border: 1px solid #e4e4e7;
    border-radius: 12px;
    padding: 18px 20px;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .vol-icon {
    width: 44px; height: 44px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .vol-value { font-size: 28px; font-weight: 700; }
  .vol-label { font-size: 10px; color: #71717a; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; }
  .section-header {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;
  }
  .section-title { font-size: 13px; font-weight: 700; color: #18181b; }
  .section-badge {
    font-size: 10px; font-weight: 600;
    background: #f4f4f5; color: #71717a;
    padding: 3px 10px; border-radius: 99px;
  }
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 28px; }
  thead tr { border-bottom: 2px solid #e4e4e7; background: #fafafa; }
  th {
    text-align: left; padding: 10px 12px;
    font-size: 9px; font-weight: 700; color: #a1a1aa;
    text-transform: uppercase; letter-spacing: 0.06em;
  }
  td { padding: 10px 12px; border-bottom: 1px solid #f4f4f5; vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:nth-child(even) td { background: #fafafa; }
  tfoot tr td { background: #f4f4f5; border-top: 2px solid #e4e4e7; font-weight: 700; font-size: 12px; }
  .order-num { font-weight: 700; color: #52525b; }
  .client-name { font-weight: 600; }
  .badge {
    display: inline-flex; align-items: center;
    padding: 2px 8px; border-radius: 99px;
    font-size: 10px; font-weight: 700;
  }
  .badge-corte { background: #18181b; color: white; }
  .badge-tapac { background: #3f3f46; color: white; }
  .badge-cola { background: #f4f4f5; color: #52525b; border: 1px solid #e4e4e7; }
  .badge-listo { background: #dcfce7; color: #166534; }
  .badge-cancel { background: #fee2e2; color: #dc2626; }
  .badge-m { background: #18181b; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; }
  .prior-urgente { color: #18181b; font-weight: 700; }
  .prior-vip { color: #ea580c; font-weight: 700; }
  .prior-normal { color: #a1a1aa; }

  /* ── Máquinas ─────────────────────────────────────── */
  .maq-section {
    border: 1px solid #e4e4e7;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 28px;
  }
  .maq-header {
    padding: 16px 20px;
    border-bottom: 1px solid #e4e4e7;
    background: #fafafa;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .maq-title { font-size: 13px; font-weight: 700; color: #18181b; }
  .maq-sub { font-size: 10px; color: #a1a1aa; margin-top: 1px; }
  .maq-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .maq-col {
    padding: 24px 28px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .maq-col:first-child { border-right: 1px solid #f4f4f5; }
  .maq-label { font-size: 13px; font-weight: 700; color: #18181b; }
  .maq-sublabel { font-size: 10px; color: #a1a1aa; }
  .prod-table { margin-bottom: 0; }
  .bar-wrap {
    display: flex; align-items: center; gap: 8px;
  }
  .bar-track {
    flex: 1; height: 6px; background: #f4f4f5; border-radius: 99px; overflow: hidden;
  }
  .bar-fill { height: 100%; border-radius: 99px; }
  .bar-pct { font-size: 10px; color: #a1a1aa; font-weight: 600; min-width: 30px; }

  .footer {
    padding: 20px 40px;
    border-top: 1px solid #e4e4e7;
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #a1a1aa;
  }
  .print-bar {
    background: #18181b;
    padding: 14px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .print-btn {
    background: #1957A6; color: white; border: none;
    padding: 10px 24px; border-radius: 8px;
    font-size: 13px; font-weight: 700; cursor: pointer;
    display: flex; align-items: center; gap: 8px;
  }
  .print-btn:hover { background: #1248A0; }
  .print-title { color: white; font-size: 13px; font-weight: 600; }
  .print-sub { color: #71717a; font-size: 11px; margin-top: 1px; }
  @media print {
    .print-bar { display: none !important; }
    body { background: white; }
    .page { max-width: 100%; margin: 0; border-radius: 0; box-shadow: none; }
    @page { margin: 15mm; size: A4; }
  }
`;

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const CIRC = 2 * Math.PI * 44;

export default async function ReportePDFPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>;
}) {
  const { fecha: fechaParam } = await searchParams;
  const supabase = await createClient();

  let hoy: Date;
  if (fechaParam && /^\d{4}-\d{2}-\d{2}$/.test(fechaParam)) {
    hoy = new Date(fechaParam + "T00:00:00-05:00");
  } else {
    const limaStr = new Date().toLocaleDateString("en-CA", { timeZone: "America/Lima" });
    hoy = new Date(limaStr + "T00:00:00-05:00");
  }
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);
  const hace7dias = new Date(hoy);
  hace7dias.setDate(hace7dias.getDate() - 6);

  const [
    { data: pedidosHoy },
    { data: todosActivos },
    { count: enCola },
    { count: enCorte },
    { count: enTapacantos },
    { count: listos },
    { count: cancelados },
    { data: completadosSemana },
    { data: activosXMaquina },
  ] = await Promise.all([
    supabase
      .from("pedidos")
      .select("*, cliente:clientes(nombre, telefono)")
      .gte("created_at", hoy.toISOString())
      .lt("created_at", manana.toISOString())
      .order("prioridad", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("pedidos")
      .select("*, cliente:clientes(nombre)")
      .not("estado", "in", '("Listo","Cancelado")')
      .order("prioridad", { ascending: true })
      .order("fecha_ingreso", { ascending: true }),
    supabase.from("pedidos").select("*", { count: "exact", head: true }).eq("estado", "En cola"),
    supabase.from("pedidos").select("*", { count: "exact", head: true }).eq("estado", "En corte"),
    supabase.from("pedidos").select("*", { count: "exact", head: true }).eq("estado", "En tapacantos"),
    supabase.from("pedidos").select("*", { count: "exact", head: true }).eq("estado", "Listo").gte("updated_at", hoy.toISOString()),
    supabase.from("pedidos").select("*", { count: "exact", head: true }).eq("estado", "Cancelado").gte("updated_at", hoy.toISOString()),
    supabase
      .from("pedidos")
      .select("maquina_asignada, updated_at, cant_planchas, cant_piezas")
      .eq("estado", "Listo")
      .gte("updated_at", hace7dias.toISOString()),
    supabase
      .from("pedidos")
      .select("maquina_asignada")
      .in("estado", ["En cola", "En corte", "En tapacantos"]),
  ]);

  const fechaHoy = hoy.toLocaleDateString("es", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const horaGenera = limaTime(new Date());

  const totalPlanchas = (pedidosHoy ?? []).reduce((acc: number, p: Record<string, unknown>) => acc + ((p.cant_planchas as number) ?? 0), 0);
  const totalPiezas   = (pedidosHoy ?? []).reduce((acc: number, p: Record<string, unknown>) => acc + ((p.cant_piezas as number) ?? 0), 0);
  const totalMetros   = (pedidosHoy ?? []).reduce((acc: number, p: Record<string, unknown>) => acc + ((p.metros_canto as number) ?? 0), 0);

  // Machine data
  const loadM1 = (activosXMaquina ?? []).filter((p: Record<string, unknown>) => p.maquina_asignada === "M1").length;
  const loadM2 = (activosXMaquina ?? []).filter((p: Record<string, unknown>) => p.maquina_asignada === "M2").length;
  const totalLoad = loadM1 + loadM2 || 1;

  type PRow = { maquina_asignada: string | null; cant_planchas: number | null; cant_piezas: number | null };
  const rows = (completadosSemana ?? []) as PRow[];

  const maquinaStats = (["M1", "M2"] as const).map((maq, idx) => {
    const recs = rows.filter(p => p.maquina_asignada === maq);
    const carga = idx === 0 ? loadM1 : loadM2;
    return {
      id: maq,
      color: idx === 0 ? "#1957A6" : "#267A8C",
      completados: recs.length,
      planchas: recs.reduce((a, p) => a + (p.cant_planchas ?? 0), 0),
      piezas:   recs.reduce((a, p) => a + (p.cant_piezas   ?? 0), 0),
      porDia: (recs.length / 7).toFixed(1),
      cargaActual: carga,
      pctCarga: Math.round((carga / totalLoad) * 100),
    };
  });

  // Bar chart data
  const diasSemana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hace7dias);
    d.setDate(d.getDate() + i);
    return d;
  });
  const chartData = diasSemana.map(d => {
    const key = d.toISOString().slice(0, 10);
    const isToday = key === hoy.toISOString().slice(0, 10);
    const dayRecs = (completadosSemana ?? []).filter((p: Record<string, unknown>) =>
      (p.updated_at as string)?.slice(0, 10) === key
    );
    return {
      label: DIAS_SEMANA[d.getDay()],
      isToday,
      M1: dayRecs.filter((p: Record<string, unknown>) => p.maquina_asignada === "M1").length,
      M2: dayRecs.filter((p: Record<string, unknown>) => p.maquina_asignada === "M2").length,
    };
  });
  const maxBar = Math.max(...chartData.map(d => Math.max(d.M1, d.M2)), 1);

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Barra de impresión */}
      <div className="print-bar">
        <div>
          <div className="print-title">Reporte Diario — Casa del Carpintero</div>
          <div className="print-sub" style={{ textTransform: "capitalize" }}>{fechaHoy}</div>
        </div>
        <PrintButton />
      </div>

      <div className="page">
        {/* Header */}
        <div className="header">
          <div className="header-top">
            <div className="logo">
              <div className="logo-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <div>
                <div className="logo-name">Casa del Carpintero</div>
                <div className="logo-sub">Production OS · Reporte de producción</div>
              </div>
            </div>
            <div className="header-date">
              <div className="label">Fecha del reporte</div>
              <div className="value">{fechaHoy}</div>
              <div className="time">Generado: {horaGenera}</div>
            </div>
          </div>

          <div className="stats-grid">
            {[
              { label: "Ingresados hoy", value: pedidosHoy?.length ?? 0, cls: "c-blue" },
              { label: "En cola",        value: enCola ?? 0,             cls: "c-orange" },
              { label: "En corte",       value: enCorte ?? 0,            cls: "c-zinc" },
              { label: "Listos hoy",     value: listos ?? 0,             cls: "c-green" },
              { label: "Cancelados",     value: cancelados ?? 0,         cls: "c-red" },
            ].map(({ label, value, cls }) => (
              <div key={label} className="stat-box">
                <div className={`stat-value ${cls}`}>{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="body">
          {/* Volumen */}
          <div className="vol-grid">
            {[
              { value: totalPlanchas.toFixed(1), label: "Total planchas hoy",    bg: "rgba(59,130,246,0.08)",  stroke: "#3b82f6", path: "M4 7h16M4 12h16M4 17h10" },
              { value: String(totalPiezas),      label: "Total piezas hoy",      bg: "rgba(38,122,140,0.08)", stroke: "#267A8C", path: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
              { value: totalMetros.toFixed(1) + " m", label: "Total metros de canto", bg: "rgba(34,197,94,0.08)",  stroke: "#22c55e", path: "M3 3h18v18H3zM9 9h6v6H9z" },
            ].map(({ value, label, bg, stroke, path }) => (
              <div key={label} className="vol-card">
                <div className="vol-icon" style={{ background: bg }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2"><path d={path} /></svg>
                </div>
                <div>
                  <div className="vol-value">{value}</div>
                  <div className="vol-label">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── REPORTE POR MÁQUINA ── */}
          <div className="maq-section">
            <div className="maq-header">
              <div>
                <div className="maq-title">Reporte por máquina</div>
                <div className="maq-sub">Carga actual · Productividad últimos 7 días</div>
              </div>
              <div style={{ fontSize: 10, color: "#a1a1aa", fontWeight: 600 }}>{loadM1 + loadM2} activos ahora</div>
            </div>

            {/* Gauges + bar chart */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid #f4f4f5" }}>
              {/* Gauges */}
              <div style={{ padding: "24px 20px", borderRight: "1px solid #f4f4f5" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>Carga actual</div>
                <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
                  {maquinaStats.map(m => {
                    const dash = (m.cargaActual / totalLoad) * CIRC;
                    return (
                      <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                        <svg viewBox="0 0 120 120" width="110" height="110">
                          <circle cx="60" cy="60" r="44" fill="none" stroke="#f4f4f5" strokeWidth="12"/>
                          <circle cx="60" cy="60" r="44" fill="none" stroke={m.color} strokeWidth="12"
                            strokeDasharray={`${dash} ${CIRC}`}
                            strokeLinecap="round"
                            transform="rotate(-90 60 60)"
                          />
                          <text x="60" y="53" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#09090b">{m.pctCarga}%</text>
                          <text x="60" y="70" textAnchor="middle" fontSize="10" fill="#71717a">{m.cargaActual} activos</text>
                        </svg>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#18181b" }}>Máquina {m.id.slice(1)}</div>
                          <div style={{ fontSize: 10, color: "#a1a1aa" }}>carga actual</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bar chart */}
              <div style={{ padding: "24px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.06em" }}>Completados 7 días</div>
                  <div style={{ display: "flex", gap: 10, fontSize: 10, fontWeight: 600 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: "#1957A6", display: "inline-block" }}/>M1
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: "#267A8C", display: "inline-block" }}/>M2
                    </span>
                  </div>
                </div>
                <svg viewBox="0 0 380 130" style={{ width: "100%" }}>
                  <line x1="20" y1="105" x2="375" y2="105" stroke="#e4e4e7" strokeWidth="1.5"/>
                  {chartData.map((d, i) => {
                    const groupW = 355 / 7;
                    const centerX = 20 + i * groupW + groupW / 2;
                    const barW = 14;
                    const gap = 3;
                    const m1H = (d.M1 / maxBar) * 90;
                    const m2H = (d.M2 / maxBar) * 90;
                    return (
                      <g key={i}>
                        <rect x={centerX - barW - gap / 2} y={105 - m1H} width={barW} height={Math.max(m1H, 0)} fill="#1957A6" rx="2" opacity={d.isToday ? 1 : 0.6}/>
                        <rect x={centerX + gap / 2}         y={105 - m2H} width={barW} height={Math.max(m2H, 0)} fill="#267A8C" rx="2" opacity={d.isToday ? 1 : 0.6}/>
                        {d.M1 > 0 && <text x={centerX - barW / 2 - gap / 2} y={105 - m1H - 3} textAnchor="middle" fontSize="8" fill="#1957A6" fontWeight="700">{d.M1}</text>}
                        {d.M2 > 0 && <text x={centerX + barW / 2 + gap / 2} y={105 - m2H - 3} textAnchor="middle" fontSize="8" fill="#267A8C" fontWeight="700">{d.M2}</text>}
                        <text x={centerX} y={120} textAnchor="middle" fontSize="9" fill={d.isToday ? "#1957A6" : "#a1a1aa"} fontWeight={d.isToday ? "700" : "400"}>
                          {d.label}
                        </text>
                      </g>
                    );
                  })}
                  <text x="18" y={105 - 90 + 4} textAnchor="middle" fontSize="8" fill="#a1a1aa">{maxBar}</text>
                  <text x="18" y="108" textAnchor="middle" fontSize="8" fill="#a1a1aa">0</text>
                </svg>
              </div>
            </div>

            {/* Productivity table */}
            <table className="prod-table" style={{ marginBottom: 0 }}>
              <thead>
                <tr>
                  {["Máquina", "Completados (7 días)", "Prom. / día", "Planchas", "Piezas", "Carga actual"].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {maquinaStats.map((m, idx) => (
                  <tr key={m.id} style={idx % 2 === 0 ? {} : { background: "#fafafa" }}>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: m.color, display: "inline-block", flexShrink: 0 }}/>
                        Máquina {m.id.slice(1)}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{m.completados}</td>
                    <td style={{ color: "#52525b" }}>{m.porDia} / día</td>
                    <td style={{ fontWeight: 600 }}>{m.planchas.toFixed(1)}</td>
                    <td style={{ fontWeight: 600 }}>{m.piezas}</td>
                    <td>
                      <div className="bar-wrap">
                        <span style={{ fontWeight: 700, minWidth: 16 }}>{m.cargaActual}</span>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${m.pctCarga}%`, background: m.color }}/>
                        </div>
                        <span className="bar-pct">{m.pctCarga}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tabla pedidos de hoy */}
          <div className="section-header">
            <div className="section-title">Pedidos ingresados hoy</div>
            <div className="section-badge">{pedidosHoy?.length ?? 0} pedidos</div>
          </div>

          {(pedidosHoy ?? []).length === 0 ? (
            <p style={{ color: "#a1a1aa", fontSize: 13, marginBottom: 28 }}>No se ingresaron pedidos hoy.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  {["#", "Cliente", "Material", "Planchas", "Piezas", "Mts. Canto", "Máquina", "Estado", "Prioridad"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(pedidosHoy ?? []).map((p: Record<string, unknown>) => {
                  const estado = p.estado as string;
                  const prioridad = p.prioridad as string;
                  const cliente = (p.cliente as Record<string, unknown>)?.nombre as string ?? "—";
                  const num = `#${String(p.id as string).slice(-4).toUpperCase()}`;
                  const estadoClass = estado === "En corte" ? "badge-corte" : estado === "En tapacantos" ? "badge-tapac" : estado === "Listo" ? "badge-listo" : estado === "Cancelado" ? "badge-cancel" : "badge-cola";
                  return (
                    <tr key={p.id as string}>
                      <td className="order-num">{num}</td>
                      <td className="client-name">{cliente}</td>
                      <td style={{ color: "#52525b" }}>{p.tipo_tablero as string} {(p.marca_melamina as string) || ""}</td>
                      <td style={{ fontWeight: 700 }}>{p.cant_planchas as string}</td>
                      <td style={{ fontWeight: 700 }}>{p.cant_piezas as string}</td>
                      <td style={{ color: "#52525b" }}>{p.metros_canto as string} m</td>
                      <td><span className="badge-m">{p.maquina_asignada as string ?? "—"}</span></td>
                      <td><span className={`badge ${estadoClass}`}>{estado}</span></td>
                      <td>
                        {prioridad === "urgente" && <span className="prior-urgente">⚡ Urgente</span>}
                        {prioridad === "vip"     && <span className="prior-vip">★ VIP</span>}
                        {prioridad === "normal"  && <span className="prior-normal">Normal</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} style={{ fontSize: 10, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.05em" }}>Totales del día</td>
                  <td>{totalPlanchas.toFixed(1)}</td>
                  <td>{totalPiezas}</td>
                  <td>{totalMetros.toFixed(1)} m</td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          )}

          {/* Cola activa */}
          {(todosActivos ?? []).length > 0 && (
            <>
              <div className="section-header">
                <div className="section-title">Cola activa de producción</div>
                <div className="section-badge">{(enCola ?? 0) + (enCorte ?? 0) + (enTapacantos ?? 0)} en proceso</div>
              </div>
              <table>
                <thead>
                  <tr>
                    {["#", "Cliente", "Material", "Planchas", "Piezas", "Máquina", "Estado", "Entrega est."].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(todosActivos ?? []).map((p: Record<string, unknown>) => {
                    const estado = p.estado as string;
                    const cliente = (p.cliente as Record<string, unknown>)?.nombre as string ?? "—";
                    const num = `#${String(p.id as string).slice(-4).toUpperCase()}`;
                    const estadoClass = estado === "En corte" ? "badge-corte" : estado === "En tapacantos" ? "badge-tapac" : "badge-cola";
                    const entrega = p.fecha_entrega_estimada
                      ? new Date(p.fecha_entrega_estimada as string).toLocaleString("es", { dateStyle: "short", timeStyle: "short" })
                      : "—";
                    return (
                      <tr key={p.id as string}>
                        <td className="order-num">{num}</td>
                        <td className="client-name">{cliente}</td>
                        <td style={{ color: "#52525b" }}>{p.tipo_tablero as string}</td>
                        <td style={{ fontWeight: 700 }}>{p.cant_planchas as string}</td>
                        <td style={{ fontWeight: 700 }}>{p.cant_piezas as string}</td>
                        <td><span className="badge-m">{p.maquina_asignada as string ?? "—"}</span></td>
                        <td><span className={`badge ${estadoClass}`}>{estado}</span></td>
                        <td style={{ color: "#71717a", fontSize: 11 }}>{entrega}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>

        <div className="footer">
          <span>© 2026 Casa del Carpintero · Production OS</span>
          <span>Generado el {fechaHoy} a las {horaGenera}</span>
        </div>
      </div>
    </>
  );
}
