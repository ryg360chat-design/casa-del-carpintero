"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const modules = [
  { mark: "⊞", name: "Dashboard", desc: "Vista principal de control · métricas al instante" },
  { mark: "◻", name: "Pedidos", desc: "Gestión completa e historial de estados" },
  { mark: "⚙", name: "Producción", desc: "Pantalla operativa del taller en tiempo real" },
  { mark: "◑", name: "Rendimiento", desc: "Analítica por máquina y por turno" },
  { mark: "▦", name: "Calendario", desc: "Planificación visual por fecha de entrega" },
  { mark: "◧", name: "Reporte", desc: "Informes diarios y exportación PDF" },
  { mark: "◎", name: "Roles", desc: "Permisos por persona y por rol" },
  { mark: "◇", name: "Historial", desc: "Trazabilidad completa de cada pedido" },
];

const chips = [
  "Control de pedidos", "Producción en tiempo real", "Trazabilidad total",
  "Calendario de entregas", "Reporte diario PDF", "Gestión de roles",
  "Historial completo", "Asignación de máquinas",
  "Control de pedidos", "Producción en tiempo real", "Trazabilidad total",
  "Calendario de entregas", "Reporte diario PDF", "Gestión de roles",
  "Historial completo", "Asignación de máquinas",
];

const benefits = [
  { num: "01", title: "Sin bitácoras en papel", desc: "Cada pedido vive en el sistema con cliente, material, planchas, piezas y fecha estimada.", before: "Cuadernos, hojas sueltas, WhatsApp", after: "Sistema centralizado en tiempo real" },
  { num: "02", title: "Cada máquina, visible", desc: "M1, M2 y M3 con estado en vivo. Si una máquina está libre, redistribuye la carga al instante.", before: "Preguntar y revisar papeles", after: "Ver en pantalla y actuar" },
  { num: "03", title: "Decisiones con datos", desc: "Rendimiento por máquina, comparativo ideal vs real, carga pendiente y reportes diarios en PDF.", before: "Suposiciones y llamadas", after: "Reportes y métricas reales" },
  { num: "04", title: "Calendario de entregas", desc: "Vista mensual por fecha. Días cerrados en verde, con carga en amarillo, atrasos al primer vistazo.", before: "Revisar pedido por pedido", after: "Un vistazo al calendario" },
  { num: "05", title: "Trazabilidad total", desc: "En cola → En corte → Tapacantos → Listo → Despachado. Con hora y responsable de cada cambio.", before: "Nadie sabe qué pasó con el pedido", after: "Historial completo con responsable" },
  { num: "06", title: "Roles para cada persona", desc: "Gerencia, ventas, producción, logística, almacén — cada rol ve exactamente lo que necesita.", before: "Todos ven todo, nadie es responsable", after: "Permisos claros por persona" },
];

const ecoApps = [
  { letter: "D", name: "Domia", desc: "Gestión de condominios y conjuntos residenciales.", color: "#dcfce7", current: false },
  { letter: "G", name: "Gestrik", desc: "Control de proyectos de construcción e ingeniería civil.", color: "#ffe4e6", current: false },
  { letter: "R", name: "ryginmo", desc: "Plataforma de gestión inmobiliaria y activos en renta.", color: "#dbeafe", current: false },
  { letter: "K", name: "Kuadra", desc: "Sistema de gestión para talleres de corte y carpintería.", color: "#fef3c7", current: true },
];

export default function Page() {
  const [active, setActive] = useState(0);
  const [clock, setClock] = useState("");
  const [rend, setRend] = useState(91);
  const [cola, setCola] = useState(28);
  const [billing, setBilling] = useState<"mensual" | "anual">("mensual");

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
      setRend((r) => Math.min(99, Math.max(82, r + (Math.random() > 0.5 ? 1 : -1))));
      setCola((c) => Math.min(35, Math.max(20, c + (Math.random() > 0.5 ? 1 : -1))));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const prices = {
    basico: billing === "mensual" ? 299 : 254,
    profesional: billing === "mensual" ? 499 : 424,
    empresarial: billing === "mensual" ? 899 : 764,
  };

  return (
    <div className="kl">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* NAV */}
      <nav className="kl-nav">
        <Link href="/" className="kl-logo">
          <div className="kl-logo-mark">K</div>
          <span className="kl-logo-name">Kuadra</span>
          <span className="kl-logo-badge">RYG · V2.4</span>
        </Link>
        <div className="kl-nav-links">
          <a href="#inicio">Producto</a>
          <a href="#modulos">Módulos</a>
          <a href="#porque">Por qué</a>
          <a href="#precios">Precios</a>
          <a href="#ecosistema">Ecosistema</a>
        </div>
        <div className="kl-nav-actions">
          <Link href="/dashboard" className="kl-nav-portal">Portal</Link>
          <Link href="/dashboard" className="kl-nav-cta">Solicitar demo →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="kl-hero" id="inicio">
        <div className="kl-hero-inner">
          <div className="kl-eyebrow">● RYG SAAS · SISTEMA OPERATIVO PARA TALLERES DE CORTE</div>
          <h1 className="kl-hero-title">
            El taller que <em>sabe</em><br />lo que está pasando.
          </h1>
          <p className="kl-hero-sub">
            Mientras otros talleres siguen con cuadernos, WhatsApp y suposiciones, los tuyos saben <strong>en segundos</strong> qué está en cola, qué máquina está libre y qué pedido lleva retraso.
          </p>
          <div className="kl-hero-ctas">
            <Link href="/dashboard" className="kl-btn-primary">Solicitar demo →</Link>
            <a href="#modulos" className="kl-btn-outline">Ver módulos ↓</a>
          </div>
          <div className="kl-metrics-strip">
            <div className="kl-metric">
              <div className="kl-metric-label">Hora del taller</div>
              <div className="kl-metric-val kl-mono">{clock || "00:00:00"}</div>
              <div className="kl-metric-sub">GL Santamaría</div>
            </div>
            <div className="kl-metric-divider" />
            <div className="kl-metric">
              <div className="kl-metric-label">Máquina 1 · Activa</div>
              <div className="kl-metric-val kl-maccent">{rend}%</div>
              <div className="kl-metric-sub">rendimiento vs ideal</div>
            </div>
            <div className="kl-metric-divider" />
            <div className="kl-metric">
              <div className="kl-metric-label">En cola</div>
              <div className="kl-metric-val">{cola}</div>
              <div className="kl-metric-sub">pedidos esperando corte</div>
            </div>
            <div className="kl-metric-divider" />
            <div className="kl-metric">
              <div className="kl-metric-label">Listos hoy</div>
              <div className="kl-metric-val kl-mok">12</div>
              <div className="kl-metric-sub">47 esta semana</div>
            </div>
          </div>
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
          <h2 className="kl-section-title">
            8 módulos.<br /><span className="kl-title-muted">Un solo sistema.</span>
          </h2>
          <p className="kl-section-sub">Desde que entra el pedido hasta que sale el despacho — todo conectado, todo visible. Click en cualquier módulo para ver la vista.</p>

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
                  <div className="kl-mockup-dot" style={{ background: "#ef4444" }} />
                  <div className="kl-mockup-dot" style={{ background: "#f59e0b" }} />
                  <div className="kl-mockup-dot" style={{ background: "#10b981" }} />
                </div>
                <div className="kl-mockup-url kl-mono">kuadra.app/dash</div>
                <div className="kl-mockup-live kl-mono"><span className="kl-live-dot" />EN VIVO</div>
              </div>
              <div className="kl-mockup-content">
                <div className="kl-mockup-header-row">
                  <span className="kl-mockup-eyebrow kl-mono">PANEL DE PRODUCCIÓN · JUEVES 7 DE MAYO</span>
                  <span className="kl-mockup-updated kl-mono">actualizado hace 59s</span>
                </div>
                <div className="kl-mockup-stats">
                  {[
                    { label: "Ingresados", val: "00", cls: "kl-mv-blue" },
                    { label: "En cola", val: "04", cls: "kl-mv-accent" },
                    { label: "En corte", val: "02", cls: "kl-mv-warn" },
                    { label: "Listos", val: "12", cls: "kl-mv-ok" },
                  ].map((s) => (
                    <div key={s.label} className="kl-mockup-stat">
                      <div className="kl-mockup-stat-label kl-mono">{s.label}</div>
                      <div className={`kl-mockup-stat-val ${s.cls}`}>{s.val}</div>
                    </div>
                  ))}
                </div>
                <div className="kl-mockup-machines">
                  {[
                    { name: "Máquina 1", status: "OPERATIVA", order: "GL Santamaria · Cocina 303", planchas: "8.5", piezas: "163", pct: 65 },
                    { name: "Máquina 2", status: "OPERATIVA", order: "Yammy Guillén", planchas: "2.5", piezas: "35", pct: 30 },
                    { name: "Máquina 3", status: "LIBRE", order: null, planchas: null, piezas: null, pct: 0 },
                  ].map((m) => (
                    <div key={m.name} className="kl-mockup-machine">
                      <div className="kl-mockup-machine-top">
                        <span className="kl-mockup-machine-name kl-mono">{m.name}</span>
                        <span className={`kl-machine-status-badge kl-mono ${m.status === "LIBRE" ? "kl-status-libre" : "kl-status-activa"}`}>
                          <span className={`kl-status-dot ${m.status === "LIBRE" ? "kl-dot-libre" : "kl-dot-activa"}`} />
                          {m.status}
                        </span>
                      </div>
                      {m.order ? (
                        <>
                          <div className="kl-mockup-order-name">{m.order}</div>
                          <div className="kl-mockup-order-nums">
                            <span className="kl-mockup-order-num kl-mono">{m.planchas} <span className="kl-mockup-unit">planchas</span></span>
                            <span className="kl-mockup-order-num kl-mono">{m.piezas} <span className="kl-mockup-unit">piezas</span></span>
                          </div>
                          <div className="kl-progress-outer">
                            <div className="kl-progress-inner" style={{ width: `${m.pct}%` }} />
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
      <section className="kl-benefits-section" id="porque">
        <div className="kl-container">
          <div className="kl-eyebrow">◆ Por qué Kuadra</div>
          <h2 className="kl-section-title">Tu taller, <em className="kl-em-accent">en tiempo<br />real.</em></h2>
          <p className="kl-section-sub">La mayoría de sistemas son para cualquier empresa. Kuadra es para talleres de corte — y solo para eso.</p>
          <div className="kl-benefits-grid">
            {benefits.map((b) => (
              <div key={b.title} className="kl-benefit-card">
                <div className="kl-benefit-num kl-mono">{b.num}</div>
                <div className="kl-benefit-title">{b.title}</div>
                <div className="kl-benefit-desc">{b.desc}</div>
                <div className="kl-benefit-sep" />
                <div className="kl-benefit-row">
                  <span className="kl-ba-label kl-ba-before kl-mono">ANTES</span>
                  <span className="kl-benefit-before">{b.before}</span>
                </div>
                <div className="kl-benefit-row">
                  <span className="kl-ba-label kl-ba-after kl-mono">AHORA</span>
                  <span className="kl-benefit-after">{b.after}</span>
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
          <h2 className="kl-section-title kl-title-center">El plan que se adapta<br /><span className="kl-title-muted">a tu taller.</span></h2>
          <p className="kl-section-sub kl-sub-center">14 días de prueba gratuita · Sin costos de activación</p>
          <div className="kl-billing-toggle">
            <button className={`kl-billing-btn${billing === "mensual" ? " kl-billing-active" : ""}`} onClick={() => setBilling("mensual")}>Mensual</button>
            <button className={`kl-billing-btn${billing === "anual" ? " kl-billing-active" : ""}`} onClick={() => setBilling("anual")}>
              Anual <span className="kl-billing-badge">-15%</span>
            </button>
          </div>
          <div className="kl-pricing-grid">
            <div className="kl-pricing-card">
              <div className="kl-ptier kl-mono">Básico</div>
              <div className="kl-pfor">Para empezar</div>
              <div className="kl-pprice"><sup>$</sup>{prices.basico}<span>/mes</span></div>
              <div className="kl-psub">2 máquinas · hasta 5 usuarios</div>
              <div className="kl-pdivider" />
              <ul className="kl-pfeatures">
                {["Panel de control", "Gestión de pedidos + historial", "Producción en tiempo real", "Marcar como listo directo", "Vista por día", "3 roles básicos"].map(f => (
                  <li key={f} className="kl-pfeature"><span className="kl-pcheck">✓</span>{f}</li>
                ))}
                {["Rendimiento avanzado", "Reporte PDF"].map(f => (
                  <li key={f} className="kl-pfeature kl-pfeature-off"><span className="kl-pno">—</span>{f}</li>
                ))}
              </ul>
              <Link href="/dashboard" className="kl-pbtn kl-pbtn-outline">Solicitar demo →</Link>
              <div className="kl-ptrial kl-mono">Prueba 14 días gratis</div>
            </div>

            <div className="kl-pricing-card kl-pfeatured">
              <div className="kl-ppopular kl-mono">POPULAR</div>
              <div className="kl-ptier kl-mono kl-ptier-inv">Profesional</div>
              <div className="kl-pfor kl-pfor-inv">Para crecer</div>
              <div className="kl-pprice kl-pprice-inv"><sup>$</sup>{prices.profesional}<span>/mes</span></div>
              <div className="kl-psub kl-psub-inv">3 máquinas · usuarios ilimitados</div>
              <div className="kl-pdivider kl-pdivider-inv" />
              <ul className="kl-pfeatures">
                {["Todo lo del plan Básico", "Analítica de rendimiento", "Calendario de entregas", "Reporte diario + PDF", "Todos los roles del sistema", "Módulo Financiero"].map(f => (
                  <li key={f} className="kl-pfeature kl-pfeature-inv"><span className="kl-pcheck-inv">✓</span>{f}</li>
                ))}
              </ul>
              <Link href="/dashboard" className="kl-pbtn kl-pbtn-inv">Solicitar demo →</Link>
              <div className="kl-ptrial kl-mono kl-ptrial-inv">Prueba 14 días gratis</div>
            </div>

            <div className="kl-pricing-card">
              <div className="kl-ptier kl-mono">Empresarial</div>
              <div className="kl-pfor">Para escalar</div>
              <div className="kl-pprice"><sup>$</sup>{prices.empresarial}<span>/mes</span></div>
              <div className="kl-psub">Máquinas ilimitadas · todo incluido</div>
              <div className="kl-pdivider" />
              <ul className="kl-pfeatures">
                {["Todo lo del plan Profesional", "CRM de Clientes", "Módulo Inventario", "Historial de reportes", "Exportar CSV / Excel", "Personalización de la herramienta"].map(f => (
                  <li key={f} className="kl-pfeature"><span className="kl-pcheck">✓</span>{f}</li>
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
          <h2 className="kl-section-title kl-title-center">El ecosistema <em className="kl-em-accent">RyG SaaS</em></h2>
          <p className="kl-section-sub kl-sub-center">Herramientas verticales para industrias específicas. Misma calidad, mismo estándar.</p>
          <div className="kl-eco-grid">
            {ecoApps.map((e) => (
              <div key={e.name} className={`kl-eco-card${e.current ? " kl-eco-current" : ""}`}>
                <div className="kl-eco-mark" style={{ background: e.color }}>{e.letter}</div>
                <div className="kl-eco-activo kl-mono">● ACTIVO</div>
                <div className="kl-eco-name">{e.name}</div>
                <div className="kl-eco-desc">{e.desc}</div>
                <div className={`kl-eco-link kl-mono${e.current ? " kl-eco-link-here" : ""}`}>
                  {e.current ? "● ESTÁS AQUÍ" : "VER PLATAFORMA →"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="kl-cta-section">
        <div className="kl-cta-watermark">KUADRA</div>
        <div className="kl-cta-inner">
          <div className="kl-eyebrow kl-eyebrow-center">◆ Empieza hoy</div>
          <h2 className="kl-cta-title">
            ¿Listo para <em>ver</em><br />tu taller?
          </h2>
          <p className="kl-cta-sub">Centraliza tus pedidos, controla tus máquinas y toma decisiones con datos reales desde el primer día.</p>
          <div className="kl-cta-btns">
            <Link href="/dashboard" className="kl-btn-cta-primary">Solicitar demo gratuita →</Link>
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
        <div className="kl-footer-copy kl-mono">© 2026 Kuadra · RyG SaaS</div>
        <div className="kl-footer-ryg kl-mono">CONSTRUIDO CON OFICIO · QUITO, EC</div>
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
  background: var(--accent);
  display: flex; align-items: center; justify-content: center;
  font-family: 'JetBrains Mono', monospace; font-weight: 600;
  color: #fff; font-size: 13px;
}
.kl-logo-name {
  font-family: 'Instrument Serif', serif;
  font-size: 20px; color: var(--ink);
  letter-spacing: -0.01em;
}
.kl-logo-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; font-weight: 500; letter-spacing: 0.06em;
  border: 1px solid var(--border2); color: var(--ink3);
  padding: 2px 8px; border-radius: 99px;
}
.kl-nav-links { display: flex; gap: 28px; }
.kl-nav-links a {
  text-decoration: none; color: var(--ink2); font-size: 14px; font-weight: 500;
  transition: color .15s;
}
.kl-nav-links a:hover { color: var(--ink); }
.kl-nav-actions { display: flex; gap: 8px; align-items: center; }
.kl-nav-portal {
  padding: 8px 18px; border-radius: 99px;
  background: transparent; color: var(--ink);
  border: 1px solid var(--border2);
  font-size: 14px; font-weight: 500;
  text-decoration: none; transition: all .15s;
}
.kl-nav-portal:hover { border-color: var(--ink); }
.kl-nav-cta {
  padding: 8px 18px; border-radius: 99px;
  background: var(--accent); color: #fff;
  font-size: 14px; font-weight: 500;
  text-decoration: none; transition: all .15s;
}
.kl-nav-cta:hover { background: var(--ink); }

/* EYEBROW */
.kl-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; font-weight: 500;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--accent);
  margin-bottom: 20px;
}
.kl-eyebrow-center { text-align: center; }

/* HERO */
.kl-hero {
  min-height: calc(100vh - 60px);
  display: flex; flex-direction: column;
  align-items: flex-start; justify-content: center;
  padding: 80px 48px 64px;
}
.kl-hero-inner { max-width: 800px; width: 100%; }
.kl-hero-title {
  font-family: 'Instrument Serif', serif;
  font-size: clamp(52px, 9vw, 136px);
  line-height: 0.94;
  letter-spacing: -0.02em;
  color: var(--ink);
  margin-bottom: 28px;
  text-align: left;
}
.kl-hero-title em { font-style: italic; color: var(--accent); }
.kl-hero-sub {
  max-width: 500px;
  font-size: 16px; color: var(--ink2);
  line-height: 1.7;
  margin-bottom: 32px;
  text-align: left;
}
.kl-hero-sub strong { color: var(--ink); font-weight: 600; }

/* METRICS STRIP */
.kl-metrics-strip {
  display: flex; align-items: stretch;
  background: var(--white); border: 1px solid var(--border);
  border-radius: 18px;
  margin-top: 40px;
  width: fit-content;
}
.kl-metric { padding: 16px 28px; text-align: left; }
.kl-metric-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--ink3); margin-bottom: 5px;
}
.kl-metric-val {
  font-size: 22px; font-weight: 600; color: var(--ink);
  line-height: 1;
}
.kl-metric-val.kl-mono { font-size: 17px; letter-spacing: -0.02em; }
.kl-metric-sub { font-size: 10px; color: var(--ink3); margin-top: 3px; }
.kl-maccent { color: var(--accent) !important; }
.kl-mok { color: #16a34a !important; }
.kl-metric-divider { width: 1px; background: var(--border); flex-shrink: 0; }

/* BUTTONS */
.kl-hero-ctas { display: flex; gap: 12px; }
.kl-btn-primary {
  padding: 13px 28px; border-radius: 99px;
  font-size: 15px; font-weight: 500;
  background: var(--accent); color: #fff;
  border: none; cursor: pointer; text-decoration: none;
  transition: all .15s; display: inline-block;
}
.kl-btn-primary:hover { background: var(--ink); }
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
  overflow: hidden; background: var(--white);
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
  font-size: clamp(36px, 5vw, 62px);
  line-height: 1.0;
  letter-spacing: -0.02em;
  color: var(--ink);
  margin-bottom: 14px;
}
.kl-title-center { text-align: center; }
.kl-title-muted { color: var(--ink3); }
.kl-em-accent { font-style: italic; color: var(--accent); }
.kl-section-sub {
  max-width: 500px;
  font-size: 15px; color: var(--ink2);
  line-height: 1.7;
  margin-bottom: 0;
}
.kl-sub-center { margin: 0 auto; text-align: center; }

/* MODULES */
.kl-modules-section {
  background: var(--white);
  border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
  padding: 96px 48px;
}
.kl-modules-grid {
  display: grid; grid-template-columns: 1fr 1.3fr;
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
.kl-mockup-dot { width: 8px; height: 8px; border-radius: 50%; }
.kl-mockup-url { font-size: 10px; color: rgba(255,255,255,0.25); margin-left: 8px; }
.kl-mockup-live {
  display: flex; align-items: center; gap: 5px;
  font-size: 8px; color: #34d399; margin-left: auto; letter-spacing: 0.06em;
}
.kl-live-dot {
  width: 5px; height: 5px; border-radius: 50%; background: #34d399;
  animation: klPulse 2s ease-in-out infinite;
}
@keyframes klPulse { 0%,100%{opacity:1}50%{opacity:0.35} }
.kl-mockup-content { padding: 16px; }
.kl-mockup-header-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 12px;
}
.kl-mockup-eyebrow { font-size: 9px; color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 0.08em; }
.kl-mockup-updated { font-size: 9px; color: rgba(255,255,255,0.18); }
.kl-mockup-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 6px; margin-bottom: 10px; }
.kl-mockup-stat { background: rgba(255,255,255,0.05); border-radius: 10px; padding: 10px; }
.kl-mockup-stat-label { font-size: 8px; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 3px; }
.kl-mockup-stat-val { font-size: 22px; font-weight: 600; color: rgba(255,255,255,0.85); }
.kl-mv-blue { color: #60a5fa !important; }
.kl-mv-accent { color: #fbbf24 !important; }
.kl-mv-warn { color: #f87171 !important; }
.kl-mv-ok { color: #34d399 !important; }
.kl-mockup-machines { display: grid; grid-template-columns: repeat(3,1fr); gap: 6px; }
.kl-mockup-machine { background: rgba(255,255,255,0.05); border-radius: 10px; padding: 10px; }
.kl-mockup-machine-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.kl-mockup-machine-name { font-size: 9px; color: rgba(255,255,255,0.5); font-weight: 600; letter-spacing: 0.04em; }
.kl-machine-status-badge { display: flex; align-items: center; gap: 3px; font-size: 8px; letter-spacing: 0.04em; }
.kl-status-activa { color: #34d399; }
.kl-status-libre { color: rgba(255,255,255,0.3); }
.kl-status-dot { width: 4px; height: 4px; border-radius: 50%; flex-shrink: 0; }
.kl-dot-activa { background: #34d399; }
.kl-dot-libre { background: rgba(255,255,255,0.3); }
.kl-mockup-order-name { font-size: 8px; color: rgba(255,255,255,0.4); margin-bottom: 5px; }
.kl-mockup-order-nums { display: flex; gap: 10px; margin-bottom: 6px; }
.kl-mockup-order-num { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.9); }
.kl-mockup-unit { font-size: 7px; color: rgba(255,255,255,0.28); font-weight: 400; }
.kl-progress-outer { height: 2px; background: rgba(255,255,255,0.08); border-radius: 99px; overflow: hidden; }
.kl-progress-inner { height: 100%; background: var(--accent); border-radius: 99px; }
.kl-mockup-empty { font-size: 9px; color: rgba(255,255,255,0.18); padding: 12px 0; text-align: center; }

/* BENEFITS */
.kl-benefits-section { padding: 96px 48px; background: var(--bg); }
.kl-benefits-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-top: 52px; }
.kl-benefit-card {
  background: var(--white); border: 1px solid var(--border);
  border-radius: 18px; padding: 28px; transition: all .2s;
}
.kl-benefit-card:hover { box-shadow: 0 4px 24px rgba(26,23,20,0.07); transform: translateY(-2px); }
.kl-benefit-num { font-size: 11px; color: var(--ink3); margin-bottom: 20px; }
.kl-benefit-title { font-size: 17px; font-weight: 600; color: var(--ink); margin-bottom: 10px; font-family: 'Instrument Serif', serif; letter-spacing: -0.01em; }
.kl-benefit-desc { font-size: 13px; color: var(--ink2); line-height: 1.65; }
.kl-benefit-sep { height: 1px; background: var(--border); margin: 18px 0 14px; }
.kl-benefit-row { display: flex; gap: 10px; align-items: baseline; margin-bottom: 6px; }
.kl-ba-label { font-size: 9px; font-weight: 600; letter-spacing: 0.06em; flex-shrink: 0; width: 42px; }
.kl-ba-before { color: var(--ink3); }
.kl-ba-after { color: var(--accent); }
.kl-benefit-before { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--ink3); text-decoration: line-through; }
.kl-benefit-after { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 500; color: var(--accent); }

/* PRICING */
.kl-pricing-section {
  background: var(--white);
  border-top: 1px solid var(--border);
  padding: 96px 48px;
}
.kl-billing-toggle {
  display: flex; justify-content: center; gap: 4px;
  background: var(--bg); border: 1px solid var(--border);
  border-radius: 99px; padding: 4px;
  width: fit-content; margin: 28px auto 48px;
}
.kl-billing-btn {
  padding: 8px 22px; border-radius: 99px;
  font-size: 13px; font-weight: 500;
  border: none; cursor: pointer; background: transparent;
  color: var(--ink2); transition: all .15s;
  display: flex; align-items: center; gap: 6px;
  font-family: 'Inter', sans-serif;
}
.kl-billing-active { background: var(--ink); color: var(--bg); }
.kl-billing-badge {
  font-size: 9px; font-weight: 700;
  background: var(--accent); color: white;
  padding: 2px 7px; border-radius: 99px;
  font-family: 'JetBrains Mono', monospace; letter-spacing: 0.04em;
}
.kl-pricing-grid {
  display: grid; grid-template-columns: repeat(3,1fr);
  gap: 14px; max-width: 900px;
  margin-left: auto; margin-right: auto;
}
.kl-pricing-card {
  background: var(--bg); border: 1px solid var(--border);
  border-radius: 18px; padding: 28px; position: relative;
  transition: all .2s;
}
.kl-pricing-card:hover { box-shadow: 0 4px 24px rgba(26,23,20,0.07); }
.kl-pfeatured { background: var(--ink); border: 2px solid var(--ink); }
.kl-ptier { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink3); margin-bottom: 20px; }
.kl-ptier-inv { color: var(--accent); }
.kl-pfor {
  font-family: 'Instrument Serif', serif;
  font-size: 20px; font-style: italic; color: var(--accent); margin-bottom: 10px;
}
.kl-pfor-inv { color: var(--accent); }
.kl-ppopular {
  position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
  background: var(--accent); color: var(--white);
  font-size: 9px; font-weight: 600; letter-spacing: 0.1em;
  padding: 4px 14px; border-radius: 99px; white-space: nowrap;
}
.kl-pprice {
  font-family: 'Instrument Serif', serif;
  font-size: 52px; color: var(--ink); line-height: 1; letter-spacing: -0.02em; margin-bottom: 6px;
}
.kl-pprice sup { font-size: 22px; vertical-align: top; margin-top: 10px; font-family: 'Inter', sans-serif; }
.kl-pprice span { font-size: 14px; color: var(--ink3); letter-spacing: 0; font-family: 'Inter', sans-serif; }
.kl-pprice-inv { color: var(--accent); }
.kl-pprice-inv span { color: rgba(255,255,255,0.4); }
.kl-psub { font-size: 12px; color: var(--ink3); margin-bottom: 20px; }
.kl-psub-inv { color: rgba(255,255,255,0.35); }
.kl-pdivider { height: 1px; background: var(--border); margin-bottom: 20px; }
.kl-pdivider-inv { background: rgba(255,255,255,0.08); }
.kl-pfeatures { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
.kl-pfeature { font-size: 13px; color: var(--ink); display: flex; align-items: flex-start; gap: 8px; }
.kl-pfeature-off { color: var(--ink3); }
.kl-pfeature-inv { color: rgba(255,255,255,0.75); }
.kl-pcheck { color: var(--accent); font-size: 12px; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
.kl-pcheck-inv { color: var(--accent); font-size: 12px; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
.kl-pno { color: var(--ink3); flex-shrink: 0; font-size: 13px; }
.kl-pbtn {
  width: 100%; padding: 12px; border-radius: 99px;
  font-size: 14px; font-weight: 500;
  cursor: pointer; text-align: center; transition: all .15s;
  text-decoration: none; display: block;
}
.kl-pbtn-outline { background: var(--white); border: 1px solid var(--border2); color: var(--ink); }
.kl-pbtn-outline:hover { border-color: var(--ink); }
.kl-pbtn-inv { background: var(--accent); border: none; color: white; }
.kl-pbtn-inv:hover { background: #fff; color: var(--ink); }
.kl-ptrial { font-size: 11px; color: var(--ink3); margin-top: 10px; text-align: center; }
.kl-ptrial-inv { color: rgba(255,255,255,0.3); }

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
  display: flex; align-items: center; justify-content: center;
  font-family: 'Instrument Serif', serif; font-size: 18px;
  color: var(--ink); margin-bottom: 12px;
  border: 1px solid var(--border);
}
.kl-eco-activo { font-size: 10px; color: #16a34a; margin-bottom: 10px; display: block; }
.kl-eco-name { font-family: 'Instrument Serif', serif; font-size: 20px; color: var(--ink); margin-bottom: 6px; }
.kl-eco-desc { font-size: 12px; color: var(--ink2); line-height: 1.55; }
.kl-eco-link { font-size: 11px; font-weight: 500; color: var(--ink3); margin-top: 14px; display: block; letter-spacing: 0.04em; }
.kl-eco-link-here { color: var(--accent); }

/* CTA */
.kl-cta-section {
  background: var(--bg); padding: 112px 48px 96px;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  position: relative; overflow: hidden;
  border-top: 1px solid var(--border);
}
.kl-cta-watermark {
  position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%);
  font-family: 'Instrument Serif', serif;
  font-size: clamp(80px, 18vw, 280px);
  color: rgba(26,23,20,0.04);
  white-space: nowrap; pointer-events: none; user-select: none;
  line-height: 1; letter-spacing: -0.03em;
}
.kl-cta-inner { position: relative; z-index: 1; }
.kl-cta-title {
  font-family: 'Instrument Serif', serif;
  font-size: clamp(44px, 7vw, 96px);
  line-height: 0.96; letter-spacing: -0.02em;
  color: var(--ink);
  margin-bottom: 20px;
}
.kl-cta-title em { font-style: italic; color: var(--accent); }
.kl-cta-sub {
  font-size: 15px; color: var(--ink2);
  max-width: 420px; line-height: 1.7; margin-bottom: 36px;
}
.kl-cta-btns { display: flex; gap: 12px; justify-content: center; }
.kl-btn-cta-primary {
  padding: 13px 28px; border-radius: 99px;
  font-size: 15px; font-weight: 500;
  background: var(--accent); color: #fff;
  border: none; cursor: pointer; text-decoration: none;
  transition: all .15s; display: inline-block;
}
.kl-btn-cta-primary:hover { background: var(--ink); }
.kl-btn-cta-outline {
  padding: 13px 28px; border-radius: 99px;
  font-size: 15px; font-weight: 500;
  background: transparent; color: var(--ink2);
  border: 1px solid var(--border2);
  cursor: pointer; text-decoration: none; transition: all .15s; display: inline-block;
}
.kl-btn-cta-outline:hover { border-color: var(--ink); color: var(--ink); }

/* FOOTER */
.kl-footer {
  background: var(--white);
  border-top: 1px solid var(--border);
  padding: 24px 48px;
  display: flex; align-items: center; justify-content: space-between;
}
.kl-footer-logo { display: flex; align-items: center; gap: 8px; }
.kl-footer-mark {
  width: 26px; height: 26px; border-radius: 6px;
  background: var(--accent);
  display: flex; align-items: center; justify-content: center;
  font-family: 'JetBrains Mono', monospace; font-weight: 600;
  color: #fff; font-size: 11px;
}
.kl-footer-name { font-family: 'Instrument Serif', serif; font-size: 16px; color: var(--ink); }
.kl-footer-copy { font-size: 11px; color: var(--ink3); }
.kl-footer-ryg { font-size: 10px; color: var(--ink3); letter-spacing: 0.06em; }
`;
