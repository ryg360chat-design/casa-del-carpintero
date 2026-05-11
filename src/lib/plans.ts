import type { OrgPlan } from "./org";

export type PlanFeature =
  | "pedidos"
  | "produccion"
  | "rendimiento"
  | "calendario"
  | "reporte_diario"
  | "reporte_pdf"
  | "reporte_historial"
  | "exportar_csv"
  | "modulo_financiero"
  | "crm_clientes"
  | "inventario"
  | "personalizacion"
  | "multisucursal"
  | "roles_personalizados";

const PLAN_FEATURES: Record<PlanFeature, OrgPlan[]> = {
  pedidos:              ["trial", "basico", "profesional", "empresarial"],
  produccion:           ["trial", "basico", "profesional", "empresarial"],
  rendimiento:          ["profesional", "empresarial"],
  calendario:           ["profesional", "empresarial"],
  reporte_diario:       ["profesional", "empresarial"],
  reporte_pdf:          ["profesional", "empresarial"],
  reporte_historial:    ["empresarial"],
  exportar_csv:         ["empresarial"],
  modulo_financiero:    ["profesional", "empresarial"],
  crm_clientes:         ["empresarial"],
  inventario:           ["empresarial"],
  personalizacion:      ["empresarial"],
  multisucursal:        ["empresarial"],
  roles_personalizados: ["empresarial"],
};

export const PLAN_LIMITS: Record<OrgPlan, { max_maquinas: number; max_usuarios: number }> = {
  trial:        { max_maquinas: 2, max_usuarios: 3 },
  basico:       { max_maquinas: 3, max_usuarios: 5 },
  profesional:  { max_maquinas: 5, max_usuarios: 10 },
  empresarial:  { max_maquinas: 8, max_usuarios: 20 },
};

export const PLAN_PRICE_MENSUAL: Record<OrgPlan, number> = {
  trial:        0,
  basico:       300,
  profesional:  500,
  empresarial:  900,
};

export const PLAN_PRICE_ANUAL: Record<OrgPlan, number> = {
  trial:        0,
  basico:       255,
  profesional:  425,
  empresarial:  765,
};

export function canUseFeature(plan: OrgPlan, feature: PlanFeature): boolean {
  return PLAN_FEATURES[feature]?.includes(plan) ?? false;
}

export function getUpgradePlan(plan: OrgPlan): OrgPlan | null {
  const order: OrgPlan[] = ["trial", "basico", "profesional", "empresarial"];
  const idx = order.indexOf(plan);
  return idx < order.length - 1 ? order[idx + 1] : null;
}

export const PLAN_FEATURES_LIST: Record<OrgPlan, string[]> = {
  trial: [
    "Crear y editar pedidos",
    "Vista de producción en columnas",
    "Hasta 2 máquinas · 3 usuarios",
    "14 días gratis",
  ],
  basico: [
    "Todo lo del Trial",
    "Vista de pedidos por día",
    "Historial completo de pedidos",
    "3 máquinas · 5 usuarios · 1 GB",
  ],
  profesional: [
    "Todo lo del Básico",
    "Dashboard de rendimiento por máquina",
    "Reporte diario + PDF imprimible",
    "Calendario de entregas",
    "Módulo Financiero",
    "5 máquinas · 10 usuarios · 5 GB",
  ],
  empresarial: [
    "Todo lo del Profesional",
    "Exportar CSV / Excel",
    "CRM de Clientes",
    "Módulo Inventario",
    "Roles personalizados",
    "Multisucursal",
    "8 máquinas · 20 usuarios · 20 GB",
  ],
};
