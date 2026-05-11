"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetSuccess = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("reset") === "true";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Correo o contraseña incorrectos");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');
        .login-root { font-family: 'Inter', sans-serif; }
        .login-wordmark { font-family: 'Instrument Serif', serif; }
      `}</style>

      <div className="login-root min-h-screen flex" style={{ background: "#f3eee7" }}>

        {/* Panel izquierdo — editorial Kuadra */}
        <div className="hidden lg:flex flex-col w-[480px] shrink-0 p-12 justify-between"
          style={{ background: "#ffffff", borderRight: "1px solid rgba(26,23,20,0.10)" }}>

          {/* Logo */}
          <div>
            <div className="flex items-center gap-3 mb-12">
              <span className="login-wordmark text-2xl" style={{ color: "#1a1714" }}>Kuadra</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded"
                style={{ background: "#f3eee7", color: "#9a9490", border: "1px solid rgba(26,23,20,0.15)" }}>
                RYG · V2.4
              </span>
            </div>

            <div className="inline-flex items-center gap-2 mb-8 text-[11px] font-semibold"
              style={{ color: "#c8472a" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#c8472a" }} />
              Sistema activo · En vivo
            </div>

            <h1 className="login-wordmark text-4xl leading-tight mb-5" style={{ color: "#1a1714" }}>
              El taller que<br /><em style={{ color: "#c8472a" }}>sabe</em> lo que<br />está pasando.
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "#5a5450" }}>
              Gestión de pedidos, producción en tiempo real y trazabilidad total — todo en un solo lugar.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-auto mt-10">
            {[
              "Control de pedidos en tiempo real",
              "Dashboard por máquina y turno",
              "Reportes PDF automáticos",
            ].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-1 h-1 rounded-full" style={{ background: "#c8472a" }} />
                <span className="text-sm" style={{ color: "#5a5450" }}>{f}</span>
              </div>
            ))}
          </div>

          <p className="text-[11px] mt-12 pt-6" style={{ color: "#9a9490", borderTop: "1px solid rgba(26,23,20,0.10)" }}>
            © 2026 Kuadra · Sistema de gestión para talleres
          </p>
        </div>

        {/* Panel derecho — formulario */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-sm">

            {/* Logo mobile */}
            <div className="lg:hidden mb-10">
              <span className="login-wordmark text-2xl" style={{ color: "#1a1714" }}>Kuadra</span>
            </div>

            <h2 className="login-wordmark text-3xl mb-1" style={{ color: "#1a1714" }}>Bienvenido</h2>
            <p className="text-sm mb-8" style={{ color: "#9a9490" }}>Ingresa tus credenciales para acceder</p>

            {resetSuccess && (
              <div className="text-sm px-4 py-3 rounded-xl mb-4"
                style={{ background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" }}>
                Contraseña actualizada. Ya podés ingresar.
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest mb-2"
                  style={{ color: "#9a9490" }}>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nombre@empresa.com"
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "#ffffff",
                    border: "1px solid rgba(26,23,20,0.18)",
                    color: "#1a1714",
                  }}
                  onFocus={e => e.target.style.borderColor = "#c8472a"}
                  onBlur={e => e.target.style.borderColor = "rgba(26,23,20,0.18)"}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-semibold uppercase tracking-widest"
                    style={{ color: "#9a9490" }}>
                    Contraseña
                  </label>
                  <Link href="/auth/forgot" className="text-[11px] font-semibold transition-colors"
                    style={{ color: "#c8472a" }}>
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 pr-10 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: "#ffffff",
                      border: "1px solid rgba(26,23,20,0.18)",
                      color: "#1a1714",
                    }}
                    onFocus={e => e.target.style.borderColor = "#c8472a"}
                    onBlur={e => e.target.style.borderColor = "rgba(26,23,20,0.18)"}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "#9a9490" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {showPass
                        ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                      }
                    </svg>
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-sm px-4 py-3 rounded-xl text-center"
                  style={{ background: "rgba(200,71,42,0.08)", color: "#c8472a", border: "1px solid rgba(200,71,42,0.2)" }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all mt-1 flex items-center justify-center gap-2"
                style={{ background: loading ? "#e07b62" : "#c8472a" }}
              >
                {loading ? "Ingresando..." : <>Ingresar <span>→</span></>}
              </button>
            </form>

            <p className="text-center text-xs mt-6" style={{ color: "#9a9490" }}>
              ¿Necesitás acceso? Contactá al administrador del sistema.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
