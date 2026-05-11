import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserRole } from "@/lib/auth";

async function requireDeveloper() {
  const role = await getUserRole();
  if (role !== "developer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function GET() {
  const deny = await requireDeveloper();
  if (deny) return deny;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("organizations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const deny = await requireDeveloper();
  if (deny) return deny;

  const body = await req.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

  const { id, plan, activo, max_maquinas, max_usuarios, extend_trial_days } = body;

  const admin = createAdminClient();
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (extend_trial_days !== undefined) {
    const { data: org } = await admin.from("organizations").select("trial_ends_at").eq("id", id).single();
    const base = org?.trial_ends_at && new Date(org.trial_ends_at) > new Date()
      ? new Date(org.trial_ends_at)
      : new Date();
    base.setDate(base.getDate() + Number(extend_trial_days));
    update.trial_ends_at = base.toISOString();
  }

  if (plan !== undefined) {
    const LIMITS: Record<string, { max_maquinas: number; max_usuarios: number }> = {
      trial:       { max_maquinas: 2,  max_usuarios: 3  },
      basico:      { max_maquinas: 3,  max_usuarios: 5  },
      profesional: { max_maquinas: 5,  max_usuarios: 10 },
      empresarial: { max_maquinas: 8,  max_usuarios: 20 },
    };
    update.plan = plan;
    if (LIMITS[plan]) {
      update.max_maquinas = LIMITS[plan].max_maquinas;
      update.max_usuarios = LIMITS[plan].max_usuarios;
    }
    if (plan !== "trial") {
      update.subscribed_at = new Date().toISOString();
      update.trial_ends_at = null;
    }
  }
  if (activo !== undefined) update.activo = activo;
  if (max_maquinas !== undefined) update.max_maquinas = max_maquinas;
  if (max_usuarios !== undefined) update.max_usuarios = max_usuarios;

  const { error } = await admin.from("organizations").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
