-- ═══════════════════════════════════════════════════════════════════
--  MIGRACIÓN v2: Roles nuevos + Despachado + M3 + fecha_programada
--  Ejecutar en Supabase → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. NUEVOS ROLES ──────────────────────────────────────────────
ALTER TYPE rol_usuario ADD VALUE IF NOT EXISTS 'gerencia';
ALTER TYPE rol_usuario ADD VALUE IF NOT EXISTS 'administracion';
ALTER TYPE rol_usuario ADD VALUE IF NOT EXISTS 'logistica';
ALTER TYPE rol_usuario ADD VALUE IF NOT EXISTS 'almacen_tableros';
ALTER TYPE rol_usuario ADD VALUE IF NOT EXISTS 'almacen_cantos';
ALTER TYPE rol_usuario ADD VALUE IF NOT EXISTS 'corte_especial';

-- ── 2. RENOMBRAR "Vendido" → "Despachado" ────────────────────────
-- (Soportado en PostgreSQL 10+, Supabase lo incluye)
DO $$
BEGIN
  -- Solo renombrar si 'Vendido' existe y 'Despachado' NO existe aún
  IF EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'estado_pedido' AND e.enumlabel = 'Vendido'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'estado_pedido' AND e.enumlabel = 'Despachado'
  ) THEN
    ALTER TYPE estado_pedido RENAME VALUE 'Vendido' TO 'Despachado';
  END IF;
END$$;

-- ── 3. AGREGAR MÁQUINA 3 ─────────────────────────────────────────
INSERT INTO maquinas (id, nombre, activa)
VALUES ('M3', 'Máquina 3', true)
ON CONFLICT (id) DO NOTHING;

-- ── 4. CAMPO FECHA PROGRAMADA EN PEDIDOS ─────────────────────────
ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS fecha_inicio_programada DATE;

-- ══════════════════════════════════════════════════════════════════
--  VERIFICACIÓN — corre estas queries después para confirmar:
-- ══════════════════════════════════════════════════════════════════
-- Ver todos los roles disponibles:
-- SELECT enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'rol_usuario' ORDER BY enumsortorder;

-- Ver estados de pedido (debe aparecer 'Despachado', no 'Vendido'):
-- SELECT enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'estado_pedido' ORDER BY enumsortorder;

-- Ver máquinas:
-- SELECT * FROM maquinas ORDER BY id;

-- Ver columna nueva en pedidos:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'pedidos' AND column_name = 'fecha_inicio_programada';
