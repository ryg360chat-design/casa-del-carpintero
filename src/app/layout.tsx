import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kuadra — Gestión de Producción",
  description: "Sistema de gestión de producción para carpintería",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
