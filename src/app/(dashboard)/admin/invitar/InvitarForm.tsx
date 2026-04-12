"use client";

import { useState } from "react";
import { invitarUsuario } from "./actions";

const ROLES = [
  { value: "gerencia",        label: "Gerencia",           desc: "Acceso completo + reportes" },
  { value: "administracion",  label: "Administración",     desc: "Ve reportes, sin modificar producción" },
  { value: "ventas",          label: "Ventas",             desc: "Crea y gestiona pedidos, asigna máquinas" },
  { value: "logistica",       label: "Logística",          desc: "Despacha pedidos listos" },
  { value: "produccion",      label: "Producción",         desc: "Avanza estados, controla máquinas" },
  { value: "almacen_tableros",label: "Almacén Tableros",   desc: "Gestiona despacho y tableros" },
  { value: "almacen_cantos",  label: "Almacén Cantos",     desc: "Vista de lectura, acceso a cantos" },
  { value: "corte_especial",  label: "Corte Especial",     desc: "Vista de lectura, pedidos especiales" },
  { value: "viewer",          label: "Visualizador",       desc: "Solo puede ver pedidos" },
  { value: "admin",           label: "Administrador",      desc: "Control total del sistema" },
] as const;

type RolValue = typeof ROLES[number]["value"];

export default function InvitarForm({ isAdmin }: { isAdmin?: boolean }) {
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState<RolValue>("ventas");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const [historial, setHistorial] = useState<{ email: string; rol: string }[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const res = await invitarUsuario(email.trim().toLowerCase(), rol);
    setResult(res);

    if (res.success) {
      setHistorial((prev) => [{ email: email.trim().toLowerCase(), rol }, ...prev]);
      setEmail("");
    }

    setLoading(false);
  }

  const rolesVisibles = isAdmin ? ROLES : ROLES.filter(r => r.value !== "admin");

  return (
    <div className="p-8 max-w-xl mx-auto min-h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Invitar Usuario</h1>
        <p className="text-zinc-500 text-sm mt-1">
          El usuario recibirá un email con un link para crear su contraseña y acceder al sistema.
        </p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl p-6 mb-6 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
              Correo electrónico
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@empresa.com" required
                className="w-full pl-9 pr-3 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 bg-white"
                style={{ "--tw-ring-color": "#1957A6" } as React.CSSProperties} />
            </div>
          </div>

          {/* Selector de rol */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
              Rol
            </label>
            <div className="grid grid-cols-1 gap-2">
              {rolesVisibles.map(r => (
                <label key={r.value} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all ${
                  rol === r.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                }`}>
                  <input
                    type="radio" name="rol" value={r.value}
                    checked={rol === r.value}
                    onChange={() => setRol(r.value)}
                    className="accent-blue-600"
                  />
                  <div>
                    <p className={`text-sm font-semibold ${rol === r.value ? "text-blue-700" : "text-zinc-800"}`}>
                      {r.label}
                    </p>
                    <p className="text-xs text-zinc-400">{r.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {result?.error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-xl">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {result.error}
            </div>
          )}

          {result?.success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2.5 rounded-xl">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              ¡Invitación enviada! El usuario recibirá el email en unos minutos.
            </div>
          )}

          <button type="submit" disabled={loading || !email}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #1957A6, #267A8C)" }}>
            {loading ? (
              <><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Enviando...</>
            ) : (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>Enviar invitación</>
            )}
          </button>
        </form>
      </div>

      <div className="rounded-xl p-4 mb-6 text-sm" style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.2)" }}>
        <p className="font-semibold text-zinc-800 mb-1">¿Cómo funciona?</p>
        <ol className="text-zinc-500 text-xs flex flex-col gap-1 list-decimal list-inside">
          <li>Ingresás el correo y el rol del nuevo usuario</li>
          <li>El sistema le envía un email con un link seguro</li>
          <li>El usuario hace clic en el link y elige su contraseña</li>
          <li>Ya puede ingresar al sistema con el rol asignado</li>
        </ol>
      </div>

      {historial.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-5">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Enviados en esta sesión</p>
          <div className="flex flex-col gap-2">
            {historial.map((e, i) => (
              <div key={i} className="flex items-center justify-between text-sm text-zinc-700">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                  {e.email}
                </div>
                <span className="text-[11px] font-bold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full capitalize">
                  {e.rol}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
