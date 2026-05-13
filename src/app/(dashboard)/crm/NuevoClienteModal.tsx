"use client";

import { useState, useTransition } from "react";
import { crearCliente } from "./actions";
import { useRouter } from "next/navigation";

export default function NuevoClienteModal() {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function reset() {
    setNombre(""); setTelefono(""); setEmail(""); setError("");
  }

  function handleClose() {
    reset();
    setOpen(false);
  }

  function handleSubmit() {
    if (!nombre.trim()) { setError("El nombre es obligatorio"); return; }
    setError("");
    startTransition(async () => {
      const result = await crearCliente({ nombre: nombre.trim(), telefono: telefono.trim(), email: email.trim() });
      if (result.error) { setError(result.error); return; }
      handleClose();
      router.refresh();
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition-colors"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M12 5v14"/>
        </svg>
        Nuevo cliente
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-900">Nuevo cliente</h2>
              <button onClick={handleClose} className="text-zinc-400 hover:text-zinc-700 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-600 block mb-1">Nombre *</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Ej: Muebles del Valle"
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-600 block mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={e => setTelefono(e.target.value)}
                  placeholder="Ej: 0991234567"
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-600 block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Ej: contacto@mueblesdelvalle.com"
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-sm font-medium border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="flex-1 px-4 py-2 text-sm font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                {isPending ? "Guardando..." : "Crear cliente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
