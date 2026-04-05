"use client";

import { useState, useTransition } from "react";
import { cambiarRol, desactivarUsuario, type UserRole } from "./actions";

const ROLES: { value: UserRole; label: string; color: string }[] = [
  { value: "admin",      label: "Administrador",      color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: "ventas",     label: "Ventas",              color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "produccion", label: "Jefe de Producción",  color: "bg-violet-100 text-violet-700 border-violet-200" },
  { value: "almacenes",  label: "Almacenes",           color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { value: "viewer",     label: "Visualizador",        color: "bg-zinc-100 text-zinc-500 border-zinc-200" },
  { value: "developer",  label: "Desarrollador",       color: "bg-zinc-900 text-white border-zinc-700" },
];

export function RolBadge({ rol }: { rol: string }) {
  const found = ROLES.find(r => r.value === rol);
  const color = found?.color ?? "bg-zinc-100 text-zinc-500 border-zinc-200";
  const label = found?.label ?? rol;
  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${color}`}>
      {label}
    </span>
  );
}

export function RolSelector({
  userId,
  rolActual,
  esSelf,
  esBaneado,
  canAssignDeveloper,
}: {
  userId: string;
  rolActual: UserRole;
  esSelf: boolean;
  esBaneado: boolean;
  canAssignDeveloper: boolean;
}) {
  const [rol, setRol] = useState<UserRole>(rolActual);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const rolesVisibles = canAssignDeveloper ? ROLES : ROLES.filter(r => r.value !== "developer");

  function handleChange(nuevoRol: UserRole) {
    if (nuevoRol === rol) return;
    setError("");
    setSuccess(false);
    const prev = rol;
    setRol(nuevoRol); // optimistic
    startTransition(async () => {
      const res = await cambiarRol(userId, nuevoRol);
      if (res.error) {
        setRol(prev); // revert
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      }
    });
  }

  if (esSelf) {
    return <RolBadge rol={rol} />;
  }

  return (
    <div className="flex flex-col gap-1 items-end">
      <div className="relative">
        <select
          value={rol}
          onChange={(e) => handleChange(e.target.value as UserRole)}
          disabled={isPending || esBaneado}
          className="text-xs font-semibold pr-7 pl-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40 appearance-none cursor-pointer transition-colors hover:border-zinc-300"
        >
          {rolesVisibles.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400">
          {isPending ? (
            <svg className="animate-spin" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          )}
        </span>
      </div>
      {error && <p className="text-[10px] text-red-500 font-medium">{error}</p>}
      {success && <p className="text-[10px] text-emerald-600 font-medium">✓ Guardado</p>}
    </div>
  );
}

export function BanToggle({
  userId,
  esBaneado,
  esSelf,
}: {
  userId: string;
  esBaneado: boolean;
  esSelf: boolean;
}) {
  const [baneado, setBaneado] = useState(esBaneado);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  if (esSelf) return null;

  function handleToggle() {
    setError("");
    const prev = baneado;
    setBaneado(!baneado);
    startTransition(async () => {
      const res = await desactivarUsuario(userId, !prev);
      if (res.error) {
        setBaneado(prev);
        setError(res.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors disabled:opacity-40 ${
          baneado
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
            : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
        }`}
      >
        {isPending ? "..." : baneado ? "Reactivar" : "Desactivar"}
      </button>
      {error && <p className="text-[10px] text-red-500">{error}</p>}
    </div>
  );
}
