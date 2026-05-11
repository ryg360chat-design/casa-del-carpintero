"use client";

import { useEffect, useState, useCallback } from "react";

const SA_KEY = "sa_key";

type KPIs = {
  activos: number; totalOrgs: number; mrr: number; arr: number;
  totalUsuarios: number; pedidosMes: number;
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
    <div className="min-h-screen flex">
      {/* Panel izquierdo — identidad Kuadra */}
      <div className="hidden lg:flex w-[420px] shrink-0 flex-col justify-between p-10"
        style={{ background: "linear-gradient(160deg, #0f1c3a 0%, #0a1628 60%, #050d1a 100%)" }}>
        <div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-8"
            style={{ background: "linear-gradient(135deg, #1957A6 0%, #267A8C 100%)" }}>
            <span className="text-white font-black text-sm tracking-tight">KD</span>
          </div>
          <h2 className="text-2xl font-bold text-white leading-snug mb-3">
            Panel de<br />control interno
          </h2>
          <p className="text-[#4a6fa5] text-sm leading-relaxed">
            Acceso exclusivo para administración de la plataforma Kuadra.
            Todas las sesiones quedan registradas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-red-500/70">Zona restringida</span>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 bg-zinc-950 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #1957A6 0%, #267A8C 100%)" }}>
              <span className="text-white font-black text-xs">KD</span>
            </div>
            <span className="text-white font-bold text-sm">Kuadra</span>
          </div>

          {!setupMode ? (
            <>
              <h1 className="text-xl font-bold text-white mb-1">Identificación</h1>
              <p className="text-zinc-500 text-sm mb-7">Ingresa tus credenciales de administrador</p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5 block">
                    Clave maestra
                  </label>
                  <input
                    type="password"
                    value={key}
                    onChange={e => setKey(e.target.value)}
                    placeholder="••••••••••••••••••••"
                    required
                    autoFocus
                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1957A6] focus:ring-1 focus:ring-[#1957A6]/30 placeholder-zinc-700 transition-colors"
                  />
                </div>

                {totpEnabled && (
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5 block">
                      Código de verificación
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={totp}
                      onChange={e => setTotp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000 000"
                      maxLength={6}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 text-sm font-mono text-center tracking-[0.5em] focus:outline-none focus:border-[#1957A6] focus:ring-1 focus:ring-[#1957A6]/30 placeholder-zinc-700 transition-colors"
                    />
                    <p className="text-[10px] text-zinc-600 mt-1.5">Código rotativo de 6 dígitos desde tu app de contraseñas</p>
                  </div>
                )}

                {totpEnabled && (
                  <button
                    type="button"
                    onClick={handleShowQr}
                    disabled={qrLoading}
                    className="w-full border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white rounded-lg py-3 text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>📱</span>
                    {qrLoading ? "Generando QR…" : "Ver QR para configurar verificación"}
                  </button>
                )}

                {error && (
                  <div className="bg-red-500/8 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 text-sm"
                  style={{ background: "linear-gradient(135deg, #1957A6, #267A8C)" }}
                >
                  {loading ? "Verificando…" : "Acceder →"}
                </button>
              </form>
            </>
          ) : (
            /* ── Pantalla de setup QR ── */
            <>
              <button
                onClick={() => { setSetupMode(false); setQrData(null); setError(""); }}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-6 flex items-center gap-1"
              >
                ← Volver al login
              </button>
              <h1 className="text-xl font-bold text-white mb-1">Configurar verificación</h1>
              <p className="text-zinc-500 text-sm mb-6">
                Escanea el QR con la cámara de tu iPhone
              </p>

              {qrData && (
                <div className="flex flex-col items-center gap-5">
                  <div className="bg-white p-3 rounded-2xl shadow-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrData.qr} alt="QR TOTP" width={200} height={200} />
                  </div>

                  <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">O ingresa la clave manualmente</p>
                    <p className="text-sm font-mono text-zinc-300 tracking-[0.25em] break-all select-all">{qrData.secret}</p>
                  </div>

                  <div className="w-full bg-[#0f1c3a]/60 border border-[#1957A6]/20 rounded-xl p-4">
                    <p className="text-xs font-semibold text-[#4a8fd4] mb-2">Pasos:</p>
                    <ol className="text-xs text-zinc-400 space-y-1.5 list-decimal list-inside">
                      <li>Abre la <strong className="text-white">cámara del iPhone</strong> y apunta al QR</li>
                      <li>Toca la notificación que aparece</li>
                      <li>Apple Passwords guarda el código automáticamente</li>
                      <li>Vuelve al login y usa el código de 6 dígitos</li>
                    </ol>
                  </div>

                  <button
                    onClick={() => { setSetupMode(false); setQrData(null); }}
                    className="w-full text-white font-semibold py-3 rounded-lg text-sm transition-all"
                    style={{ background: "linear-gradient(135deg, #1957A6, #267A8C)" }}
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
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
function Dashboard({ saKey }: { saKey: string }) {
  const [data, setData] = useState<{
    kpis: KPIs; orgs: Org[]; usuarios: Usuario[];
    recentActivity: Activity[]; alertas: Alerta[];
  } | null>(null);
  const [tab, setTab] = useState<"clientes" | "usuarios" | "monitoreo">("clientes");
  const [monitor, setMonitor] = useState<{
    kpis: { exitosos: number; fallidos: number; bloqueados: number };
    events: { ts: string; ip: string; tipo: string; detalle: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [qr, setQr] = useState<{ url: string; secret: string } | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-gray-500 text-sm animate-pulse">Cargando…</div>
      </div>
    );
  }

  const { kpis, orgs, usuarios, recentActivity, alertas } = data;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-red-400">Super Admin</span>
          </div>
          <span className="text-gray-700">·</span>
          <span className="text-sm text-gray-400">Kuadra · Panel interno</span>
        </div>
        <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-white transition-colors">
          Cerrar sesión →
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* KPIs — 6 cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Clientes activos", value: kpis.activos, sub: `de ${kpis.totalOrgs} total` },
            { label: "MRR", value: `$${kpis.mrr.toLocaleString()}`, sub: "mensual recurrente", color: "text-green-400" },
            { label: "ARR", value: `$${kpis.arr.toLocaleString()}`, sub: "anual proyectado", color: "text-green-300" },
            { label: "Total orgs", value: kpis.totalOrgs, sub: "registradas" },
            { label: "Usuarios", value: kpis.totalUsuarios, sub: "en todas las orgs" },
            { label: "Pedidos / mes", value: kpis.pedidosMes, sub: "este mes", color: "text-blue-400" },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
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

        {/* Layout 2/3 + 1/3 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Izquierda — Acciones rápidas + QR TOTP */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Panel operativo</p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => load()}
                  className="text-sm px-4 py-2 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors font-medium"
                >
                  ↻ Actualizar datos
                </button>
                <button
                  onClick={loadQr}
                  disabled={qrLoading}
                  className="text-sm px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
                >
                  {qrLoading ? "Generando…" : qr ? "Ocultar QR TOTP" : "📱 Configurar TOTP"}
                </button>
              </div>

              {/* QR para escanear con iPhone */}
              {qr && (
                <div className="mt-5 flex gap-6 items-start flex-wrap">
                  <div className="bg-white p-3 rounded-xl shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qr.url} alt="QR TOTP" width={180} height={180} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white mb-2">Escanea con la cámara del iPhone</p>
                    <ol className="text-xs text-gray-400 space-y-1.5 list-decimal list-inside">
                      <li>Abre la cámara del iPhone y apunta al QR</li>
                      <li>Toca la notificación que aparece</li>
                      <li>Apple Passwords te pedirá guardar el código TOTP</li>
                      <li>Acepta — ya está configurado</li>
                    </ol>
                    <div className="mt-3 bg-gray-800 rounded-lg px-3 py-2">
                      <p className="text-[10px] text-gray-500 mb-0.5">Clave manual (alternativa):</p>
                      <p className="text-xs font-mono text-gray-300 tracking-widest break-all">{qr.secret}</p>
                    </div>
                    <p className="text-[10px] text-gray-600 mt-2">
                      También funciona con Google Authenticator, Authy, o cualquier app TOTP.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Derecha — Actividad reciente */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
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
          <div className="flex gap-1 mb-4 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
            {([["clientes", "Clientes"], ["usuarios", "Usuarios"], ["monitoreo", "Monitoreo"]] as const).map(([t, label]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
                  tab === t ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab: Clientes */}
          {tab === "clientes" && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
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
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
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

          {/* Tab: Monitoreo */}
          {tab === "monitoreo" && monitor && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Exitosos 24h", value: monitor.kpis.exitosos, color: "text-green-400" },
                  { label: "Fallidos 24h",  value: monitor.kpis.fallidos,  color: "text-red-400" },
                  { label: "Bloqueados 24h", value: monitor.kpis.bloqueados, color: "text-amber-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{label}</p>
                    <p className={`text-3xl font-bold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
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
              <div key={plan} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
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
