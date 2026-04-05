import { createClient } from "@/lib/supabase/server";
import CalendarioInteractivo from "@/components/CalendarioInteractivo";
import { TZ, limaTodayKey } from "@/lib/time";

type Pedido = Record<string, unknown>;

function limaDateKey(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString("en-CA", { timeZone: TZ });
}

export default async function CalendarioPage() {
  const supabase = await createClient();

  const todayStr = limaTodayKey();
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const mananaStr = tomorrowDate.toLocaleDateString("en-CA", { timeZone: TZ });

  const [{ data: pedidos }, { data: sinFecha }] = await Promise.all([
    supabase
      .from("pedidos")
      .select("*, cliente:clientes(nombre)")
      .not("estado", "in", '("Cancelado")')
      .not("fecha_entrega_estimada", "is", null)
      .order("fecha_entrega_estimada", { ascending: true })
      .limit(200),
    supabase
      .from("pedidos")
      .select("*, cliente:clientes(nombre)")
      .not("estado", "in", '("Listo","Cancelado")')
      .is("fecha_entrega_estimada", null)
      .order("fecha_ingreso", { ascending: true })
      .limit(100),
  ]);

  // Agrupar por fecha Lima (no slice de UTC)
  const grupos: Record<string, Pedido[]> = {};
  for (const p of pedidos ?? []) {
    const key = limaDateKey(p.fecha_entrega_estimada as string);
    if (!grupos[key]) grupos[key] = [];
    grupos[key]!.push(p as Pedido);
  }

  const totalPendientes = (pedidos ?? []).filter((p: Pedido) => !["Listo", "Cancelado"].includes(p.estado as string)).length;
  const listosHoy = (pedidos ?? []).filter((p: Pedido) =>
    limaDateKey(p.fecha_entrega_estimada as string) === todayStr && p.estado === "Listo"
  ).length;
  const entregasHoy    = (grupos[todayStr]  ?? []).filter((p: Pedido) => !["Listo", "Cancelado"].includes(p.estado as string)).length;
  const entregasManana = (grupos[mananaStr] ?? []).filter((p: Pedido) => !["Listo", "Cancelado"].includes(p.estado as string)).length;

  return (
    <div className="p-8 min-h-full" style={{ background: "linear-gradient(160deg, rgba(237,233,254,0.45) 0%, rgba(244,244,245,0) 32%)" }}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Calendario de Entregas</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Pedidos organizados por fecha estimada de entrega</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          { label: "Pendientes",       value: totalPendientes },
          { label: "Entregan hoy",     value: entregasHoy },
          { label: "Listos hoy",       value: listosHoy },
          { label: "Entregan mañana",  value: entregasManana },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-zinc-200 rounded-xl px-5 py-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">{label}</p>
            <p className="text-3xl font-bold text-zinc-900 mt-1 tabular-nums">{String(value).padStart(2, "0")}</p>
          </div>
        ))}
      </div>

      <CalendarioInteractivo
        grupos={grupos}
        sinFecha={(sinFecha ?? []) as Pedido[]}
        todayStr={todayStr}
      />
    </div>
  );
}
