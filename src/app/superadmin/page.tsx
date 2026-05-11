"use client";

import { useEffect, useState, useCallback } from "react";

const SA_KEY = "sa_key";

type KPIs = {
  activos: number; totalOrgs: number; mrr: number; arr: number;
  totalUsuarios: number; pedidosMes: number; totalLeads: number;
};
type Org = {
  id: string; nombre: string; slug: string; plan: string; activo: boolean;
  max_usuarios: number; max_maquinas: number; trial_ends_at: string | null;
  subscribed_at: string | null; created_at: string;
  _usuarios: number; _pedidos_mes: number;
};
type Usuario = { id: string; nombre: string | null; rol: string; organization_id: string; orgNombre: string };
type Activity = { orgId: string; orgNombre: string; estado: string; fecha: string };
type Alerta = { orgId: string; nombre: string; tipo: string };
type Lead = { id: string; nombre: string; telefono: string; motivo: string; horario: string; origen: string; created_at: string };

const PLAN_LABEL: Record<string, string> = { trial: "Trial", basico: "Básico", profesional: "Profesional", empresarial: "Empresarial" };
const PLAN_COLOR: Record<string, string> = {
  trial: "bg-gray-200 text-gray-500",
  basico: "bg-blue-100 text-blue-700",
  profesional: "bg-violet-100 text-violet-700",
  empresarial: "bg-orange-100 text-orange-700",
};
const PLAN_PRICE: Record<string, number> = { trial: 0, basico: 300, profesional: 500, empresarial: 900 };
const PLAN_BAR_COLOR: Record<string, string> = { trial: "#9a9490", basico: "#3b82f6", profesional: "#8b5cf6", empresarial: "#f59e0b" };

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtRelative(iso: string | null) {
  if (!iso) return "—";
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d === 0) return "Hoy";
  if (d === 1) return "Ayer";
  if (d < 7) return `Hace ${d}d`;
  return fmtDate(iso);
}

const C = {
  bg: "#f3eee7",
  white: "#ffffff",
  border: "rgba(26,23,20,0.10)",
  text: "#1a1714",
  muted: "#9a9490",
  sub: "#5a5450",
  red: "#c8472a",
};

// ─── Shared input style ───────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  background: C.white, border: `1px solid ${C.border}`, color: C.text,
};

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 12 }}>
      {children}
    </p>
  );
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: "18px 20px", ...style }}>
      {children}
    </div>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, accent }: { label: string; value: string | number; sub: string; accent?: string }) {
  return (
    <Card>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 800, color: accent ?? C.text, lineHeight: 1.1 }}>{value}</p>
      <p style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{sub}</p>
    </Card>
  );
}

// ─── Lead card ────────────────────────────────────────────────────────────────
function LeadCard({ lead, onDelete }: { lead: Lead; onDelete: (id: string) => void }) {
  return (
    <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.nombre}</p>
          <p style={{ fontSize: 10, color: C.muted }}>{fmtRelative(lead.created_at)}</p>
        </div>
        <span style={{ flexShrink: 0, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 999, background: "rgba(200,71,42,0.08)", color: C.red }}>
          bot
        </span>
      </div>

      <a
        href={`https://wa.me/${lead.telefono.replace(/\D/g, "")}?text=Hola%20${encodeURIComponent(lead.nombre)},%20te%20contacto%20desde%20Kuadra.`}
        target="_blank" rel="noopener noreferrer"
        style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, background: "rgba(37,211,102,0.08)", color: "#16a34a", textDecoration: "none", fontSize: 12, fontWeight: 600 }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        {lead.telefono}
        <span style={{ marginLeft: "auto", opacity: 0.5, fontSize: 11 }}>↗</span>
      </a>

      <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.5 }}>
        <p><strong style={{ color: C.text }}>Motivo: </strong>{lead.motivo}</p>
        <p><strong style={{ color: C.text }}>Demo: </strong>{lead.horario}</p>
      </div>

      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => onDelete(lead.id)} style={{ fontSize: 11, color: C.muted, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
          onMouseEnter={e => (e.currentTarget.style.color = C.red)}
          onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>
          Eliminar
        </button>
      </div>
    </div>
  );
}

// ─── Login screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (key: string) => void }) {
  const [key, setKey] = useState("");
  const [totp, setTotp] = useState("");
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [setupMode, setSetupMode] = useState(false);
  const [qrData, setQrData] = useState<{ qr: string; secret: string } | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  useEffect(() => {
    fetch("/api/superadmin/status").then(r => r.json()).then(d => setTotpEnabled(d.totpEnabled));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    const res = await fetch("/api/superadmin/verify", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, totp: totp || undefined }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Error desconocido"); return; }
    sessionStorage.setItem(SA_KEY, key);
    onLogin(key);
  }

  async function handleShowQr() {
    if (!key) { setError("Ingresa la clave maestra primero"); return; }
    setError(""); setQrLoading(true);
    const res = await fetch("/api/superadmin/setup-qr", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    const data = await res.json();
    setQrLoading(false);
    if (!res.ok) { setError(data.error ?? "Clave incorrecta"); return; }
    setQrData(data); setSetupMode(true);
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');`}</style>
      <div style={{ minHeight: "100vh", display: "flex", background: C.bg, fontFamily: "Inter, sans-serif" }}>
        <div style={{ width: 400, flexShrink: 0, background: C.white, borderRight: `1px solid ${C.border}`, padding: "48px 40px", display: "none", flexDirection: "column", justifyContent: "space-between" }}
          className="lg-panel">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 48 }}>
              <span style={{ fontFamily: "Instrument Serif, serif", fontSize: 24, color: C.text }}>Kuadra</span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: C.bg, color: C.muted, border: `1px solid ${C.border}`, letterSpacing: "0.08em" }}>INTERNO</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.red }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.red }}>Zona restringida</span>
            </div>
            <h1 style={{ fontFamily: "Instrument Serif, serif", fontSize: 38, lineHeight: 1.2, color: C.text, marginBottom: 16 }}>
              Acceso<br /><em style={{ color: C.red }}>autorizado</em><br />únicamente.
            </h1>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: C.sub }}>Todas las sesiones quedan registradas. Uso exclusivo del equipo de Kuadra.</p>
          </div>
          <p style={{ fontSize: 11, color: C.muted, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>© 2026 Kuadra</p>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
          <div style={{ width: "100%", maxWidth: 360 }}>
            <span style={{ fontFamily: "Instrument Serif, serif", fontSize: 22, color: C.text, display: "block", marginBottom: 32 }}>Kuadra</span>
            {!setupMode ? (
              <>
                <h2 style={{ fontFamily: "Instrument Serif, serif", fontSize: 30, color: C.text, marginBottom: 4 }}>Identificación</h2>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 28 }}>Ingresa tus credenciales de administrador</p>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 6 }}>Clave maestra</label>
                    <input type="password" value={key} onChange={e => setKey(e.target.value)} placeholder="••••••••••••••••••••" required autoFocus
                      style={{ ...inputStyle, width: "100%", padding: "12px 16px", borderRadius: 12, fontSize: 13, outline: "none", boxSizing: "border-box" }}
                      onFocus={e => e.target.style.borderColor = C.red} onBlur={e => e.target.style.borderColor = C.border} />
                  </div>
                  {totpEnabled && (
                    <div>
                      <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 6 }}>Código de verificación</label>
                      <input type="text" inputMode="numeric" value={totp} onChange={e => setTotp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000 000" maxLength={6}
                        style={{ ...inputStyle, width: "100%", padding: "12px 16px", borderRadius: 12, fontSize: 13, outline: "none", textAlign: "center", letterSpacing: "0.4em", boxSizing: "border-box" }}
                        onFocus={e => e.target.style.borderColor = C.red} onBlur={e => e.target.style.borderColor = C.border} />
                    </div>
                  )}
                  {error && <div style={{ fontSize: 13, padding: "12px 16px", borderRadius: 12, background: "rgba(200,71,42,0.07)", color: C.red, border: "1px solid rgba(200,71,42,0.2)" }}>{error}</div>}
                  <button type="submit" disabled={loading}
                    style={{ padding: "12px 0", borderRadius: 12, background: loading ? "#e07b62" : C.red, color: "#fff", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>
                    {loading ? "Verificando…" : "Acceder →"}
                  </button>
                </form>
                <button onClick={handleShowQr} disabled={qrLoading}
                  style={{ marginTop: 16, fontSize: 12, color: C.muted, background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "center" }}>
                  {qrLoading ? "Generando QR…" : "Configurar verificación en dos pasos →"}
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { setSetupMode(false); setQrData(null); setError(""); }}
                  style={{ fontSize: 12, color: C.muted, background: "none", border: "none", cursor: "pointer", marginBottom: 24 }}>← Volver</button>
                <h2 style={{ fontFamily: "Instrument Serif, serif", fontSize: 28, color: C.text, marginBottom: 8 }}>Configurar verificación</h2>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Escanea el QR con la cámara del iPhone</p>
                {qrData && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
                    <div style={{ background: C.white, padding: 12, borderRadius: 16, border: `1px solid ${C.border}` }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrData.qr} alt="QR TOTP" width={200} height={200} />
                    </div>
                    <div style={{ ...inputStyle, borderRadius: 12, padding: 16, width: "100%", textAlign: "center", boxSizing: "border-box" }}>
                      <p style={{ fontSize: 10, color: C.muted, marginBottom: 6, letterSpacing: "0.1em", textTransform: "uppercase" }}>Clave manual</p>
                      <p style={{ fontSize: 12, fontFamily: "monospace", wordBreak: "break-all", color: C.text }}>{qrData.secret}</p>
                    </div>
                    <button onClick={() => { setSetupMode(false); setQrData(null); }}
                      style={{ width: "100%", padding: 12, borderRadius: 12, background: C.red, color: "#fff", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>
                      Ya escaneé el QR → Ir al login
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
type MainTab = "overview" | "clientes" | "usuarios" | "leads" | "monitoreo";

function Dashboard({ saKey }: { saKey: string }) {
  const [data, setData] = useState<{ kpis: KPIs; orgs: Org[]; usuarios: Usuario[]; recentActivity: Activity[]; alertas: Alerta[] } | null>(null);
  const [tab, setTab] = useState<MainTab>("overview");
  const [monitor, setMonitor] = useState<{ kpis: { exitosos: number; fallidos: number; bloqueados: number }; events: { ts: string; ip: string; tipo: string; detalle: string }[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [qr, setQr] = useState<{ url: string; secret: string } | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [emailTesting, setEmailTesting] = useState(false);
  const [emailResult, setEmailResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const headers = { "x-superadmin-key": saKey };

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/superadmin/stats", { headers });
    if (res.ok) setData(await res.json());
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saKey]);

  const loadLeads = useCallback(async () => {
    setLeadsLoading(true);
    try {
      const res = await fetch("/api/superadmin/leads", { headers });
      if (res.ok) setLeads((await res.json()).leads ?? []);
    } finally { setLeadsLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saKey]);

  useEffect(() => { load(); loadLeads(); }, [load, loadLeads]);

  useEffect(() => {
    if (tab !== "monitoreo") return;
    fetch("/api/superadmin/monitor", { headers }).then(r => r.json()).then(setMonitor);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function deleteLead(id: string) {
    await fetch("/api/superadmin/leads", {
      method: "DELETE", headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setLeads(l => l.filter(x => x.id !== id));
  }

  async function tenantAction(id: string, payload: Record<string, unknown>) {
    setActionLoading(id);
    await fetch("/api/superadmin/tenant", {
      method: "POST", headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...payload }),
    });
    await load(); setActionLoading(null);
  }

  async function loadQr() {
    if (qr) { setQr(null); return; }
    setQrLoading(true);
    const res = await fetch("/api/superadmin/setup", { headers });
    if (res.ok) { const d = await res.json(); setQr({ url: d.qr, secret: d.secret }); }
    setQrLoading(false);
  }

  async function testEmail() {
    setEmailTesting(true); setEmailResult(null);
    try {
      const res = await fetch("/api/superadmin/test-email", { method: "POST", headers });
      const d = await res.json();
      setEmailResult(res.ok
        ? { ok: true, msg: `✓ Enviado desde ${d.from} → ${d.to}` }
        : { ok: false, msg: `✗ Error: ${d.error} (from: ${d.from}, to: ${d.to})` }
      );
    } catch (e) {
      setEmailResult({ ok: false, msg: `✗ Sin conexión: ${e}` });
    }
    setEmailTesting(false);
  }

  if (loading || !data) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, fontFamily: "Inter, sans-serif" }}>
      <p style={{ color: C.muted, fontSize: 13 }}>Cargando…</p>
    </div>;
  }

  const { kpis, orgs, usuarios, recentActivity, alertas } = data;

  const TABS: { id: MainTab; label: string }[] = [
    { id: "overview", label: "Resumen" },
    { id: "clientes", label: `Clientes (${orgs.length})` },
    { id: "usuarios", label: `Usuarios (${usuarios.length})` },
    { id: "leads", label: `Leads (${leads.length})` },
    { id: "monitoreo", label: "Monitoreo" },
  ];

  const tableHead: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
    color: C.muted, padding: "10px 16px", textAlign: "left",
    borderBottom: `1px solid ${C.border}`, background: "#f9f7f4",
  };
  const tableCell: React.CSSProperties = {
    padding: "12px 16px", fontSize: 13, color: C.sub,
    borderBottom: `1px solid rgba(26,23,20,0.06)`,
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, sans-serif", color: C.text }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');`}</style>

      {/* Header */}
      <header style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 24px", position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", height: 52 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.red, animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.red }}>Super Admin</span>
          <span style={{ color: C.border, margin: "0 6px" }}>·</span>
          <span style={{ fontSize: 13, color: C.muted }}>Kuadra</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 16, alignItems: "center" }}>
          <button onClick={() => { load(); loadLeads(); }} style={{ fontSize: 12, color: C.muted, background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
            onMouseEnter={e => (e.currentTarget.style.color = C.text)} onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>
            ↻ Actualizar
          </button>
          <button onClick={() => { sessionStorage.removeItem(SA_KEY); window.location.reload(); }}
            style={{ fontSize: 12, color: C.muted, background: "none", border: "none", cursor: "pointer" }}
            onMouseEnter={e => (e.currentTarget.style.color = C.red)} onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>
            Cerrar sesión →
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 48px" }}>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
          <KpiCard label="Clientes activos" value={kpis.activos} sub={`de ${kpis.totalOrgs} orgs · ${kpis.totalUsuarios} usuarios`} />
          <KpiCard label="MRR" value={`$${kpis.mrr.toLocaleString()}`} sub={`ARR ${`$${kpis.arr.toLocaleString()}`}`} accent="#16a34a" />
          <KpiCard label="Pedidos este mes" value={kpis.pedidosMes} sub="en todas las orgs" />
          <KpiCard label="Leads bot" value={kpis.totalLeads} sub="prospectos capturados" accent={C.red} />
        </div>

        {/* Nav tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4, width: "fit-content" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                fontSize: 12, fontWeight: 600, padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                background: tab === t.id ? C.red : "transparent",
                color: tab === t.id ? "#fff" : C.muted,
                transition: "all 0.15s",
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB: Overview ── */}
        {tab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>

            {/* Prospectos recientes */}
            <div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Prospectos recientes</h2>
                  <p style={{ fontSize: 11, color: C.muted }}>{leads.length === 0 ? "Sin leads todavía" : `${leads.length} capturado${leads.length !== 1 ? "s" : ""} por el bot`}</p>
                </div>
                {leads.length > 0 && (
                  <button onClick={() => setTab("leads")} style={{ fontSize: 12, fontWeight: 600, color: C.red, background: "none", border: "none", cursor: "pointer" }}>
                    Ver todos →
                  </button>
                )}
              </div>

              {leadsLoading ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[1, 2, 3, 4].map(i => <div key={i} style={{ height: 140, background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, opacity: 0.5 }} />)}
                </div>
              ) : leads.length === 0 ? (
                <Card style={{ padding: "48px 24px", textAlign: "center" }}>
                  <p style={{ fontSize: 28, marginBottom: 8 }}>🎯</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Sin prospectos aún</p>
                  <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Los leads del chatbot aparecerán aquí</p>
                </Card>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: leads.length === 1 ? "minmax(0,460px)" : "1fr 1fr", gap: 12 }}>
                  {leads.slice(0, 6).map(lead => <LeadCard key={lead.id} lead={lead} onDelete={deleteLead} />)}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Alertas */}
              {alertas.length > 0 && (
                <Card style={{ padding: "16px 18px" }}>
                  <SectionLabel>⚠ Alertas · {alertas.length}</SectionLabel>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {alertas.map(a => (
                      <div key={a.orgId} style={{ display: "flex", gap: 10, padding: "10px 12px", borderRadius: 8, background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.15)" }}>
                        <span style={{ color: "#d97706", flexShrink: 0 }}>⚠</span>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{a.nombre}</p>
                          <p style={{ fontSize: 11, color: C.muted }}>{a.tipo === "usuarios_al_limite" ? "Al límite de usuarios (≥95%)" : a.tipo}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Actividad */}
              <Card style={{ padding: "16px 18px" }}>
                <SectionLabel>Actividad reciente</SectionLabel>
                {recentActivity.length === 0 ? (
                  <p style={{ fontSize: 12, color: C.muted }}>Sin actividad registrada</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {recentActivity.slice(0, 7).map((a, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", flexShrink: 0, marginTop: 4 }} />
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{a.orgNombre}</p>
                          <p style={{ fontSize: 11, color: C.muted }}>{a.estado} · {fmtRelative(a.fecha)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Plan breakdown */}
              <Card style={{ padding: "16px 18px" }}>
                <SectionLabel>Distribución por plan</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {Object.entries(PLAN_LABEL).map(([plan, label]) => {
                    const count = orgs.filter(o => o.plan === plan).length;
                    const ingresos = orgs.filter(o => o.plan === plan && o.activo).length * (PLAN_PRICE[plan] ?? 0);
                    const pct = kpis.totalOrgs > 0 ? (count / kpis.totalOrgs) * 100 : 0;
                    return (
                      <div key={plan}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: C.sub }}>{label}</span>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{count}</span>
                            {ingresos > 0 && <span style={{ fontSize: 10, color: "#16a34a" }}>${ingresos}/mes</span>}
                          </div>
                        </div>
                        <div style={{ height: 4, borderRadius: 4, background: "rgba(26,23,20,0.08)", overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: 4, width: `${pct}%`, background: PLAN_BAR_COLOR[plan] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Configuración / Email test */}
              <Card style={{ padding: "16px 18px" }}>
                <SectionLabel>Configuración</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button onClick={loadQr} disabled={qrLoading}
                    style={{ fontSize: 12, fontWeight: 600, padding: "9px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.sub, cursor: "pointer", textAlign: "left" }}>
                    {qrLoading ? "Generando…" : qr ? "🔒 Ocultar QR TOTP" : "📱 Configurar TOTP"}
                  </button>
                  <button onClick={testEmail} disabled={emailTesting}
                    style={{ fontSize: 12, fontWeight: 600, padding: "9px 14px", borderRadius: 8, border: `1px solid rgba(200,71,42,0.2)`, background: "rgba(200,71,42,0.05)", color: C.red, cursor: "pointer", textAlign: "left" }}>
                    {emailTesting ? "Enviando…" : "📧 Probar notificación email"}
                  </button>
                  {emailResult && (
                    <div style={{ fontSize: 11, padding: "8px 10px", borderRadius: 8, background: emailResult.ok ? "rgba(22,163,74,0.07)" : "rgba(200,71,42,0.07)", color: emailResult.ok ? "#16a34a" : C.red, border: `1px solid ${emailResult.ok ? "rgba(22,163,74,0.2)" : "rgba(200,71,42,0.2)"}`, wordBreak: "break-all" }}>
                      {emailResult.msg}
                    </div>
                  )}
                  {qr && (
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginTop: 4 }}>
                      <div style={{ background: C.white, padding: 8, borderRadius: 8, border: `1px solid ${C.border}`, flexShrink: 0 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={qr.url} alt="QR" width={130} height={130} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>Clave manual:</p>
                        <p style={{ fontSize: 10, fontFamily: "monospace", wordBreak: "break-all", color: C.text }}>{qr.secret}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ── TAB: Clientes ── */}
        {tab === "clientes" && (
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Taller", "Plan", "Usuarios", "Pedidos/mes", "Estado", "Trial / Suscrito", "Acciones"].map(h => (
                      <th key={h} style={tableHead}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orgs.map(org => {
                    const isLoad = actionLoading === org.id;
                    const trialExp = org.plan === "trial" && org.trial_ends_at && new Date(org.trial_ends_at) < new Date();
                    const daysLeft = org.trial_ends_at ? Math.max(0, Math.ceil((new Date(org.trial_ends_at).getTime() - Date.now()) / 86400000)) : null;
                    const usoPct = org.max_usuarios > 0 ? org._usuarios / org.max_usuarios : 0;
                    return (
                      <tr key={org.id} style={{ opacity: org.activo ? 1 : 0.4 }}>
                        <td style={tableCell}>
                          <p style={{ fontWeight: 700, color: C.text, fontSize: 13 }}>{org.nombre}</p>
                          <p style={{ fontSize: 10, color: C.muted, fontFamily: "monospace" }}>{org.slug}</p>
                        </td>
                        <td style={tableCell}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <select disabled={isLoad} value={org.plan} onChange={e => tenantAction(org.id, { plan: e.target.value })}
                              style={{ fontSize: 11, fontWeight: 700, border: "none", background: "transparent", cursor: "pointer", outline: "none", color: C.text }}>
                              {Object.entries(PLAN_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PLAN_COLOR[org.plan]}`} style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>
                              {PLAN_LABEL[org.plan]}
                            </span>
                          </div>
                        </td>
                        <td style={tableCell}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: usoPct >= 0.95 ? "#ef4444" : usoPct >= 0.75 ? "#f59e0b" : C.text }}>
                              {org._usuarios}/{org.max_usuarios}
                            </span>
                            <div style={{ width: 52, height: 5, borderRadius: 3, background: "rgba(26,23,20,0.08)", overflow: "hidden" }}>
                              <div style={{ height: "100%", borderRadius: 3, width: `${Math.min(100, usoPct * 100)}%`, background: usoPct >= 0.95 ? "#ef4444" : usoPct >= 0.75 ? "#f59e0b" : "#22c55e" }} />
                            </div>
                          </div>
                        </td>
                        <td style={tableCell}>{org._pedidos_mes}</td>
                        <td style={tableCell}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: org.activo ? "#16a34a" : "#ef4444" }}>
                            {org.activo ? "● Activo" : "● Suspendido"}
                          </span>
                        </td>
                        <td style={tableCell}>
                          {org.plan === "trial" && org.trial_ends_at ? (
                            <span style={{ fontSize: 12, color: trialExp ? "#ef4444" : "#f59e0b" }}>
                              {trialExp ? "⚠ Vencido" : `${daysLeft}d restantes`}
                            </span>
                          ) : org.subscribed_at ? (
                            <span style={{ fontSize: 12, color: "#16a34a" }}>desde {fmtDate(org.subscribed_at)}</span>
                          ) : <span style={{ color: C.muted }}>—</span>}
                        </td>
                        <td style={tableCell}>
                          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                            {org.plan === "trial" && (
                              <button disabled={isLoad} onClick={() => tenantAction(org.id, { extend_trial_days: 30 })}
                                style={{ fontSize: 10, fontWeight: 700, padding: "4px 8px", borderRadius: 6, background: "rgba(245,158,11,0.1)", color: "#d97706", border: "none", cursor: "pointer" }}>
                                +30d
                              </button>
                            )}
                            <button disabled={isLoad} onClick={() => tenantAction(org.id, { activo: !org.activo })}
                              style={{ fontSize: 10, fontWeight: 700, padding: "4px 8px", borderRadius: 6, border: "none", cursor: "pointer", background: org.activo ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)", color: org.activo ? "#ef4444" : "#16a34a" }}>
                              {org.activo ? "Suspender" : "Activar"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB: Usuarios ── */}
        {tab === "usuarios" && (
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>{["Nombre", "Rol", "Organización"].map(h => <th key={h} style={tableHead}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id}>
                    <td style={tableCell}><span style={{ fontWeight: 600, color: C.text }}>{u.nombre ?? <em style={{ color: C.muted }}>Sin nombre</em>}</span></td>
                    <td style={tableCell}>{u.rol}</td>
                    <td style={tableCell}>{u.orgNombre}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── TAB: Leads ── */}
        {tab === "leads" && (
          <div>
            {leadsLoading ? (
              <Card style={{ textAlign: "center", padding: 40 }}><p style={{ color: C.muted, fontSize: 13 }}>Cargando…</p></Card>
            ) : leads.length === 0 ? (
              <Card style={{ textAlign: "center", padding: 48 }}>
                <p style={{ fontSize: 28, marginBottom: 8 }}>🎯</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Sin leads capturados</p>
                <p style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>Los prospectos del chatbot aparecerán aquí</p>
              </Card>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14, marginBottom: 24 }}>
                  {leads.map(lead => <LeadCard key={lead.id} lead={lead} onDelete={deleteLead} />)}
                </div>
                <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>{["Nombre", "Teléfono", "Motivo", "Demo agendada", "Fecha", ""].map(h => <th key={h} style={tableHead}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {leads.map(l => (
                          <tr key={l.id}>
                            <td style={{ ...tableCell, fontWeight: 600, color: C.text }}>{l.nombre}</td>
                            <td style={tableCell}>
                              <a href={`https://wa.me/${l.telefono.replace(/\D/g, "")}?text=Hola%20${encodeURIComponent(l.nombre)},%20te%20contacto%20desde%20Kuadra.`}
                                target="_blank" rel="noopener noreferrer"
                                style={{ color: "#16a34a", fontFamily: "monospace", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                                {l.telefono} ↗
                              </a>
                            </td>
                            <td style={{ ...tableCell, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.motivo}</td>
                            <td style={tableCell}>{l.horario}</td>
                            <td style={{ ...tableCell, color: C.muted }}>{fmtRelative(l.created_at)}</td>
                            <td style={tableCell}>
                              <button onClick={() => deleteLead(l.id)}
                                style={{ fontSize: 10, fontWeight: 700, padding: "4px 8px", borderRadius: 6, background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", cursor: "pointer" }}>
                                Borrar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── TAB: Monitoreo ── */}
        {tab === "monitoreo" && monitor && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              {[
                { label: "Exitosos 24h", v: monitor.kpis.exitosos, color: "#16a34a" },
                { label: "Fallidos 24h", v: monitor.kpis.fallidos, color: "#ef4444" },
                { label: "Bloqueados 24h", v: monitor.kpis.bloqueados, color: "#d97706" },
              ].map(({ label, v, color }) => (
                <KpiCard key={label} label={label} value={v} sub="" accent={color} />
              ))}
            </div>
            <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
                <SectionLabel>Eventos recientes</SectionLabel>
              </div>
              {monitor.events.length === 0 ? (
                <p style={{ padding: "24px 16px", fontSize: 13, color: C.muted }}>Sin eventos en las últimas 24h</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>{["Timestamp", "IP", "Tipo", "Detalle"].map(h => <th key={h} style={tableHead}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {monitor.events.map((e, i) => (
                      <tr key={i}>
                        <td style={{ ...tableCell, fontFamily: "monospace", fontSize: 11 }}>{new Date(e.ts).toLocaleTimeString("es-EC")}</td>
                        <td style={{ ...tableCell, fontFamily: "monospace", fontSize: 11 }}>{e.ip}</td>
                        <td style={tableCell}>
                          <span style={{ fontWeight: 700, color: e.tipo === "success" ? "#16a34a" : e.tipo === "blocked" ? "#d97706" : "#ef4444" }}>{e.tipo}</span>
                        </td>
                        <td style={{ ...tableCell, fontSize: 11 }}>{e.detalle}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function SuperAdminPage() {
  const [saKey, setSaKey] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  useEffect(() => { setSaKey(sessionStorage.getItem(SA_KEY)); setChecked(true); }, []);
  if (!checked) return null;
  if (!saKey) return <LoginScreen onLogin={k => setSaKey(k)} />;
  return <Dashboard saKey={saKey} />;
}
