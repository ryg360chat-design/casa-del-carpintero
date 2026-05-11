-- ═══════════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY — Casa del Carpintero
--  Ejecutar en Supabase → SQL Editor
--  Protege las tablas para que solo usuarios autenticados accedan
-- ═══════════════════════════════════════════════════════════════════

-- ── PEDIDOS ──────────────────────────────────────────────────────────
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pedidos_auth_all" ON public.pedidos;
CREATE POLICY "pedidos_auth_all" ON public.pedidos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── CLIENTES ─────────────────────────────────────────────────────────
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clientes_auth_all" ON public.clientes;
CREATE POLICY "clientes_auth_all" ON public.clientes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── PROFILES ─────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_auth_read" ON public.profiles;
CREATE POLICY "profiles_auth_read" ON public.profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_own_update" ON public.profiles;
CREATE POLICY "profiles_own_update" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- ── MAQUINAS ─────────────────────────────────────────────────────────
ALTER TABLE public.maquinas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "maquinas_auth_read" ON public.maquinas;
CREATE POLICY "maquinas_auth_read" ON public.maquinas
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "maquinas_auth_update" ON public.maquinas;
CREATE POLICY "maquinas_auth_update" ON public.maquinas
  FOR UPDATE TO authenticated USING (true);

-- ── VERIFICACIÓN ─────────────────────────────────────────────────────
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
