import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole, IS_DEVELOPER } from "@/lib/auth";

export default async function DevPage() {
  const role = await getUserRole();
  if (!IS_DEVELOPER.includes(role)) redirect("/dashboard");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Conteos rápidos
  const [{ count: totalPedidos }, { count: pedidosHoy }, { count: totalClientes }, { data: usuarios }] = await Promise.all([
    supabase.from("pedidos").select("*", { count: "exact", head: true }),
    supabase.from("pedidos").select("*", { count: "exact", head: true })
      .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    supabase.from("clientes").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("id, nombre, rol, created_at").order("created_at"),
  ]);

  // Variables de entorno (solo presencia, nunca valores)
  const envVars = [
    { key: "NEXT_PUBLIC_SUPABASE_URL",    present: !!process.env.NEXT_PUBLIC_SUPABASE_URL },
    { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", present: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
    { key: "SUPABASE_SERVICE_ROLE_KEY",   present: !!process.env.SUPABASE_SERVICE_ROLE_KEY },
    { key: "NEXT_PUBLIC_SITE_URL",        present: !!process.env.NEXT_PUBLIC_SITE_URL },
  ];

  const CARD = "bg-white border border-zinc-200 rounded-2xl p-5";
  const SECTION_TITLE = "text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3";

  return (
    <div className="p-8 max-w-3xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#18181b,#3f3f46)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Panel de Desarrollador</h1>
          <p className="text-xs text-zinc-400">Solo visible para el rol <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-700">developer</code></p>
        </div>
      </div>

      {/* Variables de entorno */}
      <div className={CARD}>
        <p className={SECTION_TITLE}>Variables de entorno</p>
        <div className="flex flex-col gap-2">
          {envVars.map(({ key, present }) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <code className="text-zinc-700 text-xs bg-zinc-50 px-2 py-1 rounded border border-zinc-200">{key}</code>
              {present ? (
                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  Configurada
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-red-500 font-semibold text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                  FALTANTE
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pedidos total", value: totalPedidos ?? 0 },
          { label: "Pedidos hoy", value: pedidosHoy ?? 0 },
          { label: "Clientes", value: totalClientes ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className={CARD + " flex flex-col gap-1"}>
            <p className="text-xs text-zinc-400 font-medium">{label}</p>
            <p className="text-2xl font-black text-zinc-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Sesión activa */}
      <div className={CARD}>
        <p className={SECTION_TITLE}>Sesión activa</p>
        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex gap-2"><span className="text-zinc-400 w-20 shrink-0">Email</span><span className="text-zinc-800 font-medium">{user?.email}</span></div>
          <div className="flex gap-2"><span className="text-zinc-400 w-20 shrink-0">UID</span><code className="text-zinc-600 text-xs">{user?.id}</code></div>
          <div className="flex gap-2"><span className="text-zinc-400 w-20 shrink-0">Rol</span><span className="text-zinc-800 font-medium">{role}</span></div>
        </div>
      </div>

      {/* Usuarios registrados */}
      <div className={CARD}>
        <p className={SECTION_TITLE}>Usuarios registrados ({usuarios?.length ?? 0})</p>
        <div className="flex flex-col gap-2">
          {usuarios?.map((u: Record<string, unknown>) => (
            <div key={u.id as string} className="flex items-center justify-between text-sm py-1.5 border-b border-zinc-100 last:border-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-600">
                  {(u.nombre as string)?.[0]?.toUpperCase() ?? "?"}
                </div>
                <span className="text-zinc-700 truncate max-w-[200px]">{u.nombre as string}</span>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                u.rol === "developer" ? "bg-zinc-900 text-white" :
                u.rol === "admin"     ? "bg-orange-100 text-orange-700" :
                u.rol === "viewer"    ? "bg-zinc-100 text-zinc-500" :
                "bg-blue-50 text-blue-700"
              }`}>
                {u.rol as string}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
