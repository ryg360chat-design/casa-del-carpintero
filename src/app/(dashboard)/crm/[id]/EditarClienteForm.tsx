"use client";

import { useState, useTransition } from "react";
import { editarCliente } from "../actions";
import { useRouter } from "next/navigation";

type Props = {
  clienteId: string;
  nombre: string;
  telefono: string;
  email: string;
};

export default function EditarClienteForm({ clienteId, nombre, telefono, email }: Props) {
  const [editando, setEditando] = useState(false);
  const [vals, setVals] = useState({ nombre, telefono, email });
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleCancel() {
    setVals({ nombre, telefono, email });
    setError("");
    setEditando(false);
  }

  function handleSave() {
    if (!vals.nombre.trim()) { setError("El nombre es obligatorio"); return; }
    setError("");
    startTransition(async () => {
      const result = await editarCliente(clienteId, vals);
      if (result.error) { setError(result.error); return; }
      setEditando(false);
      router.refresh();
    });
  }

  if (!editando) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-zinc-900">{nombre}</h1>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-zinc-600">
            {telefono ? (
              <span className="flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.92a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                {telefono}
              </span>
            ) : <span className="text-zinc-400 italic text-xs">Sin teléfono</span>}
            {email ? (
              <span className="flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                {email}
              </span>
            ) : <span className="text-zinc-400 italic text-xs">Sin email</span>}
          </div>
        </div>
        <button
          onClick={() => setEditando(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-colors shrink-0"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Editar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-semibold text-zinc-600 block mb-1">Nombre *</label>
          <input
            type="text"
            value={vals.nombre}
            onChange={e => setVals(v => ({ ...v, nombre: e.target.value }))}
            className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            autoFocus
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-zinc-600 block mb-1">Teléfono</label>
          <input
            type="tel"
            value={vals.telefono}
            onChange={e => setVals(v => ({ ...v, telefono: e.target.value }))}
            className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-zinc-600 block mb-1">Email</label>
          <input
            type="email"
            value={vals.email}
            onChange={e => setVals(v => ({ ...v, email: e.target.value }))}
            className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>
      </div>
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      <div className="flex gap-2">
        <button onClick={handleCancel} className="px-3 py-1.5 text-xs font-medium border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 transition-colors">Cancelar</button>
        <button onClick={handleSave} disabled={isPending} className="px-3 py-1.5 text-xs font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50">
          {isPending ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
