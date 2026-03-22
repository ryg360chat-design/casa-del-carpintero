-- ============================================================
-- DATOS DE DEMO: Casa del Carpintero
-- Pega esto en Supabase > SQL Editor > New query
-- IMPORTANTE: Corré primero supabase_schema.sql si es base nueva
-- ============================================================

-- ── ACTUALIZAR SCHEMA PARA NUEVAS FUNCIONALIDADES ─────────────

-- Nuevos tipos enum
DO $$ BEGIN
  CREATE TYPE area_pedido AS ENUM (
    'Ventas', 'Produccion', 'Almacenes', 'Cortes especiales', 'Administracion', 'Logistica'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tipo_canto AS ENUM ('delgado', 'grueso');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Agregar prioridad VIP
ALTER TYPE prioridad_pedido ADD VALUE IF NOT EXISTS 'vip';

-- Agregar Triplay al tipo de tablero
ALTER TYPE tipo_tablero ADD VALUE IF NOT EXISTS 'Triplay';

-- Nuevas columnas en pedidos
ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS area area_pedido DEFAULT 'Ventas',
  ADD COLUMN IF NOT EXISTS perforaciones boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS corte_45 boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cortes_especiales text,
  ADD COLUMN IF NOT EXISTS tipo_canto tipo_canto DEFAULT 'delgado',
  ADD COLUMN IF NOT EXISTS tiempo_maquina_min integer DEFAULT 0;

-- ── CLIENTES DE DEMO ──────────────────────────────────────────

INSERT INTO clientes (id, nombre, telefono, email) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Constructora Vidal S.A.',     '099 123 456', 'compras@vidal.com.uy'),
  ('11111111-0000-0000-0000-000000000002', 'Mueblería El Roble',          '098 234 567', 'elroble@gmail.com'),
  ('11111111-0000-0000-0000-000000000003', 'Estudio Arq. Fernández',      '091 345 678', 'ofisina@fernandez.uy'),
  ('11111111-0000-0000-0000-000000000004', 'Interiores Moreira',          '097 456 789', 'moreira.interiores@gmail.com'),
  ('11111111-0000-0000-0000-000000000005', 'Reformas Del Norte',          '093 567 890', 'delnorte@hotmail.com'),
  ('11111111-0000-0000-0000-000000000006', 'Casa Moderna Hogar',          '094 678 901', 'casamoderna@uy.com'),
  ('11111111-0000-0000-0000-000000000007', 'Carpintería López & Hijos',   '092 789 012', 'lopez.carpinteria@gmail.com')
ON CONFLICT (id) DO NOTHING;

-- ── PEDIDOS DE DEMO ───────────────────────────────────────────
-- Mezcla de estados, máquinas, prioridades y fechas

INSERT INTO pedidos (
  id, cliente_id, maquina_asignada,
  tipo_tablero, marca_melamina,
  cant_planchas, cant_piezas, metros_canto,
  ranuras, perforaciones, corte_45, tipo_canto,
  estado, prioridad, turno, area,
  fecha_ingreso, fecha_entrega_estimada,
  tiempo_maquina_min, notas
) VALUES

-- ── M1 ─────────────────────────────────────────────────────

-- Urgente en corte ahora
(
  'aaaaaaaa-0000-0000-0000-000000000001',
  '11111111-0000-0000-0000-000000000001', 'M1',
  'Melamina', 'Masisa Blanco',
  4.5, 38, 22.0,
  false, true, false, 'delgado',
  'En corte', 'urgente', 'mañana', 'Ventas',
  now() - interval '3 hours', now() + interval '2 hours',
  45, 'Cliente espera en local. Llamar al terminar.'
),

-- Normal en cola
(
  'aaaaaaaa-0000-0000-0000-000000000002',
  '11111111-0000-0000-0000-000000000002', 'M1',
  'MDF', '',
  2.0, 14, 9.5,
  true, false, false, 'delgado',
  'En cola', 'normal', 'mañana', 'Ventas',
  now() - interval '1 hour', now() + interval '5 hours',
  30, NULL
),

-- VIP en cola
(
  'aaaaaaaa-0000-0000-0000-000000000003',
  '11111111-0000-0000-0000-000000000003', 'M1',
  'Melamina', 'Arauco Nogal Oscuro',
  7.0, 56, 41.0,
  false, true, true, 'grueso',
  'En cola', 'vip', 'tarde', 'Cortes especiales',
  now() - interval '30 minutes', now() + interval '6 hours',
  90, 'Cortes 45° en todas las puertas. Medir dos veces.'
),

-- En tapacantos M1
(
  'aaaaaaaa-0000-0000-0000-000000000004',
  '11111111-0000-0000-0000-000000000004', 'M1',
  'Melamina', 'Masisa Wengué',
  3.0, 22, 15.5,
  false, false, false, 'grueso',
  'En tapacantos', 'normal', 'mañana', 'Ventas',
  now() - interval '5 hours', now() + interval '1 hour',
  35, NULL
),

-- Listo hoy M1
(
  'aaaaaaaa-0000-0000-0000-000000000005',
  '11111111-0000-0000-0000-000000000005', 'M1',
  'MDF', '',
  1.5, 8, 6.0,
  false, false, false, 'delgado',
  'Listo', 'normal', 'mañana', 'Ventas',
  now() - interval '7 hours', now() - interval '1 hour',
  20, 'Listo para retirar. Paquete etiquetado.'
),

-- ── M2 ─────────────────────────────────────────────────────

-- Urgente en corte M2
(
  'aaaaaaaa-0000-0000-0000-000000000006',
  '11111111-0000-0000-0000-000000000006', 'M2',
  'Triplay', '',
  6.0, 44, 32.0,
  true, false, false, 'delgado',
  'En corte', 'urgente', 'mañana', 'Produccion',
  now() - interval '2 hours', now() + interval '3 hours',
  60, 'Ranuras para cajones deslizantes.'
),

-- Normal cola M2
(
  'aaaaaaaa-0000-0000-0000-000000000007',
  '11111111-0000-0000-0000-000000000007', 'M2',
  'Melamina', 'Arauco Blanco Brillante',
  5.0, 40, 28.0,
  false, true, false, 'delgado',
  'En cola', 'normal', 'tarde', 'Ventas',
  now() - interval '45 minutes', now() + interval '4 hours',
  55, 'Agujeros para bisagras incluidos en plano.'
),

-- VIP cola M2
(
  'aaaaaaaa-0000-0000-0000-000000000008',
  '11111111-0000-0000-0000-000000000001', 'M2',
  'Melamina', 'Masisa Roble Natural',
  9.0, 72, 58.0,
  true, true, true, 'grueso',
  'En cola', 'vip', 'tarde', 'Almacenes',
  now() - interval '20 minutes', now() + interval '7 hours',
  120, 'Pedido grande. Coordinar con logística para entrega.'
),

-- Tapacantos M2
(
  'aaaaaaaa-0000-0000-0000-000000000009',
  '11111111-0000-0000-0000-000000000002', 'M2',
  'MDF', '',
  2.5, 18, 12.0,
  false, false, false, 'delgado',
  'En tapacantos', 'normal', 'tarde', 'Ventas',
  now() - interval '4 hours', now() + interval '2 hours',
  28, NULL
),

-- Listo hoy M2
(
  'aaaaaaaa-0000-0000-0000-000000000010',
  '11111111-0000-0000-0000-000000000003', 'M2',
  'Melamina', 'Arauco Arena',
  3.5, 26, 18.5,
  false, false, false, 'grueso',
  'Listo', 'normal', 'mañana', 'Ventas',
  now() - interval '8 hours', now() - interval '2 hours',
  40, NULL
),

-- ── EXTRA (historial / cancelado) ───────────────────────────

-- Pedido cancelado (para mostrar filtros)
(
  'aaaaaaaa-0000-0000-0000-000000000011',
  '11111111-0000-0000-0000-000000000005', 'M1',
  'MDF', '',
  1.0, 6, 4.0,
  false, false, false, 'delgado',
  'Cancelado', 'normal', 'mañana', 'Ventas',
  now() - interval '2 days', now() - interval '1 day',
  0, 'Cliente canceló por cambio de medidas.'
),

-- Pedido de días anteriores listo (para reporte)
(
  'aaaaaaaa-0000-0000-0000-000000000012',
  '11111111-0000-0000-0000-000000000004', 'M2',
  'Melamina', 'Masisa Grafito',
  4.0, 32, 24.0,
  false, true, false, 'grueso',
  'Listo', 'urgente', 'tarde', 'Cortes especiales',
  now() - interval '2 days', now() - interval '1 day',
  50, 'Entregado ayer.'
)

ON CONFLICT (id) DO NOTHING;

-- ── VERIFICACIÓN ─────────────────────────────────────────────
SELECT
  COUNT(*) FILTER (WHERE estado = 'En cola')       AS en_cola,
  COUNT(*) FILTER (WHERE estado = 'En corte')      AS en_corte,
  COUNT(*) FILTER (WHERE estado = 'En tapacantos') AS en_tapacantos,
  COUNT(*) FILTER (WHERE estado = 'Listo')         AS listos,
  COUNT(*) FILTER (WHERE estado = 'Cancelado')     AS cancelados,
  COUNT(*)                                          AS total
FROM pedidos;
