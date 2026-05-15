import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { headers } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kuadra — Software de gestión para talleres de corte",
  description:
    "Registra pedidos, controla producción en tiempo real y mide el rendimiento de tus máquinas. Digitaliza tu taller de corte de tableros en 24 horas. Prueba 14 días gratis, sin tarjeta.",
  keywords: [
    "software gestión taller carpintería",
    "software corte tableros Ecuador",
    "gestión producción carpintería",
    "control pedidos taller madera",
    "sistema producción melamina",
  ],
  openGraph: {
    title: "Kuadra — El sistema que tu taller de corte necesitaba",
    description:
      "Registra pedidos, controla producción en tiempo real y mide el rendimiento de tus máquinas. Digitaliza tu taller de corte en 24 horas.",
    url: "https://kuadra.app",
    siteName: "Kuadra",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Kuadra — Software de gestión para talleres de corte",
      },
    ],
    locale: "es_EC",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kuadra — Software de gestión para talleres de corte",
    description:
      "Pedidos digitales, producción en tiempo real y métricas automáticas para talleres de corte de tableros.",
    images: ["/opengraph-image.png"],
  },
  alternates: { canonical: "https://kuadra.app" },
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Kuadra",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Sistema de gestión para talleres de corte de tableros. Controla pedidos, producción por máquina, rendimiento, inventario y finanzas en una sola plataforma diseñada para carpintería en Ecuador y Latinoamérica.",
  url: "https://kuadra.app",
  inLanguage: "es-EC",
  offers: [
    {
      "@type": "Offer",
      name: "Básico",
      price: "299",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        priceType: "https://schema.org/RecurringCharge",
        billingDuration: "P1M",
      },
    },
    {
      "@type": "Offer",
      name: "Profesional",
      price: "499",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        priceType: "https://schema.org/RecurringCharge",
        billingDuration: "P1M",
      },
    },
    {
      "@type": "Offer",
      name: "Empresarial",
      price: "899",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        priceType: "https://schema.org/RecurringCharge",
        billingDuration: "P1M",
      },
    },
  ],
  provider: {
    "@type": "Organization",
    name: "RyG SaaS",
    url: "https://kuadra.app",
    address: { "@type": "PostalAddress", addressCountry: "EC" },
  },
  featureList: [
    "Pedidos digitales en 30 segundos",
    "Dashboard de producción en tiempo real",
    "Control de estado por máquina",
    "Rendimiento real vs ideal automático",
    "Módulo Financiero con márgenes y costos",
    "CRM de Clientes con historial completo",
    "Inventario de materiales y stock",
    "Reportes PDF automáticos diarios",
    "Calendario de entregas por fecha",
    "Exportar CSV / Excel",
    "Roles y permisos por persona",
    "Trazabilidad total de cada pedido",
  ],
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read nonce to make layout dynamic (required for per-request CSP nonces)
  await headers();
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}</Script>
          </>
        )}
        {children}
      </body>
    </html>
  );
}
