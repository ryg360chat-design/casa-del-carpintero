"use client";

import { useState } from "react";
import { invitarUsuario } from "./actions";

export default function InvitarUsuarioPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const [historial, setHistorial] = useState<string[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const res = await invitarUsuario(email.trim().toLowerCase());
    setResult(res);

    if (res.success) {
      setHistorial((prev) => [email.trim().toLowerCase(), ...prev]);
      setEmail("");
    }

    setLoading(false);
  }

  return (
    <div className="p-8 max-w-xl mx-auto min-h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Invitar Usuario</h1>
        <p className="text-zinc-500 text-sm mt-1">
          El usuario recibirá un email con un link para crear su contraseña y acceder al sistema.
        </p>
      </div>

      {/* Form card */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 mb-6 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
              Correo electrónico
            </label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@empresa.com"
                required
                className="w-full pl-9 pr-3 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 bg-white"
                style={{ "--tw-ring-color": "#f97316" } as React.CSSProperties}
              />
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
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              ¡Invitación enviada! El usuario recibirá el email en unos minutos.
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all press-effect disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Enviando...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                Enviar invitación
              </>
            )}
          </button>
        </form>
      </div>

      {/* Info box */}
      <div className="rounded-xl p-4 mb-6 text-sm" style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.2)" }}>
        <p className="font-semibold text-zinc-800 mb-1">¿Cómo funciona?</p>
        <ol className="text-zinc-500 text-xs flex flex-col gap-1 list-decimal list-inside">
          <li>Ingresás el correo del nuevo usuario</li>
          <li>Supabase le envía un email automáticamente con un link seguro</li>
          <li>El usuario hace clic en el link y elige su contraseña</li>
          <li>Ya puede ingresar al sistema normalmente</li>
        </ol>
      </div>

      {/* Historial sesión */}
      {historial.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-5">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">
            Enviados en esta sesión
          </p>
          <div className="flex flex-col gap-2">
            {historial.map((e) => (
              <div key={e} className="flex items-center gap-2.5 text-sm text-zinc-700">
                <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
                {e}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
