-- Migration: Expand material types, add espesor, and update user roles
-- Run this in Supabase SQL Editor

-- 1. Add new enum values to tipo_tablero
ALTER TYPE tipo_tablero ADD VALUE IF NOT EXISTS 'Triplay';
ALTER TYPE tipo_tablero ADD VALUE IF NOT EXISTS 'OSB';
ALTER TYPE tipo_tablero ADD VALUE IF NOT EXISTS 'Laminados';
ALTER TYPE tipo_tablero ADD VALUE IF NOT EXISTS 'Aglomerado';
ALTER TYPE tipo_tablero ADD VALUE IF NOT EXISTS 'Otros';

-- 2. Add espesor column to pedidos
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS espesor text;

-- 3. Add new role values to rol_usuario enum
ALTER TYPE rol_usuario ADD VALUE IF NOT EXISTS 'ventas';
ALTER TYPE rol_usuario ADD VALUE IF NOT EXISTS 'produccion';
ALTER TYPE rol_usuario ADD VALUE IF NOT EXISTS 'almacenes';
ALTER TYPE rol_usuario ADD VALUE IF NOT EXISTS 'viewer';

-- 4. Rename existing 'vendedor' role to 'ventas' for any existing users
-- (run manually if you have users with 'vendedor' role)
-- UPDATE profiles SET rol = 'ventas' WHERE rol = 'vendedor';
