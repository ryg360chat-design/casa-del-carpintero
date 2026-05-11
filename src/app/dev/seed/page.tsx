"use client";

import { useState } from "react";

const SECRET = "kuadra_seed_2026";

export default function SeedPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "exists" | "error">("idle");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  async function runSeed() {
    setStatus("loading");
    setResult(null);
    const res = await fetch(`/api/dev/seed?secret=${SECRET}`, { method: "POST" });
    const data = await res.json();
    setResult(data);
    if (res.status === 409) setStatus("exists");
    else if (res.ok) setStatus("ok");
    else setStatus("error");
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-zinc-900 rounded-2xl border border-zinc-800 p-8">
        <h1 className="text-white text-xl font-bold mb-2">Seed — Demo Taller</h1>
        <p className="text-zinc-400 text-sm mb-6">
          Crea la organización demo con máquinas, clientes y pedidos de ejemplo.
          Solo funciona una vez.
        </p>

        {status === "idle" && (
          <button
            onClick={runSeed}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            Crear datos demo
          </button>
        )}

        {status === "loading" && (
          <div className="text-zinc-400 text-sm text-center py-4">Creando datos…</div>
        )}

        {status === "ok" && result && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
              <svg className="w-5 h-5 text-green-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span className="text-green-400 text-sm font-medium">Demo creado con éxito</span>
            </div>

            <div className="bg-zinc-800 rounded-xl px-4 py-3 space-y-1">
              <p className="text-zinc-300 text-sm font-semibold mb-2">Credenciales para login:</p>
              <p className="text-zinc-400 text-sm">Email: <span className="text-white font-mono">demo@kuadra.app</span></p>
              <p className="text-zinc-400 text-sm">Contraseña: <span className="text-white font-mono">kuadra2026</span></p>
            </div>

            {typeof result === "object" && result !== null && "datos_creados" in result && (
              <div className="bg-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-400 space-y-1">
                <p>Máquinas: <span className="text-white">{(result.datos_creados as Record<string, number>).maquinas}</span></p>
                <p>Clientes: <span className="text-white">{(result.datos_creados as Record<string, number>).clientes}</span></p>
                <p>Pedidos: <span className="text-white">{(result.datos_creados as Record<string, number>).pedidos}</span></p>
              </div>
            )}

            <a
              href="/login"
              className="block w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg transition-colors text-center"
            >
              Ir al login →
            </a>
          </div>
        )}

        {status === "exists" && (
          <div className="space-y-4">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 text-yellow-400 text-sm">
              El demo ya existe. Inicia sesión directamente.
            </div>
            <div className="bg-zinc-800 rounded-xl px-4 py-3 space-y-1">
              <p className="text-zinc-400 text-sm">Email: <span className="text-white font-mono">demo@kuadra.app</span></p>
              <p className="text-zinc-400 text-sm">Contraseña: <span className="text-white font-mono">kuadra2026</span></p>
            </div>
            <a
              href="/login"
              className="block w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg transition-colors text-center"
            >
              Ir al login →
            </a>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
              Error: {typeof result === "object" && result !== null && "error" in result ? String(result.error) : "Error desconocido"}
            </div>
            <button
              onClick={runSeed}
              className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
