import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Casa del Carpintero — Gestión de Cortes",
  description: "Sistema de gestión de pedidos de corte",
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
