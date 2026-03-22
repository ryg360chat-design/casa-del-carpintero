-- Migration: Agregar columnas faltantes a pedidos
-- Ejecutar en Supabase > SQL Editor

-- 1. Columnas de material
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS color_material text;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS tipo_canto text;

-- 2. Columnas de servicios adicionales
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS perforaciones boolean NOT NULL DEFAULT false;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS corte_45 boolean NOT NULL DEFAULT false;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS cortes_especiales boolean NOT NULL DEFAULT false;

-- 3. Área responsable
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS area text;

-- 4. Agregar valor 'vip' al enum de prioridad
ALTER TYPE prioridad_pedido ADD VALUE IF NOT EXISTS 'vip';
