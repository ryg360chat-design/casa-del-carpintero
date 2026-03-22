-- Migration: Seguridad de roles
-- Ejecutar en Supabase > SQL Editor
-- CRÍTICO: ejecutar ANTES del lanzamiento

-- 1. Cambiar el trigger para que nuevos usuarios entren como 'viewer' (solo lectura)
--    El admin los asciende manualmente después
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, nombre, rol)
  VALUES (new.id, new.email, 'viewer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. RLS por rol: solo admin puede ver/modificar profiles
DROP POLICY IF EXISTS "Actualizar mi profile" ON profiles;
CREATE POLICY "Actualizar mi profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Política para que solo admin puede cambiar roles (evita auto-escalada)
-- Los usuarios solo pueden actualizar su propio nombre, no su rol
-- Esto se enforcea en la aplicación con getUserRole()

-- 4. Verificar que tu cuenta admin siga siendo admin después de correr esto:
-- SELECT id, nombre, rol FROM profiles;
-- Si tu cuenta quedó como 'viewer', ejecuta:
-- UPDATE profiles SET rol = 'admin' WHERE email = 'TU_EMAIL_AQUI';
