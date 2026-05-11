-- ═══════════════════════════════════════════════════════════════════
-- MIGRACIÓN SEMANA 2: Multi-tenant
-- Ejecutar en Supabase → SQL Editor (una sola vez)
-- ═══════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────
-- 1. TABLA organizations
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organizations (
  id                 UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre             TEXT        NOT NULL,
  slug               TEXT        NOT NULL UNIQUE,
  plan               TEXT        NOT NULL DEFAULT 'trial'
                                 CHECK (plan IN ('trial','basico','profesional','empresarial')),
  max_maquinas       INTEGER     NOT NULL DEFAULT 3,
  max_usuarios       INTEGER     NOT NULL DEFAULT 5,
  trial_ends_at      TIMESTAMPTZ,
  subscribed_at      TIMESTAMPTZ,
  stripe_customer_id TEXT,
  activo             BOOLEAN     NOT NULL DEFAULT true,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────
-- 2. PRIMER TENANT: Casa del Carpintero (plan fundador)
-- ─────────────────────────────────────────────────────────────────
INSERT INTO organizations (nombre, slug, plan, max_maquinas, max_usuarios, activo, subscribed_at)
VALUES ('Casa del Carpintero', 'casa-del-carpintero', 'empresarial', 8, 20, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────
-- 3. AGREGAR organization_id a todas las tablas
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE profiles          ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE pedidos            ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE clientes           ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE maquinas           ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE pedido_historial   ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE pedido_lineas      ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE reportes_guardados ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- ─────────────────────────────────────────────────────────────────
-- 4. MIGRAR datos existentes → Casa del Carpintero
-- ─────────────────────────────────────────────────────────────────
DO $$
DECLARE
  cdc_id UUID;
BEGIN
  SELECT id INTO cdc_id FROM organizations WHERE slug = 'casa-del-carpintero';

  UPDATE profiles          SET organization_id = cdc_id WHERE organization_id IS NULL;
  UPDATE pedidos            SET organization_id = cdc_id WHERE organization_id IS NULL;
  UPDATE clientes           SET organization_id = cdc_id WHERE organization_id IS NULL;
  UPDATE maquinas           SET organization_id = cdc_id WHERE organization_id IS NULL;
  UPDATE pedido_historial   SET organization_id = cdc_id WHERE organization_id IS NULL;
  UPDATE pedido_lineas      SET organization_id = cdc_id WHERE organization_id IS NULL;
  UPDATE reportes_guardados SET organization_id = cdc_id WHERE organization_id IS NULL;
END $$;

-- ─────────────────────────────────────────────────────────────────
-- 5. NOT NULL después de migrar
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE profiles          ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE pedidos            ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE clientes           ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE maquinas           ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE pedido_historial   ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE pedido_lineas      ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE reportes_guardados ALTER COLUMN organization_id SET NOT NULL;

-- reportes_guardados: (org + fecha) únicos, no solo fecha
ALTER TABLE reportes_guardados DROP CONSTRAINT IF EXISTS reportes_guardados_fecha_key;
ALTER TABLE reportes_guardados ADD CONSTRAINT reportes_guardados_org_fecha_key
  UNIQUE (organization_id, fecha);

-- ─────────────────────────────────────────────────────────────────
-- 6. FUNCIÓN HELPER — SECURITY DEFINER para evitar recursión en RLS
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_my_org_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid() LIMIT 1
$$;

-- ─────────────────────────────────────────────────────────────────
-- 7. TRIGGERS — auto-set organization_id en INSERT
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION auto_set_organization_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.organization_id IS NULL THEN
    NEW.organization_id := get_my_org_id();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_org_id_pedidos          ON pedidos;
DROP TRIGGER IF EXISTS trg_org_id_clientes          ON clientes;
DROP TRIGGER IF EXISTS trg_org_id_pedido_historial  ON pedido_historial;
DROP TRIGGER IF EXISTS trg_org_id_pedido_lineas     ON pedido_lineas;
DROP TRIGGER IF EXISTS trg_org_id_reportes          ON reportes_guardados;

CREATE TRIGGER trg_org_id_pedidos
  BEFORE INSERT ON pedidos FOR EACH ROW EXECUTE FUNCTION auto_set_organization_id();
CREATE TRIGGER trg_org_id_clientes
  BEFORE INSERT ON clientes FOR EACH ROW EXECUTE FUNCTION auto_set_organization_id();
CREATE TRIGGER trg_org_id_pedido_historial
  BEFORE INSERT ON pedido_historial FOR EACH ROW EXECUTE FUNCTION auto_set_organization_id();
CREATE TRIGGER trg_org_id_pedido_lineas
  BEFORE INSERT ON pedido_lineas FOR EACH ROW EXECUTE FUNCTION auto_set_organization_id();
CREATE TRIGGER trg_org_id_reportes
  BEFORE INSERT ON reportes_guardados FOR EACH ROW EXECUTE FUNCTION auto_set_organization_id();

-- ─────────────────────────────────────────────────────────────────
-- 8. RLS — aislamiento por tenant (reemplaza políticas permisivas)
-- ─────────────────────────────────────────────────────────────────

-- Drop old permissive policies
DROP POLICY IF EXISTS pedidos_auth_all                   ON pedidos;
DROP POLICY IF EXISTS clientes_auth_all                  ON clientes;
DROP POLICY IF EXISTS profiles_auth_read                 ON profiles;
DROP POLICY IF EXISTS profiles_own_update                ON profiles;
DROP POLICY IF EXISTS maquinas_auth_read                 ON maquinas;
DROP POLICY IF EXISTS maquinas_auth_update               ON maquinas;
DROP POLICY IF EXISTS "auth users can read reportes"     ON reportes_guardados;
DROP POLICY IF EXISTS "auth users can upsert reportes"   ON reportes_guardados;
DROP POLICY IF EXISTS "auth users can update reportes"   ON reportes_guardados;
DROP POLICY IF EXISTS "auth_select_pedido_lineas"        ON pedido_lineas;
DROP POLICY IF EXISTS "auth_insert_pedido_lineas"        ON pedido_lineas;
DROP POLICY IF EXISTS "auth_update_pedido_lineas"        ON pedido_lineas;
DROP POLICY IF EXISTS "auth_delete_pedido_lineas"        ON pedido_lineas;

-- PEDIDOS
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY pedidos_tenant ON pedidos
  FOR ALL USING (organization_id = get_my_org_id());

-- CLIENTES
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY clientes_tenant ON clientes
  FOR ALL USING (organization_id = get_my_org_id());

-- MAQUINAS
ALTER TABLE maquinas ENABLE ROW LEVEL SECURITY;
CREATE POLICY maquinas_tenant_read ON maquinas
  FOR SELECT USING (organization_id = get_my_org_id());
CREATE POLICY maquinas_tenant_update ON maquinas
  FOR UPDATE USING (organization_id = get_my_org_id());

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_tenant_read ON profiles
  FOR SELECT USING (organization_id = get_my_org_id());
CREATE POLICY profiles_own_update ON profiles
  FOR UPDATE USING (id = auth.uid());

-- PEDIDO_HISTORIAL
ALTER TABLE pedido_historial ENABLE ROW LEVEL SECURITY;
CREATE POLICY historial_tenant ON pedido_historial
  FOR ALL USING (organization_id = get_my_org_id());

-- PEDIDO_LINEAS
ALTER TABLE pedido_lineas ENABLE ROW LEVEL SECURITY;
CREATE POLICY pedido_lineas_tenant ON pedido_lineas
  FOR ALL USING (organization_id = get_my_org_id());

-- REPORTES_GUARDADOS
ALTER TABLE reportes_guardados ENABLE ROW LEVEL SECURITY;
CREATE POLICY reportes_tenant ON reportes_guardados
  FOR ALL USING (organization_id = get_my_org_id());

-- ORGANIZATIONS (cada org ve solo la suya)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY organizations_own ON organizations
  FOR SELECT USING (id = get_my_org_id());

-- ─────────────────────────────────────────────────────────────────
-- 9. ACTUALIZAR trigger de nuevo usuario
--    Por defecto: viewer sin org (admin le asigna después)
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, nombre, rol)
  VALUES (NEW.id, NEW.email, 'viewer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────────────────────────
-- VERIFICACIÓN
-- ─────────────────────────────────────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM organizations)                              AS orgs,
  (SELECT COUNT(*) FROM profiles)                                   AS profiles_total,
  (SELECT COUNT(*) FROM profiles WHERE organization_id IS NULL)     AS profiles_sin_org,
  (SELECT COUNT(*) FROM pedidos WHERE organization_id IS NULL)      AS pedidos_sin_org,
  (SELECT COUNT(*) FROM maquinas WHERE organization_id IS NULL)     AS maquinas_sin_org;
