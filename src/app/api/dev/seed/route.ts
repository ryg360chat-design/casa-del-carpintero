// Endpoint de un solo uso para crear datos de demo
// Usar: POST /api/dev/seed?secret=kuadra_seed_2026
// IMPORTANTE: desactivar o eliminar este endpoint en producción real

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const SEED_SECRET = "kuadra_seed_2026";

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("secret") !== SEED_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();

  // Verificar si ya existe
  const { data: existingOrg } = await admin
    .from("organizations")
    .select("id")
    .eq("slug", "demo-taller")
    .maybeSingle();

  if (existingOrg) {
    return NextResponse.json({
      error: "Demo ya existe.",
      email: "demo@kuadra.app",
      password: "kuadra2026",
      hint: "Inicia sesión directamente con esas credenciales",
    }, { status: 409 });
  }

  // 1. Crear organización demo (plan profesional para ver todas las funciones)
  const { data: org, error: orgError } = await admin
    .from("organizations")
    .insert({
      nombre: "Demo Taller",
      slug: "demo-taller",
      plan: "profesional",
      max_maquinas: 5,
      max_usuarios: 10,
      activo: true,
      subscribed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (orgError || !org) {
    return NextResponse.json({ error: "Error creando organización: " + orgError?.message }, { status: 500 });
  }

  // 2. Crear usuario demo
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: "demo@kuadra.app",
    password: "kuadra2026",
    email_confirm: true,
    user_metadata: { nombre: "Admin Demo" },
  });

  if (authError || !authData?.user) {
    await admin.from("organizations").delete().eq("id", org.id);
    return NextResponse.json({ error: "Error creando usuario: " + authError?.message }, { status: 500 });
  }

  const userId = authData.user.id;

  // 3. Actualizar profile (el trigger lo crea, nosotros lo completamos)
  await admin.from("profiles").update({
    organization_id: org.id,
    nombre: "Admin Demo",
    rol: "admin",
  }).eq("id", userId);

  // 4. Crear máquinas
  const { error: maqError } = await admin.from("maquinas").insert([
    { id: "demo-M1", nombre: "Máquina 1", activa: true, organization_id: org.id },
    { id: "demo-M2", nombre: "Máquina 2", activa: true, organization_id: org.id },
    { id: "demo-M3", nombre: "Máquina 3", activa: false, organization_id: org.id },
  ]);
  if (maqError) console.error("maquinas:", maqError.message);

  // 5. Crear clientes
  const { data: clientes, error: cliError } = await admin.from("clientes").insert([
    { nombre: "GL Santamaría Cocinas",  telefono: "0991234567", organization_id: org.id },
    { nombre: "Yammy Guillén Diseños",  telefono: "0987654321", organization_id: org.id },
    { nombre: "Muebles del Valle",      telefono: "0976543210", organization_id: org.id },
    { nombre: "Carpintería Central",    telefono: "0965432109", organization_id: org.id },
    { nombre: "Diseños Modernos SA",    telefono: "0954321098", organization_id: org.id },
  ]).select();
  if (cliError) console.error("clientes:", cliError.message);

  if (!clientes || clientes.length === 0) {
    return NextResponse.json({ error: "Error creando clientes" }, { status: 500 });
  }

  const hoy = new Date();
  const diasAtras = (d: number) => new Date(hoy.getTime() - d * 86400000).toISOString().split("T")[0];

  // 6. Crear pedidos con estados variados
  const pedidosData = [
    // En cola
    {
      cliente_id: clientes[0].id, vendedor_id: userId, organization_id: org.id,
      tipo_tablero: "MDF", cant_planchas: 8.5, cant_piezas: 163, metros_canto: 45,
      estado: "En cola", prioridad: "urgente", fecha_ingreso: diasAtras(0),
      maquina_asignada: null,
    },
    {
      cliente_id: clientes[1].id, vendedor_id: userId, organization_id: org.id,
      tipo_tablero: "Melamina", cant_planchas: 4, cant_piezas: 72, metros_canto: 28,
      estado: "En cola", prioridad: "normal", fecha_ingreso: diasAtras(0),
      maquina_asignada: null,
    },
    // En corte
    {
      cliente_id: clientes[2].id, vendedor_id: userId, organization_id: org.id,
      tipo_tablero: "MDF", cant_planchas: 12, cant_piezas: 220, metros_canto: 60,
      estado: "En corte", prioridad: "normal", fecha_ingreso: diasAtras(1),
      maquina_asignada: "demo-M1",
    },
    {
      cliente_id: clientes[3].id, vendedor_id: userId, organization_id: org.id,
      tipo_tablero: "Melamina", cant_planchas: 6, cant_piezas: 98, metros_canto: 35,
      estado: "En corte", prioridad: "urgente", fecha_ingreso: diasAtras(1),
      maquina_asignada: "demo-M2",
    },
    // En tapacantos
    {
      cliente_id: clientes[4].id, vendedor_id: userId, organization_id: org.id,
      tipo_tablero: "MDF", cant_planchas: 5, cant_piezas: 88, metros_canto: 30,
      estado: "En tapacantos", prioridad: "normal", fecha_ingreso: diasAtras(2),
      maquina_asignada: "demo-M1",
    },
    // Listo
    {
      cliente_id: clientes[0].id, vendedor_id: userId, organization_id: org.id,
      tipo_tablero: "Melamina", cant_planchas: 7, cant_piezas: 130, metros_canto: 42,
      estado: "Listo", prioridad: "normal", fecha_ingreso: diasAtras(2),
      maquina_asignada: "demo-M2",
    },
    {
      cliente_id: clientes[1].id, vendedor_id: userId, organization_id: org.id,
      tipo_tablero: "MDF", cant_planchas: 3.5, cant_piezas: 64, metros_canto: 20,
      estado: "Listo", prioridad: "normal", fecha_ingreso: diasAtras(3),
      maquina_asignada: "demo-M1",
    },
    // Despachado (ayer)
    {
      cliente_id: clientes[2].id, vendedor_id: userId, organization_id: org.id,
      tipo_tablero: "MDF", cant_planchas: 10, cant_piezas: 195, metros_canto: 55,
      estado: "Despachado", prioridad: "normal", fecha_ingreso: diasAtras(4),
      maquina_asignada: "demo-M2",
    },
    {
      cliente_id: clientes[3].id, vendedor_id: userId, organization_id: org.id,
      tipo_tablero: "Melamina", cant_planchas: 5.5, cant_piezas: 102, metros_canto: 38,
      estado: "Despachado", prioridad: "urgente", fecha_ingreso: diasAtras(5),
      maquina_asignada: "demo-M1",
    },
    // Cancelado
    {
      cliente_id: clientes[4].id, vendedor_id: userId, organization_id: org.id,
      tipo_tablero: "Triplay", cant_planchas: 2, cant_piezas: 30, metros_canto: 10,
      estado: "Cancelado", prioridad: "normal", fecha_ingreso: diasAtras(6),
      maquina_asignada: null,
    },
  ];

  const { error: pedidosError } = await admin.from("pedidos").insert(pedidosData);
  if (pedidosError) console.error("pedidos:", pedidosError.message);

  return NextResponse.json({
    success: true,
    credenciales: {
      email: "demo@kuadra.app",
      password: "kuadra2026",
    },
    org: {
      nombre: "Demo Taller",
      plan: "profesional",
    },
    datos_creados: {
      maquinas: 3,
      clientes: clientes.length,
      pedidos: pedidosData.length,
    },
  });
}
