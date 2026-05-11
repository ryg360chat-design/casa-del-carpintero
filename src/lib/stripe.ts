// Requiere: npm install stripe
// Variables de entorno necesarias en .env.local:
//   STRIPE_SECRET_KEY=sk_live_...
//   STRIPE_WEBHOOK_SECRET=whsec_...
//   STRIPE_PRICE_BASICO=price_...       (mensual)
//   STRIPE_PRICE_PROFESIONAL=price_...  (mensual)
//   STRIPE_PRICE_EMPRESARIAL=price_...  (mensual)
//   NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const STRIPE_PRICES: Record<string, string | undefined> = {
  basico:      process.env.STRIPE_PRICE_BASICO,
  profesional: process.env.STRIPE_PRICE_PROFESIONAL,
  empresarial: process.env.STRIPE_PRICE_EMPRESARIAL,
};
