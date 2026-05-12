-- ═══════════════════════════════════════════════════════════════
-- MIGRACIÓN: Feature flags + Módulo Financiero
-- Ejecutar en Supabase → SQL Editor (una sola vez)
-- ═══════════════════════════════════════════════════════════════

-- 1. Feature flags por organización
--    features_enabled es un array de strings con los módulos activos
--    Ej: '{modulo_financiero,control_materiales}'
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS features_enabled text[] DEFAULT '{}';

-- CDC ya existente: no le activamos nada nuevo todavía
-- Para activar un módulo a una org:
--   UPDATE organizations
--   SET features_enabled = array_append(features_enabled, 'modulo_financiero')
--   WHERE slug = 'nombre-del-taller';

-- 2. Campo precio de venta en pedidos
ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS precio_venta NUMERIC(10,2);

-- 3. Config de costos por org (precio planche, costo mano de obra)
--    Guardado como JSONB para flexibilidad
--    Ej: {"costo_planche": 25, "costo_mano_obra_por_pieza": 0.5}
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}';
