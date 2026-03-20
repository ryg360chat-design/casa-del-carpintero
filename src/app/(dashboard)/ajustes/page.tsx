import { createClient } from "@/lib/supabase/server";
import MaquinaToggle from "@/components/MaquinaToggle";
import CopiarLink from "./CopiarLink";

export default async function AjustesPage() {
  const supabase = await createClient();

  const { data: maquinas } = await supabase.from("maquinas").select("*").order("id");

  return (
    <div className="p-8 flex flex-col items-center min-h-full" style={{ background: "linear-gradient(160deg, rgba(226,232,240,0.45) 0%, rgba(244,244,245,0) 32%)" }}>
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900">Ajustes</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Configuración del sistema y del taller</p>
        </div>

        <div className="flex flex-col gap-5">
          {/* Máquinas */}
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <div className="px-5 pt-5 pb-3 border-b border-zinc-100">
              <h2 className="font-bold text-zinc-900 text-sm uppercase tracking-wide">Máquinas</h2>
              <p className="text-zinc-500 text-xs mt-0.5">Activá o desactivá las máquinas de corte</p>
            </div>
            <div className="px-5 divide-y divide-zinc-50">
              {(maquinas ?? []).map((m: { id: string; nombre: string; activa: boolean }) => (
                <MaquinaToggle
                  key={m.id}
                  id={m.id}
                  nombre={m.nombre}
                  activaInicial={m.activa}
                />
              ))}
            </div>
          </div>

          {/* Link para clientes */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <h2 className="font-bold text-zinc-900 text-sm uppercase tracking-wide mb-1">Link para clientes</h2>
            <p className="text-zinc-500 text-xs mb-4">
              Compartí este link para que tus clientes puedan ver el estado de su pedido. No requiere contraseña.
            </p>
            <CopiarLink />
          </div>

          {/* Versión */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-zinc-900 text-sm uppercase tracking-wide">Sistema</h2>
                <p className="text-zinc-500 text-xs mt-0.5">Casa del Carpintero — Gestión de producción</p>
              </div>
              <span className="text-xs font-bold bg-zinc-900 text-white px-2.5 py-1 rounded-full tracking-widest">
                BETA
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-50 flex flex-col gap-2">
              {[
                { label: "Versión", value: "0.5.0 — pre-alpha" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-zinc-500">{label}</span>
                  <span className="font-semibold text-zinc-700">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
