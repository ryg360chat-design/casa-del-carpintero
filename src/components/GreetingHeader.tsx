"use client";
import { useState, useEffect } from "react";

const ROLE_LABEL: Record<string, string> = {
  admin:      "Administrador",
  ventas:     "Equipo de Ventas",
  produccion: "Jefe de Producción",
  almacenes:  "Jefe de Almacenes",
  viewer:     "Invitado",
};

export default function GreetingHeader({ userRole = "admin" }: { userRole?: string }) {
  const [data, setData] = useState({ greeting: "", fecha: "" });

  useEffect(() => {
    const now = new Date();
    const hora = now.getHours();
    const greeting =
      hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";
    const fecha = now.toLocaleDateString("es", {
      weekday: "long", day: "numeric", month: "long",
    });
    setData({ greeting, fecha });
  }, []);

  if (!data.greeting) return <div className="mb-6 h-12" />;

  const nombre = ROLE_LABEL[userRole] ?? "Jefe de Taller";

  return (
    <div className="mb-6 animate-fade-in-down">
      <p className="text-xs text-zinc-400 uppercase tracking-widest font-semibold capitalize">
        {data.fecha}
      </p>
      <h1 className="text-xl font-bold text-zinc-900 mt-0.5">
        {data.greeting}, {nombre}
      </h1>
    </div>
  );
}
