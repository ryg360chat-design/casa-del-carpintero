import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrganization } from "@/lib/org";
import { getUserRole } from "@/lib/auth";
import { hasOrgFeature } from "@/lib/plans";
import PrintButton from "@/components/PrintButton";
import { limaTime } from "@/lib/time";

export const metadata = { title: "Control de Materiales — Kuadra" };

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
    font-size: 18px; font-weight: 900; color: white;
  }
  .logo-name { font-size: 17px; font-weight: 700; }
  .logo-sub { font-size: 11px; color: #10b981; margin-top: 1px; }
  .header-date { text-align: right; }
  .header-date .label { font-size: 11px; color: #71717a; }
  .header-date .value { font-size: 14px; font-weight: 600; text-transform: capitalize; margin-top: 2px; }
  .header-date .time { font-size: 11px; color: #71717a; margin-top: 2px; }
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
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
  .c-red { color: #f87171; }
  .c-green { color: #4ade80; }
  .body { padding: 32px 40px; }
  .section-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 10px; margin-top: 24px;
  }
  .section-header:first-child { margin-top: 0; }
  .section-title { font-size: 13px; font-weight: 700; color: #18181b; }
  .section-badge {
    font-size: 10px; font-weight: 600;
    background: #f4f4f5; color: #71717a;
    padding: 3px 10px; border-radius: 99px;
  }
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 4px; }
  thead tr { border-bottom: 2px solid #e4e4e7; background: #fafafa; }
  th {
    text-align: left; padding: 10px 12px;
    font-size: 9px; font-weight: 700; color: #a1a1aa;
    text-transform: uppercase; letter-spacing: 0.06em;
  }
  th.right { text-align: right; }
  th.center { text-align: center; }
  td { padding: 10px 12px; border-bottom: 1px solid #f4f4f5; vertical-align: middle; }
  td.right { text-align: right; }
  td.center { text-align: center; }
  tr:last-child td { border-bottom: none; }
  tfoot tr td { background: #f4f4f5; border-top: 2px solid #e4e4e7; font-weight: 700; font-size: 12px; }
  .badge {
    display: inline-flex; align-items: center;
    padding: 2px 8px; border-radius: 99px;
    font-size: 10px; font-weight: 700;
  }
  .badge-ok { background: #dcfce7; color: #166534; }
  .badge-alert { background: #fee2e2; color: #dc2626; }
  .badge-warn { background: #fef9c3; color: #854d0e; }
  .bar-row { display: flex; align-items: center; gap: 8px; }
  .bar-track { flex: 1; height: 5px; background: #f4f4f5; border-radius: 99px; overflow: hidden; min-width: 40px; }
  .bar-fill { height: 100%; border-radius: 99px; }
  .alert-box {
    background: #fef2f2; border: 1px solid #fecaca;
    border-radius: 8px; padding: 10px 14px;
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 8px; font-size: 12px;
  }
  .alert-dot { width: 8px; height: 8px; background: #ef4444; border-radius: 50%; flex-shrink: 0; }
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
  .print-title { color: white; font-size: 13px; font-weight: 600; }
  .print-sub { color: #71717a; font-size: 11px; margin-top: 1px; }
  @media print {
    .print-bar { display: none !important; }
    body { background: white; }
    .page { max-width: 100%; margin: 0; border-radius: 0; box-shadow: none; }
    @page { margin: 15mm; size: A4; }
  }
`;

function fmtMoney(n: number) {
  return "$" + n.toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function MaterialesPDFPage() {
  const [role, org] = await Promise.all([getUserRole(), getOrganization()]);
  if (!org) redirect("/dashboard");

  const canAccess = hasOrgFeature(org.plan, org.features_enabled ?? [], "control_materiales", role === "developer");
  if (!canAccess) redirect("/dashboard");

  const supabase = await createClient();
  const orgNombre = org.nombre ?? "Taller";
  const fechaHoy = new Date().toLocaleDateString("es", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const horaGenera = limaTime(new Date());

  const [{ data: materiales }, { data: movimientos }] = await Promise.all([
    supabase.from("materiales").select("*").eq("organization_id", org.id).eq("activo", true).order("tipo").order("marca"),
    supabase.from("movimientos_material")
      .select("*, materiales(tipo, marca, espesor)")
      .eq("organization_id", org.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const mats = materiales ?? [];
  const movs = movimientos ?? [];

  const valorTotal = mats.reduce((s, m) => s + m.stock_actual * m.precio_unitario, 0);
  const bajoMinimo = mats.filter(m => m.stock_actual <= m.stock_minimo);
  const hace30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  type MovRow = { material_id: string; tipo: string; cantidad: number; created_at: string };
  const consumoPorMat: Record<string, number> = {};
  (movs as MovRow[]).forEach(mov => {
    if (mov.tipo === "salida" && new Date(mov.created_at) > hace30) {
      consumoPorMat[mov.material_id] = (consumoPorMat[mov.material_id] || 0) + mov.cantidad;
    }
  });
  const consumoTotal30d = Object.values(consumoPorMat).reduce((s, v) => s + v, 0);

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Barra de impresión */}
      <div className="print-bar">
        <div>
          <div className="print-title">Control de Materiales — {orgNombre}</div>
          <div className="print-sub" style={{ textTransform: "capitalize" }}>{fechaHoy}</div>
        </div>
        <PrintButton />
      </div>

      <div className="page">
        {/* Header oscuro */}
        <div className="header">
          <div className="header-top">
            <div className="logo">
              <div className="logo-icon">K</div>
              <div>
                <div className="logo-name">{orgNombre}</div>
                <div className="logo-sub">Kuadra · Control de Materiales</div>
              </div>
            </div>
            <div className="header-date">
              <div className="label">Fecha del reporte</div>
              <div className="value">{fechaHoy}</div>
              <div className="time">Generado: {horaGenera}</div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-value c-blue">{fmtMoney(valorTotal)}</div>
              <div className="stat-label">Valor en bodega</div>
            </div>
            <div className="stat-box">
              <div className="stat-value" style={{ color: bajoMinimo.length > 0 ? "#f87171" : "#4ade80" }}>
                {bajoMinimo.length > 0 ? `${bajoMinimo.length} alerta${bajoMinimo.length > 1 ? "s" : ""}` : "Sin alertas"}
              </div>
              <div className="stat-label">Stock bajo mínimo</div>
            </div>
            <div className="stat-box">
              <div className="stat-value c-green">{consumoTotal30d > 0 ? `${consumoTotal30d} u` : "—"}</div>
              <div className="stat-label">Consumo últimos 30 días</div>
            </div>
          </div>
        </div>

        <div className="body">
          {/* Alertas */}
          {bajoMinimo.length > 0 && (
            <>
              <div className="section-header">
                <div className="section-title">⚠ Materiales a reponer</div>
                <div className="section-badge">{bajoMinimo.length} material{bajoMinimo.length > 1 ? "es" : ""}</div>
              </div>
              {bajoMinimo.map((m) => (
                <div key={m.id} className="alert-box">
                  <span className="alert-dot" />
                  <span>
                    <strong>{m.tipo} {m.marca} {m.espesor}</strong> — stock actual: <strong>{m.stock_actual}</strong>, mínimo configurado: {m.stock_minimo}. Diferencia: {m.stock_minimo - m.stock_actual} planchas.
                  </span>
                </div>
              ))}
            </>
          )}

          {/* Inventario */}
          <div className="section-header">
            <div className="section-title">Inventario actual</div>
            <div className="section-badge">{mats.length} materiales</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Material</th>
                <th className="center">Stock</th>
                <th className="center">Mínimo</th>
                <th className="center">Estado</th>
                <th className="right">Precio/u</th>
                <th className="right">Valor total</th>
              </tr>
            </thead>
            <tbody>
              {mats.map((m) => {
                const bajo = m.stock_actual <= m.stock_minimo;
                const pct = Math.min((m.stock_actual / Math.max(m.stock_minimo * 2, 1)) * 100, 100);
                return (
                  <tr key={m.id} style={bajo ? { background: "#fff8f8" } : {}}>
                    <td>
                      <strong>{m.tipo}</strong> {m.marca}
                      {m.espesor && <span style={{ color: "#71717a", fontSize: 10, marginLeft: 4 }}>{m.espesor}</span>}
                    </td>
                    <td className="center">
                      <div className="bar-row">
                        <strong style={{ color: bajo ? "#ef4444" : "#1957A6", minWidth: 24 }}>{m.stock_actual}</strong>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${pct}%`, background: bajo ? "#ef4444" : "#10b981" }} />
                        </div>
                      </div>
                    </td>
                    <td className="center" style={{ color: "#71717a" }}>{m.stock_minimo}</td>
                    <td className="center">
                      <span className={`badge ${bajo ? "badge-alert" : "badge-ok"}`}>
                        {bajo ? "⚠ Reponer" : "✓ OK"}
                      </span>
                    </td>
                    <td className="right" style={{ color: "#52525b" }}>{fmtMoney(m.precio_unitario)}</td>
                    <td className="right"><strong>{fmtMoney(m.stock_actual * m.precio_unitario)}</strong></td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5} style={{ fontSize: 10, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total en bodega</td>
                <td className="right">{fmtMoney(valorTotal)}</td>
              </tr>
            </tfoot>
          </table>

          {/* Análisis de consumo */}
          <div className="section-header">
            <div className="section-title">Análisis de consumo — últimos 30 días</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Material</th>
                <th className="center">Stock actual</th>
                <th className="center">Consumo 30d</th>
                <th className="center">Prom. / día</th>
                <th className="center">Días restantes</th>
                <th className="right">Valor stock</th>
              </tr>
            </thead>
            <tbody>
              {mats.map((m) => {
                const consumo30 = consumoPorMat[m.id] || 0;
                const consumoDiario = consumo30 / 30;
                const diasRestantes = consumoDiario > 0 ? Math.floor(m.stock_actual / consumoDiario) : null;
                const bajo = m.stock_actual <= m.stock_minimo;
                const diasColor = diasRestantes === null ? "#a1a1aa"
                  : diasRestantes < 7 ? "#ef4444"
                  : diasRestantes < 14 ? "#f59e0b"
                  : "#16a34a";
                return (
                  <tr key={m.id} style={bajo ? { background: "#fff8f8" } : {}}>
                    <td>
                      <strong>{m.tipo}</strong> {m.marca}
                      {m.espesor && <span style={{ color: "#71717a", fontSize: 10, marginLeft: 4 }}>{m.espesor}</span>}
                      {bajo && <span style={{ color: "#ef4444", fontSize: 10, fontWeight: 700, marginLeft: 6 }}>⚠ REPONER</span>}
                    </td>
                    <td className="center" style={{ fontWeight: 700, color: bajo ? "#ef4444" : "#1957A6" }}>{m.stock_actual}</td>
                    <td className="center" style={{ color: "#52525b" }}>{consumo30 > 0 ? `${consumo30} u` : "—"}</td>
                    <td className="center" style={{ color: "#71717a" }}>{consumoDiario > 0 ? `${consumoDiario.toFixed(1)}/día` : "—"}</td>
                    <td className="center" style={{ fontWeight: 700, color: diasColor }}>
                      {diasRestantes !== null ? `${diasRestantes} días` : "—"}
                    </td>
                    <td className="right" style={{ fontWeight: 600 }}>{fmtMoney(m.stock_actual * m.precio_unitario)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Kardex reciente */}
          {movs.length > 0 && (
            <>
              <div className="section-header">
                <div className="section-title">Últimos movimientos (Kardex)</div>
                <div className="section-badge">{movs.length} registros</div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Material</th>
                    <th className="center">Tipo</th>
                    <th className="center">Cantidad</th>
                    <th className="right">Stock resultante</th>
                    <th>Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {(movs as Array<{
                    id: string; tipo: string; cantidad: number; stock_resultante: number;
                    notas: string | null; created_at: string; pedido_id: string | null;
                    materiales: { tipo: string; marca: string; espesor: string } | null;
                  }>).map((mov) => {
                    const esEntrada = mov.tipo === "entrada";
                    const esSalida = mov.tipo === "salida";
                    return (
                      <tr key={mov.id}>
                        <td style={{ color: "#71717a", fontSize: 11 }}>
                          {new Date(mov.created_at).toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "2-digit" })}
                        </td>
                        <td>
                          <strong>{mov.materiales?.tipo}</strong> {mov.materiales?.marca}
                          {mov.materiales?.espesor && <span style={{ color: "#71717a", fontSize: 10 }}> {mov.materiales.espesor}</span>}
                        </td>
                        <td className="center">
                          <span className={`badge ${esEntrada ? "badge-ok" : esSalida ? "badge-alert" : "badge-warn"}`}>
                            {esEntrada ? "↑ Entrada" : esSalida ? "↓ Salida" : "⟳ Ajuste"}
                          </span>
                        </td>
                        <td className="center" style={{ fontWeight: 700, color: esEntrada ? "#16a34a" : esSalida ? "#ef4444" : "#ca8a04" }}>
                          {esEntrada ? "+" : "−"}{mov.cantidad}
                        </td>
                        <td className="right" style={{ fontWeight: 600 }}>{mov.stock_resultante}</td>
                        <td style={{ color: "#71717a", fontSize: 11 }}>
                          {mov.pedido_id ? "Pedido automático" : mov.notas ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>

        <div className="footer">
          <span>© 2026 {orgNombre} · Kuadra</span>
          <span>Generado el {fechaHoy} a las {horaGenera}</span>
        </div>
      </div>
    </>
  );
}
