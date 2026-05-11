import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const REGISTRATION_SECRET = process.env.REGISTRATION_SECRET;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const { org_nombre, nombre, email, password, token } = body;

  // Validar token de invitación
  if (!REGISTRATION_SECRET || !token || token !== REGISTRATION_SECRET) {
    return NextResponse.json({ error: "Token de invitación inválido o expirado." }, { status: 403 });
  }

  if (!org_nombre?.trim() || !nombre?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Generar slug único
  const slug = org_nombre.trim()
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 50);

  const trial_ends_at = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  // 1. Crear organización
  const { data: org, error: orgError } = await admin
    .from("organizations")
    .insert({
      nombre: org_nombre.trim(),
      slug,
      plan: "trial",
      max_maquinas: 2,
      max_usuarios: 3,
      trial_ends_at,
      activo: true,
    })
    .select()
    .single();

  if (orgError) {
    if (orgError.code === "23505") {
      return NextResponse.json({ error: "Ya existe un taller con ese nombre. Prueba con otro nombre." }, { status: 409 });
    }
    return NextResponse.json({ error: "Error al crear el taller" }, { status: 500 });
  }

  // 2. Crear usuario (sin confirmación de email — acceso inmediato)
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: email.trim(),
    password,
    email_confirm: true,
    user_metadata: { nombre: nombre.trim() },
  });

  if (authError) {
    await admin.from("organizations").delete().eq("id", org.id);
    const msg = authError.message.includes("already registered")
      ? "Ese correo ya está registrado. Inicia sesión en su lugar."
      : "Error al crear el usuario";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // 3. Actualizar profile con org_id + rol admin
  const { error: profileError } = await admin
    .from("profiles")
    .update({ organization_id: org.id, nombre: nombre.trim(), rol: "admin" })
    .eq("id", authData.user.id);

  if (profileError) {
    await admin.auth.admin.deleteUser(authData.user.id);
    await admin.from("organizations").delete().eq("id", org.id);
    return NextResponse.json({ error: "Error configurando el perfil" }, { status: 500 });
  }

  // 4. Crear máquinas por defecto para la org
  await admin.from("maquinas").insert([
    { id: `${slug}-M1`, nombre: "Máquina 1", activa: true, organization_id: org.id },
    { id: `${slug}-M2`, nombre: "Máquina 2", activa: true, organization_id: org.id },
  ]);

  return NextResponse.json({ success: true, org_nombre: org.nombre });
}
