"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || cooldown > 0) return;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError("No se pudo enviar el email. Intentá nuevamente.");
      setLoading(false);
      return;
    }
    setSent(true);
    setLoading(false);
    // 60s cooldown para prevenir spam
    let remaining = 60;
    setCooldown(remaining);
    const interval = setInterval(() => {
      remaining -= 1;
      setCooldown(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#fafaf9" }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm shrink-0"
            style={{ background: "linear-gradient(135deg, #1957A6, #267A8C)" }}>
            <span className="text-white font-black text-[13px] tracking-tight">CC</span>
          </div>
          <div>
            <p className="font-bold text-zinc-900 text-sm leading-tight">Casa del Carpintero</p>
            <p className="text-[10px] text-zinc-400">Production OS</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-zinc-900 text-base">Email enviado</p>
                <p className="text-sm text-zinc-500 mt-1">
                  Si <span className="font-semibold text-zinc-700">{email}</span> está registrado, recibirás un link para restablecer tu contraseña.
                </p>
              </div>
              <p className="text-xs text-zinc-400 mt-2">Revisá también tu carpeta de spam. El link expira en 1 hora.</p>
              <Link href="/login"
                className="mt-2 text-sm font-semibold"
                style={{ color: "#1957A6" }}>
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight">¿Olvidaste tu contraseña?</h1>
                <p className="text-zinc-500 text-sm mt-1">Ingresá tu email y te mandamos un link para restablecerla.</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="20" height="16" x="2" y="4" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      placeholder="nombre@empresa.com"
                      required
                      className="w-full pl-9 pr-3 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                  disabled={loading || !email.trim() || cooldown > 0}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all press-effect disabled:opacity-40 flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #1957A6, #267A8C)" }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      Enviando...
                    </>
                  ) : cooldown > 0 ? (
                    `Esperá ${cooldown}s para reenviar`
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                      Enviar link de recuperación
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-zinc-400 mt-6">
          <Link href="/login" className="font-semibold hover:text-zinc-700 transition-colors" style={{ color: "#1957A6" }}>
            ← Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
