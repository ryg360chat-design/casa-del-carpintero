const BASE_COLOR = "#1957A6";
const WA_NUMBER = "593963009901";
const APP_URL = "https://kuadra.app";

function waHref(orgNombre: string) {
  const text = encodeURIComponent(`Hola, soy de ${orgNombre} y quiero continuar usando Kuadra.`);
  return `https://wa.me/${WA_NUMBER}?text=${text}`;
}

function wrapper(content: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kuadra</title></head>
<body style="margin:0;padding:0;background:#f3eee7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3eee7;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1957A6 0%,#267A8C 100%);padding:28px 32px;">
            <div style="display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,.18);">
              <span style="color:#fff;font-size:22px;font-weight:900;letter-spacing:-1px;line-height:1;">K</span>
            </div>
            <span style="display:inline-block;vertical-align:middle;color:#fff;font-size:20px;font-weight:700;margin-left:12px;letter-spacing:-.5px;">Kuadra</span>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:32px;">${content}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8f9fb;padding:20px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
              Kuadra · Software para talleres de madera<br>
              <a href="${APP_URL}" style="color:#9ca3af;">kuadra.app</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(href: string, label: string, color = BASE_COLOR) {
  return `<a href="${href}" style="display:inline-block;padding:12px 24px;background:${color};color:#fff;border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;">${label}</a>`;
}

export function emailBienvenida(orgNombre: string, userName: string) {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">¡Bienvenido a Kuadra, ${orgNombre}!</h1>
    <p style="margin:0 0 20px;font-size:15px;color:#4b5563;">Hola ${userName}, tu taller ya está listo. Tienes <strong>14 días de prueba gratuita</strong> para explorar todo lo que Kuadra puede hacer por tu carpintería.</p>

    <table cellpadding="0" cellspacing="0" style="width:100%;background:#f8f9fb;border-radius:10px;padding:16px;margin-bottom:24px;">
      <tr>
        <td style="padding:8px 0;">
          <span style="font-size:16px;">📋</span>
          <span style="font-size:14px;color:#374151;margin-left:8px;">Gestiona pedidos y clientes en un solo lugar</span>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;">
          <span style="font-size:16px;">🏭</span>
          <span style="font-size:14px;color:#374151;margin-left:8px;">Controla el estado de producción en tiempo real</span>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;">
          <span style="font-size:16px;">📦</span>
          <span style="font-size:14px;color:#374151;margin-left:8px;">Lleva el inventario de materiales y costos</span>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;">
          <span style="font-size:16px;">📊</span>
          <span style="font-size:14px;color:#374151;margin-left:8px;">Reportes financieros y exportación en CSV</span>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 24px;text-align:center;">${btn(`${APP_URL}/dashboard`, "Ir al dashboard")}</p>

    <p style="margin:0;font-size:13px;color:#6b7280;">Si tienes alguna pregunta, escríbenos directamente por WhatsApp — respondemos rápido.</p>
    <p style="margin:8px 0 0;text-align:center;">${btn(waHref(orgNombre), "Escribir por WhatsApp", "#25d366")}</p>
  `;
  return { subject: `¡Bienvenido a Kuadra, ${orgNombre}!`, html: wrapper(body) };
}

export function emailTrialWarning(orgNombre: string, daysLeft: number) {
  const dayLabel = daysLeft === 1 ? "1 día" : `${daysLeft} días`;
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">Tu trial vence en ${dayLabel}</h1>
    <p style="margin:0 0 20px;font-size:15px;color:#4b5563;">
      El período de prueba de <strong>${orgNombre}</strong> en Kuadra termina pronto. Para seguir gestionando tu taller sin interrupciones, contáctanos por WhatsApp.
    </p>

    <table cellpadding="0" cellspacing="0" style="width:100%;background:#fff8f0;border:1px solid #fed7aa;border-radius:10px;padding:16px;margin-bottom:24px;">
      <tr>
        <td>
          <p style="margin:0;font-size:14px;color:#92400e;font-weight:600;">⏰ Días restantes: ${dayLabel}</p>
          <p style="margin:6px 0 0;font-size:13px;color:#b45309;">Después del vencimiento, el acceso será bloqueado hasta activar tu plan.</p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 24px;text-align:center;">${btn(waHref(orgNombre), "Continuar en Kuadra — WhatsApp", "#25d366")}</p>
    <p style="margin:0;font-size:13px;color:#6b7280;text-align:center;">También puedes escribirnos directamente respondiendo este correo.</p>
  `;
  return { subject: `Tu trial de Kuadra vence en ${dayLabel} — ${orgNombre}`, html: wrapper(body) };
}

export function emailTrialExpired(orgNombre: string) {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">Tu período de prueba terminó</h1>
    <p style="margin:0 0 20px;font-size:15px;color:#4b5563;">
      Los 14 días de prueba gratuita de <strong>${orgNombre}</strong> han vencido. Tu acceso a Kuadra está temporalmente suspendido.
    </p>

    <table cellpadding="0" cellspacing="0" style="width:100%;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px;margin-bottom:24px;">
      <tr>
        <td>
          <p style="margin:0;font-size:14px;color:#991b1b;font-weight:600;">🔒 Acceso suspendido</p>
          <p style="margin:6px 0 0;font-size:13px;color:#b91c1c;">Contáctanos por WhatsApp para reactivar tu cuenta. El proceso toma menos de 5 minutos.</p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 16px;text-align:center;">${btn(waHref(orgNombre), "Reactivar mi cuenta — WhatsApp", "#25d366")}</p>
    <p style="margin:0;font-size:13px;color:#6b7280;text-align:center;">Todos tus datos están guardados y seguros.</p>
  `;
  return { subject: `Tu trial de Kuadra ha terminado — ${orgNombre}`, html: wrapper(body) };
}
