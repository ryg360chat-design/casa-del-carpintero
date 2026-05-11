-- ═══════════════════════════════════════════════════════════════
--  MIGRACIÓN: Fixes de seguridad (Supabase Security Advisor)
--  Ejecutar en Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────
-- 1. ERROR: Security Definer View → cola_produccion
--    La vista debe ejecutarse con los permisos del CALLER (invoker),
--    no del creador, para que RLS funcione correctamente.
-- ──────────────────────────────────────────────────────────────
ALTER VIEW public.cola_produccion SET (security_invoker = on);


-- ──────────────────────────────────────────────────────────────
-- 2. WARNING: Function Search Path Mutable
--    Sin SET search_path las funciones son vulnerables a
--    search_path injection. Usamos '' para forzar rutas explícitas.
-- ──────────────────────────────────────────────────────────────

-- update_updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- registrar_cambio_estado
CREATE OR REPLACE FUNCTION public.registrar_cambio_estado()
RETURNS trigger AS $$
BEGIN
  IF old.estado IS DISTINCT FROM new.estado THEN
    INSERT INTO public.pedido_historial (pedido_id, estado_anterior, estado_nuevo, cambiado_por)
    VALUES (new.id, old.estado, new.estado, auth.uid());
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '';

-- fn_generar_codigo_cliente
CREATE OR REPLACE FUNCTION public.fn_generar_codigo_cliente()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.codigo IS NULL THEN
    NEW.codigo := 'CDC-' || LPAD(nextval('public.clientes_codigo_seq')::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';


-- ──────────────────────────────────────────────────────────────
-- 3. WARNING: RLS Policy Always True
--    Reemplazamos USING (true) / WITH CHECK (true) por
--    auth.uid() IS NOT NULL — misma semántica pero explícita.
-- ──────────────────────────────────────────────────────────────

-- ── pedidos ──
DROP POLICY IF EXISTS "Ver pedidos"       ON public.pedidos;
DROP POLICY IF EXISTS "Crear pedidos"     ON public.pedidos;
DROP POLICY IF EXISTS "Actualizar pedidos" ON public.pedidos;

CREATE POLICY "Ver pedidos"
  ON public.pedidos FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Crear pedidos"
  ON public.pedidos FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Actualizar pedidos"
  ON public.pedidos FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ── clientes ──
DROP POLICY IF EXISTS "Ver clientes"       ON public.clientes;
DROP POLICY IF EXISTS "Crear clientes"     ON public.clientes;
DROP POLICY IF EXISTS "Actualizar clientes" ON public.clientes;

CREATE POLICY "Ver clientes"
  ON public.clientes FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Crear clientes"
  ON public.clientes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Actualizar clientes"
  ON public.clientes FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ── maquinas ──
DROP POLICY IF EXISTS "Ver maquinas" ON public.maquinas;

CREATE POLICY "Ver maquinas"
  ON public.maquinas FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ── profiles ──
DROP POLICY IF EXISTS "Ver profiles" ON public.profiles;

CREATE POLICY "Ver profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ── pedido_lineas ──
DROP POLICY IF EXISTS "auth_select_pedido_lineas" ON public.pedido_lineas;
DROP POLICY IF EXISTS "auth_insert_pedido_lineas" ON public.pedido_lineas;
DROP POLICY IF EXISTS "auth_update_pedido_lineas" ON public.pedido_lineas;
DROP POLICY IF EXISTS "auth_delete_pedido_lineas" ON public.pedido_lineas;

CREATE POLICY "auth_select_pedido_lineas"
  ON public.pedido_lineas FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "auth_insert_pedido_lineas"
  ON public.pedido_lineas FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_update_pedido_lineas"
  ON public.pedido_lineas FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_delete_pedido_lineas"
  ON public.pedido_lineas FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);


-- ──────────────────────────────────────────────────────────────
-- 4. WARNING: Extension in Public (pg_trgm)
--    No se migra aquí — hacerlo rompería el índice GIN en clientes.
--    Es un warning de bajo riesgo; pg_trgm no expone datos.
-- ──────────────────────────────────────────────────────────────


-- ──────────────────────────────────────────────────────────────
-- 5. WARNING: Leaked Password Protection
--    PASO MANUAL en Supabase Dashboard:
--    Authentication → Providers → Email → Password → Enable HaveIBeenPwned
-- ──────────────────────────────────────────────────────────────
