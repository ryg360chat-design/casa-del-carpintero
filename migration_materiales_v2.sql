-- ═══════════════════════════════════════════════════════════════
-- MIGRACIÓN: Control de Materiales (Kardex + Inventario)
-- Ejecutar en Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- 1. TABLA: materiales (stock por tipo/marca/espesor)
CREATE TABLE IF NOT EXISTS materiales (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id  UUID        REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  tipo             TEXT        NOT NULL,
  marca            TEXT        NOT NULL DEFAULT '',
  espesor          TEXT        NOT NULL DEFAULT '',
  stock_actual     NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock_minimo     NUMERIC(10,2) NOT NULL DEFAULT 10,
  precio_unitario  NUMERIC(10,2) NOT NULL DEFAULT 0,
  activo           BOOLEAN     NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA: movimientos_material (kardex)
CREATE TABLE IF NOT EXISTS movimientos_material (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id  UUID        REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  material_id      UUID        REFERENCES materiales(id) ON DELETE CASCADE NOT NULL,
  tipo             TEXT        NOT NULL CHECK (tipo IN ('entrada', 'salida', 'ajuste')),
  cantidad         NUMERIC(10,2) NOT NULL,
  stock_resultante NUMERIC(10,2) NOT NULL,
  pedido_id        UUID        REFERENCES pedidos(id) ON DELETE SET NULL,
  notas            TEXT,
  created_by       UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS
ALTER TABLE materiales          ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_material ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_materiales" ON materiales
  USING (organization_id = get_my_org_id());

CREATE POLICY "org_movimientos" ON movimientos_material
  USING (organization_id = get_my_org_id());

-- 4. ACTIVAR feature para CDC y demo-taller
UPDATE organizations
SET features_enabled = array_append(
  COALESCE(features_enabled, '{}'),
  'control_materiales'
)
WHERE slug IN ('casa-del-carpintero', 'demo-taller')
  AND NOT ('control_materiales' = ANY(COALESCE(features_enabled, '{}')));

-- 5. DEMO DATA — CDC
DO $$
DECLARE
  v_org UUID;
  v_m1 UUID; v_m2 UUID; v_m3 UUID; v_m4 UUID; v_m5 UUID; v_m6 UUID;
BEGIN
  SELECT id INTO v_org FROM organizations WHERE slug = 'casa-del-carpintero';
  IF v_org IS NULL THEN RETURN; END IF;

  -- Insertar materiales
  INSERT INTO materiales (organization_id, tipo, marca, espesor, stock_actual, stock_minimo, precio_unitario) VALUES
    (v_org, 'Melamina', 'Pelikano',   '15mm', 42,  20, 22.50),
    (v_org, 'Melamina', 'Kronospan',  '18mm', 78,  25, 24.00),
    (v_org, 'MDF',      'Arauco',     '15mm',  8,  15, 18.00),
    (v_org, 'MDF',      'Arauco',     '18mm', 55,  20, 19.50),
    (v_org, 'Triplay',  'Eucamax',    '9mm',  23,  10, 32.00),
    (v_org, 'Melamina', 'Duraplac',   '18mm',  6,  15, 23.00)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_m1;

  SELECT id INTO v_m1 FROM materiales WHERE organization_id=v_org AND tipo='Melamina' AND marca='Pelikano';
  SELECT id INTO v_m2 FROM materiales WHERE organization_id=v_org AND tipo='Melamina' AND marca='Kronospan';
  SELECT id INTO v_m3 FROM materiales WHERE organization_id=v_org AND tipo='MDF' AND espesor='15mm';
  SELECT id INTO v_m4 FROM materiales WHERE organization_id=v_org AND tipo='MDF' AND espesor='18mm';
  SELECT id INTO v_m5 FROM materiales WHERE organization_id=v_org AND tipo='Triplay';
  SELECT id INTO v_m6 FROM materiales WHERE organization_id=v_org AND tipo='Melamina' AND marca='Duraplac';

  -- Movimientos Pelikano 15mm (stock actual 42)
  INSERT INTO movimientos_material (organization_id, material_id, tipo, cantidad, stock_resultante, notas, created_at) VALUES
    (v_org, v_m1, 'entrada', 100, 100, 'Compra inicial',                    NOW() - INTERVAL '30 days'),
    (v_org, v_m1, 'salida',   18,  82, 'Pedidos semana 1',                  NOW() - INTERVAL '22 days'),
    (v_org, v_m1, 'entrada',  50, 132, 'Reposición de stock',               NOW() - INTERVAL '15 days'),
    (v_org, v_m1, 'salida',   24, 108, 'Pedidos semana 2',                  NOW() - INTERVAL '10 days'),
    (v_org, v_m1, 'salida',   55,  53, 'Pedidos semana 3',                  NOW() - INTERVAL '5 days'),
    (v_org, v_m1, 'salida',   11,  42, 'Pedidos esta semana',               NOW() - INTERVAL '1 day');

  -- Movimientos Kronospan 18mm (stock 78)
  INSERT INTO movimientos_material (organization_id, material_id, tipo, cantidad, stock_resultante, notas, created_at) VALUES
    (v_org, v_m2, 'entrada', 120, 120, 'Compra inicial',                    NOW() - INTERVAL '30 days'),
    (v_org, v_m2, 'salida',   42,  78, 'Pedidos del mes',                   NOW() - INTERVAL '3 days');

  -- Movimientos MDF 15mm (stock 8 — bajo mínimo)
  INSERT INTO movimientos_material (organization_id, material_id, tipo, cantidad, stock_resultante, notas, created_at) VALUES
    (v_org, v_m3, 'entrada',  60,  60, 'Compra inicial',                    NOW() - INTERVAL '30 days'),
    (v_org, v_m3, 'salida',   52,   8, 'Consumo del mes — reponer urgente', NOW() - INTERVAL '2 days');

  -- Movimientos MDF 18mm (stock 55)
  INSERT INTO movimientos_material (organization_id, material_id, tipo, cantidad, stock_resultante, notas, created_at) VALUES
    (v_org, v_m4, 'entrada',  80,  80, 'Compra inicial',                    NOW() - INTERVAL '28 days'),
    (v_org, v_m4, 'salida',   25,  55, 'Pedidos del mes',                   NOW() - INTERVAL '4 days');

  -- Movimientos Triplay (stock 23)
  INSERT INTO movimientos_material (organization_id, material_id, tipo, cantidad, stock_resultante, notas, created_at) VALUES
    (v_org, v_m5, 'entrada',  30,  30, 'Compra inicial',                    NOW() - INTERVAL '20 days'),
    (v_org, v_m5, 'salida',    7,  23, 'Pedidos del mes',                   NOW() - INTERVAL '6 days');

  -- Movimientos Duraplac 18mm (stock 6 — bajo mínimo)
  INSERT INTO movimientos_material (organization_id, material_id, tipo, cantidad, stock_resultante, notas, created_at) VALUES
    (v_org, v_m6, 'entrada',  40,  40, 'Compra inicial',                    NOW() - INTERVAL '25 days'),
    (v_org, v_m6, 'salida',   34,   6, 'Alta demanda — reponer',            NOW() - INTERVAL '1 day');

END $$;

-- 6. DEMO DATA — Demo Taller
DO $$
DECLARE
  v_org UUID;
BEGIN
  SELECT id INTO v_org FROM organizations WHERE slug = 'demo-taller';
  IF v_org IS NULL THEN RETURN; END IF;

  INSERT INTO materiales (organization_id, tipo, marca, espesor, stock_actual, stock_minimo, precio_unitario) VALUES
    (v_org, 'Melamina', 'Pelikano',  '15mm', 35, 20, 22.50),
    (v_org, 'Melamina', 'Kronospan', '18mm', 60, 25, 24.00),
    (v_org, 'MDF',      'Arauco',    '18mm', 12, 15, 19.50),
    (v_org, 'Triplay',  'Eucamax',   '9mm',  18, 10, 32.00)
  ON CONFLICT DO NOTHING;
END $$;
