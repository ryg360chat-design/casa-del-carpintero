import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendBienvenidaPlanEmail } from "@/lib/send-emails";

function requireSuperAdmin(req: NextRequest) {
  const key = req.headers.get("x-superadmin-key");
  if (!process.env.SUPERADMIN_KEY || key !== process.env.SUPERADMIN_KEY) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return null;
}

const LIMITS: Record<string, { max_maquinas: number; max_usuarios: number }> = {
  trial:       { max_maquinas: 2,  max_usuarios: 3  },
  basico:      { max_maquinas: 3,  max_usuarios: 5  },
  profesional: { max_maquinas: 5,  max_usuarios: 10 },
  empresarial: { max_maquinas: 8,  max_usuarios: 20 },
};

export async function POST(req: NextRequest) {
  const deny = requireSuperAdmin(req);
  if (deny) return deny;

  const body = await req.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

  const { id, plan, activo, extend_trial_days } = body;
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };

  const admin = createAdminClient();

  if (extend_trial_days !== undefined) {
    const { data: org } = await admin.from("organizations").select("trial_ends_at").eq("id", id).single();
    const base = org?.trial_ends_at && new Date(org.trial_ends_at) > new Date()
      ? new Date(org.trial_ends_at)
      : new Date();
    base.setDate(base.getDate() + Number(extend_trial_days));
    update.trial_ends_at = base.toISOString();
  }

  if (plan !== undefined) {
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

  // Obtener nombre de la org para el email
  const { data: orgRow } = await admin.from("organizations").select("nombre, plan").eq("id", id).single();

  const { error } = await admin.from("organizations").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Email de bienvenida al plan cuando se activa un plan pagado
  const planAnterior = orgRow?.plan;
  if (plan && plan !== "trial" && planAnterior === "trial" && orgRow?.nombre) {
    sendBienvenidaPlanEmail(id, orgRow.nombre, plan).catch(() => {});
  }

  return NextResponse.json({ success: true });
}
