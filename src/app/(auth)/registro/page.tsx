"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegistroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "success">("form");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        org_nombre: form.get("org_nombre"),
        nombre:     form.get("nombre"),
        email:      form.get("email"),
        password:   form.get("password"),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Error al registrar. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    setStep("success");
    setLoading(false);
    setTimeout(() => router.push("/login"), 3000);
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-zinc-900 rounded-2xl border border-zinc-800 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">¡Taller creado!</h2>
          <p className="text-zinc-400 text-sm mb-1">Tu trial de 14 días comienza ahora.</p>
          <p className="text-zinc-500 text-xs">Redirigiendo al login…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
              <span className="text-white font-black text-[14px]">K</span>
            </div>
            <span className="text-white text-2xl font-light tracking-tight">Kuadra</span>
          </div>
          <p className="text-zinc-400 text-sm">Sistema de gestión para talleres de corte</p>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-white mb-1">Registra tu taller</h1>
            <p className="text-zinc-400 text-sm">14 días gratis · Sin tarjeta de crédito</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-widest mb-1.5">
                Nombre del taller
              </label>
              <input
                name="org_nombre"
                type="text"
                required
                placeholder="Ej: Talleres Rodríguez"
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3.5 py-2.5 placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-widest mb-1.5">
                Tu nombre
              </label>
              <input
                name="nombre"
                type="text"
                required
                placeholder="Nombre completo"
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3.5 py-2.5 placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-widest mb-1.5">
                Correo electrónico
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="tu@correo.com"
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3.5 py-2.5 placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-widest mb-1.5">
                Contraseña
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="Mínimo 8 caracteres"
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3.5 py-2.5 placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 rounded-lg transition-colors mt-2"
            >
              {loading ? "Creando taller…" : "Empezar 14 días gratis →"}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-500 mt-5">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-zinc-300 hover:text-white transition-colors">
              Iniciar sesión
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-4">
          Al registrarte aceptas los términos de servicio de Kuadra · RyG SaaS
        </p>
      </div>
    </div>
  );
}
