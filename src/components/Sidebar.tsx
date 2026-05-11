"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { canUseFeature } from "@/lib/plans";
import type { OrgPlan } from "@/lib/org";
import clsx from "clsx";

type NavItem = {
  label: string;
  href: string;
  feature?: Parameters<typeof canUseFeature>[1];
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
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
    label: "Rendimiento",
    href: "/produccion/rendimiento",
    feature: "rendimiento",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
        <line x1="2" y1="20" x2="22" y2="20"/>
      </svg>
    ),
  },
  {
    label: "Calendario",
    href: "/calendario",
    feature: "calendario",
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
    label: "Reporte",
    href: "/reporte",
    feature: "reporte_diario",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 6 2 18 2 18 9"/>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
        <rect width="12" height="8" x="6" y="14"/>
      </svg>
    ),
  },
  {
    label: "Usuarios",
    href: "/admin/usuarios",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
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
    label: "Dev",
    href: "/dev",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/>
        <polyline points="8 6 2 12 8 18"/>
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


export default function Sidebar({
  userEmail,
  userRole = "viewer",
  isAdmin = false,
  isDeveloper = false,
  orgNombre = "Kuadra",
  orgPlan = "trial",
}: {
  userEmail: string;
  userRole?: string;
  isAdmin?: boolean;
  isDeveloper?: boolean;
  orgNombre?: string;
  orgPlan?: OrgPlan;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = userEmail ? userEmail[0].toUpperCase() : "U";
  const canViewReporte = ["developer","admin","gerencia","administracion","produccion"].includes(userRole);

  const visibleItems = navItems.filter((item) => {
    if (item.href === "/dev") return isDeveloper;
    if (item.href === "/ajustes" || item.href === "/admin/invitar" || item.href === "/admin/usuarios") return isAdmin;
    if (item.href === "/reporte") return canViewReporte && canUseFeature(orgPlan, "reporte_diario");
    if (item.href === "/produccion" || item.href === "/produccion/rendimiento" || item.href === "/calendario") {
      if (userRole === "viewer") return false;
      if (item.feature && !canUseFeature(orgPlan, item.feature)) return false;
      return true;
    }
    if (item.feature && !canUseFeature(orgPlan, item.feature)) return false;
    return true;
  });

  const ROLE_LABEL: Record<string, string> = {
    developer:        "Desarrollador",
    admin:            "Administrador",
    gerencia:         "Gerencia",
    administracion:   "Administración",
    ventas:           "Ventas",
    logistica:        "Logística",
    produccion:       "Producción",
    almacen_tableros: "Almacén Tableros",
    almacen_cantos:   "Almacén Cantos",
    almacenes:        "Almacenes",
    corte_especial:   "Corte Especial",
    viewer:           "Visualizador",
  };

  const PLAN_BADGE: Record<OrgPlan, { label: string; color: string }> = {
    trial:        { label: "Trial",        color: "#6b7280" },
    basico:       { label: "Básico",       color: "#1957A6" },
    profesional:  { label: "Profesional",  color: "#7c3aed" },
    empresarial:  { label: "Empresarial",  color: "#CC5238" },
  };

  const planBadge = PLAN_BADGE[orgPlan] ?? PLAN_BADGE.trial;

  return (
    <aside className="group/nav relative w-[60px] hover:w-[220px] transition-[width] duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] bg-zinc-900 hidden md:flex flex-col h-full shrink-0 overflow-hidden z-30 select-none">

      {/* Logo */}
      <div className="h-[57px] flex items-center px-[14px] border-b border-zinc-800/80 overflow-hidden gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-content-center items-center justify-center shrink-0 shadow-sm" style={{ background: "linear-gradient(135deg, #1957A6 0%, #267A8C 100%)" }}>
          <span className="text-white font-black text-[11px] tracking-tight">
            {orgNombre.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="opacity-0 group-hover/nav:opacity-100 transition-opacity duration-150 delay-75 min-w-0">
          <p className="text-white text-[10px] font-black leading-tight tracking-widest whitespace-nowrap truncate max-w-[140px]">
            {orgNombre.toUpperCase()}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <span
              className="text-[8.5px] font-semibold tracking-wider uppercase whitespace-nowrap"
              style={{ color: planBadge.color }}
            >
              {planBadge.label}
            </span>
            <span className="text-zinc-600 text-[8px]">·</span>
            <span className="text-[8.5px] font-semibold tracking-wider uppercase whitespace-nowrap text-zinc-500">
              KUADRA
            </span>
          </div>
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
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              item.href !== "/produccion" &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              data-tooltip={item.label}
              className={clsx(
                "relative flex items-center gap-3 pl-[11px] pr-3 py-2.5 rounded-lg transition-all duration-150 overflow-hidden",
                isActive
                  ? "text-blue-300 bg-blue-500/15 border border-blue-500/20"
                  : "text-zinc-400 hover:text-white hover:bg-white/8"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full" style={{ background: "#1957A6", boxShadow: "0 0 8px rgba(25,87,166,0.6)" }} />
              )}
              <span className="shrink-0 transition-all duration-150">{item.icon}</span>
              <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover/nav:opacity-100 transition-opacity duration-150 delay-50">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Upgrade CTA — solo si no es empresarial */}
        {orgPlan !== "empresarial" && (
          <Link
            href="/upgrade"
            className="mt-2 flex items-center gap-3 pl-[11px] pr-3 py-2.5 rounded-lg transition-all duration-150 overflow-hidden text-amber-400 hover:bg-amber-400/10"
          >
            <span className="shrink-0">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12 7-7 7 7"/>
                <path d="M12 19V5"/>
              </svg>
            </span>
            <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover/nav:opacity-100 transition-opacity duration-150 delay-50">
              Actualizar plan
            </span>
          </Link>
        )}
      </nav>

      {/* Divider */}
      <div className="mx-3 border-t border-zinc-800/80" />

      {/* User */}
      <div className="px-2 py-3 overflow-hidden">
        <Link href="/perfil" className="flex items-center gap-2.5 pl-2 pr-2 py-2 rounded-lg hover:bg-white/6 transition-colors">
          <div className="w-7 h-7 bg-gradient-to-br from-zinc-500 to-zinc-700 rounded-full flex items-center justify-center shrink-0 ring-1 ring-white/10">
            <span className="text-white text-[11px] font-bold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-150 delay-75 overflow-hidden">
            <p className="text-white text-xs font-semibold truncate whitespace-nowrap">{ROLE_LABEL[userRole] ?? "Usuario"}</p>
            <p className="text-zinc-500 text-[10px] truncate whitespace-nowrap">{userEmail}</p>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); handleLogout(); }}
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
        </Link>
      </div>
    </aside>
  );
}
