import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_PRICES } from "@/lib/stripe";
import { getOrganization } from "@/lib/org";

export async function POST(req: NextRequest) {
  const org = await getOrganization();
  if (!org) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { plan } = await req.json().catch(() => ({}));
  if (!plan || !STRIPE_PRICES[plan]) {
    return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
  }

  const priceId = STRIPE_PRICES[plan]!;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { org_id: org.id, plan },
    success_url: `${appUrl}/dashboard?upgrade=success`,
    cancel_url:  `${appUrl}/upgrade`,
    ...(org.stripe_customer_id ? { customer: org.stripe_customer_id } : {}),
  });

  return NextResponse.json({ url: session.url });
}
