-- ============================================================
-- ESQUEMA COMPLETO: Casa del Carpintero
-- Pega TODO este contenido en Supabase > SQL Editor > New query
-- ============================================================

-- 1. EXTENSIONES
create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;

-- 2. TIPOS ENUM
create type estado_pedido as enum (
  'En cola',
  'En corte',
  'En tapacantos',
  'Listo',
  'Cancelado',
  'Pausado'
);

create type prioridad_pedido as enum ('normal', 'urgente');
create type turno_tipo as enum ('mañana', 'tarde');
create type tipo_tablero as enum ('MDF', 'Melamina');
create type rol_usuario as enum ('vendedor', 'admin');

-- 3. TABLA: profiles (vinculada a auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  rol rol_usuario not null default 'vendedor',
  created_at timestamptz default now()
);

-- Trigger: crear profile automáticamente al crear usuario
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, nombre, rol)
  values (new.id, new.email, 'admin');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 4. TABLA: maquinas
create table maquinas (
  id text primary key,
  nombre text not null,
  activa boolean default true,
  created_at timestamptz default now()
);

insert into maquinas (id, nombre, activa) values
  ('M1', 'Máquina 1', true),
  ('M2', 'Máquina 2', true);

-- 5. TABLA: clientes
create table clientes (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  telefono text,
  email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_clientes_nombre on clientes using gin (nombre gin_trgm_ops);

-- 6. TABLA: pedidos
create table pedidos (
  id uuid primary key default uuid_generate_v4(),

  -- Relaciones
  cliente_id uuid references clientes(id) on delete set null,
  vendedor_id uuid references auth.users(id) on delete set null,
  maquina_asignada text references maquinas(id),

  -- Material
  tipo_tablero tipo_tablero not null default 'Melamina',
  marca_melamina text not null default '',

  -- Datos del corte (del optimizador Lepton)
  cant_planchas numeric(10,2) not null default 0,
  cant_piezas integer not null default 0,
  metros_canto numeric(10,2) not null default 0,
  ranuras boolean not null default false,

  -- Estado
  estado estado_pedido not null default 'En cola',
  prioridad prioridad_pedido not null default 'normal',
  turno turno_tipo,

  -- Fechas
  fecha_ingreso timestamptz not null default now(),
  fecha_entrega_estimada timestamptz,
  fecha_entrega_real timestamptz,

  -- Extra
  notas text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_pedidos_estado on pedidos(estado);
create index idx_pedidos_maquina on pedidos(maquina_asignada);
create index idx_pedidos_fecha_ingreso on pedidos(fecha_ingreso);
create index idx_pedidos_cliente on pedidos(cliente_id);

-- 7. TRIGGER: updated_at automático
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_pedidos
  before update on pedidos
  for each row execute function update_updated_at();

create trigger set_updated_at_clientes
  before update on clientes
  for each row execute function update_updated_at();

-- 8. TABLA: historial de estados
create table pedido_historial (
  id uuid primary key default uuid_generate_v4(),
  pedido_id uuid references pedidos(id) on delete cascade,
  estado_anterior estado_pedido,
  estado_nuevo estado_pedido not null,
  cambiado_por uuid references auth.users(id),
  created_at timestamptz default now()
);

create index idx_historial_pedido on pedido_historial(pedido_id);

-- 9. TRIGGER: registrar cambio de estado automáticamente
create or replace function registrar_cambio_estado()
returns trigger as $$
begin
  if old.estado is distinct from new.estado then
    insert into pedido_historial (pedido_id, estado_anterior, estado_nuevo, cambiado_por)
    values (new.id, old.estado, new.estado, auth.uid());
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_estado_change
  after update on pedidos
  for each row execute function registrar_cambio_estado();

-- 10. ROW LEVEL SECURITY
alter table pedidos enable row level security;
alter table clientes enable row level security;
alter table maquinas enable row level security;
alter table profiles enable row level security;
alter table pedido_historial enable row level security;

-- Pedidos: todos los autenticados ven todo
create policy "Ver pedidos" on pedidos for select to authenticated using (true);
create policy "Crear pedidos" on pedidos for insert to authenticated with check (true);
create policy "Actualizar pedidos" on pedidos for update to authenticated using (true);

-- Clientes
create policy "Ver clientes" on clientes for select to authenticated using (true);
create policy "Crear clientes" on clientes for insert to authenticated with check (true);
create policy "Actualizar clientes" on clientes for update to authenticated using (true);

-- Máquinas: solo lectura
create policy "Ver maquinas" on maquinas for select to authenticated using (true);

-- Profiles
create policy "Ver profiles" on profiles for select to authenticated using (true);
create policy "Actualizar mi profile" on profiles for update to authenticated using (auth.uid() = id);

-- Historial
create policy "Ver historial" on pedido_historial for select to authenticated using (true);

-- 11. VISTA: cola de producción
create or replace view cola_produccion as
select
  p.id,
  p.tipo_tablero,
  p.marca_melamina,
  c.nombre as cliente,
  p.cant_planchas,
  p.cant_piezas,
  p.metros_canto,
  p.ranuras,
  p.estado,
  p.prioridad,
  p.maquina_asignada,
  m.nombre as nombre_maquina,
  p.turno,
  p.fecha_ingreso,
  p.fecha_entrega_estimada,
  p.notas
from pedidos p
left join clientes c on p.cliente_id = c.id
left join maquinas m on p.maquina_asignada = m.id
where p.estado not in ('Listo', 'Cancelado')
order by
  case p.prioridad when 'urgente' then 0 else 1 end,
  p.fecha_ingreso asc;

-- 12. REALTIME
alter publication supabase_realtime add table pedidos;
