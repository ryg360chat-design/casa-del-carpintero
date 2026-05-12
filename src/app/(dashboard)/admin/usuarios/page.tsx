import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserRole, IS_ADMIN, IS_DEVELOPER } from "@/lib/auth";
import { getOrganization } from "@/lib/org";
import { RolSelector, BanToggle, RolBadge } from "./RolSelector";
import type { UserRole } from "./actions";

const ROLE_COLOR: Record<string, string> = {
  developer:        "bg-zinc-900 text-white border-zinc-700",
  admin:            "bg-orange-100 text-orange-700 border-orange-200",
  gerencia:         "bg-red-100 text-red-700 border-red-200",
  administracion:   "bg-amber-100 text-amber-700 border-amber-200",
  ventas:           "bg-blue-100 text-blue-700 border-blue-200",
  logistica:        "bg-cyan-100 text-cyan-700 border-cyan-200",
  produccion:       "bg-violet-100 text-violet-700 border-violet-200",
  almacen_tableros: "bg-green-100 text-green-700 border-green-200",
  almacen_cantos:   "bg-teal-100 text-teal-700 border-teal-200",
  corte_especial:   "bg-pink-100 text-pink-700 border-pink-200",
  almacenes:        "bg-yellow-100 text-yellow-700 border-yellow-200",
  viewer:           "bg-zinc-100 text-zinc-500 border-zinc-200",
};

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "America/Lima",
  });
}

function fmtRelative(iso?: string | null) {
  if (!iso) return "Nunca";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "Hace un momento";
  if (mins < 60) return `Hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `Hace ${days}d`;
  return fmtDate(iso);
}

export default async function UsuariosPage() {
  const role = await getUserRole();
  if (!IS_ADMIN.includes(role)) redirect("/dashboard");

  const supabase = await createClient();
  const [{ data: { user: me } }, org] = await Promise.all([
    supabase.auth.getUser(),
    getOrganization(),
  ]);
  const rolesNombres = org?.roles_nombres ?? {};

  const admin = createAdminClient();

  // Profiles filtrados por org via RLS (user client)
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, nombre, rol");

  const orgUserIds = new Set((profiles ?? []).map((p: { id: string }) => p.id));

  const profileMap = Object.fromEntries(
    (profiles ?? []).map((p: { id: string; nombre: string | null; rol: string }) => [p.id, p])
  );

  // Auth data solo para email/timestamps — filtramos a los de esta org
  const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });

  const usuarios = (authData?.users ?? []).filter(u => {
    if (!orgUserIds.has(u.id)) return false; // solo usuarios de esta org
    const perfil = profileMap[u.id];
    return perfil?.rol !== "developer"; // developer es invisible para el panel de admin
  }).map(u => ({
    id: u.id,
    email: u.email ?? "—",
    nombre: profileMap[u.id]?.nombre ?? null,
    rol: (profileMap[u.id]?.rol as UserRole) ?? "viewer",
    confirmado: !!u.confirmed_at,
    baneado: !!u.banned_until && new Date(u.banned_until) > new Date(),
    creadoEn: u.created_at,
    ultimoAcceso: u.last_sign_in_at,
  })).sort((a, b) => {
    // Ordenar: developer > admin > resto, luego por fecha de creación
    const ORDEN: Record<string, number> = {
      developer: 0, admin: 1, gerencia: 2, administracion: 3,
      ventas: 4, logistica: 5, produccion: 6,
      almacen_tableros: 7, almacen_cantos: 8, corte_especial: 9,
      almacenes: 10, viewer: 11,
    };
    const diff = (ORDEN[a.rol] ?? 9) - (ORDEN[b.rol] ?? 9);
    if (diff !== 0) return diff;
    return new Date(a.creadoEn).getTime() - new Date(b.creadoEn).getTime();
  });

  const canAssignDeveloper = IS_DEVELOPER.includes(role);

  // Estadísticas
  const statsRoles = usuarios.reduce<Record<string, number>>((acc, u) => {
    acc[u.rol] = (acc[u.rol] ?? 0) + 1;
    return acc;
  }, {});
  const activos   = usuarios.filter(u => !u.baneado && u.confirmado).length;
  const pendientes = usuarios.filter(u => !u.confirmado).length;
  const inactivos  = usuarios.filter(u => u.baneado).length;

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Usuarios</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{usuarios.length} cuentas registradas</p>
        </div>
        <a
          href="/admin/invitar"
          className="flex items-center gap-2 text-sm font-bold text-white px-4 py-2.5 rounded-xl transition-all"
          style={{ background: "linear-gradient(135deg, #1957A6, #267A8C)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Invitar usuario
        </a>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Activos",    value: activos,   color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
          { label: "Pendientes", value: pendientes, color: "text-amber-600",   bg: "bg-amber-50 border-amber-100" },
          { label: "Inactivos",  value: inactivos,  color: "text-red-500",     bg: "bg-red-50 border-red-100" },
          { label: "Total",      value: usuarios.length, color: "text-zinc-700", bg: "bg-white border-zinc-200" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} border rounded-xl p-4 flex flex-col gap-1`}>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Distribución de roles */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Distribución de roles</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(statsRoles).map(([r, count]) => (
            <div key={r} className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${ROLE_COLOR[r] ?? "bg-zinc-100 text-zinc-600 border-zinc-200"}`}>
              <span>{count}</span>
              <span className="opacity-70">·</span>
              <span>{rolesNombres[r] || r}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-100 bg-zinc-50/60">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Todos los usuarios</p>
        </div>

        <div className="divide-y divide-zinc-100">
          {usuarios.map(u => (
            <div key={u.id} className={`px-5 py-4 flex items-center gap-4 transition-colors hover:bg-zinc-50/60 ${u.baneado ? "opacity-50" : ""}`}>

              {/* Avatar */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-black ${
                u.baneado ? "bg-zinc-200 text-zinc-400" : "bg-gradient-to-br from-zinc-700 to-zinc-900 text-white"
              }`}>
                {(u.nombre ?? u.email)[0].toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-zinc-900 truncate">
                    {u.nombre ?? <span className="text-zinc-400 italic">Sin nombre</span>}
                  </p>
                  {u.id === me?.id && (
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded-full">Tú</span>
                  )}
                  {!u.confirmado && (
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-full">Pendiente</span>
                  )}
                  {u.baneado && (
                    <span className="text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-full">Desactivado</span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 truncate">{u.email}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  Registrado {fmtDate(u.creadoEn)} · Último acceso: {fmtRelative(u.ultimoAcceso)}
                </p>
              </div>

              {/* Rol actual (badge si es developer o self, selector si no) */}
              <div className="shrink-0">
                {u.rol === "developer" || u.id === me?.id
                  ? <RolBadge rol={u.rol} rolesNombres={rolesNombres} />
                  : (
                    <RolSelector
                      userId={u.id}
                      rolActual={u.rol}
                      esSelf={u.id === me?.id}
                      esBaneado={u.baneado}
                      canAssignDeveloper={canAssignDeveloper}
                      rolesNombres={rolesNombres}
                    />
                  )
                }
              </div>

              {/* Desactivar — oculto para developer */}
              <div className="shrink-0">
                {u.rol === "developer"
                  ? <div className="w-[88px]" />
                  : (
                    <BanToggle
                      userId={u.id}
                      esBaneado={u.baneado}
                      esSelf={u.id === me?.id}
                    />
                  )
                }
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
