import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
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
  const rl = await checkRateLimit(`bot:${getClientIp(req)}`);
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
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      await sb.from("leads").insert({ nombre, telefono, motivo, horario, origen: "bot_kuadra" });
      leadSaved = true;
    } catch { /* non-critical */ }

    try {
      await getResend().emails.send({
        from: getFromEmail(),
        to: resolveToEmail("rygingenieria1@gmail.com"),
        subject: `Nuevo lead Kuadra — ${nombre}`,
        html: `
          <h2>Nuevo lead capturado por el bot de Kuadra</h2>
          <table style="border-collapse:collapse;width:100%;max-width:500px">
            <tr><td style="padding:8px;font-weight:bold;border:1px solid #eee">Nombre</td><td style="padding:8px;border:1px solid #eee">${nombre}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border:1px solid #eee">Teléfono</td><td style="padding:8px;border:1px solid #eee">${telefono}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border:1px solid #eee">Motivo</td><td style="padding:8px;border:1px solid #eee">${motivo}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border:1px solid #eee">Demo</td><td style="padding:8px;border:1px solid #eee">${horario}</td></tr>
          </table>
          <p style="margin-top:16px">
            <a href="https://wa.me/${telefono.replace(/\D/g, "")}" style="background:#25d366;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold">
              Abrir WhatsApp →
            </a>
          </p>
          <p style="color:#999;font-size:12px;margin-top:24px">
            Ver todos los leads en <a href="https://kuadra-ryg.vercel.app/superadmin">kuadra-ryg.vercel.app/superadmin</a>
          </p>
        `,
      });
    } catch { /* non-critical */ }
  }

  return NextResponse.json({ reply, leadSaved });
}
