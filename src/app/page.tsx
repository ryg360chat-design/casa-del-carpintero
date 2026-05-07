"use client";

import { useState } from "react";
import Link from "next/link";

const modules = [
  { icon: "📊", name: "Dashboard", desc: "Vista principal de control — métricas al instante" },
  { icon: "📋", name: "Pedidos", desc: "Gestión completa e historial de estados" },
  { icon: "🏭", name: "Producción", desc: "Pantalla operativa del taller en tiempo real" },
  { icon: "📈", name: "Rendimiento", desc: "Analítica por máquina y por turno" },
  { icon: "📅", name: "Calendario", desc: "Planificación visual por fecha de entrega" },
  { icon: "🖨️", name: "Reporte", desc: "Informes diarios y exportación PDF" },
  { icon: "👥", name: "Usuarios", desc: "Roles y permisos seguros por persona" },
  { icon: "⚙️", name: "Ajustes", desc: "Parámetros y configuración del taller" },
];

export default function Page() {
  const [active, setActive] = useState(0);

  return (
    <div className="kl">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* NAV */}
      <nav className="kl-nav">
        <Link href="/" className="kl-logo">
          <div className="kl-logo-icon">K</div>
          <span className="kl-logo-name">Kuadra</span>
          <span className="kl-badge">RYG SAAS</span>
        </Link>
        <div className="kl-nav-links">
          <a href="#modulos">Módulos</a>
          <a href="#precios">Precios</a>
          <a href="#ecosistema">Ecosistema</a>
        </div>
        <div className="kl-nav-actions">
          <Link href="/dashboard" className="kl-btn-ghost">Portal</Link>
          <Link href="/dashboard" className="kl-btn-primary">Solicitar demo →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="kl-hero" id="inicio">
        <div className="kl-hero-bg" />
        <div className="kl-hero-grid" />

        <div className="kl-badge-pill">
          <span className="kl-badge-dot" />
          RYG SAAS — Gestión de Producción
        </div>

        <h1 className="kl-hero-title">
          Tu taller,<br /><span>bajo control.</span>
        </h1>

        <p className="kl-hero-sub">
          Kuadra es el sistema operativo para talleres de corte. Pedidos, máquinas y rendimiento — todo en tiempo real, sin papeles, sin llamadas.
        </p>

        <div className="kl-hero-ctas">
          <Link href="/dashboard" className="kl-btn-hero-primary">Solicitar demo →</Link>
          <a href="#modulos" className="kl-btn-hero-ghost">Ver módulos ↓</a>
        </div>

        {/* Floating cards */}
        <div className="kl-hero-cards">
          <div className="kl-float-card kl-card-cola">
            <div className="kl-fc-label">En cola</div>
            <div className="kl-fc-value" style={{ color: "#d97706" }}>28</div>
            <div className="kl-fc-sub">esperando corte</div>
          </div>

          <div className="kl-float-card kl-card-m1">
            <div className="kl-fc-label">
              <span className="kl-fc-dot" style={{ background: "#10b981" }} />
              Máquina 1 — Activa
            </div>
            <div className="kl-fc-sub" style={{ fontSize: "12px", color: "#374151", fontWeight: 600 }}>
              GL Santamaria Cocina 303
            </div>
            <div style={{ display: "flex", gap: "16px", marginTop: "6px" }}>
              <div><div className="kl-fc-label">planchas</div><div style={{ fontSize: "18px", fontWeight: 800 }}>8.5</div></div>
              <div><div className="kl-fc-label">piezas</div><div style={{ fontSize: "18px", fontWeight: 800 }}>163</div></div>
              <div><div className="kl-fc-label">canto</div><div style={{ fontSize: "18px", fontWeight: 800 }}>332m</div></div>
            </div>
            <div className="kl-progress-bar"><div className="kl-progress-fill" style={{ width: "65%" }} /></div>
          </div>

          <div className="kl-float-card kl-card-completados">
            <div className="kl-fc-label">Completados hoy</div>
            <div className="kl-fc-value" style={{ color: "#16a34a" }}>12</div>
            <div className="kl-fc-sub">listos + entregados</div>
          </div>

          <div className="kl-float-card kl-card-rendimiento">
            <div className="kl-fc-label">Rendimiento M1</div>
            <div className="kl-fc-value" style={{ fontSize: "36px", color: "#c2410c" }}>86%</div>
            <div className="kl-fc-sub">34.5 vs 40 ideales</div>
            <div className="kl-progress-bar"><div className="kl-progress-fill" style={{ width: "86%" }} /></div>
          </div>

          <div className="kl-float-card kl-card-semana">
            <div className="kl-fc-label">Esta semana</div>
            <div className="kl-fc-value" style={{ fontSize: "32px" }}>47</div>
            <div className="kl-fc-sub">pedidos procesados</div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="kl-ticker-wrap">
        <div className="kl-ticker-track">
          {[
            "Control de pedidos", "Producción en tiempo real", "Trazabilidad total",
            "Analítica de rendimiento", "Calendario de entregas", "Reporte diario PDF",
            "Gestión de roles", "Historial completo", "Asignación de máquinas",
            "Control de pedidos", "Producción en tiempo real", "Trazabilidad total",
            "Analítica de rendimiento", "Calendario de entregas", "Reporte diario PDF",
            "Gestión de roles", "Historial completo", "Asignación de máquinas",
          ].map((item, i) => (
            <div key={i} className="kl-ticker-item">
              <span>◆</span> {item}
            </div>
          ))}
        </div>
      </div>

      {/* MODULES */}
      <section className="kl-modules-section" id="modulos">
        <div className="kl-container">
          <p className="kl-section-label">Plataforma completa</p>
          <h2 className="kl-section-title">
            8 módulos<br /><span className="kl-dim">para tu taller.</span>
          </h2>
          <p className="kl-section-sub">Desde que entra el pedido hasta que sale el despacho. Todo conectado, todo visible.</p>

          <div className="kl-modules-grid">
            <div className="kl-module-list">
              {modules.map((m, i) => (
                <div
                  key={i}
                  className={`kl-module-item${active === i ? " kl-active" : ""}`}
                  onClick={() => setActive(i)}
                >
                  <div className="kl-module-icon">{m.icon}</div>
                  <div>
                    <div className="kl-module-name">{m.name}</div>
                    <div className="kl-module-desc">{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mockup */}
            <div className="kl-mockup">
              <div className="kl-mockup-bar">
                <div className="kl-mockup-dot" style={{ background: "#ef4444" }} />
                <div className="kl-mockup-dot" style={{ background: "#f59e0b" }} />
                <div className="kl-mockup-dot" style={{ background: "#10b981" }} />
                <div className="kl-mockup-url">kuadra.vercel.app/dashboard</div>
              </div>
              <div className="kl-mockup-content">
                <div className="kl-mockup-header">Panel de Producción — Jueves, 7 de Mayo</div>
                <div className="kl-mockup-stats">
                  {[
                    { label: "Ingresados", val: "00", color: "#60a5fa" },
                    { label: "En cola", val: "04", color: "#fbbf24" },
                    { label: "En corte", val: "02", color: "#f87171" },
                    { label: "Listos", val: "12", color: "#34d399" },
                  ].map((s) => (
                    <div key={s.label} className="kl-mockup-stat">
                      <div className="kl-mockup-stat-label">{s.label}</div>
                      <div className="kl-mockup-stat-val" style={{ color: s.color }}>{s.val}</div>
                    </div>
                  ))}
                </div>
                <div className="kl-mockup-machines">
                  <div className="kl-mockup-machine">
                    <div className="kl-mockup-machine-name">MÁQUINA 1</div>
                    <div className="kl-mockup-machine-status">Operativa · 3 activos</div>
                    <div className="kl-mockup-order">
                      <div className="kl-mockup-order-name">GL Santamaria Cocina 303</div>
                      <div className="kl-mockup-order-nums">
                        <div><div className="kl-mockup-order-num">8.5</div><div className="kl-mockup-order-num-label">planchas</div></div>
                        <div><div className="kl-mockup-order-num">163</div><div className="kl-mockup-order-num-label">piezas</div></div>
                      </div>
                    </div>
                  </div>
                  <div className="kl-mockup-machine">
                    <div className="kl-mockup-machine-name">MÁQUINA 2</div>
                    <div className="kl-mockup-machine-status">Operativa · 1 activo</div>
                    <div className="kl-mockup-order">
                      <div className="kl-mockup-order-name">Yammy Guillén</div>
                      <div className="kl-mockup-order-nums">
                        <div><div className="kl-mockup-order-num">2.5</div><div className="kl-mockup-order-num-label">planchas</div></div>
                        <div><div className="kl-mockup-order-num">35</div><div className="kl-mockup-order-num-label">piezas</div></div>
                      </div>
                    </div>
                  </div>
                  <div className="kl-mockup-machine">
                    <div className="kl-mockup-machine-name">MÁQUINA 3</div>
                    <div className="kl-mockup-machine-status">Operativa · 0 activos</div>
                    <div className="kl-mockup-order" style={{ opacity: 0.4, textAlign: "center", padding: "16px 8px" }}>
                      <div className="kl-mockup-order-name" style={{ fontSize: "10px" }}>Sin pedidos activos</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="kl-benefits-section">
        <div className="kl-container">
          <p className="kl-section-label">Por qué Kuadra</p>
          <h2 className="kl-section-title">Tu taller, <span className="kl-dim">en tiempo real.</span></h2>
          <p className="kl-section-sub">Deja de decidir a ciegas. Kuadra convierte el caos del taller en datos claros y acción inmediata.</p>
          <div className="kl-benefits-grid">
            {[
              { icon: "📋", title: "Sin bitácoras en papel", desc: "Cada pedido vive en el sistema con cliente, material, planchas, piezas y fecha estimada.", before: "Cuadernos, hojas sueltas, WhatsApp", after: "Sistema centralizado en tiempo real" },
              { icon: "🏭", title: "Cada máquina, visible", desc: "M1, M2 y M3 con estado en vivo. Si una máquina está libre, redistribuye la carga al instante.", before: "Preguntar y revisar papeles", after: "Ver en pantalla y actuar" },
              { icon: "📈", title: "Decisiones con datos", desc: "Rendimiento por máquina, comparativo ideal vs real, carga pendiente y reportes diarios en PDF.", before: "Suposiciones y llamadas", after: "Reportes y métricas reales" },
              { icon: "📅", title: "Calendario de entregas", desc: "Vista mensual por fecha. Días cerrados en verde, días con carga en amarillo. Atrasos al primer vistazo.", before: "Revisar pedido por pedido", after: "Un vistazo al calendario" },
              { icon: "🔍", title: "Trazabilidad total", desc: "En cola → En corte → Tapacantos → Listo → Despachado. Con hora y responsable de cada cambio.", before: "Nadie sabe qué pasó con el pedido", after: "Historial completo con responsable" },
              { icon: "👥", title: "Roles para cada persona", desc: "Gerencia, ventas, producción, logística, almacén — cada rol ve exactamente lo que necesita.", before: "Todos ven todo, nadie es responsable", after: "Permisos claros por persona" },
            ].map((b) => (
              <div key={b.title} className="kl-benefit-card">
                <div className="kl-benefit-icon">{b.icon}</div>
                <div className="kl-benefit-title">{b.title}</div>
                <div className="kl-benefit-desc">{b.desc}</div>
                <div className="kl-benefit-ba">
                  <div className="kl-benefit-before">Antes: {b.before}</div>
                  <div className="kl-benefit-after">Ahora: {b.after}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="kl-pricing-section" id="precios">
        <div className="kl-container">
          <p className="kl-section-label" style={{ textAlign: "center" }}>Inversión transparente</p>
          <h2 className="kl-section-title" style={{ textAlign: "center" }}>
            El plan que se adapta<br /><span className="kl-dim">a tu taller.</span>
          </h2>
          <p className="kl-section-sub" style={{ textAlign: "center", margin: "12px auto 0" }}>14 días de prueba gratuita. Sin costos de activación.</p>

          <div className="kl-pricing-grid">
            {/* Básico */}
            <div className="kl-pricing-card">
              <span className="kl-pbadge kl-pbadge-basico">Básico</span>
              <div className="kl-pname">Para empezar</div>
              <div className="kl-pprice"><sup>$</sup>299<span>/mes</span></div>
              <div className="kl-psub">2 máquinas · hasta 5 usuarios</div>
              <hr className="kl-pdivider" />
              <ul className="kl-pfeatures">
                {["Panel de control", "Gestión de pedidos + historial", "Producción en tiempo real", "Marcar como listo directo", "Vista por día", "3 roles básicos"].map(f => (
                  <li key={f} className="kl-pfeature"><span className="kl-pcheck">✓</span> {f}</li>
                ))}
                {["Rendimiento avanzado", "Reporte PDF"].map(f => (
                  <li key={f} className="kl-pfeature"><span className="kl-pcheck-dim">—</span> <span style={{ color: "var(--kl-text-dim)" }}>{f}</span></li>
                ))}
              </ul>
              <Link href="/dashboard" className="kl-pbtn kl-pbtn-outline">Solicitar demo →</Link>
              <div className="kl-pmaquinas">Prueba 14 días gratis</div>
            </div>

            {/* Profesional */}
            <div className="kl-pricing-card kl-pfeatured">
              <span className="kl-ppopular">POPULAR</span>
              <span className="kl-pbadge kl-pbadge-pro">Profesional</span>
              <div className="kl-pname">Para crecer</div>
              <div className="kl-pprice"><sup>$</sup>499<span>/mes</span></div>
              <div className="kl-psub">3 máquinas · usuarios ilimitados</div>
              <hr className="kl-pdivider" style={{ borderColor: "#374151" }} />
              <ul className="kl-pfeatures">
                {["Todo lo del plan Básico", "Analítica de rendimiento", "Calendario de entregas", "Reporte diario + PDF", "Todos los roles del sistema", "Módulo Financiero", "Múltiples materiales por pedido", "Soporte prioritario"].map(f => (
                  <li key={f} className="kl-pfeature"><span className="kl-pcheck">✓</span> {f}</li>
                ))}
              </ul>
              <Link href="/dashboard" className="kl-pbtn kl-pbtn-dark">Solicitar demo →</Link>
              <div className="kl-pmaquinas" style={{ color: "#6b7280" }}>Prueba 14 días gratis</div>
            </div>

            {/* Empresarial */}
            <div className="kl-pricing-card">
              <span className="kl-pbadge kl-pbadge-emp">Empresarial</span>
              <div className="kl-pname">Para escalar</div>
              <div className="kl-pprice"><sup>$</sup>899<span>/mes</span></div>
              <div className="kl-psub">Máquinas ilimitadas · todo incluido</div>
              <hr className="kl-pdivider" />
              <ul className="kl-pfeatures">
                {["Todo lo del plan Profesional", "CRM de Clientes", "Módulo Inventario", "Historial de reportes", "Exportar CSV / Excel", "Personalización de la herramienta", "Roles personalizados", "Soporte dedicado"].map(f => (
                  <li key={f} className="kl-pfeature"><span className="kl-pcheck">✓</span> {f}</li>
                ))}
              </ul>
              <Link href="/dashboard" className="kl-pbtn kl-pbtn-outline">Solicitar demo →</Link>
              <div className="kl-pmaquinas">Demo personalizada</div>
            </div>
          </div>
        </div>
      </section>

      {/* ECOSYSTEM */}
      <section className="kl-ecosystem-section" id="ecosistema">
        <div className="kl-container">
          <p className="kl-section-label" style={{ textAlign: "center" }}>Parte de algo más grande</p>
          <h2 className="kl-section-title" style={{ textAlign: "center" }}>
            El ecosistema <span style={{ color: "var(--kl-accent)" }}>RyG SaaS</span>
          </h2>
          <p className="kl-section-sub" style={{ textAlign: "center", margin: "12px auto 0" }}>
            Herramientas verticales para industrias específicas. Misma calidad, mismo estándar.
          </p>
          <div className="kl-eco-grid">
            {[
              { icon: "🏢", bg: "#f0fdf4", name: "Domia", desc: "Gestión de condominios y conjuntos residenciales.", current: false },
              { icon: "🏗️", bg: "#fff7ed", name: "Gestrik", desc: "Control de proyectos de construcción e ingeniería civil.", current: false },
              { icon: "🏠", bg: "#eff6ff", name: "ryginmo", desc: "Plataforma de gestión inmobiliaria y activos en renta.", current: false },
              { icon: "🪚", bg: "#fff7ed", name: "Kuadra", desc: "Sistema de gestión para talleres y empresas de carpintería.", current: true },
            ].map((e) => (
              <div key={e.name} className={`kl-eco-card${e.current ? " kl-eco-active" : ""}`}>
                <div className="kl-eco-icon" style={{ background: e.bg }}>{e.icon}</div>
                <span className="kl-eco-status">Activo</span>
                <div className="kl-eco-name">{e.name}</div>
                <div className="kl-eco-desc">{e.desc}</div>
                <span className="kl-eco-link">{e.current ? "Estás aquí" : "Ver plataforma →"}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="kl-cta-section">
        <h2 className="kl-cta-title">
          ¿Tu taller listo<br />para el <span className="kl-cta-accent">siguiente nivel?</span>
        </h2>
        <p className="kl-cta-sub">Centraliza tus pedidos, controla tus máquinas y toma decisiones con datos reales desde el primer día.</p>
        <div className="kl-cta-btns">
          <Link href="/dashboard" className="kl-btn-cta-primary">Solicitar demo →</Link>
          <a href="#modulos" className="kl-btn-cta-ghost">Ver módulos</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="kl-footer">
        <div className="kl-footer-logo">
          <div className="kl-footer-logo-icon">K</div>
          <span className="kl-footer-logo-name">Kuadra</span>
        </div>
        <div className="kl-footer-copy">© 2026 Kuadra. Todos los derechos reservados.</div>
        <div className="kl-footer-ryg">Construido con ❤️ por <span>RyG SaaS</span></div>
      </footer>
    </div>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Syne:wght@700;800&display=swap');

.kl { --kl-bg:#fafaf9; --kl-white:#ffffff; --kl-accent:#c2410c; --kl-accent-light:#fff7ed; --kl-accent-mid:#fed7aa; --kl-amber:#d97706; --kl-border:#e5e7eb; --kl-text:#111827; --kl-text-muted:#6b7280; --kl-text-dim:#9ca3af; }
.kl * { box-sizing:border-box; margin:0; padding:0; }
.kl { background:var(--kl-bg); color:var(--kl-text); font-family:'Inter',sans-serif; overflow-x:hidden; }

/* NAV */
.kl-nav { position:sticky; top:0; z-index:100; background:rgba(255,255,255,0.92); backdrop-filter:blur(12px); border-bottom:1px solid var(--kl-border); display:flex; align-items:center; justify-content:space-between; padding:0 40px; height:64px; }
.kl-logo { display:flex; align-items:center; gap:10px; text-decoration:none; }
.kl-logo-icon { width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg,#c2410c,#d97706); display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-weight:800; color:white; font-size:14px; }
.kl-logo-name { font-family:'Syne',sans-serif; font-weight:800; font-size:18px; color:var(--kl-text); letter-spacing:-0.5px; }
.kl-badge { font-size:9px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; background:var(--kl-accent-light); color:var(--kl-accent); border:1px solid var(--kl-accent-mid); padding:2px 7px; border-radius:99px; }
.kl-nav-links { display:flex; gap:32px; }
.kl-nav-links a { text-decoration:none; color:var(--kl-text-muted); font-size:14px; font-weight:500; transition:color .15s; }
.kl-nav-links a:hover { color:var(--kl-text); }
.kl-nav-actions { display:flex; gap:8px; align-items:center; }
.kl-btn-ghost { padding:8px 16px; border-radius:8px; font-size:14px; font-weight:500; border:1px solid var(--kl-border); background:white; color:var(--kl-text); cursor:pointer; text-decoration:none; transition:all .15s; }
.kl-btn-ghost:hover { background:#f9fafb; }
.kl-btn-primary { padding:8px 18px; border-radius:8px; font-size:14px; font-weight:600; background:var(--kl-accent); color:white; border:none; cursor:pointer; text-decoration:none; transition:all .15s; }
.kl-btn-primary:hover { background:#9a3412; }

/* HERO */
.kl-hero { min-height:calc(100vh - 64px); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px 40px 60px; position:relative; overflow:hidden; }
.kl-hero-bg { position:absolute; inset:0; pointer-events:none; background:radial-gradient(ellipse 70% 60% at 50% 0%,rgba(194,65,12,.06) 0%,transparent 70%); }
.kl-hero-grid { position:absolute; inset:0; pointer-events:none; opacity:.2; background-image:linear-gradient(var(--kl-border) 1px,transparent 1px),linear-gradient(90deg,var(--kl-border) 1px,transparent 1px); background-size:60px 60px; }
.kl-badge-pill { display:inline-flex; align-items:center; gap:6px; background:var(--kl-accent-light); border:1px solid var(--kl-accent-mid); color:var(--kl-accent); font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; padding:5px 12px; border-radius:99px; margin-bottom:28px; }
.kl-badge-dot { width:6px; height:6px; border-radius:50%; background:var(--kl-accent); }
.kl-hero-title { font-family:'Syne',sans-serif; font-weight:800; font-size:clamp(64px,10vw,120px); line-height:.9; text-align:center; letter-spacing:-4px; color:var(--kl-text); position:relative; z-index:1; }
.kl-hero-title span { color:var(--kl-accent); }
.kl-hero-sub { max-width:520px; text-align:center; margin-top:24px; font-size:17px; color:var(--kl-text-muted); line-height:1.6; }
.kl-hero-ctas { display:flex; gap:12px; margin-top:36px; }
.kl-btn-hero-primary { padding:13px 28px; border-radius:10px; font-size:15px; font-weight:600; background:var(--kl-accent); color:white; border:none; cursor:pointer; text-decoration:none; transition:all .15s; }
.kl-btn-hero-primary:hover { background:#9a3412; transform:translateY(-1px); }
.kl-btn-hero-ghost { padding:13px 28px; border-radius:10px; font-size:15px; font-weight:500; background:white; color:var(--kl-text); border:1px solid var(--kl-border); cursor:pointer; text-decoration:none; transition:all .15s; }
.kl-btn-hero-ghost:hover { transform:translateY(-1px); }

/* FLOAT CARDS */
.kl-hero-cards { position:relative; width:100%; max-width:900px; height:220px; margin-top:60px; }
.kl-float-card { position:absolute; background:white; border:1px solid var(--kl-border); border-radius:14px; padding:14px 18px; box-shadow:0 1px 3px rgba(0,0,0,.06),0 4px 16px rgba(0,0,0,.04); animation:klFloat 6s ease-in-out infinite; }
.kl-float-card:nth-child(2){animation-delay:-2s}
.kl-float-card:nth-child(3){animation-delay:-4s}
.kl-float-card:nth-child(4){animation-delay:-1s}
.kl-float-card:nth-child(5){animation-delay:-3s}
@keyframes klFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.kl-fc-label { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:var(--kl-text-dim); margin-bottom:4px; }
.kl-fc-value { font-size:28px; font-weight:800; color:var(--kl-text); line-height:1; font-family:'Syne',sans-serif; }
.kl-fc-sub { font-size:11px; color:var(--kl-text-muted); margin-top:3px; }
.kl-fc-dot { display:inline-block; width:7px; height:7px; border-radius:50%; margin-right:4px; }
.kl-card-cola { left:0; top:20px; min-width:140px; }
.kl-card-m1 { left:180px; top:0; min-width:200px; }
.kl-card-completados { left:50%; transform:translateX(-50%); top:50px; min-width:160px; }
.kl-card-rendimiento { right:180px; top:10px; min-width:180px; }
.kl-card-semana { right:0; top:40px; min-width:150px; }
.kl-progress-bar { height:4px; border-radius:99px; background:#f3f4f6; margin-top:10px; overflow:hidden; }
.kl-progress-fill { height:100%; border-radius:99px; background:linear-gradient(90deg,#c2410c,#d97706); }

/* TICKER */
.kl-ticker-wrap { background:#111827; padding:14px 0; overflow:hidden; }
.kl-ticker-track { display:flex; width:max-content; animation:klTicker 32s linear infinite; }
@keyframes klTicker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.kl-ticker-item { display:flex; align-items:center; gap:8px; padding:0 36px; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:.1em; color:#6b7280; white-space:nowrap; }
.kl-ticker-item span { color:var(--kl-accent); font-size:14px; }

/* SHARED */
.kl-container { max-width:1140px; margin:0 auto; }
.kl-section-label { font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--kl-accent); margin-bottom:16px; }
.kl-section-title { font-family:'Syne',sans-serif; font-weight:800; font-size:clamp(32px,4vw,52px); line-height:1.05; letter-spacing:-1.5px; color:var(--kl-text); }
.kl-dim { color:var(--kl-text-dim); }
.kl-section-sub { max-width:500px; font-size:16px; color:var(--kl-text-muted); line-height:1.6; margin-top:12px; }

/* MODULES */
.kl-modules-section { background:white; border-top:1px solid var(--kl-border); border-bottom:1px solid var(--kl-border); padding:96px 40px; }
.kl-modules-grid { display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center; margin-top:56px; }
.kl-module-list { display:flex; flex-direction:column; gap:4px; }
.kl-module-item { display:flex; align-items:center; gap:14px; padding:14px 16px; border-radius:10px; cursor:pointer; transition:all .15s; border:1px solid transparent; }
.kl-module-item:hover,.kl-module-item.kl-active { background:var(--kl-accent-light); border-color:var(--kl-accent-mid); }
.kl-module-item.kl-active .kl-module-name { color:var(--kl-accent); font-weight:700; }
.kl-module-icon { width:36px; height:36px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:16px; background:#f3f4f6; flex-shrink:0; }
.kl-module-item.kl-active .kl-module-icon { background:var(--kl-accent-light); }
.kl-module-name { font-size:14px; font-weight:500; color:var(--kl-text); }
.kl-module-desc { font-size:12px; color:var(--kl-text-muted); margin-top:1px; }

/* MOCKUP */
.kl-mockup { background:#111827; border-radius:20px; overflow:hidden; box-shadow:0 24px 64px rgba(0,0,0,.15); border:1px solid #1f2937; }
.kl-mockup-bar { background:#1f2937; padding:12px 16px; display:flex; align-items:center; gap:6px; border-bottom:1px solid #374151; }
.kl-mockup-dot { width:10px; height:10px; border-radius:50%; }
.kl-mockup-url { margin-left:8px; font-size:11px; color:#4b5563; font-family:monospace; }
.kl-mockup-content { padding:20px; }
.kl-mockup-header { font-size:11px; color:#6b7280; margin-bottom:16px; font-weight:500; text-transform:uppercase; letter-spacing:.06em; }
.kl-mockup-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:16px; }
.kl-mockup-stat { background:#1f2937; border-radius:8px; padding:10px 12px; }
.kl-mockup-stat-label { font-size:9px; color:#6b7280; text-transform:uppercase; letter-spacing:.06em; }
.kl-mockup-stat-val { font-size:22px; font-weight:800; color:white; font-family:'Syne',sans-serif; margin-top:2px; }
.kl-mockup-machines { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
.kl-mockup-machine { background:#1f2937; border-radius:8px; padding:10px 12px; }
.kl-mockup-machine-name { font-size:10px; font-weight:700; color:white; margin-bottom:6px; }
.kl-mockup-machine-status { display:flex; align-items:center; gap:4px; font-size:9px; color:#10b981; }
.kl-mockup-machine-status::before { content:''; width:5px; height:5px; border-radius:50%; background:#10b981; }
.kl-mockup-order { background:#111827; border:1px solid #374151; border-radius:6px; padding:8px; margin-top:6px; }
.kl-mockup-order-name { font-size:9px; color:#9ca3af; margin-bottom:4px; }
.kl-mockup-order-nums { display:flex; gap:8px; }
.kl-mockup-order-num { font-size:11px; font-weight:700; color:white; }
.kl-mockup-order-num-label { font-size:8px; color:#6b7280; }

/* BENEFITS */
.kl-benefits-section { background:var(--kl-bg); padding:96px 40px; }
.kl-benefits-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; margin-top:56px; }
.kl-benefit-card { background:white; border:1px solid var(--kl-border); border-radius:16px; padding:28px; transition:all .2s; }
.kl-benefit-card:hover { box-shadow:0 4px 24px rgba(0,0,0,.1); transform:translateY(-2px); }
.kl-benefit-icon { font-size:28px; margin-bottom:16px; }
.kl-benefit-title { font-size:17px; font-weight:700; color:var(--kl-text); margin-bottom:8px; }
.kl-benefit-desc { font-size:14px; color:var(--kl-text-muted); line-height:1.6; }
.kl-benefit-ba { margin-top:16px; padding:12px; background:var(--kl-accent-light); border-radius:8px; border-left:3px solid var(--kl-accent); }
.kl-benefit-before { font-size:12px; color:#6b7280; text-decoration:line-through; }
.kl-benefit-after { font-size:12px; font-weight:600; color:var(--kl-accent); margin-top:2px; }

/* PRICING */
.kl-pricing-section { background:white; border-top:1px solid var(--kl-border); padding:96px 40px; }
.kl-pricing-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-top:56px; max-width:900px; margin-left:auto; margin-right:auto; }
.kl-pricing-card { background:var(--kl-bg); border:1px solid var(--kl-border); border-radius:20px; padding:32px 28px; position:relative; transition:all .2s; }
.kl-pricing-card:hover { box-shadow:0 4px 24px rgba(0,0,0,.1); }
.kl-pfeatured { background:#111827; border-color:#111827; transform:scale(1.03); }
.kl-pfeatured .kl-pprice,.kl-pfeatured .kl-pname { color:white; }
.kl-pfeatured .kl-psub { color:#9ca3af; }
.kl-pfeatured .kl-pfeature { color:#d1d5db; border-color:#374151; }
.kl-pbadge { display:inline-block; font-size:10px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; padding:3px 10px; border-radius:99px; margin-bottom:20px; }
.kl-pbadge-basico { background:#f3f4f6; color:#6b7280; }
.kl-pbadge-pro { background:var(--kl-accent); color:white; }
.kl-pbadge-emp { background:#1f2937; color:#9ca3af; }
.kl-ppopular { position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:var(--kl-accent); color:white; font-size:10px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; padding:4px 14px; border-radius:99px; }
.kl-pname { font-size:14px; font-weight:600; color:var(--kl-text-muted); margin-bottom:8px; }
.kl-pprice { font-family:'Syne',sans-serif; font-weight:800; font-size:48px; color:var(--kl-text); letter-spacing:-2px; line-height:1; }
.kl-pprice sup { font-size:20px; vertical-align:top; margin-top:8px; }
.kl-pprice span { font-size:14px; font-weight:400; color:var(--kl-text-muted); letter-spacing:0; }
.kl-psub { font-size:13px; color:var(--kl-text-muted); margin:8px 0 24px; }
.kl-pdivider { border:none; border-top:1px solid var(--kl-border); margin-bottom:20px; }
.kl-pfeatures { list-style:none; display:flex; flex-direction:column; gap:10px; margin-bottom:28px; }
.kl-pfeature { font-size:13px; color:var(--kl-text); display:flex; align-items:flex-start; gap:8px; border-bottom:1px solid var(--kl-border); padding-bottom:10px; }
.kl-pfeature:last-child { border-bottom:none; }
.kl-pcheck { color:var(--kl-accent); font-weight:700; flex-shrink:0; }
.kl-pcheck-dim { color:var(--kl-text-dim); flex-shrink:0; }
.kl-pbtn { width:100%; padding:13px; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; text-align:center; transition:all .15s; text-decoration:none; display:block; }
.kl-pbtn-outline { background:white; border:1px solid var(--kl-border); color:var(--kl-text); }
.kl-pbtn-outline:hover { background:#f9fafb; }
.kl-pbtn-dark { background:white; border:none; color:var(--kl-text); }
.kl-pbtn-dark:hover { background:#f3f4f6; }
.kl-pmaquinas { font-size:12px; color:var(--kl-text-muted); margin-top:10px; text-align:center; }

/* ECOSYSTEM */
.kl-ecosystem-section { background:var(--kl-bg); padding:96px 40px; }
.kl-eco-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-top:48px; }
.kl-eco-card { background:white; border:1px solid var(--kl-border); border-radius:16px; padding:24px; transition:all .2s; cursor:pointer; text-decoration:none; color:inherit; display:block; }
.kl-eco-card:hover { box-shadow:0 4px 24px rgba(0,0,0,.1); transform:translateY(-2px); }
.kl-eco-active { border-color:var(--kl-accent-mid); background:var(--kl-accent-light); }
.kl-eco-icon { width:44px; height:44px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:20px; margin-bottom:14px; }
.kl-eco-status { display:inline-flex; align-items:center; gap:5px; font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.06em; padding:2px 8px; border-radius:99px; margin-bottom:12px; background:#dcfce7; color:#16a34a; }
.kl-eco-status::before { content:''; width:5px; height:5px; border-radius:50%; background:#16a34a; }
.kl-eco-name { font-size:17px; font-weight:800; font-family:'Syne',sans-serif; color:var(--kl-text); margin-bottom:6px; }
.kl-eco-desc { font-size:12px; color:var(--kl-text-muted); line-height:1.5; }
.kl-eco-link { font-size:12px; font-weight:600; color:var(--kl-accent); margin-top:12px; display:block; }

/* CTA */
.kl-cta-section { background:#111827; padding:96px 40px; display:flex; flex-direction:column; align-items:center; text-align:center; }
.kl-cta-title { font-family:'Syne',sans-serif; font-weight:800; font-size:clamp(36px,5vw,60px); letter-spacing:-2px; color:white; line-height:1.05; margin-bottom:16px; }
.kl-cta-accent { color:var(--kl-amber); }
.kl-cta-sub { font-size:16px; color:#9ca3af; max-width:440px; line-height:1.6; margin-bottom:36px; }
.kl-cta-btns { display:flex; gap:12px; }
.kl-btn-cta-primary { padding:14px 32px; border-radius:10px; font-size:15px; font-weight:600; background:var(--kl-accent); color:white; border:none; cursor:pointer; text-decoration:none; transition:all .15s; }
.kl-btn-cta-primary:hover { background:#9a3412; }
.kl-btn-cta-ghost { padding:14px 32px; border-radius:10px; font-size:15px; font-weight:500; background:transparent; color:#d1d5db; border:1px solid #374151; cursor:pointer; text-decoration:none; transition:all .15s; }
.kl-btn-cta-ghost:hover { border-color:#6b7280; color:white; }

/* FOOTER */
.kl-footer { background:#111827; border-top:1px solid #1f2937; padding:24px 40px; display:flex; align-items:center; justify-content:space-between; }
.kl-footer-logo { display:flex; align-items:center; gap:8px; }
.kl-footer-logo-icon { width:28px; height:28px; border-radius:7px; background:linear-gradient(135deg,#c2410c,#d97706); display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-weight:800; color:white; font-size:10px; }
.kl-footer-logo-name { font-family:'Syne',sans-serif; font-weight:800; font-size:14px; color:white; }
.kl-footer-copy { font-size:12px; color:#6b7280; }
.kl-footer-ryg { font-size:12px; color:#6b7280; }
.kl-footer-ryg span { color:white; font-weight:600; }
`;
