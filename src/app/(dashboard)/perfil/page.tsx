"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const ROLE_LABEL: Record<string, string> = {
  developer: "Desarrollador",
  admin: "Administrador",
  ventas: "Ventas",
  produccion: "Jefe de Producción",
  almacenes: "Almacenes",
  viewer: "Visualizador",
};

function validatePassword(pwd: string): string | null {
  if (pwd.length < 8) return "La contraseña debe tener al menos 8 caracteres";
  if (!/[A-Z]/.test(pwd)) return "Debe incluir al menos una letra mayúscula";
  if (!/[0-9]/.test(pwd)) return "Debe incluir al menos un número";
  return null;
}

const INPUT = "w-full pl-9 pr-10 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
const LABEL = "block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5";

export default function PerfilPage() {
  const [user, setUser] = useState<{ email: string; id: string } | null>(null);
  const [role, setRole] = useState<string>("viewer");
  const [loadingUser, setLoadingUser] = useState(true);

  // Change password form
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass]         = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);
  const [passError, setPassError]     = useState("");
  const [passSuccess, setPassSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser({ email: user.email ?? "", id: user.id });

      const { data } = await supabase.from("profiles").select("rol").eq("id", user.id).maybeSingle();
      setRole(data?.rol ?? "viewer");
      setLoadingUser(false);
    }
    load();
  }, []);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPassError("");
    setPassSuccess(false);

    const validErr = validatePassword(newPass);
    if (validErr) { setPassError(validErr); return; }
    if (newPass !== confirmPass) { setPassError("Las contraseñas no coinciden"); return; }
    if (!currentPass) { setPassError("Ingresá tu contraseña actual"); return; }

    setLoadingPass(true);
    const supabase = createClient();

    // Verify current password by re-signing in
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: user?.email ?? "",
      password: currentPass,
    });
    if (signInErr) {
      setPassError("La contraseña actual es incorrecta");
      setLoadingPass(false);
      return;
    }

    // Update to new password
    const { error: updateErr } = await supabase.auth.updateUser({ password: newPass });
    if (updateErr) {
      setPassError("No se pudo actualizar la contraseña. Intentá nuevamente.");
      setLoadingPass(false);
      return;
    }

    setPassSuccess(true);
    setCurrentPass("");
    setNewPass("");
    setConfirmPass("");
    setLoadingPass(false);
  }

  const strength = [
    newPass.length >= 8,
    /[A-Z]/.test(newPass),
    /[0-9]/.test(newPass),
  ].filter(Boolean).length;

  const initials = user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="p-4 sm:p-8 max-w-xl mx-auto min-h-full animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Mi perfil</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Información de tu cuenta</p>
      </div>

      {/* Tarjeta de perfil */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 mb-5 shadow-sm">
        {loadingUser ? (
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-14 h-14 rounded-full bg-zinc-100 shrink-0" />
            <div className="flex flex-col gap-2">
              <div className="h-4 w-32 bg-zinc-100 rounded" />
              <div className="h-3 w-48 bg-zinc-100 rounded" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0"
              style={{ background: "linear-gradient(135deg, #1957A6, #267A8C)" }}>
              {initials}
            </div>
            <div>
              <p className="font-bold text-zinc-900 text-base">{user?.email}</p>
              <span className="inline-flex items-center gap-1.5 mt-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {ROLE_LABEL[role] ?? role}
              </span>
            </div>
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">Email</p>
            <p className="text-sm font-medium text-zinc-700">{user?.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">Rol en el sistema</p>
            <p className="text-sm font-medium text-zinc-700">{ROLE_LABEL[role] ?? role}</p>
          </div>
        </div>

        <p className="mt-4 text-[11px] text-zinc-400">
          Para cambiar tu rol o email, contactá al administrador del sistema.
        </p>
      </div>

      {/* Cambio de contraseña */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2">
              <rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-zinc-900 text-sm">Cambiar contraseña</h2>
            <p className="text-[11px] text-zinc-400">Mínimo 8 caracteres, una mayúscula y un número</p>
          </div>
        </div>

        {passSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-2.5 rounded-xl mb-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Contraseña actualizada correctamente
          </div>
        )}

        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
          {/* Contraseña actual */}
          <div>
            <label className={LABEL}>Contraseña actual</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPass}
                onChange={(e) => { setCurrentPass(e.target.value); setPassError(""); setPassSuccess(false); }}
                placeholder="Tu contraseña actual"
                className={INPUT}
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                {showCurrent
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          {/* Nueva contraseña */}
          <div>
            <label className={LABEL}>Nueva contraseña</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                type={showNew ? "text" : "password"}
                value={newPass}
                onChange={(e) => { setNewPass(e.target.value); setPassError(""); setPassSuccess(false); }}
                placeholder="Mínimo 8 caracteres"
                className={INPUT}
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                {showNew
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            {newPass.length > 0 && (
              <>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < strength ? (strength === 3 ? "bg-emerald-500" : strength === 2 ? "bg-amber-400" : "bg-red-400") : "bg-zinc-200"}`} />
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-400">
                    {strength === 3 ? "Fuerte" : strength === 2 ? "Regular" : "Débil"}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-col gap-0.5">
                  {[
                    { ok: newPass.length >= 8, text: "Al menos 8 caracteres" },
                    { ok: /[A-Z]/.test(newPass), text: "Una letra mayúscula" },
                    { ok: /[0-9]/.test(newPass), text: "Un número" },
                  ].map(({ ok, text }) => (
                    <p key={text} className={`text-[11px] flex items-center gap-1.5 ${ok ? "text-emerald-600" : "text-zinc-400"}`}>
                      <span>{ok ? "✓" : "·"}</span> {text}
                    </p>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Confirmar */}
          <div>
            <label className={LABEL}>Confirmar nueva contraseña</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                type={showNew ? "text" : "password"}
                value={confirmPass}
                onChange={(e) => { setConfirmPass(e.target.value); setPassError(""); setPassSuccess(false); }}
                placeholder="Repetí la nueva contraseña"
                className={INPUT + (confirmPass && confirmPass !== newPass ? " border-red-300 focus:ring-red-400" : "")}
              />
            </div>
          </div>

          {passError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-xl">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {passError}
            </div>
          )}

          <button
            type="submit"
            disabled={loadingPass || !currentPass || strength < 3 || !confirmPass}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all press-effect disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #1957A6, #267A8C)" }}
          >
            {loadingPass ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Actualizando...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Actualizar contraseña
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
