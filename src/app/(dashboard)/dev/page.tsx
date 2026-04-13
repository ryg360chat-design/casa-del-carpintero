import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserRole, IS_DEVELOPER } from "@/lib/auth";

export default async function DevPage() {
  const role = await getUserRole();
  if (!IS_DEVELOPER.includes(role)) redirect("/dashboard");

  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  const ahora = new Date();
  const hoyStart = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()).toISOString();
  const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const hace1h  = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const [
    { count: totalPedidos },
    { count: pedidosHoy },
    { count: totalClientes },
    { count: enCola },
    { count: enCorte },
    { count: enTapacantos },
    { count: listos },
    { data: maquinas },
    { data: perfiles },
    { data: authUsers },
  ] = await Promise.all([
    admin.from("pedidos").select("*", { count: "exact", head: true }),
    admin.from("pedidos").select("*", { count: "exact", head: true }).gte("fecha_ingreso", hoyStart),
    admin.from("clientes").select("*", { count: "exact", head: true }),
    admin.from("pedidos").select("*", { count: "exact", head: true }).eq("estado", "En cola"),
    admin.from("pedidos").select("*", { count: "exact", head: true }).eq("estado", "En corte"),
    admin.from("pedidos").select("*", { count: "exact", head: true }).eq("estado", "En tapacantos"),
    admin.from("pedidos").select("*", { count: "exact", head: true }).eq("estado", "Listo"),
    admin.from("maquinas").select("id, nombre, activa"),
    admin.from("profiles").select("id, nombre, rol, created_at").order("created_at"),
    admin.auth.admin.listUsers({ perPage: 200 }),
  ]);

  // Cruzar auth users con perfiles para saber último acceso
  const authMap = Object.fromEntries(
    (authUsers?.users ?? []).map(u => [u.id, u])
  );

  const usuariosConAcceso = (perfiles ?? []).map(p => ({
    ...p,
    email: authMap[p.id]?.email ?? "—",
    ultimoAcceso: authMap[p.id]?.last_sign_in_at ?? null,
    activo1h:  !!authMap[p.id]?.last_sign_in_at && authMap[p.id]!.last_sign_in_at! > hace1h,
    activo24h: !!authMap[p.id]?.last_sign_in_at && authMap[p.id]!.last_sign_in_at! > hace24h,
  }));

  const activosAhora = usuariosConAcceso.filter(u => u.activo1h).length;
  const activos24h   = usuariosConAcceso.filter(u => u.activo24h).length;

  // GitHub commits (repo público, sin token)
  type GitHubCommit = {
    sha: string;
    commit: { message: string; author: { name: string; date: string } };
    html_url: string;
  };
  let commits: GitHubCommit[] = [];
  try {
    const res = await fetch(
      "https://api.github.com/repos/ryg360chat-design/casa-del-carpintero/commits?per_page=15",
      { next: { revalidate: 300 }, headers: { Accept: "application/vnd.github.v3+json" } }
    );
    if (res.ok) commits = await res.json() as GitHubCommit[];
  } catch { /* ignora errores de red */ }

  const envVars = [
    { key: "NEXT_PUBLIC_SUPABASE_URL",      present: !!process.env.NEXT_PUBLIC_SUPABASE_URL },
    { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", present: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
    { key: "SUPABASE_SERVICE_ROLE_KEY",     present: !!process.env.SUPABASE_SERVICE_ROLE_KEY },
    { key: "NEXT_PUBLIC_SITE_URL",          present: !!process.env.NEXT_PUBLIC_SITE_URL },
    { key: "HUB_API_SECRET",               present: !!process.env.HUB_API_SECRET },
  ];

  function fmtRelative(iso?: string | null) {
    if (!iso) return "Nunca";
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 2)  return "Ahora mismo";
    if (mins < 60) return `Hace ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `Hace ${hrs}h`;
    return `Hace ${Math.floor(hrs / 24)}d`;
  }

  const CARD = "bg-white border border-zinc-200 rounded-2xl p-5";
  const LABEL = "text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3";

  type MaquinaRow = { id: string; nombre: string; activa: boolean };
  type PerfilRow  = { id: string; nombre: string | null; rol: string; created_at: string; email: string; ultimoAcceso: string | null; activo1h: boolean; activo24h: boolean };

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: "linear-gradient(135deg,#18181b,#3f3f46)" }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Panel de Desarrollador</h1>
          <p className="text-xs text-zinc-400">Vista privada · Solo accesible con rol <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-700">developer</code> (asignado directamente en BD)</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-zinc-400">{ahora.toLocaleString("es-PE", { timeZone: "America/Lima" })}</p>
          <p className="text-[10px] text-zinc-300">America/Lima</p>
        </div>
      </div>

      {/* Sesión activa */}
      <div className={CARD}>
        <p className={LABEL}>Sesión activa</p>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div><p className="text-zinc-400 text-xs mb-0.5">Email</p><p className="font-semibold text-zinc-800">{user?.email}</p></div>
          <div><p className="text-zinc-400 text-xs mb-0.5">UID</p><code className="text-zinc-600 text-xs break-all">{user?.id}</code></div>
          <div><p className="text-zinc-400 text-xs mb-0.5">Rol</p><span className="bg-zinc-900 text-white text-xs font-bold px-2 py-0.5 rounded-full">{role}</span></div>
        </div>
      </div>

      {/* Stats operacionales */}
      <div>
        <p className={LABEL}>Sistema — ahora mismo</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Usuarios activos (1h)",  value: activosAhora, color: "text-emerald-600", dot: "bg-emerald-500 animate-pulse" },
            { label: "Activos hoy (24h)",       value: activos24h,   color: "text-blue-600",    dot: "bg-blue-400" },
            { label: "Pedidos en producción",   value: (enCola ?? 0) + (enCorte ?? 0) + (enTapacantos ?? 0) + (listos ?? 0), color: "text-violet-600", dot: null },
            { label: "Pedidos hoy",             value: pedidosHoy ?? 0, color: "text-zinc-700", dot: null },
          ].map(({ label, value, color, dot }) => (
            <div key={label} className={CARD + " flex flex-col gap-2"}>
              <div className="flex items-center gap-1.5">
                {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />}
                <p className="text-[11px] text-zinc-400 font-medium leading-tight">{label}</p>
              </div>
              <p className={`text-3xl font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cola de producción */}
      <div className={CARD}>
        <p className={LABEL}>Cola de producción</p>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "En cola",       value: enCola ?? 0,       color: "bg-zinc-100 text-zinc-700" },
            { label: "En corte",      value: enCorte ?? 0,      color: "bg-zinc-800 text-white" },
            { label: "En tapacantos", value: enTapacantos ?? 0, color: "bg-zinc-600 text-white" },
            { label: "Listos",        value: listos ?? 0,       color: "bg-emerald-100 text-emerald-700" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-xl p-3 text-center ${color}`}>
              <p className="text-2xl font-black">{value}</p>
              <p className="text-[10px] font-semibold mt-0.5 opacity-70">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Máquinas */}
      <div className={CARD}>
        <p className={LABEL}>Estado de máquinas</p>
        <div className="flex gap-3">
          {(maquinas as MaquinaRow[] ?? []).map(m => (
            <div key={m.id} className={`flex-1 rounded-xl border p-3 flex items-center gap-2.5 ${m.activa ? "border-emerald-200 bg-emerald-50" : "border-zinc-200 bg-zinc-50"}`}>
              <span className={`w-2 h-2 rounded-full shrink-0 ${m.activa ? "bg-emerald-500 animate-pulse" : "bg-zinc-300"}`} />
              <div>
                <p className="text-sm font-bold text-zinc-800">{m.nombre}</p>
                <p className={`text-[10px] font-semibold ${m.activa ? "text-emerald-600" : "text-zinc-400"}`}>{m.activa ? "Operativa" : "Inactiva"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Todos los usuarios (incluye developer) */}
      <div className={CARD}>
        <p className={LABEL}>Todos los usuarios ({usuariosConAcceso.length})</p>
        <div className="flex flex-col divide-y divide-zinc-100">
          {(usuariosConAcceso as PerfilRow[]).map(u => (
            <div key={u.id} className="py-2.5 flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${u.rol === "developer" ? "bg-zinc-900 text-white" : "bg-zinc-200 text-zinc-600"}`}>
                {(u.nombre ?? u.email)[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-zinc-800 truncate">{u.nombre ?? "—"}</p>
                  {u.activo1h  && <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">ACTIVO</span>}
                  {u.activo24h && !u.activo1h && <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">HOY</span>}
                </div>
                <p className="text-[10px] text-zinc-400 truncate">{u.email}</p>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.rol === "developer" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"}`}>{u.rol}</span>
                <p className="text-[10px] text-zinc-400 mt-0.5">{fmtRelative(u.ultimoAcceso)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DB stats */}
      <div className={CARD}>
        <p className={LABEL}>Base de datos</p>
        <div className="grid grid-cols-3 gap-4 text-sm">
          {[
            { label: "Total pedidos", value: totalPedidos ?? 0 },
            { label: "Total clientes", value: totalClientes ?? 0 },
            { label: "Total usuarios", value: usuariosConAcceso.length },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-zinc-400 text-xs mb-0.5">{label}</p>
              <p className="text-2xl font-black text-zinc-900">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Variables de entorno */}
      <div className={CARD}>
        <p className={LABEL}>Variables de entorno</p>
        <div className="flex flex-col gap-2">
          {envVars.map(({ key, present }) => (
            <div key={key} className="flex items-center justify-between">
              <code className="text-zinc-700 text-xs bg-zinc-50 px-2 py-1 rounded border border-zinc-200">{key}</code>
              {present
                ? <span className="flex items-center gap-1.5 text-emerald-600 font-semibold text-xs"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Configurada</span>
                : <span className="flex items-center gap-1.5 text-red-500 font-semibold text-xs"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />FALTANTE</span>
              }
            </div>
          ))}
        </div>
      </div>

      {/* Changelog — commits de GitHub */}
      <div className={CARD}>
        <div className="flex items-center justify-between mb-3">
          <p className={LABEL + " mb-0"}>Changelog · últimos commits</p>
          <a
            href="https://github.com/ryg360chat-design/casa-del-carpintero/commits"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-zinc-400 hover:text-zinc-600 transition-colors font-mono"
          >
            ryg360chat-design/casa-del-carpintero ↗
          </a>
        </div>

        {commits.length === 0 ? (
          <p className="text-xs text-zinc-400 italic">Sin datos del repositorio.</p>
        ) : (
          <div className="flex flex-col">
            {commits.map((c, i) => {
              const [title, ...bodyLines] = c.commit.message.split("\n");
              const extras = bodyLines.filter(l => l.trim());
              return (
                <div key={c.sha} className="flex gap-3">
                  {/* línea de tiempo */}
                  <div className="flex flex-col items-center shrink-0 pt-1">
                    <div className="w-2 h-2 rounded-full bg-zinc-700 shrink-0" />
                    {i < commits.length - 1 && <div className="w-px flex-1 bg-zinc-100 my-1" />}
                  </div>

                  {/* contenido */}
                  <div className={`flex-1 min-w-0 ${i < commits.length - 1 ? "pb-3.5" : ""}`}>
                    <div className="flex items-start justify-between gap-2">
                      <a
                        href={c.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-zinc-800 hover:text-zinc-500 transition-colors leading-snug"
                      >
                        {title.length > 80 ? title.slice(0, 80) + "…" : title}
                      </a>
                      <span className="text-[10px] text-zinc-400 shrink-0 mt-0.5 whitespace-nowrap">
                        {fmtRelative(c.commit.author.date)}
                      </span>
                    </div>

                    {extras.length > 0 && (
                      <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed line-clamp-2">
                        {extras.slice(0, 2).join(" · ")}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-0.5">
                      <code className="text-[10px] text-zinc-300 font-mono">{c.sha.slice(0, 7)}</code>
                      <span className="text-[10px] text-zinc-300">·</span>
                      <span className="text-[10px] text-zinc-400">{c.commit.author.name}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
