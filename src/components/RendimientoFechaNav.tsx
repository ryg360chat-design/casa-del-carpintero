"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function RendimientoFechaNav({ todayLima }: { todayLima: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const fechaActual = params.get("fecha") ?? todayLima;

  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString("en-CA", { timeZone: "America/Lima" });
  });

  const DIAS_ES: Record<string, string> = {
    Mon: "Lun", Tue: "Mar", Wed: "Mié", Thu: "Jue",
    Fri: "Vie", Sat: "Sáb", Sun: "Dom",
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {dias.map((fecha) => {
        const d = new Date(`${fecha}T12:00:00-05:00`);
        const dayShort = d.toLocaleDateString("en-US", { weekday: "short" });
        const dayNum = d.toLocaleDateString("es", { day: "numeric", month: "numeric" });
        const label = fecha === todayLima ? "Hoy" : `${DIAS_ES[dayShort] ?? dayShort} ${dayNum}`;
        const isActive = fechaActual === fecha;
        return (
          <button
            key={fecha}
            onClick={() =>
              router.push(
                fecha === todayLima
                  ? "/produccion/rendimiento"
                  : `/produccion/rendimiento?fecha=${fecha}`
              )
            }
            className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all border ${
              isActive
                ? "bg-zinc-900 text-white border-zinc-900"
                : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400 hover:text-zinc-900"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
