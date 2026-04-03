-- ═══════════════════════════════════════════════════════════════
--  MIGRACIÓN: Estado "Vendido" + columna fecha_cierre
--  Ejecutar en Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- 1. Si el campo estado usa un enum de PostgreSQL, añadir el valor
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type
    WHERE typname IN ('estado_pedido', 'estado')
    AND typtype = 'e'
  ) THEN
    -- Intentar añadir a cualquier enum llamado estado_pedido o estado
    BEGIN
      ALTER TYPE estado_pedido ADD VALUE IF NOT EXISTS 'Vendido';
    EXCEPTION WHEN undefined_object THEN NULL;
    END;
    BEGIN
      ALTER TYPE estado ADD VALUE IF NOT EXISTS 'Vendido';
    EXCEPTION WHEN undefined_object THEN NULL;
    END;
  END IF;
END$$;

-- 2. Añadir columna fecha_cierre (cuando admin marca como Vendido)
ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS fecha_cierre TIMESTAMPTZ;

-- Verificar:
-- SELECT id, estado, fecha_cierre FROM pedidos WHERE estado = 'Vendido' LIMIT 5;
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'pedidos' AND column_name = 'fecha_cierre';
