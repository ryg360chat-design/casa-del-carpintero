"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

const PAGE_META: Record<string, { title: string; breadcrumb?: string }> = {
  "/dashboard":  { title: "Panel de Producción" },
  "/pedidos":    { title: "Pedidos", breadcrumb: "Gestión" },
  "/produccion": { title: "Producción", breadcrumb: "Gestión" },
  "/calendario": { title: "Calendario", breadcrumb: "Planificación" },
  "/ajustes":    { title: "Ajustes", breadcrumb: "Sistema" },
};

export default function TopBar({ canCreatePedido = true }: { canCreatePedido?: boolean }) {
  const pathname = usePathname();
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    function update() {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })
      );
    }
    update();
    const id = setInterval(update, 10000);
    return () => clearInterval(id);
  }, []);

  const meta = Object.entries(PAGE_META).find(([href]) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
  )?.[1];

  const isDetail = pathname.includes("/pedidos/") && pathname !== "/pedidos/nuevo";
  const isNuevo = pathname === "/pedidos/nuevo";

  return (
    <header className="h-[57px] glass-white border-b border-zinc-200/80 flex items-center px-6 gap-4 shrink-0 z-20">
      {/* Breadcrumb / page title */}
      <div className="flex items-center gap-2 min-w-0">
        {meta?.breadcrumb && (
          <>
            <span className="text-xs text-zinc-400 font-medium">{meta.breadcrumb}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </>
        )}
        {isDetail && (
          <>
            <Link href="/pedidos" className="text-xs text-zinc-400 font-medium hover:text-zinc-700 transition-colors">Pedidos</Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
            <span className="text-xs font-semibold text-zinc-700">Detalle</span>
          </>
        )}
        {isNuevo && (
          <>
            <Link href="/pedidos" className="text-xs text-zinc-400 font-medium hover:text-zinc-700 transition-colors">Pedidos</Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
            <span className="text-xs font-semibold text-zinc-700">Nuevo</span>
          </>
        )}
        {!isDetail && !isNuevo && (
          <span className="text-sm font-semibold text-zinc-800 truncate">
            {meta?.title ?? "Casa del Carpintero"}
          </span>
        )}
      </div>

      <div className="flex-1" />

      {/* Clock */}
      {time && (
        <div className="hidden sm:flex items-center gap-1.5 text-zinc-400">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span className="text-xs font-semibold tabular-nums">{time}</span>
        </div>
      )}

      {/* Separator */}
      <div className="h-5 w-px bg-zinc-200 hidden sm:block" />

      {/* Quick action */}
      {!isNuevo && canCreatePedido && (
        <Link
          href="/pedidos/nuevo"
          className="btn-accent inline-flex items-center gap-1.5 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition-all press-effect"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5v14"/>
          </svg>
          Nuevo Pedido
        </Link>
      )}
    </header>
  );
}
