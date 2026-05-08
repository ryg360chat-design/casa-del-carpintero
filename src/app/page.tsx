"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const flowStages = [
  {
    step: "01", label: "Ingresa", module: "Pedidos",
    title: "El pedido entra al sistema",
    desc: "Cliente, material, planchas, piezas y fecha de entrega — registrado en 30 segundos. Sin papeles, sin llamadas internas al taller.",
    before: "Cuaderno, WhatsApp, hojas sueltas",
    after: "Pedido digital con todos los datos",
  },
  {
    step: "02", label: "En cola", module: "Dashboard",
    title: "El taller sabe lo que viene",
    desc: "El panel en tiempo real muestra cuántos pedidos esperan, qué máquina está libre y cuál tiene prioridad ahora mismo.",
    before: "Ir a preguntar físicamente al taller",
    after: "Ver en pantalla desde cualquier lugar",
  },
  {
    step: "03", label: "Al corte", module: "Producción",
    title: "Se asigna a la máquina",
    desc: "El operario ve en pantalla qué procesar, en qué máquina y con qué detalle exacto. Sin papeles, sin confusiones.",
    before: "Buscar el papel o preguntar al jefe",
    after: "Instrucción clara en pantalla",
  },
  {
    step: "04", label: "Terminado", module: "Rendimiento",
    title: "Se mide lo que se produce",
    desc: "Al marcar listo, el sistema registra planchas, piezas y calcula rendimiento real vs ideal de cada máquina en tiempo real.",
    before: "No se sabe si el ritmo es bueno",
    after: "Métricas y comparativo en vivo",
  },
  {
    step: "05", label: "Despachado", module: "Historial",
    title: "Sale con trazabilidad total",
    desc: "Queda registrado quién lo cortó, a qué hora salió y qué máquina se usó. Historial completo visible para siempre.",
    before: "Nadie sabe qué pasó con el pedido",
    after: "Historial completo con responsable",
  },
  {
    step: "06", label: "Reportado", module: "Reporte",
    title: "El día queda documentado",
    desc: "Un PDF automático con todo lo producido, pendiente y el rendimiento de cada máquina. Listo para compartir en segundos.",
    before: "Contar a mano o no documentar nada",
    after: "PDF automático al cerrar el día",
  },
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
  const [flowStage, setFlowStage] = useState(0);
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
    basico: billing === "mensual" ? 300 : 255,
    profesional: billing === "mensual" ? 500 : 425,
    empresarial: billing === "mensual" ? 900 : 765,
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
        <div className="kl-hero-content">
          <div className="kl-eyebrow">● RYG SAAS · SISTEMA OPERATIVO PARA TALLERES DE CORTE</div>
          <h1 className="kl-hero-title">
            El taller que <em>sabe</em><br />lo que está pasando.
          </h1>
          <div className="kl-hero-bottom">
            <p className="kl-hero-sub">
              Mientras otros talleres siguen con cuadernos, WhatsApp y suposiciones, los tuyos saben <strong>en segundos</strong> qué está en cola, qué máquina está libre y qué pedido lleva retraso.
            </p>
            <div className="kl-hero-ctas">
              <Link href="/dashboard" className="kl-btn-primary">Solicitar demo →</Link>
              <a href="#modulos" className="kl-btn-outline">Ver módulos ↓</a>
            </div>
          </div>
        </div>
        <div className="kl-metrics-strip">
          <div className="kl-metric">
            <div className="kl-metric-label">Hora del taller</div>
            <div className="kl-metric-val kl-mono">{clock || "00:00:00"}</div>
            <div className="kl-metric-sub">GL Santamaría</div>
          </div>
          <div className="kl-metric">
            <div className="kl-metric-label">Máquina 1 · Activa</div>
            <div className="kl-metric-val kl-maccent">{rend}%</div>
            <div className="kl-metric-sub">rendimiento vs ideal</div>
          </div>
          <div className="kl-metric">
            <div className="kl-metric-label">En cola</div>
            <div className="kl-metric-val">{cola}</div>
            <div className="kl-metric-sub">pedidos esperando corte</div>
          </div>
          <div className="kl-metric">
            <div className="kl-metric-label">Listos hoy</div>
            <div className="kl-metric-val kl-mok">12</div>
            <div className="kl-metric-sub">47 esta semana</div>
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

      {/* FLOW */}
      <section className="kl-flow-section" id="modulos">
        <div className="kl-container">
          <div className="kl-eyebrow">◆ Así funciona Kuadra</div>
          <h2 className="kl-section-title">De la llamada<br /><span className="kl-title-muted">al despacho.</span></h2>
          <p className="kl-section-sub">Cada pedido recorre 6 etapas. Click en cualquiera para ver qué módulo la gestiona y qué cambia.</p>

          {/* FLOW NAV */}
          <div className="kl-flow-nav">
            {flowStages.map((s, i) => (
              <button key={i} className={`kl-flow-step${flowStage === i ? " kl-fs-active" : i < flowStage ? " kl-fs-done" : ""}`} onClick={() => setFlowStage(i)}>
                <div className="kl-fs-node kl-mono">
                  {i < flowStage ? "✓" : s.step}
                </div>
                <div className="kl-fs-label">{s.label}</div>
                {i < flowStages.length - 1 && <div className="kl-fs-line" />}
              </button>
            ))}
          </div>

          {/* FLOW PANEL */}
          <div className="kl-flow-panel">
            <div className="kl-flow-left">
              <div className="kl-flow-stepnum kl-mono">{flowStages[flowStage].step} / 06</div>
              <h3 className="kl-flow-title">{flowStages[flowStage].title}</h3>
              <div className="kl-flow-module-pill kl-mono">◆ {flowStages[flowStage].module}</div>
              <p className="kl-flow-desc">{flowStages[flowStage].desc}</p>
              <div className="kl-flow-ba">
                <div className="kl-benefit-row">
                  <span className="kl-ba-label kl-ba-before kl-mono">ANTES</span>
                  <span className="kl-benefit-before">{flowStages[flowStage].before}</span>
                </div>
                <div className="kl-benefit-row" style={{ marginTop: 8 }}>
                  <span className="kl-ba-label kl-ba-after kl-mono">AHORA</span>
                  <span className="kl-benefit-after">{flowStages[flowStage].after}</span>
                </div>
              </div>
              <div className="kl-flow-nav-btns">
                {flowStage > 0 && <button className="kl-flow-prev" onClick={() => setFlowStage(flowStage - 1)}>← Anterior</button>}
                {flowStage < flowStages.length - 1 && <button className="kl-flow-next" onClick={() => setFlowStage(flowStage + 1)}>Siguiente →</button>}
              </div>
            </div>

            <div className="kl-flow-right">
              <div className="kl-flow-mock">
                <div className="kl-flow-mock-bar">
                  <div style={{ display: "flex", gap: 5 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} />
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
                  </div>
                  <div className="kl-flow-mock-url kl-mono">kuadra.app/{flowStages[flowStage].module.toLowerCase()}</div>
                </div>
                <div className="kl-flow-mock-body">
                  {flowStage === 0 && (
                    <>
                      <div className="kl-fm-header kl-mono">NUEVO PEDIDO · #2847</div>
                      <div className="kl-fm-fields">
                        {[["CLIENTE","GL Santamaría",false],["MATERIAL","MDF 15mm · Blanco",false],["PLANCHAS","8.5",true],["PIEZAS","163",true],["ENTREGA","12 mayo 2026",false]].map(([l,v,a]) => (
                          <div key={String(l)} className="kl-fm-field">
                            <span className="kl-fm-label kl-mono">{String(l)}</span>
                            <span className={`kl-fm-val${a ? " kl-fm-accent" : ""}`}>{String(v)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="kl-fm-status"><span className="kl-fm-dot-green" /><span className="kl-mono">INGRESADO</span></div>
                    </>
                  )}
                  {flowStage === 1 && (
                    <>
                      <div className="kl-fm-header kl-mono">PANEL EN VIVO · 7 MAYO</div>
                      <div className="kl-fm-stats4">
                        {[["EN COLA","28","kl-fm-accent"],["EN CORTE","04","kl-fm-warn"],["LISTOS","12","kl-fm-ok"],["TOTAL HOY","18",""]].map(([l,v,c]) => (
                          <div key={String(l)} className="kl-fm-stat">
                            <div className="kl-fm-stat-label kl-mono">{String(l)}</div>
                            <div className={`kl-fm-stat-val ${String(c)}`}>{String(v)}</div>
                          </div>
                        ))}
                      </div>
                      <div className="kl-fm-machines">
                        {[["M1","GL Santamaría","activa"],["M2","Yammy Guillén","activa"],["M3","Sin pedidos","libre"]].map(([m,o,s]) => (
                          <div key={String(m)} className="kl-fm-machine-row">
                            <span className="kl-fm-m-name kl-mono">{String(m)}</span>
                            <span className="kl-fm-m-order">{String(o)}</span>
                            <span className={`kl-fm-m-dot ${String(s) === "libre" ? "kl-fm-dot-gray" : "kl-fm-dot-green"}`} />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {flowStage === 2 && (
                    <>
                      <div className="kl-fm-header kl-mono">PRODUCCIÓN · MÁQUINA 1</div>
                      <div className="kl-fm-machine-card">
                        <div className="kl-fm-mc-top">
                          <span className="kl-fm-mc-name kl-mono">GL Santamaría · Cocina 303</span>
                          <span className="kl-fm-mc-status"><span className="kl-fm-dot-green" /><span className="kl-mono">EN CORTE</span></span>
                        </div>
                        <div className="kl-fm-mc-nums">
                          <div><span className="kl-fm-big">8.5</span><span className="kl-fm-unit"> planchas</span></div>
                          <div><span className="kl-fm-big">163</span><span className="kl-fm-unit"> piezas</span></div>
                        </div>
                        <div className="kl-fm-progress-label kl-mono">65% completado</div>
                        <div className="kl-fm-progress"><div className="kl-fm-progress-fill" style={{ width: "65%" }} /></div>
                      </div>
                      <div className="kl-fm-field" style={{ marginTop: 12 }}>
                        <span className="kl-fm-label kl-mono">OPERARIO</span>
                        <span className="kl-fm-val">Juan Pérez</span>
                      </div>
                    </>
                  )}
                  {flowStage === 3 && (
                    <>
                      <div className="kl-fm-header kl-mono">RENDIMIENTO · HOY</div>
                      {[["M1",91,65],["M2",74,30],["M3",0,0]].map(([m,pct,filled]) => (
                        <div key={String(m)} className="kl-fm-rend-row">
                          <span className="kl-fm-r-name kl-mono">{String(m)}</span>
                          <div className="kl-fm-r-bar-wrap">
                            <div className="kl-fm-progress"><div className="kl-fm-progress-fill" style={{ width: `${filled}%` }} /></div>
                          </div>
                          <span className={`kl-fm-r-pct kl-mono${Number(pct) >= 80 ? " kl-fm-ok" : Number(pct) > 0 ? " kl-fm-warn" : ""}`}>{pct}%</span>
                        </div>
                      ))}
                      <div className="kl-fm-field" style={{ marginTop: 16 }}>
                        <span className="kl-fm-label kl-mono">PROMEDIO TALLER</span>
                        <span className="kl-fm-val kl-fm-ok" style={{ fontSize: 22, fontWeight: 700 }}>83%</span>
                      </div>
                      <div className="kl-fm-field">
                        <span className="kl-fm-label kl-mono">VS IDEAL</span>
                        <span className="kl-fm-val" style={{ fontSize: 13 }}>42.5 / 55 planchas</span>
                      </div>
                    </>
                  )}
                  {flowStage === 4 && (
                    <>
                      <div className="kl-fm-header kl-mono">HISTORIAL · #2847</div>
                      <div className="kl-fm-timeline">
                        {[
                          ["✓","Ingresado","08:14","Rosa M.","ok"],
                          ["✓","En cola","09:00","sistema","ok"],
                          ["✓","Al corte","10:22","Juan P.","ok"],
                          ["✓","Terminado","14:15","Juan P.","ok"],
                          ["✓","Despachado","15:30","Carlos L.","ok"],
                        ].map(([icon,label,time,who,cls]) => (
                          <div key={String(label)} className="kl-fm-tl-row">
                            <span className={`kl-fm-tl-icon kl-mono kl-fm-${String(cls)}`}>{String(icon)}</span>
                            <span className="kl-fm-tl-label">{String(label)}</span>
                            <span className="kl-fm-tl-time kl-mono">{String(time)}</span>
                            <span className="kl-fm-tl-who kl-mono">{String(who)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="kl-fm-field" style={{ marginTop: 12 }}>
                        <span className="kl-fm-label kl-mono">TIEMPO TOTAL</span>
                        <span className="kl-fm-val">7h 16m</span>
                      </div>
                    </>
                  )}
                  {flowStage === 5 && (
                    <>
                      <div className="kl-fm-header kl-mono">REPORTE · 7 MAYO 2026</div>
                      <div className="kl-fm-fields">
                        {[["PEDIDOS","18",true],["PLANCHAS TOTALES","42.5",false],["PIEZAS TOTALES","847",false],["RENDIMIENTO PROM.","87%",true]].map(([l,v,a]) => (
                          <div key={String(l)} className="kl-fm-field">
                            <span className="kl-fm-label kl-mono">{String(l)}</span>
                            <span className={`kl-fm-val${a ? " kl-fm-ok" : ""}`} style={a ? { fontSize: 20, fontWeight: 700 } : {}}>{String(v)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="kl-fm-export kl-mono">⬇ EXPORTAR PDF</div>
                    </>
                  )}
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
          <p className="kl-section-sub kl-sub-center">7 días de prueba gratis · Activación única $1,300</p>
          <div className="kl-billing-toggle">
            <button className={`kl-billing-btn${billing === "mensual" ? " kl-billing-active" : ""}`} onClick={() => setBilling("mensual")}>Mensual</button>
            <button className={`kl-billing-btn${billing === "anual" ? " kl-billing-active" : ""}`} onClick={() => setBilling("anual")}>
              Anual <span className="kl-billing-badge">-15%</span>
            </button>
          </div>
          <div className="kl-pricing-grid">

            {/* BÁSICO */}
            <div className="kl-pricing-card">
              <div className="kl-ptier kl-mono">Básico</div>
              <div className="kl-pfor">Para empezar</div>
              <div className="kl-pprice">
                <span className="kl-psign">$</span>
                <span className="kl-pnum">{prices.basico}</span>
                <span className="kl-pperiod">/mes</span>
              </div>
              <div className="kl-psub">3 máquinas · 5 usuarios · 1 GB</div>
              <div className="kl-pact kl-mono">+ $1,300 activación única</div>
              <div className="kl-pexpand">
                <div className="kl-pdivider" />
                <ul className="kl-pfeatures">
                  {["Crear, editar y cancelar pedidos", "Vista de producción en columnas", "Avances de producción", "Vista de pedidos por día", "Historial de pedidos", "Marcado como listo directo"].map(f => (
                    <li key={f} className="kl-pfeature"><span className="kl-pcheck">✓</span>{f}</li>
                  ))}
                  {["Dashboard de rendimiento", "Reporte PDF"].map(f => (
                    <li key={f} className="kl-pfeature kl-pfeature-off"><span className="kl-pno">—</span>{f}</li>
                  ))}
                </ul>
              </div>
              <Link href="/dashboard" className="kl-pbtn kl-pbtn-outline">Solicitar demo →</Link>
              <div className="kl-ptrial kl-mono">7 días de prueba gratis</div>
            </div>

            {/* PROFESIONAL */}
            <div className="kl-pricing-card kl-pfeatured">
              <div className="kl-ppopular kl-mono">POPULAR</div>
              <div className="kl-ptier kl-mono kl-ptier-inv">Profesional</div>
              <div className="kl-pfor kl-pfor-inv">Para crecer</div>
              <div className="kl-pprice kl-pprice-inv">
                <span className="kl-psign">$</span>
                <span className="kl-pnum">{prices.profesional}</span>
                <span className="kl-pperiod">/mes</span>
              </div>
              <div className="kl-psub kl-psub-inv">5 máquinas · 10 usuarios · 5 GB</div>
              <div className="kl-pact kl-mono kl-pact-inv">+ $1,300 activación única</div>
              <div className="kl-pexpand">
                <div className="kl-pdivider kl-pdivider-inv" />
                <ul className="kl-pfeatures">
                  {["Todo lo del plan Básico", "Dashboard rendimiento por máquina", "Reporte diario + PDF imprimible", "Calendario de entrega", "Historial de cada pedido", "Múltiples materiales por pedido", "Módulo Financiero"].map(f => (
                    <li key={f} className="kl-pfeature kl-pfeature-inv"><span className="kl-pcheck-inv">✓</span>{f}</li>
                  ))}
                </ul>
              </div>
              <Link href="/dashboard" className="kl-pbtn kl-pbtn-inv">Solicitar demo →</Link>
              <div className="kl-ptrial kl-mono kl-ptrial-inv">7 días de prueba gratis</div>
            </div>

            {/* EMPRESARIAL */}
            <div className="kl-pricing-card">
              <div className="kl-ptier kl-mono">Empresarial</div>
              <div className="kl-pfor">Para escalar</div>
              <div className="kl-pprice">
                <span className="kl-psign">$</span>
                <span className="kl-pnum">{prices.empresarial}</span>
                <span className="kl-pperiod">/mes</span>
              </div>
              <div className="kl-psub">8 máquinas · 20 usuarios · 20 GB</div>
              <div className="kl-pact kl-mono">+ $1,300 activación única</div>
              <div className="kl-pexpand">
                <div className="kl-pdivider" />
                <ul className="kl-pfeatures">
                  {["Todo lo del plan Profesional", "Exportar CSV / Excel", "Roles personalizados", "Multisucursal", "CRM de clientes", "Módulo Inventario", "Personalización de la herramienta"].map(f => (
                    <li key={f} className="kl-pfeature"><span className="kl-pcheck">✓</span>{f}</li>
                  ))}
                </ul>
              </div>
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
}
.kl-hero-content {
  flex: 1;
  display: flex; flex-direction: column; justify-content: center;
  padding: 80px 48px 52px;
}
.kl-hero-title {
  font-family: 'Instrument Serif', serif;
  font-size: clamp(56px, 10vw, 148px);
  line-height: 0.94;
  letter-spacing: -0.02em;
  color: var(--ink);
  margin-bottom: 28px;
}
.kl-hero-title em { font-style: italic; color: var(--accent); }
.kl-hero-bottom {
  display: flex; justify-content: space-between; align-items: flex-end;
  gap: 48px;
}
.kl-hero-sub {
  max-width: 460px;
  font-size: 16px; color: var(--ink2);
  line-height: 1.7;
}
.kl-hero-sub strong { color: var(--ink); font-weight: 600; }

/* METRICS STRIP */
.kl-metrics-strip {
  display: flex; align-items: stretch;
  border-top: 1px solid var(--border);
}
.kl-metric {
  flex: 1; padding: 20px 48px 28px;
  border-right: 1px solid var(--border);
}
.kl-metric:last-child { border-right: none; }
.kl-metric-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--ink3); margin-bottom: 6px;
}
.kl-metric-val {
  font-size: 24px; font-weight: 600; color: var(--ink);
  line-height: 1;
}
.kl-metric-val.kl-mono { font-size: 18px; letter-spacing: -0.02em; }
.kl-metric-sub { font-size: 10px; color: var(--ink3); margin-top: 4px; }
.kl-maccent { color: var(--accent) !important; }
.kl-mok { color: #16a34a !important; }
.kl-metric-divider { display: none; }

/* BUTTONS */
.kl-hero-ctas { display: flex; gap: 12px; flex-shrink: 0; }
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

/* FLOW SECTION */
.kl-flow-section {
  background: var(--white);
  border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
  padding: 96px 48px;
}

/* Flow Nav — horizontal stepper */
.kl-flow-nav {
  display: flex; align-items: flex-start;
  margin: 48px 0 40px; position: relative;
}
.kl-flow-step {
  display: flex; flex-direction: column; align-items: center;
  background: none; border: none; cursor: pointer;
  position: relative; flex: 1; padding: 0;
}
.kl-fs-node {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 600;
  border: 1.5px solid var(--border2);
  background: var(--white); color: var(--ink3);
  transition: all .2s; z-index: 1; position: relative;
}
.kl-flow-step.kl-fs-active .kl-fs-node {
  background: var(--accent); border-color: var(--accent); color: #fff;
}
.kl-flow-step.kl-fs-done .kl-fs-node {
  background: var(--ink); border-color: var(--ink); color: #fff;
}
.kl-fs-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; font-weight: 500; letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--ink3);
  margin-top: 8px; text-align: center;
}
.kl-flow-step.kl-fs-active .kl-fs-label { color: var(--accent); }
.kl-flow-step.kl-fs-done .kl-fs-label { color: var(--ink); }
.kl-fs-line {
  position: absolute; top: 18px; left: 50%;
  width: 100%; height: 1px;
  background: var(--border2); z-index: 0;
}
.kl-flow-step.kl-fs-done .kl-fs-line { background: var(--ink); }

/* Flow Panel */
.kl-flow-panel {
  display: grid; grid-template-columns: 1fr 1.1fr;
  gap: 56px; align-items: start;
}
.kl-flow-left { padding-top: 8px; }
.kl-flow-stepnum {
  font-size: 10px; color: var(--ink3); letter-spacing: 0.06em; margin-bottom: 12px;
}
.kl-flow-title {
  font-family: 'Instrument Serif', serif;
  font-size: clamp(22px, 2.8vw, 34px);
  line-height: 1.1; letter-spacing: -0.01em;
  color: var(--ink); margin-bottom: 14px;
}
.kl-flow-module-pill {
  display: inline-block;
  font-size: 9px; font-weight: 600; letter-spacing: 0.1em;
  color: var(--accent);
  background: rgba(200,71,42,0.08); border: 1px solid rgba(200,71,42,0.2);
  border-radius: 99px; padding: 4px 12px; margin-bottom: 18px;
}
.kl-flow-desc {
  font-size: 14px; color: var(--ink2); line-height: 1.7; margin-bottom: 20px;
}
.kl-flow-ba {
  background: var(--bg); border-radius: 12px; padding: 16px; margin-bottom: 24px;
}
.kl-flow-nav-btns { display: flex; gap: 8px; }
.kl-flow-prev, .kl-flow-next {
  padding: 10px 20px; border-radius: 99px;
  font-size: 13px; font-weight: 500; font-family: 'Inter', sans-serif;
  cursor: pointer; transition: all .15s;
}
.kl-flow-prev {
  border: 1px solid var(--border2); background: transparent; color: var(--ink);
}
.kl-flow-prev:hover { border-color: var(--ink); }
.kl-flow-next {
  border: 1px solid var(--ink); background: var(--ink); color: var(--bg);
}
.kl-flow-next:hover { background: var(--accent); border-color: var(--accent); }

/* Flow Mockup */
.kl-flow-mock {
  background: var(--ink); border-radius: 18px;
  overflow: hidden; box-shadow: 0 20px 60px rgba(26,23,20,0.18);
  min-height: 360px;
}
.kl-flow-mock-bar {
  background: rgba(255,255,255,0.04); padding: 10px 16px;
  display: flex; align-items: center; gap: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}
.kl-flow-mock-url {
  font-size: 10px; color: rgba(255,255,255,0.25); flex: 1; text-align: center;
}
.kl-flow-mock-body { padding: 20px; }

/* Mockup shared */
.kl-fm-header {
  font-size: 9px; color: rgba(255,255,255,0.3);
  text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px;
}
.kl-fm-fields { display: flex; flex-direction: column; gap: 0; }
.kl-fm-field {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
}
.kl-fm-label { font-size: 9px; color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 0.06em; }
.kl-fm-val { font-size: 13px; color: rgba(255,255,255,0.8); font-weight: 500; }
.kl-fm-accent { color: #fbbf24 !important; }
.kl-fm-ok { color: #34d399 !important; }
.kl-fm-warn { color: #f87171 !important; }
.kl-fm-status {
  display: flex; align-items: center; gap: 8px;
  margin-top: 16px; font-size: 10px; color: #34d399; letter-spacing: 0.06em;
}
.kl-fm-dot-green {
  width: 6px; height: 6px; border-radius: 50%; background: #34d399;
  display: inline-block; flex-shrink: 0;
}
.kl-fm-dot-gray {
  width: 6px; height: 6px; border-radius: 50%;
  background: rgba(255,255,255,0.2); display: inline-block; flex-shrink: 0;
}

/* Stage 1 — dashboard stats */
.kl-fm-stats4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 6px; margin-bottom: 14px; }
.kl-fm-stat { background: rgba(255,255,255,0.05); border-radius: 10px; padding: 10px; }
.kl-fm-stat-label { font-size: 7px; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
.kl-fm-stat-val { font-size: 22px; font-weight: 700; color: rgba(255,255,255,0.85); }
.kl-fm-machines { display: flex; flex-direction: column; gap: 4px; }
.kl-fm-machine-row {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px; border-radius: 8px; background: rgba(255,255,255,0.04);
}
.kl-fm-m-name { font-size: 10px; color: rgba(255,255,255,0.5); flex-shrink: 0; width: 24px; }
.kl-fm-m-order { font-size: 12px; color: rgba(255,255,255,0.7); flex: 1; }
.kl-fm-m-dot { flex-shrink: 0; }

/* Stage 2 — machine card */
.kl-fm-machine-card {
  background: rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; margin-bottom: 4px;
}
.kl-fm-mc-top {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;
}
.kl-fm-mc-name { font-size: 10px; color: rgba(255,255,255,0.5); }
.kl-fm-mc-status {
  display: flex; align-items: center; gap: 5px;
  font-size: 9px; color: #34d399; letter-spacing: 0.06em;
}
.kl-fm-mc-nums { display: flex; gap: 24px; margin-bottom: 14px; }
.kl-fm-big { font-size: 28px; font-weight: 700; color: rgba(255,255,255,0.85); }
.kl-fm-unit { font-size: 10px; color: rgba(255,255,255,0.3); }
.kl-fm-progress {
  height: 4px; background: rgba(255,255,255,0.08); border-radius: 99px; overflow: hidden;
}
.kl-fm-progress-fill {
  height: 100%; background: var(--accent); border-radius: 99px; transition: width .4s ease;
}
.kl-fm-progress-label { font-size: 9px; color: rgba(255,255,255,0.35); margin-bottom: 6px; }

/* Stage 3 — rendimiento */
.kl-fm-rend-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.kl-fm-r-name { font-size: 10px; color: rgba(255,255,255,0.4); width: 24px; flex-shrink: 0; }
.kl-fm-r-bar-wrap { flex: 1; }
.kl-fm-r-pct { font-size: 12px; font-weight: 600; width: 36px; text-align: right; flex-shrink: 0; color: rgba(255,255,255,0.5); }

/* Stage 4 — timeline */
.kl-fm-timeline { display: flex; flex-direction: column; gap: 0; }
.kl-fm-tl-row {
  display: flex; align-items: center; gap: 10px;
  padding: 7px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
}
.kl-fm-tl-icon { font-size: 10px; flex-shrink: 0; width: 14px; }
.kl-fm-tl-label { font-size: 12px; color: rgba(255,255,255,0.7); flex: 1; }
.kl-fm-tl-time { font-size: 10px; color: rgba(255,255,255,0.3); }
.kl-fm-tl-who { font-size: 10px; color: rgba(255,255,255,0.2); width: 60px; text-align: right; }

/* Stage 5 — export */
.kl-fm-export {
  display: inline-flex; align-items: center; gap: 6px;
  margin-top: 16px; padding: 8px 14px; border-radius: 8px;
  border: 1px solid rgba(200,71,42,0.4);
  font-size: 10px; color: var(--accent); letter-spacing: 0.08em; cursor: pointer;
}

/* BENEFITS */
.kl-benefits-section { padding: 96px 48px; background: var(--bg); }
.kl-benefits-grid {
  display: grid; grid-template-columns: repeat(3,1fr);
  gap: 14px; margin-top: 52px; align-items: start;
}
.kl-benefit-card {
  background: var(--white); border: 1px solid var(--border);
  border-radius: 18px; padding: 28px;
  transition: box-shadow .2s, transform .2s, border-color .2s;
  cursor: pointer;
}
.kl-benefit-card:hover {
  box-shadow: 0 8px 32px rgba(26,23,20,0.10);
  border-color: var(--border2); transform: translateY(-2px);
}
.kl-benefit-num { font-size: 11px; color: var(--ink3); margin-bottom: 16px; }
.kl-benefit-title {
  font-size: 17px; font-weight: 600; color: var(--ink);
  font-family: 'Instrument Serif', serif; letter-spacing: -0.01em;
  margin-bottom: 0;
}
.kl-benefit-title::after {
  content: ' ↓'; font-size: 12px; color: var(--ink3);
  font-family: 'Inter', sans-serif; font-weight: 400;
  transition: opacity .2s;
}
.kl-benefit-card:hover .kl-benefit-title::after { opacity: 0; }

/* collapsed by default */
.kl-benefit-desc {
  font-size: 13px; color: var(--ink2); line-height: 1.65;
  max-height: 0; overflow: hidden; opacity: 0;
  transition: max-height .35s ease, opacity .3s ease, margin .35s ease;
  margin-top: 0;
}
.kl-benefit-sep {
  background: var(--border);
  max-height: 0; overflow: hidden; opacity: 0; margin: 0;
  transition: max-height .35s ease, opacity .3s ease, margin .35s ease;
}
.kl-benefit-row {
  display: flex; gap: 10px; align-items: baseline;
  max-height: 0; overflow: hidden; opacity: 0; margin-bottom: 0;
  transition: max-height .35s ease, opacity .3s ease, margin .35s ease;
}

/* reveal on hover */
.kl-benefit-card:hover .kl-benefit-desc {
  max-height: 120px; opacity: 1; margin-top: 10px;
}
.kl-benefit-card:hover .kl-benefit-sep {
  height: 1px; max-height: 1px; opacity: 1; margin: 18px 0 14px;
}
.kl-benefit-card:hover .kl-benefit-row {
  max-height: 28px; opacity: 1; margin-bottom: 6px;
}

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
  align-items: start;
}
.kl-pricing-card {
  background: var(--bg); border: 1px solid var(--border);
  border-radius: 18px; padding: 28px; position: relative;
  transition: box-shadow .2s, border-color .2s;
  cursor: pointer;
}
.kl-pricing-card:not(.kl-pfeatured):hover { box-shadow: 0 8px 32px rgba(26,23,20,0.10); border-color: var(--border2); }
.kl-pfeatured { background: var(--ink); border: 2px solid var(--ink); }

/* Tier + for */
.kl-ptier { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink3); margin-bottom: 16px; }
.kl-ptier-inv { color: var(--accent); }
.kl-pfor { font-family: 'Instrument Serif', serif; font-size: 18px; font-style: italic; color: var(--accent); margin-bottom: 8px; }
.kl-pfor-inv { color: var(--accent); }
.kl-ppopular {
  position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
  background: var(--accent); color: var(--white);
  font-size: 9px; font-weight: 600; letter-spacing: 0.1em;
  padding: 4px 14px; border-radius: 99px; white-space: nowrap;
}

/* Price — sin superíndice problemático */
.kl-pprice { display: flex; align-items: flex-end; gap: 2px; margin-bottom: 6px; line-height: 1; }
.kl-psign { font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 500; color: var(--ink3); padding-bottom: 10px; }
.kl-pnum { font-family: 'Instrument Serif', serif; font-size: 54px; line-height: 1; letter-spacing: -0.02em; color: var(--ink); }
.kl-pperiod { font-family: 'Inter', sans-serif; font-size: 13px; color: var(--ink3); padding-bottom: 8px; }
.kl-pprice-inv .kl-psign { color: rgba(255,255,255,0.4); }
.kl-pprice-inv .kl-pnum { color: var(--accent); }
.kl-pprice-inv .kl-pperiod { color: rgba(255,255,255,0.35); }

.kl-psub { font-size: 12px; color: var(--ink3); margin-bottom: 4px; }
.kl-psub-inv { color: rgba(255,255,255,0.35); }
.kl-pact { font-size: 10px; color: var(--ink3); letter-spacing: 0.04em; margin-bottom: 0; }
.kl-pact-inv { color: rgba(255,255,255,0.25); }

/* Expandable features wrapper */
.kl-pexpand {
  max-height: 0; overflow: hidden; opacity: 0; margin-bottom: 0;
  transition: max-height .4s ease, opacity .3s ease, margin .4s ease;
}
.kl-pricing-card:not(.kl-pfeatured):hover .kl-pexpand {
  max-height: 500px; opacity: 1; margin-bottom: 16px;
}
.kl-pfeatured .kl-pexpand {
  max-height: 500px; opacity: 1; margin-bottom: 16px;
}

.kl-pdivider { height: 1px; background: var(--border); margin: 20px 0; }
.kl-pdivider-inv { background: rgba(255,255,255,0.08); }
.kl-pfeatures { list-style: none; display: flex; flex-direction: column; gap: 9px; }
.kl-pfeature { font-size: 13px; color: var(--ink); display: flex; align-items: flex-start; gap: 8px; }
.kl-pfeature-off { color: var(--ink3); }
.kl-pfeature-inv { color: rgba(255,255,255,0.75); }
.kl-pcheck { color: var(--accent); font-size: 12px; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
.kl-pcheck-inv { color: var(--accent); font-size: 12px; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
.kl-pno { color: var(--ink3); flex-shrink: 0; font-size: 13px; }

.kl-pbtn {
  width: 100%; padding: 12px; border-radius: 99px;
  font-size: 14px; font-weight: 500; margin-top: 20px;
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
