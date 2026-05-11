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
  // setupMode/qrData solo accesible desde dashboard, no desde login externo

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

        {/* Panel izquierdo — editorial, igual a la landing */}
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

        {/* Panel derecho — formulario */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-sm">

            {/* Logo mobile */}
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
              </>
            ) : (
              /* ── Setup QR ── */
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

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (tab !== "monitoreo") return;
    fetch("/api/superadmin/monitor", { headers })
      .then(r => r.json()).then(setMonitor);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    if (tab !== "leads") return;
    setLeadsLoading(true);
    fetch("/api/superadmin/leads", { headers })
      .then(r => r.json())
      .then(d => setLeads(d.leads ?? []))
      .finally(() => setLeadsLoading(false));
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
    if (qr) { setQr(null); return; } // toggle off
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
        .sa-dash .bg-gray-800 { background: #f3eee7 !important; }
        .sa-dash .bg-gray-800\\/50 { background: rgba(26,23,20,0.04) !important; }
        .sa-dash .bg-gray-700 { background: rgba(26,23,20,0.08) !important; }
        .sa-dash select.bg-transparent option { background: #fff; color: #1a1714; }
        .sa-dash table thead tr { background: #f9f7f4; }
        .sa-dash .font-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between" style={{ background: "#fff", borderBottom: "1px solid rgba(26,23,20,0.10)" }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#c8472a" }}>Super Admin</span>
          </div>
          <span style={{ color: "rgba(26,23,20,0.20)" }}>·</span>
          <span className="text-sm" style={{ color: "#9a9490" }}>Kuadra · Panel interno</span>
        </div>
        <button onClick={handleLogout} className="text-xs transition-colors" style={{ color: "#9a9490" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#c8472a")}
          onMouseLeave={e => (e.currentTarget.style.color = "#9a9490")}>
          Cerrar sesión →
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* KPIs — 7 cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
          {[
            { label: "Clientes activos", value: kpis.activos, sub: `de ${kpis.totalOrgs} total` },
            { label: "MRR", value: `$${kpis.mrr.toLocaleString()}`, sub: "mensual recurrente", color: "text-green-400" },
            { label: "ARR", value: `$${kpis.arr.toLocaleString()}`, sub: "anual proyectado", color: "text-green-300" },
            { label: "Total orgs", value: kpis.totalOrgs, sub: "registradas" },
            { label: "Usuarios", value: kpis.totalUsuarios, sub: "en todas las orgs" },
            { label: "Pedidos / mes", value: kpis.pedidosMes, sub: "este mes", color: "text-blue-400" },
            { label: "Leads bot", value: kpis.totalLeads, sub: "capturados total", color: "text-amber-400" },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="bg-white rounded-xl p-4" style={{ border: "1px solid rgba(26,23,20,0.10)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color ?? "text-white"}`}>{value}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Alertas */}
        {alertas.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">
              ⚠ Alertas ({alertas.length})
            </p>
            <div className="space-y-1.5">
              {alertas.map(a => (
                <p key={a.orgId} className="text-sm text-amber-300">
                  <strong>{a.nombre}</strong> — {a.tipo === "usuarios_al_limite" ? "al límite de usuarios (≥95%)" : a.tipo}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Preview últimos leads */}
        {kpis.totalLeads > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
                🎯 Últimos leads del bot ({kpis.totalLeads} total)
              </p>
              <button
                onClick={() => setTab("leads")}
                className="text-[10px] font-semibold text-amber-400/70 hover:text-amber-400 transition-colors"
              >
                Ver todos →
              </button>
            </div>
            <p className="text-[10px] text-amber-400/50">
              Cargá el tab &quot;Leads&quot; para ver la lista completa con botones de WhatsApp.
            </p>
          </div>
        )}

        {/* Acciones + Actividad — misma fila compacta */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Acciones rápidas */}
          <div className="bg-white rounded-xl p-5" style={{ border: "1px solid rgba(26,23,20,0.10)" }}>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Acciones rápidas</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => load()}
                className="text-sm px-4 py-2 rounded-lg font-medium transition-colors" style={{ background: "rgba(200,71,42,0.08)", color: "#c8472a" }}
              >
                ↻ Actualizar datos
              </button>
              <button
                onClick={loadQr}
                disabled={qrLoading}
                className="text-sm px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50" style={{ background: "rgba(26,23,20,0.06)", color: "#5a5450" }}
              >
                {qrLoading ? "Generando…" : qr ? "Ocultar QR TOTP" : "📱 Configurar TOTP"}
              </button>
            </div>

            {qr && (
              <div className="mt-5 flex gap-5 items-start flex-wrap">
                <div className="bg-white p-2.5 rounded-xl shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qr.url} alt="QR TOTP" width={160} height={160} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white mb-2">Escanea con la cámara del iPhone</p>
                  <div className="bg-gray-800 rounded-lg px-3 py-2 mt-2">
                    <p className="text-[10px] text-gray-500 mb-0.5">Clave manual:</p>
                    <p className="text-xs font-mono text-gray-300 break-all">{qr.secret}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actividad reciente */}
          <div className="bg-white rounded-xl p-5" style={{ border: "1px solid rgba(26,23,20,0.10)" }}>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Actividad reciente</p>
            <div className="space-y-3">
              {recentActivity.length === 0 && (
                <p className="text-xs text-gray-600">Sin actividad reciente</p>
              )}
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-300 font-medium">{a.orgNombre}</p>
                    <p className="text-[10px] text-gray-500">{a.estado} · {fmtRelative(a.fecha)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div>
          <div className="flex gap-1 mb-4 rounded-xl p-1 w-fit" style={{ background: "#fff", border: "1px solid rgba(26,23,20,0.10)" }}>
            {([["clientes", "Clientes"], ["usuarios", "Usuarios"], ["monitoreo", "Monitoreo"], ["leads", "Leads"]] as const).map(([t, label]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
                  tab === t ? "text-white" : "hover:text-white"
                }`}
                style={tab === t ? { background: "#c8472a", color: "#fff" } : { color: "#9a9490" }}
              >
                {label}
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
                            <select
                              disabled={isLoading}
                              value={org.plan}
                              onChange={e => tenantAction(org.id, { plan: e.target.value })}
                              className="text-[11px] font-bold rounded-full px-2.5 py-1 border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 bg-transparent"
                              style={{ backgroundColor: "transparent" }}
                            >
                              {Object.entries(PLAN_LABEL).map(([v, l]) => (
                                <option key={v} value={v} className="bg-gray-900">{l}</option>
                              ))}
                            </select>
                            <span className={`ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${PLAN_COLOR[org.plan]}`}>
                              {PLAN_LABEL[org.plan]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${usoPct >= 0.95 ? "text-red-400" : usoPct >= 0.75 ? "text-amber-400" : "text-gray-300"}`}>
                                {org._usuarios}/{org.max_usuarios}
                              </span>
                              <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
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

          {/* Tab: Leads */}
          {tab === "leads" && (
            <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid rgba(26,23,20,0.10)" }}>
              {leadsLoading ? (
                <p className="px-4 py-6 text-xs text-gray-600 animate-pulse">Cargando leads…</p>
              ) : leads.length === 0 ? (
                <p className="px-4 py-6 text-xs text-gray-600">No hay leads capturados todavía.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800">
                        {["Nombre", "Teléfono", "Motivo", "Demo", "Fecha", ""].map(h => (
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
                              className="text-green-400 hover:text-green-300 font-mono text-xs transition-colors"
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
                  { label: "Fallidos 24h",  value: monitor.kpis.fallidos,  color: "text-red-400" },
                  { label: "Bloqueados 24h", value: monitor.kpis.bloqueados, color: "text-amber-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white rounded-xl p-4" style={{ border: "1px solid rgba(26,23,20,0.10)" }}>
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

        {/* Plan breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(PLAN_LABEL).map(([plan, label]) => {
            const count = orgs.filter(o => o.plan === plan).length;
            const ingresos = orgs.filter(o => o.plan === plan && o.activo).length * (PLAN_PRICE[plan] ?? 0);
            return (
              <div key={plan} className="bg-white rounded-xl p-4" style={{ border: "1px solid rgba(26,23,20,0.10)" }}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{label}</p>
                <p className="text-2xl font-bold">{count}</p>
                {ingresos > 0 && <p className="text-[10px] text-green-500 mt-0.5">${ingresos}/mes</p>}
              </div>
            );
          })}
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
