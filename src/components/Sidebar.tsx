"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import clsx from "clsx";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="7" x="3" y="3" rx="1"/>
        <rect width="7" height="7" x="14" y="3" rx="1"/>
        <rect width="7" height="7" x="14" y="14" rx="1"/>
        <rect width="7" height="7" x="3" y="14" rx="1"/>
      </svg>
    ),
  },
  {
    label: "Pedidos",
    href: "/pedidos",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
        <rect width="6" height="4" x="9" y="3" rx="1"/>
        <path d="M9 12h6M9 16h4"/>
      </svg>
    ),
  },
  {
    label: "Produccion",
    href: "/produccion",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
      </svg>
    ),
  },
  {
    label: "Calendario",
    href: "/calendario",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
        <line x1="16" x2="16" y1="2" y2="6"/>
        <line x1="8" x2="8" y1="2" y2="6"/>
        <line x1="3" x2="21" y1="10" y2="10"/>
      </svg>
    ),
  },
  {
    label: "Invitar",
    href: "/admin/invitar",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <line x1="19" y1="8" x2="19" y2="14"/>
        <line x1="22" y1="11" x2="16" y2="11"/>
      </svg>
    ),
  },
  {
    label: "Ajustes",
    href: "/ajustes",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ),
  },
];

export default function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = userEmail ? userEmail[0].toUpperCase() : "U";

  return (
    <aside className="group/nav relative w-[60px] hover:w-[220px] transition-[width] duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] bg-zinc-900 flex flex-col h-full shrink-0 overflow-hidden z-30 select-none">

      {/* Logo */}
      <div className="h-[57px] flex items-center px-[14px] border-b border-zinc-800/80 overflow-hidden gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}>
          <span className="text-white font-black text-[13px] tracking-tight">CC</span>
        </div>
        <div className="opacity-0 group-hover/nav:opacity-100 transition-opacity duration-150 delay-75 whitespace-nowrap">
          <p className="text-white text-[11px] font-bold leading-tight tracking-wider">CASA DEL CARPINTERO</p>
          <p className="text-[9px] font-semibold tracking-[0.18em] uppercase" style={{ color: "#f97316" }}>PRODUCTION OS</p>
        </div>
      </div>

      {/* Live dot */}
      <div className="flex items-center gap-2 px-[18px] py-2.5 border-b border-zinc-800/50 overflow-hidden">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest whitespace-nowrap opacity-0 group-hover/nav:opacity-100 transition-opacity duration-150 delay-75">
          En vivo
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-hidden">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              data-tooltip={item.label}
              className={clsx(
                "relative flex items-center gap-3 pl-[11px] pr-3 py-2.5 rounded-lg transition-all duration-150 overflow-hidden",
                isActive
                  ? "text-orange-400 bg-orange-500/10 border border-orange-500/20"
                  : "text-zinc-400 hover:text-white hover:bg-white/8"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full" style={{ background: "#f97316", boxShadow: "0 0 8px rgba(249,115,22,0.6)" }} />
              )}
              <span className="shrink-0 transition-all duration-150">
                {item.icon}
              </span>
              <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover/nav:opacity-100 transition-opacity duration-150 delay-50">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 border-t border-zinc-800/80" />

      {/* User */}
      <div className="px-2 py-3 overflow-hidden">
        <div className="flex items-center gap-2.5 pl-2 pr-2 py-2 rounded-lg hover:bg-white/6 transition-colors">
          <div className="w-7 h-7 bg-gradient-to-br from-zinc-500 to-zinc-700 rounded-full flex items-center justify-center shrink-0 ring-1 ring-white/10">
            <span className="text-white text-[11px] font-bold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-150 delay-75 overflow-hidden">
            <p className="text-white text-xs font-semibold truncate whitespace-nowrap">Jefe de Taller</p>
            <p className="text-zinc-500 text-[10px] truncate whitespace-nowrap">{userEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar sesion"
            data-tooltip="Salir"
            className="shrink-0 opacity-0 group-hover/nav:opacity-100 transition-all text-zinc-600 hover:text-white p-1 rounded hover:bg-white/10"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" x2="9" y1="12" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
