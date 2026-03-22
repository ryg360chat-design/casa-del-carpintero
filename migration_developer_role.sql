-- Migration: Agregar rol 'developer'
-- Ejecutar en Supabase > SQL Editor

-- 1. Agregar valor al enum
ALTER TYPE rol_usuario ADD VALUE IF NOT EXISTS 'developer';

-- 2. Asignar rol developer a tu cuenta (reemplaza con tu email real)
-- UPDATE profiles SET rol = 'developer' WHERE nombre = 'TU_EMAIL@gmail.com';

-- Para ver todos los usuarios y sus roles:
-- SELECT id, nombre, rol, created_at FROM profiles ORDER BY created_at;

-- 3. Asegurarte que el dueño (admin) tenga el rol correcto:
-- UPDATE profiles SET rol = 'admin' WHERE nombre = 'EMAIL_DEL_DUEÑO@gmail.com';
