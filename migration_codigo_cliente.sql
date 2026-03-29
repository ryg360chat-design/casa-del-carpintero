-- ═══════════════════════════════════════════════════════
--  MIGRACIÓN: Código único de cliente (CDC-001, CDC-002…)
--  Ejecutar en Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════

-- 1. Agregar columna codigo a la tabla clientes
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS codigo text UNIQUE;

-- 2. Crear secuencia para los números
CREATE SEQUENCE IF NOT EXISTS clientes_codigo_seq START WITH 1 INCREMENT BY 1;

-- 3. Función que genera el código automáticamente al insertar
CREATE OR REPLACE FUNCTION fn_generar_codigo_cliente()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.codigo IS NULL THEN
    NEW.codigo := 'CDC-' || LPAD(nextval('clientes_codigo_seq')::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger: se ejecuta antes de cada INSERT en clientes
DROP TRIGGER IF EXISTS trg_codigo_cliente ON clientes;
CREATE TRIGGER trg_codigo_cliente
  BEFORE INSERT ON clientes
  FOR EACH ROW EXECUTE FUNCTION fn_generar_codigo_cliente();

-- 5. Rellenar clientes existentes (en orden de creación → CDC-001, CDC-002…)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT id FROM clientes WHERE codigo IS NULL ORDER BY created_at ASC
  LOOP
    UPDATE clientes
      SET codigo = 'CDC-' || LPAD(nextval('clientes_codigo_seq')::text, 3, '0')
      WHERE id = r.id;
  END LOOP;
END;
$$;

-- Verificar resultado:
-- SELECT codigo, nombre, created_at FROM clientes ORDER BY codigo;
