-- ============================================================
-- DEMO KUADRA — correr en Supabase → SQL Editor
-- Crea: org "Demo Taller" + admin + 3 máquinas + clientes + pedidos
-- Credenciales: demo@kuadra.app / Kuadra2026!
-- ============================================================

DO $$
DECLARE
  v_user_id UUID;
  v_org_id  UUID;
  v_cli     UUID[];
BEGIN

  -- ── 1. Organización ─────────────────────────────────────────
  INSERT INTO organizations (nombre, slug, plan, max_maquinas, max_usuarios, activo, subscribed_at)
  VALUES ('Demo Taller', 'demo-taller', 'profesional', 5, 10, true, now())
  ON CONFLICT (slug) DO UPDATE SET plan='profesional', activo=true
  RETURNING id INTO v_org_id;

  IF v_org_id IS NULL THEN
    SELECT id INTO v_org_id FROM organizations WHERE slug='demo-taller';
  END IF;

  -- ── 2. Usuario auth ──────────────────────────────────────────
  SELECT id INTO v_user_id FROM auth.users WHERE email='demo@kuadra.app';

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, aud, role,
      raw_app_meta_data, raw_user_meta_data,
      is_super_admin, confirmation_token, recovery_token, email_change_token_new
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'demo@kuadra.app',
      crypt('Kuadra2026!', gen_salt('bf')),
      now(), now(), now(),
      'authenticated', 'authenticated',
      '{"provider":"email","providers":["email"]}',
      '{"nombre":"Admin Demo"}',
      false, '', '', ''
    );
    RAISE NOTICE 'Usuario creado: %', v_user_id;
  ELSE
    RAISE NOTICE 'Usuario ya existe: %', v_user_id;
  END IF;

  -- ── 3. Profile ───────────────────────────────────────────────
  INSERT INTO profiles (id, nombre, rol, organization_id)
  VALUES (v_user_id, 'Admin Demo', 'admin', v_org_id)
  ON CONFLICT (id) DO UPDATE
    SET nombre=EXCLUDED.nombre, rol=EXCLUDED.rol, organization_id=EXCLUDED.organization_id;

  -- ── 4. Máquinas ─────────────────────────────────────────────
  INSERT INTO maquinas (id, nombre, activa, organization_id)
  VALUES
    ('demo-M1', 'Máquina 1', true,  v_org_id),
    ('demo-M2', 'Máquina 2', true,  v_org_id),
    ('demo-M3', 'Máquina 3', false, v_org_id)
  ON CONFLICT (id) DO NOTHING;

  -- ── 5. Clientes ─────────────────────────────────────────────
  WITH ins AS (
    INSERT INTO clientes (nombre, telefono, organization_id)
    VALUES
      ('GL Santamaría Cocinas', '0991234567', v_org_id),
      ('Yammy Guillén Diseños', '0987654321', v_org_id),
      ('Muebles del Valle',     '0976543210', v_org_id),
      ('Carpintería Central',   '0965432109', v_org_id),
      ('Diseños Modernos SA',   '0954321098', v_org_id)
    RETURNING id
  )
  SELECT array_agg(id) INTO v_cli FROM ins;

  -- ── 6. Pedidos ──────────────────────────────────────────────
  INSERT INTO pedidos (cliente_id, vendedor_id, organization_id, tipo_tablero, cant_planchas, cant_piezas, metros_canto, estado, prioridad, fecha_ingreso, maquina_asignada)
  VALUES
    (v_cli[1], v_user_id, v_org_id, 'MDF',      8.5, 163, 45, 'En cola',       'urgente', current_date,     null),
    (v_cli[2], v_user_id, v_org_id, 'Melamina',   4,  72, 28, 'En cola',       'normal',  current_date,     null),
    (v_cli[3], v_user_id, v_org_id, 'MDF',       12, 220, 60, 'En corte',      'normal',  current_date-1,  'demo-M1'),
    (v_cli[4], v_user_id, v_org_id, 'Melamina',   6,  98, 35, 'En corte',      'urgente', current_date-1,  'demo-M2'),
    (v_cli[5], v_user_id, v_org_id, 'MDF',        5,  88, 30, 'En tapacantos', 'normal',  current_date-2,  'demo-M1'),
    (v_cli[1], v_user_id, v_org_id, 'Melamina',   7, 130, 42, 'Listo',         'normal',  current_date-2,  'demo-M2'),
    (v_cli[2], v_user_id, v_org_id, 'MDF',       3.5, 64, 20, 'Listo',         'normal',  current_date-3,  'demo-M1'),
    (v_cli[3], v_user_id, v_org_id, 'MDF',       10, 195, 55, 'Despachado',    'normal',  current_date-4,  'demo-M2'),
    (v_cli[4], v_user_id, v_org_id, 'Melamina', 5.5, 102, 38, 'Despachado',    'urgente', current_date-5,  'demo-M1'),
    (v_cli[5], v_user_id, v_org_id, 'Triplay',    2,  30, 10, 'Cancelado',     'normal',  current_date-6,  null);

  RAISE NOTICE '✓ Demo Kuadra listo — demo@kuadra.app / Kuadra2026!';
END $$;
