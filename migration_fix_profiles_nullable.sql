-- Fix: profiles.organization_id debe ser nullable
-- El trigger de Supabase crea el profile sin org_id todavia,
-- luego el API route lo actualiza en un segundo paso.
ALTER TABLE profiles ALTER COLUMN organization_id DROP NOT NULL;
