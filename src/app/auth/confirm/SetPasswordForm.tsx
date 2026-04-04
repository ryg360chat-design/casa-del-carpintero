"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function validatePassword(pwd: string): string | null {
  if (pwd.length < 8) return "La contraseña debe tener al menos 8 caracteres";
  if (!/[A-Z]/.test(pwd)) return "Debe incluir al menos una letra mayúscula";
  if (!/[0-9]/.test(pwd)) return "Debe incluir al menos un número";
  return null;
}

const INPUT = "w-full pl-9 pr-10 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
const LABEL = "block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5";

export default function SetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validErr = validatePassword(password);
    if (validErr) { setError(validErr); return; }
    if (password !== confirm) { setError("Las contraseñas no coinciden"); return; }

    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError("No se pudo guardar la contraseña. El link puede haber expirado.");
      setLoading(false);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p className="font-bold text-zinc-900">¡Contraseña creada!</p>
        <p className="text-sm text-zinc-500">Redirigiendo al panel...</p>
      </div>
    );
  }

  const strength = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
  ].filter(Boolean).length;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={LABEL}>Nueva contraseña</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <input
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            placeholder="Mínimo 8 caracteres"
            required
            className={INPUT}
          />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
            {showPass
              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            }
          </button>
        </div>

        {/* Strength indicator */}
        {password.length > 0 && (
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
        )}
        <div className="mt-2 flex flex-col gap-0.5">
          {[
            { ok: password.length >= 8, text: "Al menos 8 caracteres" },
            { ok: /[A-Z]/.test(password), text: "Una letra mayúscula" },
            { ok: /[0-9]/.test(password), text: "Un número" },
          ].map(({ ok, text }) => (
            <p key={text} className={`text-[11px] flex items-center gap-1.5 ${ok ? "text-emerald-600" : "text-zinc-400"}`}>
              <span>{ok ? "✓" : "·"}</span> {text}
            </p>
          ))}
        </div>
      </div>

      <div>
        <label className={LABEL}>Confirmar contraseña</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <input
            type={showPass ? "text" : "password"}
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setError(""); }}
            placeholder="Repetí la contraseña"
            required
            className={INPUT + (confirm && confirm !== password ? " border-red-300 focus:ring-red-400" : "")}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-xl">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || strength < 3 || !confirm}
        className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all press-effect disabled:opacity-40 flex items-center justify-center gap-2 mt-1"
        style={{ background: "linear-gradient(135deg, #1957A6, #267A8C)" }}
      >
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
            Crear contraseña y entrar
          </>
        )}
      </button>
    </form>
  );
}
