-- ═══════════════════════════════════════════════════════════════
--  MIGRACIÓN: Tabla pedido_lineas (múltiples materiales por pedido)
--  Ejecutar en Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- 1. Crear tabla
CREATE TABLE IF NOT EXISTS pedido_lineas (
  id                   UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id            UUID        NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  orden                INTEGER     NOT NULL DEFAULT 1,
  tipo_tablero         TEXT        NOT NULL DEFAULT '',
  marca_melamina       TEXT        NOT NULL DEFAULT '',
  espesor              TEXT        NOT NULL DEFAULT '',
  color_material       TEXT        NOT NULL DEFAULT '',
  cant_planchas        NUMERIC(10,2) NOT NULL DEFAULT 0,
  cant_piezas          INTEGER     NOT NULL DEFAULT 0,
  metros_canto_delgado NUMERIC(10,2) NOT NULL DEFAULT 0,
  metros_canto_grueso  NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Índice para búsqueda rápida por pedido
CREATE INDEX IF NOT EXISTS idx_pedido_lineas_pedido_id
  ON pedido_lineas(pedido_id);

-- 3. RLS
ALTER TABLE pedido_lineas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_select_pedido_lineas"
  ON pedido_lineas FOR SELECT TO authenticated USING (true);

CREATE POLICY "auth_insert_pedido_lineas"
  ON pedido_lineas FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "auth_update_pedido_lineas"
  ON pedido_lineas FOR UPDATE TO authenticated USING (true);

CREATE POLICY "auth_delete_pedido_lineas"
  ON pedido_lineas FOR DELETE TO authenticated USING (true);

-- Verificar:
-- SELECT * FROM pedido_lineas LIMIT 5;
