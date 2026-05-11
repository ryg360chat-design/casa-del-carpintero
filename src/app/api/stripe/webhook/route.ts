import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";

const PLAN_LIMITS: Record<string, { max_maquinas: number; max_usuarios: number }> = {
  basico:      { max_maquinas: 3,  max_usuarios: 5  },
  profesional: { max_maquinas: 5,  max_usuarios: 10 },
  empresarial: { max_maquinas: 8,  max_usuarios: 20 },
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 });
  }

  const admin = createAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const org_id  = session.metadata?.org_id;
    const plan    = session.metadata?.plan;
    const limits  = PLAN_LIMITS[plan ?? ""] ?? PLAN_LIMITS.basico;

    if (org_id && plan) {
      await admin.from("organizations").update({
        plan,
        stripe_customer_id: session.customer as string,
        subscribed_at: new Date().toISOString(),
        trial_ends_at: null,
        max_maquinas: limits.max_maquinas,
        max_usuarios: limits.max_usuarios,
        activo: true,
        updated_at: new Date().toISOString(),
      }).eq("id", org_id);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const customer = sub.customer as string;
    await admin.from("organizations").update({
      plan: "trial",
      activo: false,
      updated_at: new Date().toISOString(),
    }).eq("stripe_customer_id", customer);
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const customer = invoice.customer as string;
    await admin.from("organizations").update({
      activo: false,
      updated_at: new Date().toISOString(),
    }).eq("stripe_customer_id", customer);
  }

  return NextResponse.json({ received: true });
}
