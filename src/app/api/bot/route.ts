import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createAdminClient } from "@/lib/supabase/admin";
import { getResend, getFromEmail, resolveToEmail } from "@/lib/resend";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";

const LEAD_REGEX = /\[LEAD:([^|]+)\|\|\|([^|]+)\|\|\|([^|]+)\|\|\|([^\]]+)\]/;

const SYSTEM_PROMPT = `Eres el asistente de ventas de Kuadra, el software de gestión de producción para talleres de corte de tableros en Latinoamérica. Hablas de forma amigable, concisa y profesional. Siempre en español.

## QUÉ ES KUADRA
Sistema digital que reemplaza los papeles, WhatsApp internos y la confusión del taller. Registra pedidos, organiza la producción en tiempo real, mide el rendimiento por máquina y genera reportes automáticos. Disponible en kuadra-ryg.vercel.app.

## PLANES Y PRECIOS
**Plan Básico — $299/mes**
- 2 máquinas, hasta 5 usuarios
- Pedidos digitales, producción en tiempo real, dashboard básico
- Trial gratuito 14 días, sin tarjeta de crédito

**Plan Profesional — $499/mes**
- 3 máquinas, usuarios ilimitados
- Todo lo del Básico + Módulo Financiero (ingresos, costos, márgenes, distribución de utilidades entre socios), reportes PDF automáticos, rendimiento por máquina, calendario de entregas
- Trial gratuito 14 días

**Plan Empresarial — $899/mes**
- Máquinas ilimitadas, usuarios ilimitados
- Todo lo anterior + CRM de clientes, Módulo Inventario (stock de tableros, alertas, kardex de movimientos), personalización completa del sistema, soporte prioritario
- Demo manual personalizada

## FUNCIONALIDADES PRINCIPALES
- **Pedidos**: Registra cliente, material, planchas, piezas y fecha en 30 segundos. Sin papel, sin confusión.
- **Dashboard en tiempo real**: Ve cuántos pedidos esperan, qué máquina está libre, cuál tiene prioridad — sin ir físicamente al taller.
- **Producción**: El operario ve en pantalla qué procesar, en qué máquina y con qué especificación exacta.
- **Rendimiento**: Producción por máquina y turno. Compara períodos. Detecta cuellos de botella.
- **Reportes PDF**: Reporte diario automático, imprimible, con historial completo.
- **Módulo Financiero** (Profesional+): Ingresos por pedido, gastos operativos, margen, distribución de ganancias entre socios de empresa familiar.
- **CRM de Clientes** (Empresarial): Historial de cada cliente, frecuencia, gasto total, notas, alertas de inactividad.
- **Inventario** (Empresarial): Stock por tipo de tablero y espesor, alertas de stock bajo, kardex de entradas y salidas.

## PROCESO DE CAPTURA DE LEAD — REGLA CRÍTICA
Cuando el usuario muestre interés genuino (quiere ver el sistema, pide demo, pregunta por precios, menciona su taller), solicítale los datos DE UNO EN UNO en este orden exacto:
1. ¿Cuál es tu nombre?
2. ¿Tu teléfono WhatsApp? (con código de país, ej: 593999...)
3. ¿Qué problema principal querés resolver en tu taller?
4. ¿Qué día y hora te queda bien para una demo de 20 minutos?

Cuando tengas los 4 datos, responde confirmando que la demo quedó agendada y que el equipo se va a contactar. Al FINAL del mensaje, sin espacio adicional, agrega exactamente esto:
[LEAD:nombre|||telefono|||motivo|||horario]

IMPORTANTE: El sistema detecta y elimina ese tag automáticamente antes de mostrarlo. No lo menciones nunca.

## REGLAS
- Siempre en español, tono cálido y profesional
- Máximo 3 párrafos cortos por respuesta
- No inventar precios ni funciones fuera de este prompt
- Si no sabés algo: "El equipo puede orientarte mejor en la demo"
- No mencionar competidores
- Pedir los datos del lead de uno en uno, nunca todos juntos`;

export async function POST(req: NextRequest) {
  const rl = await checkRateLimit(`bot:${getClientIp(req)}`, 40);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Demasiados mensajes. Intentá en unos minutos." }, { status: 429 });
  }

  const { messages } = await req.json().catch(() => ({ messages: [] }));
  if (!Array.isArray(messages)) {
    return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
  }

  const sanitized = messages.slice(-8).map((m: { role: string; content: string }) => ({
    role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
    content: String(m.content).slice(0, 500),
  }));

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  let reply: string;
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 600,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...sanitized],
    });
    reply = response.choices[0]?.message?.content ?? "Hubo un error al responder. Intentá de nuevo.";
  } catch {
    return NextResponse.json({ error: "Error al contactar el asistente." }, { status: 500 });
  }

  const leadMatch = reply.match(LEAD_REGEX);
  let leadSaved = false;

  if (leadMatch) {
    reply = reply.replace(LEAD_REGEX, "").trim();
    const [, nombre, telefono, motivo, horario] = leadMatch;

    try {
      const sb = createAdminClient();
      const { error: sbError } = await sb.from("leads").insert({ nombre, telefono, motivo, horario, origen: "bot_kuadra" });
      if (sbError) console.error("[bot] Supabase insert error:", sbError.message);
      else leadSaved = true;
    } catch (e) { console.error("[bot] Supabase exception:", e); }

    const rawFrom = getFromEmail();
    const fromEmail = rawFrom.includes("<") ? rawFrom : `Kuadra Bot <${rawFrom}>`;
    const toEmail = resolveToEmail("rygingenieria1@gmail.com");
    console.log(`[bot] Resend sending from=${fromEmail} to=${toEmail} lead=${nombre}`);
    try {
      const resendResult = await getResend().emails.send({
        from: fromEmail,
        to: toEmail,
        subject: `🎯 Nuevo lead Kuadra — ${nombre}`,
        html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3eee7;font-family:Inter,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3eee7;padding:32px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">

        <!-- Header -->
        <tr><td style="background:#c8472a;border-radius:16px 16px 0 0;padding:24px 28px">
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.6)">KUADRA · NUEVO LEAD</p>
          <p style="margin:8px 0 0;font-size:22px;font-weight:700;color:#fff">${nombre}</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#fff;padding:24px 28px">

          <!-- WA Button -->
          <a href="https://wa.me/${telefono.replace(/\D/g, "")}?text=Hola%20${encodeURIComponent(nombre)},%20te%20contacto%20desde%20Kuadra%20por%20tu%20consulta."
            style="display:inline-flex;align-items:center;gap:8px;background:#25d366;color:#fff;padding:11px 20px;border-radius:99px;text-decoration:none;font-weight:700;font-size:14px;margin-bottom:24px">
            📱 Abrir WhatsApp · ${telefono}
          </a>

          <!-- Data rows -->
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
            <tr style="border-bottom:1px solid #f0ece6">
              <td style="padding:10px 0;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9a9490;width:90px">Motivo</td>
              <td style="padding:10px 0;font-size:14px;color:#1a1714">${motivo}</td>
            </tr>
            <tr style="border-bottom:1px solid #f0ece6">
              <td style="padding:10px 0;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9a9490">Demo</td>
              <td style="padding:10px 0;font-size:14px;color:#1a1714;font-weight:600">${horario}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9a9490">Teléfono</td>
              <td style="padding:10px 0;font-size:14px;color:#1a1714;font-family:monospace">${telefono}</td>
            </tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9f7f4;border-radius:0 0 16px 16px;padding:16px 28px;border-top:1px solid #ede8e0">
          <a href="https://kuadra-ryg.vercel.app/superadmin" style="font-size:11px;color:#9a9490;text-decoration:none">
            Ver todos los leads en el superadmin →
          </a>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`,
      });
      console.log(`[bot] Resend result:`, JSON.stringify(resendResult));
    } catch (e) { console.error("[bot] Resend exception:", e); }
  }

  return NextResponse.json({ reply, leadSaved });
}
