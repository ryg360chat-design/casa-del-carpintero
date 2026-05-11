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
type Usuario = {
  id: string; nombre: string | null; rol: string;
  organization_id: string; orgNombre: string;
};
type Activity = { orgId: string; orgNombre: string; estado: string; fecha: string };
type Alerta = { orgId: string; nombre: string; tipo: string };
type Lead = { id: string; nombre: string; telefono: string; motivo: string; horario: string; origen: string; created_at: string };

const PLAN_LABEL: Record<string, string> = {
  trial: "Trial", basico: "Básico", profesional: "Profesional", empresarial: "Empresarial",
};
const PLAN_COLOR: Record<string, string> = {
  trial: "bg-gray-700 text-gray-300",
  basico: "bg-blue-900/70 text-blue-300",
  profesional: "bg-violet-900/70 text-violet-300",
  empresarial: "bg-orange-900/70 text-orange-300",
};
const PLAN_PRICE: Record<string, number> = { trial: 0, basico: 300, profesional: 500, empresarial: 900 };

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

// ─── Login screen ───────────────────────────────────────────────────────────
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
    fetch("/api/superadmin/status")
      .then(r => r.json())
      .then(d => setTotpEnabled(d.totpEnabled));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/superadmin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    setError("");
    setQrLoading(true);
    const res = await fetch("/api/superadmin/setup-qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    const data = await res.json();
    setQrLoading(false);
    if (!res.ok) { setError(data.error ?? "Clave incorrecta"); return; }
    setQrData(data);
    setSetupMode(true);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');
        .sa-root { font-family: 'Inter', sans-serif; }
        .sa-wordmark { font-family: 'Instrument Serif', serif; }
      `}</style>

      <div className="sa-root min-h-screen flex" style={{ background: "#f3eee7" }}>

        {/* Panel izquierdo */}
        <div className="hidden lg:flex flex-col w-[420px] shrink-0 p-12 justify-between"
          style={{ background: "#ffffff", borderRight: "1px solid rgba(26,23,20,0.10)" }}>
          <div>
            <div className="flex items-center gap-3 mb-12">
              <span className="sa-wordmark text-2xl" style={{ color: "#1a1714" }}>Kuadra</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded"
                style={{ background: "#f3eee7", color: "#9a9490", border: "1px solid rgba(26,23,20,0.15)" }}>
                INTERNO
              </span>
            </div>
            <div className="flex items-center gap-2 mb-8">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#c8472a" }} />
              <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#c8472a" }}>
                Zona restringida
              </span>
            </div>
            <h1 className="sa-wordmark text-4xl leading-tight mb-5" style={{ color: "#1a1714" }}>
              Acceso<br /><em style={{ color: "#c8472a" }}>autorizado</em><br />únicamente.
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "#5a5450" }}>
              Todas las sesiones quedan registradas. Uso exclusivo del equipo de Kuadra.
            </p>
          </div>
          <p className="text-[11px] pt-6" style={{ color: "#9a9490", borderTop: "1px solid rgba(26,23,20,0.10)" }}>
            © 2026 Kuadra
          </p>
        </div>

        {/* Panel derecho */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-sm">
            <div className="lg:hidden mb-10">
              <span className="sa-wordmark text-2xl" style={{ color: "#1a1714" }}>Kuadra</span>
            </div>

            {!setupMode ? (
              <>
                <h2 className="sa-wordmark text-3xl mb-1" style={{ color: "#1a1714" }}>Identificación</h2>
                <p className="text-sm mb-8" style={{ color: "#9a9490" }}>Ingresa tus credenciales de administrador</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-widest mb-2"
                      style={{ color: "#9a9490" }}>
                      Clave maestra
                    </label>
                    <input
                      type="password"
                      value={key}
                      onChange={e => setKey(e.target.value)}
                      placeholder="••••••••••••••••••••"
                      required
                      autoFocus
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                      style={{ background: "#fff", border: "1px solid rgba(26,23,20,0.18)", color: "#1a1714" }}
                      onFocus={e => e.target.style.borderColor = "#c8472a"}
                      onBlur={e => e.target.style.borderColor = "rgba(26,23,20,0.18)"}
                    />
                  </div>

                  {totpEnabled && (
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-widest mb-2"
                        style={{ color: "#9a9490" }}>
                        Código de verificación
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={totp}
                        onChange={e => setTotp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000 000"
                        maxLength={6}
                        className="w-full px-4 py-3 rounded-xl text-sm font-mono text-center outline-none transition-all"
                        style={{ background: "#fff", border: "1px solid rgba(26,23,20,0.18)", color: "#1a1714", letterSpacing: "0.4em" }}
                        onFocus={e => e.target.style.borderColor = "#c8472a"}
                        onBlur={e => e.target.style.borderColor = "rgba(26,23,20,0.18)"}
                      />
                      <p className="text-[10px] mt-1.5" style={{ color: "#9a9490" }}>Código rotativo desde tu app de contraseñas</p>
                    </div>
                  )}

                  {error && (
                    <div className="text-sm px-4 py-3 rounded-xl"
                      style={{ background: "rgba(200,71,42,0.08)", color: "#c8472a", border: "1px solid rgba(200,71,42,0.2)" }}>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all mt-1"
                    style={{ background: loading ? "#e07b62" : "#c8472a" }}
                  >
                    {loading ? "Verificando…" : "Acceder →"}
                  </button>
                </form>

                <button
                  onClick={handleShowQr}
                  disabled={qrLoading}
                  className="mt-4 text-xs w-full text-center transition-colors"
                  style={{ color: "#9a9490" }}
                >
                  {qrLoading ? "Generando QR…" : "Configurar verificación en dos pasos →"}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setSetupMode(false); setQrData(null); setError(""); }}
                  className="text-xs mb-6 flex items-center gap-1 transition-colors"
                  style={{ color: "#9a9490" }}
                >
                  ← Volver
                </button>
                <h2 className="sa-wordmark text-3xl mb-1" style={{ color: "#1a1714" }}>Configurar verificación</h2>
                <p className="text-sm mb-6" style={{ color: "#9a9490" }}>Escanea el QR con la cámara del iPhone</p>

                {qrData && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="bg-white p-3 rounded-2xl" style={{ border: "1px solid rgba(26,23,20,0.10)" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrData.qr} alt="QR TOTP" width={200} height={200} />
                    </div>
                    <div className="w-full p-4 rounded-xl text-center" style={{ background: "#fff", border: "1px solid rgba(26,23,20,0.10)" }}>
                      <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "#9a9490" }}>Clave manual</p>
                      <p className="text-sm font-mono break-all select-all" style={{ color: "#1a1714" }}>{qrData.secret}</p>
                    </div>
                    <button
                      onClick={() => { setSetupMode(false); setQrData(null); }}
                      className="w-full py-3 rounded-xl text-sm font-semibold text-white"
                      style={{ background: "#c8472a" }}
                    >
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

// ─── Lead card ───────────────────────────────────────────────────────────────
function LeadCard({ lead, onDelete }: { lead: Lead; onDelete: (id: string) => void }) {
  return (
    <div className="bg-white rounded-xl p-4 flex flex-col gap-3" style={{ border: "1px solid rgba(26,23,20,0.10)" }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: "#1a1714" }}>{lead.nombre}</p>
          <p className="text-[10px]" style={{ color: "#9a9490" }}>{fmtRelative(lead.created_at)}</p>
        </div>
        <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ background: "rgba(200,71,42,0.08)", color: "#c8472a" }}>
          bot
        </span>
      </div>

      <a
        href={`https://wa.me/${lead.telefono.replace(/\D/g, "")}?text=Hola%20${encodeURIComponent(lead.nombre)},%20te%20contacto%20desde%20Kuadra.`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
        style={{ background: "rgba(37,211,102,0.08)", color: "#16a34a" }}
        onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "rgba(37,211,102,0.15)"}
        onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "rgba(37,211,102,0.08)"}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        {lead.telefono}
        <span className="ml-auto opacity-60">↗</span>
      </a>

      <div className="space-y-1.5 text-xs" style={{ color: "#5a5450" }}>
        <p className="leading-snug">
          <span className="font-semibold" style={{ color: "#1a1714" }}>Motivo: </span>
          {lead.motivo}
        </p>
        <p>
          <span className="font-semibold" style={{ color: "#1a1714" }}>Demo: </span>
          {lead.horario}
        </p>
      </div>

      <div className="flex justify-end pt-1" style={{ borderTop: "1px solid rgba(26,23,20,0.06)" }}>
        <button
          onClick={() => onDelete(lead.id)}
          className="text-[10px] font-bold transition-colors"
          style={{ color: "#9a9490" }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "#c8472a"}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "#9a9490"}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
function Dashboard({ saKey }: { saKey: string }) {
  const [data, setData] = useState<{
    kpis: KPIs; orgs: Org[]; usuarios: Usuario[];
    recentActivity: Activity[]; alertas: Alerta[];
  } | null>(null);
  const [tab, setTab] = useState<"clientes" | "usuarios" | "monitoreo" | "leads">("clientes");
  const [monitor, setMonitor] = useState<{
    kpis: { exitosos: number; fallidos: number; bloqueados: number };
    events: { ts: string; ip: string; tipo: string; detalle: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [qr, setQr] = useState<{ url: string; secret: string } | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);

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
    } finally {
      setLeadsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saKey]);

  useEffect(() => { load(); loadLeads(); }, [load, loadLeads]);

  useEffect(() => {
    if (tab !== "monitoreo") return;
    fetch("/api/superadmin/monitor", { headers })
      .then(r => r.json()).then(setMonitor);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function deleteLead(id: string) {
    await fetch("/api/superadmin/leads", {
      method: "DELETE",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setLeads(l => l.filter(lead => lead.id !== id));
  }

  async function tenantAction(id: string, payload: Record<string, unknown>) {
    setActionLoading(id);
    await fetch("/api/superadmin/tenant", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...payload }),
    });
    await load();
    setActionLoading(null);
  }

  async function loadQr() {
    if (qr) { setQr(null); return; }
    setQrLoading(true);
    const res = await fetch("/api/superadmin/setup", { headers });
    if (res.ok) {
      const d = await res.json();
      setQr({ url: d.qr, secret: d.secret });
    }
    setQrLoading(false);
  }

  function handleLogout() {
    sessionStorage.removeItem(SA_KEY);
    window.location.reload();
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f3eee7" }}>
        <div className="text-sm animate-pulse" style={{ color: "#9a9490" }}>Cargando…</div>
      </div>
    );
  }

  const { kpis, orgs, usuarios, recentActivity, alertas } = data;

  return (
    <div className="sa-dash min-h-screen" style={{ background: "#f3eee7", color: "#1a1714", fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');
        .sa-dash { font-family: 'Inter', sans-serif; }
        .sa-dash .text-white { color: #1a1714 !important; }
        .sa-dash .text-gray-300 { color: #1a1714 !important; }
        .sa-dash .text-gray-400 { color: #5a5450 !important; }
        .sa-dash .text-gray-500 { color: #9a9490 !important; }
        .sa-dash .text-gray-600 { color: #9a9490 !important; }
        .sa-dash .text-gray-700 { color: #9a9490 !important; }
        .sa-dash .border-gray-800 { border-color: rgba(26,23,20,0.10) !important; }
        .sa-dash .border-gray-800\\/60 { border-color: rgba(26,23,20,0.08) !important; }
        .sa-dash .border-gray-800\\/40 { border-color: rgba(26,23,20,0.06) !important; }
        .sa-dash .hover\\:bg-gray-800\\/50:hover { background: rgba(26,23,20,0.04) !important; }
        .sa-dash .hover\\:bg-gray-800\\/30:hover { background: rgba(26,23,20,0.03) !important; }
        .sa-dash .hover\\:text-white:hover { color: #1a1714 !important; }
        .sa-dash .bg-gray-800 { background: rgba(26,23,20,0.06) !important; }
        .sa-dash .bg-gray-800\\/50 { background: rgba(26,23,20,0.04) !important; }
        .sa-dash .bg-gray-700 { background: rgba(26,23,20,0.08) !important; }
        .sa-dash select.bg-transparent option { background: #fff; color: #1a1714; }
        .sa-dash table thead tr { background: #f9f7f4; }
      `}</style>

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-10"
        style={{ background: "#fff", borderBottom: "1px solid rgba(26,23,20,0.10)" }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#c8472a" }}>Super Admin</span>
          </div>
          <span style={{ color: "rgba(26,23,20,0.20)" }}>·</span>
          <span className="text-sm" style={{ color: "#9a9490" }}>Kuadra · Panel interno</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => { load(); loadLeads(); }}
            className="text-xs font-medium transition-colors"
            style={{ color: "#9a9490" }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "#1a1714"}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "#9a9490"}
          >
            ↻ Actualizar
          </button>
          <button onClick={handleLogout} className="text-xs transition-colors" style={{ color: "#9a9490" }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "#c8472a"}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "#9a9490"}>
            Cerrar sesión →
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* KPIs principales — 4 cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5" style={{ border: "1px solid rgba(26,23,20,0.10)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#9a9490" }}>Clientes activos</p>
            <p className="text-3xl font-bold" style={{ color: "#1a1714" }}>{kpis.activos}</p>
            <p className="text-[10px] mt-1" style={{ color: "#9a9490" }}>de {kpis.totalOrgs} organizaciones</p>
          </div>
          <div className="bg-white rounded-xl p-5" style={{ border: "1px solid rgba(26,23,20,0.10)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#9a9490" }}>MRR</p>
            <p className="text-3xl font-bold" style={{ color: "#16a34a" }}>${kpis.mrr.toLocaleString()}</p>
            <p className="text-[10px] mt-1" style={{ color: "#9a9490" }}>ARR proyectado ${kpis.arr.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl p-5" style={{ border: "1px solid rgba(26,23,20,0.10)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#9a9490" }}>Usuarios totales</p>
            <p className="text-3xl font-bold" style={{ color: "#1a1714" }}>{kpis.totalUsuarios}</p>
            <p className="text-[10px] mt-1" style={{ color: "#9a9490" }}>{kpis.pedidosMes} pedidos este mes</p>
          </div>
          <div className="bg-white rounded-xl p-5" style={{ border: "1px solid rgba(26,23,20,0.10)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#9a9490" }}>Leads del bot</p>
            <p className="text-3xl font-bold" style={{ color: "#c8472a" }}>{kpis.totalLeads}</p>
            <p className="text-[10px] mt-1" style={{ color: "#9a9490" }}>prospectos capturados</p>
          </div>
        </div>

        {/* Main layout: 2/3 + 1/3 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Columna izquierda: Prospectos recientes */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold" style={{ color: "#1a1714" }}>Prospectos recientes</h2>
                <p className="text-[11px]" style={{ color: "#9a9490" }}>
                  {leads.length === 0 ? "Sin leads todavía" : `${leads.length} lead${leads.length !== 1 ? "s" : ""} capturado${leads.length !== 1 ? "s" : ""}`}
                </p>
              </div>
              {leads.length > 0 && (
                <button
                  onClick={() => setTab("leads")}
                  className="text-xs font-semibold transition-colors"
                  style={{ color: "#c8472a" }}
                >
                  Ver en tabla →
                </button>
              )}
            </div>

            {leadsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-xl p-4 animate-pulse h-36"
                    style={{ border: "1px solid rgba(26,23,20,0.10)" }} />
                ))}
              </div>
            ) : leads.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center" style={{ border: "1px solid rgba(26,23,20,0.10)" }}>
                <p className="text-2xl mb-2">🎯</p>
                <p className="text-sm font-medium" style={{ color: "#1a1714" }}>Sin prospectos aún</p>
                <p className="text-xs mt-1" style={{ color: "#9a9490" }}>Los leads del chatbot aparecerán aquí</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {leads.slice(0, 6).map(lead => (
                  <LeadCard key={lead.id} lead={lead} onDelete={deleteLead} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar derecho */}
          <div className="space-y-4">

            {/* Alertas */}
            {alertas.length > 0 && (
              <div className="bg-white rounded-xl p-5" style={{ border: "1px solid rgba(26,23,20,0.10)" }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#d97706" }}>
                  ⚠ Alertas · {alertas.length}
                </p>
                <div className="space-y-2">
                  {alertas.map(a => (
                    <div key={a.orgId} className="flex items-start gap-2.5 rounded-lg px-3 py-2.5"
                      style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.15)" }}>
                      <span className="text-amber-500 text-sm shrink-0 mt-0.5">⚠</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: "#1a1714" }}>{a.nombre}</p>
                        <p className="text-[10px]" style={{ color: "#9a9490" }}>
                          {a.tipo === "usuarios_al_limite" ? "Al límite de usuarios (≥95%)" : a.tipo}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actividad reciente */}
            <div className="bg-white rounded-xl p-5" style={{ border: "1px solid rgba(26,23,20,0.10)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: "#9a9490" }}>
                Actividad reciente
              </p>
              {recentActivity.length === 0 ? (
                <p className="text-xs" style={{ color: "#9a9490" }}>Sin actividad registrada</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.slice(0, 6).map((a, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "#3b82f6" }} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate" style={{ color: "#1a1714" }}>{a.orgNombre}</p>
                        <p className="text-[10px]" style={{ color: "#9a9490" }}>{a.estado} · {fmtRelative(a.fecha)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="bg-white rounded-xl p-5" style={{ border: "1px solid rgba(26,23,20,0.10)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#9a9490" }}>
                Acciones rápidas
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={loadQr}
                  disabled={qrLoading}
                  className="text-xs font-medium px-4 py-2.5 rounded-lg text-left transition-colors disabled:opacity-50"
                  style={{ background: "rgba(26,23,20,0.04)", color: "#5a5450" }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(26,23,20,0.08)"}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(26,23,20,0.04)"}
                >
                  {qrLoading ? "Generando…" : qr ? "🔒 Ocultar QR TOTP" : "📱 Configurar TOTP"}
                </button>
              </div>

              {qr && (
                <div className="mt-4 flex gap-3 items-start flex-wrap">
                  <div className="bg-white p-2 rounded-lg shrink-0" style={{ border: "1px solid rgba(26,23,20,0.10)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qr.url} alt="QR TOTP" width={140} height={140} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] mb-1" style={{ color: "#9a9490" }}>Clave manual:</p>
                    <p className="text-[10px] font-mono break-all select-all p-2 rounded-lg"
                      style={{ background: "rgba(26,23,20,0.04)", color: "#1a1714" }}>
                      {qr.secret}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Plan breakdown */}
            <div className="bg-white rounded-xl p-5" style={{ border: "1px solid rgba(26,23,20,0.10)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#9a9490" }}>
                Distribución por plan
              </p>
              <div className="space-y-2">
                {Object.entries(PLAN_LABEL).map(([plan, label]) => {
                  const count = orgs.filter(o => o.plan === plan).length;
                  const ingresos = orgs.filter(o => o.plan === plan && o.activo).length * (PLAN_PRICE[plan] ?? 0);
                  const pct = kpis.totalOrgs > 0 ? (count / kpis.totalOrgs) * 100 : 0;
                  return (
                    <div key={plan}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs" style={{ color: "#5a5450" }}>{label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold" style={{ color: "#1a1714" }}>{count}</span>
                          {ingresos > 0 && <span className="text-[10px]" style={{ color: "#16a34a" }}>${ingresos}/mes</span>}
                        </div>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(26,23,20,0.08)" }}>
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: plan === "trial" ? "#9a9490" : plan === "basico" ? "#3b82f6" : plan === "profesional" ? "#8b5cf6" : "#f59e0b" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div>
          <div className="flex gap-1 mb-4 rounded-xl p-1 w-fit" style={{ background: "#fff", border: "1px solid rgba(26,23,20,0.10)" }}>
            {([["clientes", "Clientes"], ["usuarios", "Usuarios"], ["monitoreo", "Monitoreo"], ["leads", "Todos los leads"]] as const).map(([t, label]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                style={tab === t
                  ? { background: "#c8472a", color: "#fff" }
                  : { color: "#9a9490" }}
              >
                {label}{t === "leads" && leads.length > 0 ? ` (${leads.length})` : ""}
              </button>
            ))}
          </div>

          {/* Tab: Clientes */}
          {tab === "clientes" && (
            <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid rgba(26,23,20,0.10)" }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      {["Taller", "Plan", "Usuarios", "Pedidos/mes", "Estado", "Trial / Suscrito", "Acciones"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orgs.map(org => {
                      const isLoading = actionLoading === org.id;
                      const trialExp = org.plan === "trial" && org.trial_ends_at && new Date(org.trial_ends_at) < new Date();
                      const daysLeft = org.trial_ends_at
                        ? Math.max(0, Math.ceil((new Date(org.trial_ends_at).getTime() - Date.now()) / 86400000))
                        : null;
                      const usoPct = org.max_usuarios > 0 ? org._usuarios / org.max_usuarios : 0;

                      return (
                        <tr key={org.id} className={`border-b border-gray-800/60 hover:bg-gray-800/50 transition-colors ${!org.activo ? "opacity-40" : ""}`}>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-white text-sm">{org.nombre}</p>
                            <p className="text-[10px] text-gray-500 font-mono">{org.slug}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <select
                                disabled={isLoading}
                                value={org.plan}
                                onChange={e => tenantAction(org.id, { plan: e.target.value })}
                                className="text-[11px] font-bold rounded-full px-2 py-1 border-0 cursor-pointer focus:outline-none disabled:opacity-50 bg-transparent"
                              >
                                {Object.entries(PLAN_LABEL).map(([v, l]) => (
                                  <option key={v} value={v}>{l}</option>
                                ))}
                              </select>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PLAN_COLOR[org.plan]}`}>
                                {PLAN_LABEL[org.plan]}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${usoPct >= 0.95 ? "text-red-400" : usoPct >= 0.75 ? "text-amber-400" : "text-gray-300"}`}>
                                {org._usuarios}/{org.max_usuarios}
                              </span>
                              <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(26,23,20,0.08)" }}>
                                <div
                                  className={`h-full rounded-full ${usoPct >= 0.95 ? "bg-red-500" : usoPct >= 0.75 ? "bg-amber-500" : "bg-green-500"}`}
                                  style={{ width: `${Math.min(100, usoPct * 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-300">{org._pedidos_mes}</td>
                          <td className="px-4 py-3">
                            <span className={`text-[11px] font-bold ${org.activo ? "text-green-400" : "text-red-400"}`}>
                              {org.activo ? "● Activo" : "● Suspendido"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {org.plan === "trial" && org.trial_ends_at ? (
                              <span className={trialExp ? "text-red-400" : "text-amber-400"}>
                                {trialExp ? "⚠ Vencido" : `${daysLeft}d restantes`}
                              </span>
                            ) : org.subscribed_at ? (
                              <span className="text-green-400">desde {fmtDate(org.subscribed_at)}</span>
                            ) : <span className="text-gray-600">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1.5 justify-end flex-wrap">
                              {org.plan === "trial" && (
                                <button
                                  disabled={isLoading}
                                  onClick={() => tenantAction(org.id, { extend_trial_days: 30 })}
                                  className="text-[10px] font-bold px-2 py-1 rounded-md bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-colors disabled:opacity-50"
                                >
                                  +30d
                                </button>
                              )}
                              <button
                                disabled={isLoading}
                                onClick={() => tenantAction(org.id, { activo: !org.activo })}
                                className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors disabled:opacity-50 ${
                                  org.activo
                                    ? "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                                    : "bg-green-500/15 text-green-400 hover:bg-green-500/25"
                                }`}
                              >
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

          {/* Tab: Usuarios */}
          {tab === "usuarios" && (
            <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid rgba(26,23,20,0.10)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    {["Nombre", "Rol", "Organización"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u.id} className="border-b border-gray-800/60 hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-white">{u.nombre ?? <span className="text-gray-500 italic">Sin nombre</span>}</td>
                      <td className="px-4 py-3 text-gray-400 capitalize">{u.rol}</td>
                      <td className="px-4 py-3 text-gray-400">{u.orgNombre}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab: Leads (tabla completa) */}
          {tab === "leads" && (
            <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid rgba(26,23,20,0.10)" }}>
              {leadsLoading ? (
                <p className="px-4 py-6 text-xs text-gray-600 animate-pulse">Cargando leads…</p>
              ) : leads.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <p className="text-2xl mb-2">🎯</p>
                  <p className="text-sm font-medium" style={{ color: "#1a1714" }}>Sin leads capturados</p>
                  <p className="text-xs mt-1" style={{ color: "#9a9490" }}>Los leads del chatbot aparecerán aquí cuando el bot capture prospectos.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800">
                        {["Nombre", "Teléfono", "Motivo", "Demo agendada", "Fecha", ""].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map(l => (
                        <tr key={l.id} className="border-b border-gray-800/60 hover:bg-gray-800/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-white">{l.nombre}</td>
                          <td className="px-4 py-3">
                            <a
                              href={`https://wa.me/${l.telefono.replace(/\D/g, "")}?text=Hola%20${encodeURIComponent(l.nombre)},%20te%20contacto%20desde%20Kuadra%20por%20tu%20consulta.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-xs font-semibold transition-colors"
                              style={{ color: "#16a34a" }}
                            >
                              {l.telefono} ↗
                            </a>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs max-w-[200px] truncate">{l.motivo}</td>
                          <td className="px-4 py-3 text-gray-400 text-xs">{l.horario}</td>
                          <td className="px-4 py-3 text-gray-600 text-xs">{fmtRelative(l.created_at)}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => deleteLead(l.id)}
                              className="text-[10px] font-bold px-2 py-1 rounded-md bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors"
                            >
                              Borrar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab: Monitoreo */}
          {tab === "monitoreo" && monitor && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Exitosos 24h", value: monitor.kpis.exitosos, color: "text-green-400" },
                  { label: "Fallidos 24h", value: monitor.kpis.fallidos, color: "text-red-400" },
                  { label: "Bloqueados 24h", value: monitor.kpis.bloqueados, color: "text-amber-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white rounded-xl p-5" style={{ border: "1px solid rgba(26,23,20,0.10)" }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{label}</p>
                    <p className={`text-3xl font-bold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid rgba(26,23,20,0.10)" }}>
                <div className="px-4 py-3 border-b border-gray-800">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Eventos recientes</p>
                </div>
                {monitor.events.length === 0 ? (
                  <p className="px-4 py-6 text-xs text-gray-600">Sin eventos registrados en las últimas 24h</p>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-800">
                        {["Timestamp", "IP", "Tipo", "Detalle"].map(h => (
                          <th key={h} className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {monitor.events.map((e, i) => (
                        <tr key={i} className="border-b border-gray-800/40 hover:bg-gray-800/30">
                          <td className="px-4 py-2 font-mono text-gray-500">{new Date(e.ts).toLocaleTimeString("es-EC")}</td>
                          <td className="px-4 py-2 font-mono text-gray-400">{e.ip}</td>
                          <td className="px-4 py-2">
                            <span className={`font-bold ${e.tipo === "success" ? "text-green-400" : e.tipo === "blocked" ? "text-amber-400" : "text-red-400"}`}>
                              {e.tipo}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-gray-500">{e.detalle}</td>
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
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────
export default function SuperAdminPage() {
  const [saKey, setSaKey] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(SA_KEY);
    setSaKey(stored);
    setChecked(true);
  }, []);

  if (!checked) return null;
  if (!saKey) return <LoginScreen onLogin={k => setSaKey(k)} />;
  return <Dashboard saKey={saKey} />;
}
