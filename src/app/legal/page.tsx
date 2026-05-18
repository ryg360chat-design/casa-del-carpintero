import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos y Privacidad — Kuadra",
  description: "Términos de servicio y política de privacidad de Kuadra.",
  robots: { index: false },
};

const CONTACT_EMAIL = "gestion@ryginmo.com";
const COMPANY = "RyG SaaS";
const PRODUCT = "Kuadra";
const COUNTRY = "Ecuador";
const EFFECTIVE_DATE = "1 de mayo de 2026";

export default function LegalPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f3eee7", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* NAV mínimo */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(243,238,231,0.80)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(26,23,20,0.10)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", height: 56,
      }}>
        <Link href="/" style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "#1a1714", textDecoration: "none" }}>
          Kuadra
        </Link>
        <Link href="/" style={{ fontSize: 13, color: "#9a9490", textDecoration: "none" }}>← Volver</Link>
      </nav>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "64px 32px 96px" }}>
        <p style={{ fontSize: 12, color: "#9a9490", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>Documento legal</p>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 48, lineHeight: 1.1, color: "#1a1714", marginBottom: 8 }}>
          Términos y<br />Privacidad
        </h1>
        <p style={{ fontSize: 14, color: "#9a9490", marginBottom: 56 }}>Vigente desde {EFFECTIVE_DATE} · {PRODUCT} por {COMPANY} · {COUNTRY}</p>

        <Section title="1. Aceptación de los términos">
          <p>Al acceder y utilizar {PRODUCT}, aceptas estos términos en su totalidad. Si no estás de acuerdo con alguna parte, no debes usar el servicio.</p>
          <p>Estos términos se aplican a todos los usuarios, incluyendo administradores, operadores y cualquier persona que acceda al sistema a través de una cuenta activa.</p>
        </Section>

        <Section title="2. Descripción del servicio">
          <p>{PRODUCT} es un sistema de gestión en la nube diseñado para talleres de corte de tableros y carpintería. Permite registrar pedidos, controlar producción por máquina, gestionar inventario y generar reportes operativos.</p>
          <p>El servicio se presta bajo un modelo de suscripción mensual o anual. El acceso está condicionado al pago oportuno del plan contratado.</p>
        </Section>

        <Section title="3. Cuentas y acceso">
          <p>Cada organización contratante recibe un entorno aislado. El administrador principal es responsable de gestionar el acceso de los usuarios dentro de su organización.</p>
          <p>El usuario es responsable de mantener la confidencialidad de sus credenciales. Ante sospecha de acceso no autorizado, debe notificar de inmediato a {CONTACT_EMAIL}.</p>
          <p>Nos reservamos el derecho de suspender cuentas que incumplan estos términos, presenten actividad fraudulenta o estén en mora.</p>
        </Section>

        <Section title="4. Período de prueba">
          <p>{PRODUCT} ofrece un período de prueba gratuito de 14 días desde el registro. Al vencerse, el acceso se suspende automáticamente hasta que se active un plan de pago.</p>
          <p>Durante el período de prueba se aplican las mismas condiciones de uso y privacidad que a los planes pagos.</p>
        </Section>

        <Section title="5. Pagos y cancelación">
          <p>Los planes se facturan mensual o anualmente en dólares estadounidenses (USD). Los precios están publicados en la página principal y pueden modificarse con 30 días de aviso previo.</p>
          <p>No se realizan reembolsos por períodos parciales. La cancelación es efectiva al final del período de facturación vigente.</p>
          <p>Para cancelar o modificar tu plan, escribe a {CONTACT_EMAIL}.</p>
        </Section>

        <Section title="6. Política de privacidad">
          <p>{COMPANY} recopila y trata los siguientes datos para prestar el servicio:</p>
          <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
            <li><strong>Datos de la organización:</strong> nombre del taller, información de contacto y configuración del plan.</li>
            <li><strong>Datos operativos:</strong> pedidos, materiales, máquinas, usuarios internos y reportes generados dentro del sistema.</li>
            <li><strong>Datos de acceso:</strong> dirección de correo electrónico y contraseña (almacenada de forma encriptada).</li>
            <li><strong>Datos de uso:</strong> registros de actividad y metadatos técnicos para el funcionamiento del servicio.</li>
          </ul>
        </Section>

        <Section title="7. Uso de los datos">
          <p>Tus datos se utilizan exclusivamente para:</p>
          <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
            <li>Prestar y mantener el servicio contratado.</li>
            <li>Enviarte comunicaciones relacionadas con tu cuenta (activación, avisos de vencimiento, actualizaciones importantes).</li>
            <li>Mejorar la plataforma de forma agregada y anónima.</li>
          </ul>
          <p>No vendemos ni compartimos tus datos personales con terceros con fines comerciales.</p>
        </Section>

        <Section title="8. Infraestructura y terceros técnicos">
          <p>Para operar el servicio utilizamos proveedores de infraestructura en la nube, servicios de autenticación, almacenamiento de archivos y envío de correo electrónico. Estos proveedores actúan como encargados del tratamiento bajo acuerdos de confidencialidad y seguridad.</p>
          <p>No divulgamos los nombres específicos de estos proveedores en este documento. Están sujetos a sus propias políticas de privacidad y a las obligaciones contractuales que mantenemos con ellos.</p>
        </Section>

        <Section title="9. Seguridad de los datos">
          <p>Implementamos medidas técnicas y organizativas para proteger la información, incluyendo encriptación en tránsito y en reposo, autenticación segura, y separación de datos por organización (multi-tenant).</p>
          <p>A pesar de estas medidas, ningún sistema es 100% infalible. En caso de incidente de seguridad que afecte tus datos, te notificaremos en el menor tiempo posible.</p>
        </Section>

        <Section title="10. Retención y eliminación de datos">
          <p>Los datos operativos se conservan mientras la cuenta esté activa. Al cancelar el servicio, los datos se mantienen por un período de 30 días para permitir una eventual recuperación. Transcurrido ese plazo, se eliminan de forma permanente.</p>
          <p>Puedes solicitar la eliminación anticipada de tus datos escribiendo a {CONTACT_EMAIL}.</p>
        </Section>

        <Section title="11. Propiedad intelectual">
          <p>{PRODUCT} y todo su contenido — incluyendo código, diseño, textos y funcionalidades — son propiedad de {COMPANY}. El uso del servicio no otorga ningún derecho de propiedad sobre la plataforma.</p>
          <p>Los datos ingresados por el usuario (pedidos, clientes, materiales, etc.) son de su exclusiva propiedad. {COMPANY} no reclama derechos sobre ellos.</p>
        </Section>

        <Section title="12. Limitación de responsabilidad">
          <p>{PRODUCT} se ofrece "tal cual". No garantizamos disponibilidad ininterrumpida del servicio. No somos responsables por pérdidas de negocio derivadas de interrupciones del sistema, errores en los datos ingresados por el usuario o uso incorrecto de la plataforma.</p>
        </Section>

        <Section title="13. Modificaciones">
          <p>Podemos actualizar estos términos en cualquier momento. Las modificaciones sustanciales se comunicarán por correo electrónico con al menos 15 días de anticipación. El uso continuado del servicio tras la notificación implica aceptación de los nuevos términos.</p>
        </Section>

        <Section title="14. Legislación aplicable">
          <p>Estos términos se rigen por las leyes de la República del {COUNTRY}. Cualquier disputa se someterá a los tribunales competentes de Quito, {COUNTRY}.</p>
        </Section>

        <Section title="15. Contacto">
          <p>Para cualquier consulta sobre estos términos o sobre el tratamiento de tus datos personales, escríbenos a:</p>
          <p>
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#c8472a", textDecoration: "none", fontWeight: 600 }}>
              {CONTACT_EMAIL}
            </a>
          </p>
          <p style={{ marginTop: 8, color: "#9a9490", fontSize: 13 }}>{COMPANY} · Quito, {COUNTRY}</p>
        </Section>
      </main>

      <footer style={{ textAlign: "center", padding: "0 0 40px", color: "#9a9490", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {PRODUCT} · {COMPANY} · © 2026
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a1714", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid rgba(26,23,20,0.10)" }}>
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 15, color: "#5a5450", lineHeight: 1.7 }}>
        {children}
      </div>
    </section>
  );
}
