import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function requireSuperAdmin(req: NextRequest) {
  const key = req.headers.get("x-superadmin-key");
  if (!process.env.SUPERADMIN_KEY || key !== process.env.SUPERADMIN_KEY) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const deny = requireSuperAdmin(req);
  if (deny) return deny;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ leads: data ?? [] });
}

export async function DELETE(req: NextRequest) {
  const deny = requireSuperAdmin(req);
  if (deny) return deny;

  const { id } = await req.json().catch(() => ({ id: null }));
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

  const admin = createAdminClient();
  await admin.from("leads").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
