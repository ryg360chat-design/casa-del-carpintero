"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function RegistroContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Sin token → mostrar página cerrada (no el formulario)
  if (!token) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-black text-[15px]">K</span>
          </div>
          <h1 className="text-white text-xl font-semibold mb-3">Kuadra</h1>
          <p className="text-zinc-400 text-sm mb-6">
            El registro está disponible solo por invitación.<br />
            Contactanos para solicitar acceso a tu taller.
          </p>
          <a
            href="https://wa.me/593999999999?text=Hola,%20quiero%20registrar%20mi%20taller%20en%20Kuadra"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.862L.057 23.527a.5.5 0 0 0 .609.61l5.805-1.525A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.7-.505-5.25-1.385l-.376-.214-3.899 1.023 1.023-3.751-.232-.386A9.945 9.945 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
            Solicitar acceso por WhatsApp
          </a>
          <p className="text-zinc-600 text-xs mt-4">
            ¿Tienes un enlace de invitación?{" "}
            <Link href="/login" className="text-zinc-400 hover:text-white transition-colors">Iniciar sesión</Link>
          </p>
        </div>
      </div>
    );
  }

  if (done) {
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
        token,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Error al registrar. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/login"), 2500);
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
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
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-widest mb-1.5">Nombre del taller</label>
              <input name="org_nombre" type="text" required placeholder="Ej: Talleres Rodríguez"
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3.5 py-2.5 placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-widest mb-1.5">Tu nombre</label>
              <input name="nombre" type="text" required placeholder="Nombre completo"
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3.5 py-2.5 placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-widest mb-1.5">Correo electrónico</label>
              <input name="email" type="email" required placeholder="tu@correo.com"
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3.5 py-2.5 placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-widest mb-1.5">Contraseña</label>
              <input name="password" type="password" required minLength={8} placeholder="Mínimo 8 caracteres"
                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3.5 py-2.5 placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition" />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 rounded-lg transition-colors mt-2">
              {loading ? "Creando taller…" : "Empezar 14 días gratis →"}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-500 mt-5">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-zinc-300 hover:text-white transition-colors">Iniciar sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegistroPage() {
  return (
    <Suspense>
      <RegistroContent />
    </Suspense>
  );
}
