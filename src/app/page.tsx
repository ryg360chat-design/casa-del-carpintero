"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const modules = [
  { mark: "◈", name: "Dashboard", desc: "Vista principal — métricas al instante" },
  { mark: "◻", name: "Pedidos", desc: "Gestión completa e historial de estados" },
  { mark: "◆", name: "Producción", desc: "Pantalla operativa del taller en tiempo real" },
  { mark: "↗", name: "Rendimiento", desc: "Analítica por máquina y por turno" },
  { mark: "▦", name: "Calendario", desc: "Planificación visual por fecha de entrega" },
  { mark: "◧", name: "Reporte", desc: "Informes diarios y exportación PDF" },
  { mark: "◎", name: "Usuarios", desc: "Roles y permisos seguros por persona" },
  { mark: "⊕", name: "Ajustes", desc: "Parámetros y configuración del taller" },
];

const chips = [
  "Control de pedidos", "Producción en tiempo real", "Trazabilidad total",
  "Analítica de rendimiento", "Calendario de entregas", "Reporte diario PDF",
  "Gestión de roles", "Historial completo", "Asignación de máquinas",
  "Control de pedidos", "Producción en tiempo real", "Trazabilidad total",
  "Analítica de rendimiento", "Calendario de entregas", "Reporte diario PDF",
  "Gestión de roles", "Historial completo", "Asignación de máquinas",
];

export default function Page() {
  const [active, setActive] = useState(0);
  const [clock, setClock] = useState("");
  const [rend, setRend] = useState(86);
  const [cola, setCola] = useState(28);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setRend((r) => Math.min(99, Math.max(72, r + (Math.random() > 0.5 ? 1 : -1))));
      setCola((c) => Math.min(35, Math.max(20, c + (Math.random() > 0.5 ? 1 : -1))));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="kl">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* NAV */}
      <nav className="kl-nav">
        <Link href="/" className="kl-logo">
          <div className="kl-logo-mark">K</div>
          <span className="kl-logo-name">Kuadra</span>
        </Link>
        <div className="kl-nav-links">
          <a href="#modulos">Módulos</a>
          <a href="#precios">Precios</a>
          <a href="#ecosistema">Ecosistema</a>
        </div>
        <Link href="/dashboard" className="kl-nav-cta">Solicitar demo →</Link>
      </nav>

      {/* HERO */}
      <section className="kl-hero" id="inicio">
        <div className="kl-eyebrow">◆ Sistema de gestión para talleres</div>
        <h1 className="kl-hero-title">
          El taller que<br /><em>sabe</em> lo que<br />está pasando.
        </h1>
        <p className="kl-hero-sub">
          Kuadra centraliza pedidos, máquinas y rendimiento en un solo sistema — sin papeles, sin llamadas, en tiempo real.
        </p>

        <div className="kl-metrics-strip">
          <div className="kl-metric">
            <div className="kl-metric-label">Hora actual</div>
            <div className="kl-metric-val kl-mono">{clock || "00:00:00"}</div>
          </div>
          <div className="kl-metric-divider" />
          <div className="kl-metric">
            <div className="kl-metric-label">En cola ahora</div>
            <div className="kl-metric-val">{cola} <span className="kl-metric-unit">pedidos</span></div>
          </div>
          <div className="kl-metric-divider" />
          <div className="kl-metric">
            <div className="kl-metric-label">Rendimiento M1</div>
            <div className="kl-metric-val kl-maccent">{rend}%</div>
          </div>
          <div className="kl-metric-divider" />
          <div className="kl-metric">
            <div className="kl-metric-label">Estado sistema</div>
            <div className="kl-metric-live"><span className="kl-live-dot" />En vivo</div>
          </div>
        </div>

        <div className="kl-hero-ctas">
          <Link href="/dashboard" className="kl-btn-primary">Solicitar demo →</Link>
          <a href="#modulos" className="kl-btn-outline">Ver módulos</a>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="kl-marquee-wrap">
        <div className="kl-marquee-track">
          {chips.map((c, i) => (
            <div key={i} className="kl-chip">◆ {c}</div>
          ))}
        </div>
      </div>

      {/* MODULES */}
      <section className="kl-modules-section" id="modulos">
        <div className="kl-container">
          <div className="kl-eyebrow">◆ Plataforma completa</div>
          <h2 className="kl-section-title">8 módulos.<br />Un solo sistema.</h2>
          <p className="kl-section-sub">Desde que entra el pedido hasta que sale el despacho. Todo conectado, todo visible.</p>

          <div className="kl-modules-grid">
            <div className="kl-module-list">
              {modules.map((m, i) => (
                <div
                  key={i}
                  className={`kl-module-item${active === i ? " kl-active" : ""}`}
                  onClick={() => setActive(i)}
                >
                  <div className="kl-module-mark">{m.mark}</div>
                  <div className="kl-module-text">
                    <div className="kl-module-name">{m.name}</div>
                    <div className="kl-module-desc">{m.desc}</div>
                  </div>
                  <div className="kl-module-arrow">→</div>
                </div>
              ))}
            </div>

            <div className="kl-mockup">
              <div className="kl-mockup-bar">
                <div className="kl-mockup-dots">
                  <div className="kl-mockup-dot" />
                  <div className="kl-mockup-dot" />
                  <div className="kl-mockup-dot" />
                </div>
                <div className="kl-mockup-url kl-mono">kuadra.app / dashboard</div>
              </div>
              <div className="kl-mockup-content">
                <div className="kl-mockup-eyebrow kl-mono">PRODUCCIÓN — Jueves, 7 de Mayo</div>
                <div className="kl-mockup-stats">
                  {[
                    { label: "Ingresados", val: "00" },
                    { label: "En cola", val: "04", cls: "kl-mv-accent" },
                    { label: "En corte", val: "02", cls: "kl-mv-warn" },
                    { label: "Listos", val: "12", cls: "kl-mv-ok" },
                  ].map((s) => (
                    <div key={s.label} className="kl-mockup-stat">
                      <div className="kl-mockup-stat-label kl-mono">{s.label}</div>
                      <div className={`kl-mockup-stat-val${s.cls ? " " + s.cls : ""}`}>{s.val}</div>
                    </div>
                  ))}
                </div>
                <div className="kl-mockup-machines">
                  {[
                    { name: "MÁQUINA 1", order: "GL Santamaria Cocina 303", planchas: "8.5", piezas: "163" },
                    { name: "MÁQUINA 2", order: "Yammy Guillén", planchas: "2.5", piezas: "35" },
                    { name: "MÁQUINA 3", order: null },
                  ].map((m) => (
                    <div key={m.name} className="kl-mockup-machine">
                      <div className="kl-mockup-machine-name kl-mono">{m.name}</div>
                      {m.order ? (
                        <>
                          <div className="kl-mockup-machine-status">Operativa</div>
                          <div className="kl-mockup-order">
                            <div className="kl-mockup-order-name">{m.order}</div>
                            <div className="kl-mockup-order-nums">
                              <div>
                                <div className="kl-mockup-order-num kl-mono">{m.planchas}</div>
                                <div className="kl-mockup-order-num-label">planchas</div>
                              </div>
                              <div>
                                <div className="kl-mockup-order-num kl-mono">{m.piezas}</div>
                                <div className="kl-mockup-order-num-label">piezas</div>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="kl-mockup-empty">Sin pedidos activos</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="kl-benefits-section">
        <div className="kl-container">
          <div className="kl-eyebrow">◆ Por qué Kuadra</div>
          <h2 className="kl-section-title">Tu taller,<br />en tiempo real.</h2>
          <p className="kl-section-sub">Deja de decidir a ciegas. Kuadra convierte el caos del taller en datos claros y acción inmediata.</p>
          <div className="kl-benefits-grid">
            {[
              { mark: "◻", title: "Sin bitácoras en papel", desc: "Cada pedido vive en el sistema con cliente, material, planchas, piezas y fecha estimada.", before: "Cuadernos, hojas sueltas, WhatsApp", after: "Sistema centralizado en tiempo real" },
              { mark: "◆", title: "Cada máquina, visible", desc: "M1, M2 y M3 con estado en vivo. Si una máquina está libre, redistribuye la carga al instante.", before: "Preguntar y revisar papeles", after: "Ver en pantalla y actuar" },
              { mark: "↗", title: "Decisiones con datos", desc: "Rendimiento por máquina, comparativo ideal vs real, carga pendiente y reportes diarios en PDF.", before: "Suposiciones y llamadas internas", after: "Reportes y métricas reales" },
              { mark: "▦", title: "Calendario de entregas", desc: "Vista mensual por fecha. Días cerrados en verde, días con carga en amarillo. Atrasos al primer vistazo.", before: "Revisar pedido por pedido", after: "Un vistazo al calendario" },
              { mark: "◈", title: "Trazabilidad total", desc: "En cola → En corte → Tapacantos → Listo → Despachado. Con hora y responsable de cada cambio.", before: "Nadie sabe qué pasó con el pedido", after: "Historial completo con responsable" },
              { mark: "◎", title: "Roles para cada persona", desc: "Gerencia, ventas, producción, logística, almacén — cada rol ve exactamente lo que necesita.", before: "Todos ven todo, nadie es responsable", after: "Permisos claros por persona" },
            ].map((b) => (
              <div key={b.title} className="kl-benefit-card">
                <div className="kl-benefit-mark">{b.mark}</div>
                <div className="kl-benefit-title">{b.title}</div>
                <div className="kl-benefit-desc">{b.desc}</div>
                <div className="kl-benefit-ba">
                  <div className="kl-benefit-before">{b.before}</div>
                  <div className="kl-benefit-after">→ {b.after}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="kl-pricing-section" id="precios">
        <div className="kl-container">
          <div className="kl-eyebrow kl-eyebrow-center">◆ Inversión transparente</div>
          <h2 className="kl-section-title kl-title-center">El plan que se adapta<br />a tu taller.</h2>
          <p className="kl-section-sub kl-sub-center">14 días de prueba gratuita. Sin costos de activación.</p>

          <div className="kl-pricing-grid">
            <div className="kl-pricing-card">
              <div className="kl-ptier kl-mono">Básico</div>
              <div className="kl-pfor">Para empezar</div>
              <div className="kl-pprice"><sup>$</sup>299<span>/mes</span></div>
              <div className="kl-psub">2 máquinas · hasta 5 usuarios</div>
              <div className="kl-pdivider" />
              <ul className="kl-pfeatures">
                {["Panel de control", "Gestión de pedidos + historial", "Producción en tiempo real", "Vista por día", "3 roles básicos"].map(f => (
                  <li key={f} className="kl-pfeature"><span className="kl-pcheck">◆</span>{f}</li>
                ))}
                {["Rendimiento avanzado", "Reporte PDF"].map(f => (
                  <li key={f} className="kl-pfeature kl-pfeature-off"><span className="kl-pno">—</span>{f}</li>
                ))}
              </ul>
              <Link href="/dashboard" className="kl-pbtn kl-pbtn-outline">Solicitar demo →</Link>
              <div className="kl-ptrial kl-mono">Prueba 14 días gratis</div>
            </div>

            <div className="kl-pricing-card kl-pfeatured">
              <div className="kl-ppopular kl-mono">MÁS POPULAR</div>
              <div className="kl-ptier kl-mono kl-ptier-inv">Profesional</div>
              <div className="kl-pfor kl-pfor-inv">Para crecer</div>
              <div className="kl-pprice kl-pprice-inv"><sup>$</sup>499<span>/mes</span></div>
              <div className="kl-psub kl-psub-inv">3 máquinas · usuarios ilimitados</div>
              <div className="kl-pdivider kl-pdivider-inv" />
              <ul className="kl-pfeatures">
                {["Todo lo del plan Básico", "Analítica de rendimiento", "Calendario de entregas", "Reporte diario + PDF", "Todos los roles del sistema", "Módulo Financiero", "Múltiples materiales por pedido"].map(f => (
                  <li key={f} className="kl-pfeature kl-pfeature-inv"><span className="kl-pcheck-inv">◆</span>{f}</li>
                ))}
              </ul>
              <Link href="/dashboard" className="kl-pbtn kl-pbtn-inv">Solicitar demo →</Link>
              <div className="kl-ptrial kl-mono kl-ptrial-inv">Prueba 14 días gratis</div>
            </div>

            <div className="kl-pricing-card">
              <div className="kl-ptier kl-mono">Empresarial</div>
              <div className="kl-pfor">Para escalar</div>
              <div className="kl-pprice"><sup>$</sup>899<span>/mes</span></div>
              <div className="kl-psub">Máquinas ilimitadas · todo incluido</div>
              <div className="kl-pdivider" />
              <ul className="kl-pfeatures">
                {["Todo lo del plan Profesional", "CRM de Clientes", "Módulo Inventario", "Historial de reportes", "Exportar CSV / Excel", "Personalización de la herramienta", "Roles personalizados"].map(f => (
                  <li key={f} className="kl-pfeature"><span className="kl-pcheck">◆</span>{f}</li>
                ))}
              </ul>
              <Link href="/dashboard" className="kl-pbtn kl-pbtn-outline">Solicitar demo →</Link>
              <div className="kl-ptrial kl-mono">Demo personalizada</div>
            </div>
          </div>
        </div>
      </section>

      {/* ECOSYSTEM */}
      <section className="kl-ecosystem-section" id="ecosistema">
        <div className="kl-container">
          <div className="kl-eyebrow kl-eyebrow-center">◆ Parte de algo más grande</div>
          <h2 className="kl-section-title kl-title-center">El ecosistema RyG SaaS</h2>
          <p className="kl-section-sub kl-sub-center">Herramientas verticales para industrias específicas. Misma calidad, mismo estándar.</p>
          <div className="kl-eco-grid">
            {[
              { mark: "D", name: "Domia", desc: "Gestión de condominios y conjuntos residenciales.", current: false },
              { mark: "G", name: "Gestrik", desc: "Control de proyectos de construcción e ingeniería civil.", current: false },
              { mark: "R", name: "ryginmo", desc: "Plataforma de gestión inmobiliaria y activos en renta.", current: false },
              { mark: "K", name: "Kuadra", desc: "Sistema de gestión para talleres de corte y carpintería.", current: true },
            ].map((e) => (
              <div key={e.name} className={`kl-eco-card${e.current ? " kl-eco-current" : ""}`}>
                <div className="kl-eco-mark">{e.mark}</div>
                {e.current && <div className="kl-eco-here kl-mono">Estás aquí</div>}
                <div className="kl-eco-name">{e.name}</div>
                <div className="kl-eco-desc">{e.desc}</div>
                <div className="kl-eco-link">{e.current ? "Kuadra" : "RyG SaaS →"}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="kl-cta-section">
        <div className="kl-cta-watermark">KUADRA</div>
        <div className="kl-cta-inner">
          <div className="kl-eyebrow kl-eyebrow-center kl-eyebrow-cream">◆ Empieza hoy</div>
          <h2 className="kl-cta-title">
            ¿Listo para ver<br /><em>tu taller?</em>
          </h2>
          <p className="kl-cta-sub">Centraliza pedidos, controla máquinas y toma decisiones con datos reales desde el primer día.</p>
          <div className="kl-cta-btns">
            <Link href="/dashboard" className="kl-btn-cta-primary">Solicitar demo →</Link>
            <a href="#modulos" className="kl-btn-cta-outline">Ver módulos</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="kl-footer">
        <div className="kl-footer-logo">
          <div className="kl-footer-mark">K</div>
          <span className="kl-footer-name">Kuadra</span>
        </div>
        <div className="kl-footer-copy kl-mono">© 2026 Kuadra. Todos los derechos reservados.</div>
        <div className="kl-footer-ryg">Construido con ❤ por <span>RyG SaaS</span></div>
      </footer>
    </div>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

.kl {
  --bg: #f3eee7;
  --ink: #1a1714;
  --ink2: #5a5450;
  --ink3: #9a9490;
  --accent: #c8472a;
  --white: #ffffff;
  --border: rgba(26,23,20,0.10);
  --border2: rgba(26,23,20,0.18);
}
.kl * { box-sizing:border-box; margin:0; padding:0; }
.kl {
  background: var(--bg);
  color: var(--ink);
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
}
.kl-mono { font-family: 'JetBrains Mono', monospace; }

/* NAV */
.kl-nav {
  position: sticky; top: 0; z-index: 100;
  background: rgba(243,238,231,0.94);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 48px; height: 60px;
}
.kl-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.kl-logo-mark {
  width: 32px; height: 32px; border-radius: 8px;
  background: var(--ink);
  display: flex; align-items: center; justify-content: center;
  font-family: 'JetBrains Mono', monospace; font-weight: 600;
  color: var(--bg); font-size: 13px;
}
.kl-logo-name {
  font-family: 'Instrument Serif', serif;
  font-size: 20px; color: var(--ink);
  letter-spacing: -0.01em;
}
.kl-nav-links { display: flex; gap: 32px; }
.kl-nav-links a {
  text-decoration: none; color: var(--ink2); font-size: 14px; font-weight: 500;
  transition: color .15s;
}
.kl-nav-links a:hover { color: var(--ink); }
.kl-nav-cta {
  padding: 9px 20px; border-radius: 99px;
  background: var(--ink); color: var(--bg);
  font-size: 14px; font-weight: 500;
  text-decoration: none; transition: all .15s;
}
.kl-nav-cta:hover { background: var(--accent); }

/* EYEBROW */
.kl-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; font-weight: 500;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--accent);
  margin-bottom: 20px;
}
.kl-eyebrow-center { text-align: center; }
.kl-eyebrow-cream { color: var(--bg); opacity: 0.7; }

/* HERO */
.kl-hero {
  min-height: calc(100vh - 60px);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 80px 48px 64px;
  text-align: center;
}
.kl-hero-title {
  font-family: 'Instrument Serif', serif;
  font-size: clamp(56px, 10vw, 148px);
  line-height: 0.94;
  letter-spacing: -0.02em;
  color: var(--ink);
  margin-bottom: 28px;
}
.kl-hero-title em {
  font-style: italic;
  color: var(--accent);
}
.kl-hero-sub {
  max-width: 460px;
  font-size: 16px; color: var(--ink2);
  line-height: 1.7;
  margin-bottom: 36px;
}

/* METRICS STRIP */
.kl-metrics-strip {
  display: flex; align-items: center;
  background: var(--white); border: 1px solid var(--border);
  border-radius: 18px;
  margin-bottom: 36px;
}
.kl-metric { padding: 14px 28px; text-align: center; }
.kl-metric-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--ink3); margin-bottom: 5px;
}
.kl-metric-val {
  font-size: 20px; font-weight: 600; color: var(--ink);
  line-height: 1;
}
.kl-metric-val.kl-mono { font-size: 17px; letter-spacing: -0.02em; }
.kl-metric-unit { font-size: 12px; font-weight: 400; color: var(--ink3); }
.kl-maccent { color: var(--accent) !important; }
.kl-metric-divider { width: 1px; background: var(--border); height: 40px; flex-shrink: 0; }
.kl-metric-live {
  display: flex; align-items: center; gap: 6px;
  font-size: 14px; font-weight: 500; color: #16a34a;
}
.kl-live-dot {
  width: 7px; height: 7px; border-radius: 50%; background: #16a34a;
  animation: klPulse 2s ease-in-out infinite;
}
@keyframes klPulse { 0%,100%{opacity:1}50%{opacity:0.35} }

/* BUTTONS */
.kl-hero-ctas { display: flex; gap: 12px; }
.kl-btn-primary {
  padding: 13px 28px; border-radius: 99px;
  font-size: 15px; font-weight: 500;
  background: var(--ink); color: var(--bg);
  border: none; cursor: pointer; text-decoration: none;
  transition: all .15s; display: inline-block;
}
.kl-btn-primary:hover { background: var(--accent); }
.kl-btn-outline {
  padding: 13px 28px; border-radius: 99px;
  font-size: 15px; font-weight: 500;
  background: transparent; color: var(--ink);
  border: 1px solid var(--border2);
  cursor: pointer; text-decoration: none; transition: all .15s; display: inline-block;
}
.kl-btn-outline:hover { border-color: var(--ink); }

/* MARQUEE */
.kl-marquee-wrap {
  border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
  padding: 0; overflow: hidden;
  background: var(--white);
}
.kl-marquee-track {
  display: flex; width: max-content;
  animation: klMarquee 40s linear infinite;
}
@keyframes klMarquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
.kl-chip {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 22px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; font-weight: 500;
  text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--ink2); white-space: nowrap;
  border-right: 1px solid var(--border);
}

/* SHARED LAYOUT */
.kl-container { max-width: 1100px; margin: 0 auto; }
.kl-section-title {
  font-family: 'Instrument Serif', serif;
  font-size: clamp(36px, 5vw, 60px);
  line-height: 1.0;
  letter-spacing: -0.02em;
  color: var(--ink);
  margin-bottom: 14px;
}
.kl-title-center { text-align: center; }
.kl-section-sub {
  max-width: 460px;
  font-size: 15px; color: var(--ink2);
  line-height: 1.7;
}
.kl-sub-center { margin: 0 auto; text-align: center; }

/* MODULES */
.kl-modules-section {
  background: var(--white);
  border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
  padding: 96px 48px;
}
.kl-modules-grid {
  display: grid; grid-template-columns: 1fr 1.2fr;
  gap: 56px; align-items: start; margin-top: 52px;
}
.kl-module-list { display: flex; flex-direction: column; gap: 2px; }
.kl-module-item {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 14px; border-radius: 12px;
  cursor: pointer; transition: all .15s;
  border: 1px solid transparent;
}
.kl-module-item:hover { background: var(--bg); border-color: var(--border); }
.kl-module-item.kl-active {
  background: var(--bg); border-color: var(--border2);
}
.kl-module-item.kl-active .kl-module-name { color: var(--accent); }
.kl-module-item.kl-active .kl-module-mark { color: var(--accent); }
.kl-module-mark {
  width: 28px; font-size: 15px; color: var(--ink3);
  flex-shrink: 0; text-align: center;
}
.kl-module-text { flex: 1; }
.kl-module-name { font-size: 14px; font-weight: 500; color: var(--ink); }
.kl-module-desc { font-size: 12px; color: var(--ink3); margin-top: 1px; }
.kl-module-arrow { font-size: 14px; color: var(--accent); opacity: 0; transition: opacity .15s; }
.kl-module-item:hover .kl-module-arrow,
.kl-module-item.kl-active .kl-module-arrow { opacity: 1; }

/* MOCKUP */
.kl-mockup {
  background: var(--ink); border-radius: 18px;
  overflow: hidden; box-shadow: 0 20px 60px rgba(26,23,20,0.18);
}
.kl-mockup-bar {
  background: rgba(255,255,255,0.04);
  padding: 10px 16px; display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}
.kl-mockup-dots { display: flex; gap: 5px; }
.kl-mockup-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.14); }
.kl-mockup-url { font-size: 10px; color: rgba(255,255,255,0.25); margin-left: 8px; }
.kl-mockup-content { padding: 18px; }
.kl-mockup-eyebrow { font-size: 9px; color: rgba(255,255,255,0.25); margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.08em; }
.kl-mockup-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 6px; margin-bottom: 12px; }
.kl-mockup-stat { background: rgba(255,255,255,0.05); border-radius: 10px; padding: 10px 10px; }
.kl-mockup-stat-label { font-size: 8px; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 3px; }
.kl-mockup-stat-val { font-size: 22px; font-weight: 600; color: rgba(255,255,255,0.85); }
.kl-mv-accent { color: #fbbf24 !important; }
.kl-mv-warn { color: #f87171 !important; }
.kl-mv-ok { color: #34d399 !important; }
.kl-mockup-machines { display: grid; grid-template-columns: repeat(3,1fr); gap: 6px; }
.kl-mockup-machine { background: rgba(255,255,255,0.05); border-radius: 10px; padding: 10px; }
.kl-mockup-machine-name { font-size: 8px; font-weight: 600; color: rgba(255,255,255,0.4); margin-bottom: 5px; letter-spacing: 0.06em; }
.kl-mockup-machine-status { font-size: 9px; color: #34d399; display: flex; align-items: center; gap: 4px; margin-bottom: 6px; }
.kl-mockup-machine-status::before { content:''; width:5px; height:5px; border-radius:50%; background:#34d399; }
.kl-mockup-order { background: rgba(0,0,0,0.2); border-radius: 6px; padding: 6px 8px; }
.kl-mockup-order-name { font-size: 8px; color: rgba(255,255,255,0.45); margin-bottom: 5px; }
.kl-mockup-order-nums { display: flex; gap: 10px; }
.kl-mockup-order-num { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.9); }
.kl-mockup-order-num-label { font-size: 7px; color: rgba(255,255,255,0.28); margin-top: 1px; }
.kl-mockup-empty { font-size: 9px; color: rgba(255,255,255,0.18); padding: 10px 0; text-align: center; }

/* BENEFITS */
.kl-benefits-section { padding: 96px 48px; background: var(--bg); }
.kl-benefits-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-top: 52px; }
.kl-benefit-card {
  background: var(--white); border: 1px solid var(--border);
  border-radius: 18px; padding: 28px; transition: all .2s;
}
.kl-benefit-card:hover { box-shadow: 0 4px 24px rgba(26,23,20,0.07); transform: translateY(-2px); }
.kl-benefit-mark { font-size: 18px; color: var(--accent); margin-bottom: 18px; }
.kl-benefit-title { font-size: 15px; font-weight: 600; color: var(--ink); margin-bottom: 8px; }
.kl-benefit-desc { font-size: 13px; color: var(--ink2); line-height: 1.65; }
.kl-benefit-ba { margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border); }
.kl-benefit-before {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; color: var(--ink3); text-decoration: line-through; margin-bottom: 5px;
}
.kl-benefit-after {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; font-weight: 500; color: var(--accent);
}

/* PRICING */
.kl-pricing-section {
  background: var(--white);
  border-top: 1px solid var(--border);
  padding: 96px 48px;
}
.kl-pricing-grid {
  display: grid; grid-template-columns: repeat(3,1fr);
  gap: 14px; margin-top: 52px; max-width: 880px;
  margin-left: auto; margin-right: auto;
}
.kl-pricing-card {
  background: var(--bg); border: 1px solid var(--border);
  border-radius: 18px; padding: 28px; position: relative;
  transition: all .2s;
}
.kl-pricing-card:hover { box-shadow: 0 4px 24px rgba(26,23,20,0.07); }
.kl-pfeatured { background: var(--ink); border-color: var(--ink); }
.kl-ptier { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink3); margin-bottom: 20px; }
.kl-ptier-inv { color: rgba(243,238,231,0.38); }
.kl-pfor { font-size: 13px; color: var(--ink2); margin-bottom: 8px; }
.kl-pfor-inv { color: rgba(243,238,231,0.55); }
.kl-ppopular {
  position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
  background: var(--accent); color: var(--bg);
  font-size: 9px; font-weight: 600; letter-spacing: 0.1em;
  padding: 4px 14px; border-radius: 99px; white-space: nowrap;
}
.kl-pprice {
  font-family: 'Instrument Serif', serif;
  font-size: 48px; color: var(--ink); line-height: 1; letter-spacing: -0.02em;
}
.kl-pprice sup { font-size: 22px; vertical-align: top; margin-top: 8px; font-family: 'Inter', sans-serif; }
.kl-pprice span { font-size: 14px; color: var(--ink3); letter-spacing: 0; font-family: 'Inter', sans-serif; }
.kl-pprice-inv { color: var(--bg); }
.kl-pprice-inv span { color: rgba(243,238,231,0.4); }
.kl-psub { font-size: 12px; color: var(--ink3); margin: 6px 0 20px; }
.kl-psub-inv { color: rgba(243,238,231,0.38); }
.kl-pdivider { height: 1px; background: var(--border); margin-bottom: 20px; }
.kl-pdivider-inv { background: rgba(243,238,231,0.09); }
.kl-pfeatures { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
.kl-pfeature { font-size: 13px; color: var(--ink); display: flex; align-items: flex-start; gap: 8px; }
.kl-pfeature-off { color: var(--ink3); }
.kl-pfeature-inv { color: rgba(243,238,231,0.75); }
.kl-pcheck { color: var(--accent); font-size: 9px; margin-top: 3px; flex-shrink: 0; }
.kl-pcheck-inv { color: rgba(200,71,42,0.6); font-size: 9px; margin-top: 3px; flex-shrink: 0; }
.kl-pno { color: var(--ink3); flex-shrink: 0; font-size: 13px; }
.kl-pbtn {
  width: 100%; padding: 12px; border-radius: 99px;
  font-size: 14px; font-weight: 500;
  cursor: pointer; text-align: center; transition: all .15s;
  text-decoration: none; display: block;
}
.kl-pbtn-outline { background: var(--white); border: 1px solid var(--border2); color: var(--ink); }
.kl-pbtn-outline:hover { border-color: var(--ink); }
.kl-pbtn-inv { background: var(--bg); border: none; color: var(--ink); }
.kl-pbtn-inv:hover { background: var(--accent); color: var(--bg); }
.kl-ptrial { font-size: 11px; color: var(--ink3); margin-top: 10px; text-align: center; }
.kl-ptrial-inv { color: rgba(243,238,231,0.3); }

/* ECOSYSTEM */
.kl-ecosystem-section { padding: 96px 48px; background: var(--bg); }
.kl-eco-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-top: 48px; }
.kl-eco-card {
  background: var(--white); border: 1px solid var(--border);
  border-radius: 18px; padding: 24px; transition: all .2s;
}
.kl-eco-card:hover { box-shadow: 0 4px 24px rgba(26,23,20,0.07); transform: translateY(-2px); }
.kl-eco-current { border-color: var(--accent); border-width: 1.5px; }
.kl-eco-mark {
  width: 40px; height: 40px; border-radius: 10px;
  background: var(--bg); display: flex; align-items: center; justify-content: center;
  font-family: 'Instrument Serif', serif; font-size: 20px;
  color: var(--ink); margin-bottom: 14px;
  border: 1px solid var(--border);
}
.kl-eco-here { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent); margin-bottom: 10px; }
.kl-eco-name { font-family: 'Instrument Serif', serif; font-size: 20px; color: var(--ink); margin-bottom: 6px; }
.kl-eco-desc { font-size: 12px; color: var(--ink2); line-height: 1.55; }
.kl-eco-link { font-size: 12px; font-weight: 500; color: var(--ink3); margin-top: 12px; display: block; }

/* CTA */
.kl-cta-section {
  background: var(--ink); padding: 112px 48px 96px;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  position: relative; overflow: hidden;
}
.kl-cta-watermark {
  position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%);
  font-family: 'Instrument Serif', serif;
  font-size: clamp(80px, 18vw, 280px);
  color: rgba(243,238,231,0.04);
  white-space: nowrap; pointer-events: none; user-select: none;
  line-height: 1; letter-spacing: -0.03em;
}
.kl-cta-inner { position: relative; z-index: 1; }
.kl-cta-title {
  font-family: 'Instrument Serif', serif;
  font-size: clamp(44px, 7vw, 96px);
  line-height: 0.96; letter-spacing: -0.02em;
  color: var(--bg);
  margin-bottom: 20px;
}
.kl-cta-title em { font-style: italic; color: var(--accent); }
.kl-cta-sub {
  font-size: 15px; color: rgba(243,238,231,0.5);
  max-width: 420px; line-height: 1.7; margin-bottom: 36px;
}
.kl-cta-btns { display: flex; gap: 12px; justify-content: center; }
.kl-btn-cta-primary {
  padding: 13px 28px; border-radius: 99px;
  font-size: 15px; font-weight: 500;
  background: var(--bg); color: var(--ink);
  border: none; cursor: pointer; text-decoration: none;
  transition: all .15s; display: inline-block;
}
.kl-btn-cta-primary:hover { background: var(--accent); color: var(--bg); }
.kl-btn-cta-outline {
  padding: 13px 28px; border-radius: 99px;
  font-size: 15px; font-weight: 500;
  background: transparent; color: rgba(243,238,231,0.6);
  border: 1px solid rgba(243,238,231,0.2);
  cursor: pointer; text-decoration: none; transition: all .15s; display: inline-block;
}
.kl-btn-cta-outline:hover { border-color: rgba(243,238,231,0.5); color: var(--bg); }

/* FOOTER */
.kl-footer {
  background: var(--ink);
  border-top: 1px solid rgba(255,255,255,0.06);
  padding: 24px 48px;
  display: flex; align-items: center; justify-content: space-between;
}
.kl-footer-logo { display: flex; align-items: center; gap: 8px; }
.kl-footer-mark {
  width: 26px; height: 26px; border-radius: 6px;
  background: rgba(243,238,231,0.1);
  display: flex; align-items: center; justify-content: center;
  font-family: 'JetBrains Mono', monospace; font-weight: 600;
  color: var(--bg); font-size: 11px;
}
.kl-footer-name { font-family: 'Instrument Serif', serif; font-size: 16px; color: var(--bg); }
.kl-footer-copy { font-size: 11px; color: rgba(243,238,231,0.3); }
.kl-footer-ryg { font-size: 12px; color: rgba(243,238,231,0.4); }
.kl-footer-ryg span { color: var(--bg); font-weight: 500; }
`;
