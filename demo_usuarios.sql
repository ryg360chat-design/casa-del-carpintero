-- ═══════════════════════════════════════════════════════════════════
--  USUARIOS DEMO — Casa del Carpintero
--  Contraseña de todos: CasaCarpintero2025!
--  Ejecutar en Supabase → SQL Editor → New query → Run
--  Es seguro re-ejecutar: usa ON CONFLICT para no duplicar
-- ═══════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_id UUID;

  -- Lista de usuarios: email | nombre | rol
  usuarios TEXT[][] := ARRAY[
    ['jorge.castillo@cdc.demo',  'Jorge del Castillo', 'gerencia'],
    ['gavi.valladares@cdc.demo', 'Gavi Valladares',    'administracion'],
    ['lucy.alarcon@cdc.demo',    'Lucy Alarcón',       'logistica'],
    ['karelys.guillen@cdc.demo', 'Karelys Guillén',    'ventas'],
    ['jose.salas@cdc.demo',      'José Salas',         'almacen_tableros'],
    ['cesar@cdc.demo',           'César',              'almacen_cantos'],
    ['pedro.acuna@cdc.demo',     'Pedro Acuña',        'produccion'],
    ['lidia.suarez@cdc.demo',    'Lidia Suárez',       'corte_especial']
  ];

  u TEXT[];

BEGIN
  FOREACH u SLICE 1 IN ARRAY usuarios LOOP

    -- ── 1. Verificar si ya existe en auth.users ──────────────────
    SELECT id INTO v_id FROM auth.users WHERE email = u[1];

    IF v_id IS NULL THEN
      -- ── 2. Crear usuario en auth.users ──────────────────────────
      v_id := gen_random_uuid();

      INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        aud,
        role,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        confirmation_token,
        recovery_token,
        email_change_token_new
      ) VALUES (
        v_id,
        '00000000-0000-0000-0000-000000000000',
        u[1],
        crypt('CasaCarpintero2025!', gen_salt('bf')),
        NOW(),          -- email ya confirmado
        NOW(),
        NOW(),
        'authenticated',
        'authenticated',
        jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
        jsonb_build_object('nombre', u[2]),
        FALSE,
        '',
        '',
        ''
      );

      RAISE NOTICE 'Creado: % (%)', u[2], u[1];
    ELSE
      RAISE NOTICE 'Ya existe: % — actualizando rol', u[1];
    END IF;

    -- ── 3. Crear / actualizar profile con el rol ─────────────────
    INSERT INTO public.profiles (id, nombre, rol)
    VALUES (v_id, u[2], u[3]::rol_usuario)
    ON CONFLICT (id) DO UPDATE
      SET nombre = EXCLUDED.nombre,
          rol    = EXCLUDED.rol;

  END LOOP;

  RAISE NOTICE '✓ Todos los usuarios demo procesados.';
END $$;


-- ── VERIFICACIÓN ─────────────────────────────────────────────────
-- Ejecutá esto después para confirmar:
SELECT
  u.email,
  p.nombre,
  p.rol,
  u.email_confirmed_at IS NOT NULL AS confirmado
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
WHERE u.email LIKE '%@cdc.demo'
ORDER BY p.rol;
