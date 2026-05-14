import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col items-center justify-center px-6 text-center">
      {/* Ilustración animada */}
      <div className="mb-8 animate-fade-in-up" style={{ animationDelay: "0ms" }}>
        <svg
          width="160"
          height="140"
          viewBox="0 0 160 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto"
        >
          {/* Tablero roto */}
          <rect x="20" y="60" width="50" height="18" rx="4" fill="#d4a96a" stroke="#b8864e" strokeWidth="1.5" transform="rotate(-12 20 60)" />
          <rect x="90" y="68" width="50" height="18" rx="4" fill="#d4a96a" stroke="#b8864e" strokeWidth="1.5" transform="rotate(8 90 68)" />
          {/* Serrucho */}
          <g transform="translate(55, 30) rotate(20)">
            <rect x="0" y="8" width="60" height="10" rx="3" fill="#a1a1aa" />
            <rect x="55" y="4" width="12" height="18" rx="2" fill="#71717a" />
            {/* Dientes */}
            <polygon points="0,18 5,24 10,18" fill="#a1a1aa" />
            <polygon points="10,18 15,24 20,18" fill="#a1a1aa" />
            <polygon points="20,18 25,24 30,18" fill="#a1a1aa" />
            <polygon points="30,18 35,24 40,18" fill="#a1a1aa" />
            <polygon points="40,18 45,24 50,18" fill="#a1a1aa" />
          </g>
          {/* Virutas */}
          <path d="M30 95 Q38 88 46 95 Q54 102 62 95" stroke="#d4a96a" strokeWidth="2" fill="none" strokeLinecap="round" className="animate-fade-in" style={{ animationDelay: "400ms" }} />
          <path d="M85 100 Q93 93 101 100 Q109 107 117 100" stroke="#d4a96a" strokeWidth="2" fill="none" strokeLinecap="round" className="animate-fade-in" style={{ animationDelay: "600ms" }} />
        </svg>
      </div>

      {/* 404 grande */}
      <div className="mb-2 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <span className="text-[80px] font-extrabold leading-none text-zinc-200 select-none tracking-tighter">
          404
        </span>
      </div>

      {/* Texto */}
      <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <h1 className="text-xl font-bold text-zinc-800 mb-2">
          Este tablero ya fue cortado
        </h1>
        <p className="text-sm text-zinc-500 max-w-xs mx-auto leading-relaxed">
          La página que buscas no existe o fue movida a otro lugar. No te preocupes, pasa hasta en el mejor taller.
        </p>
      </div>

      {/* Acciones */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "#1957A6" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/>
            <rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>
          </svg>
          Ir al dashboard
        </Link>
        <Link
          href="/pedidos"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 transition-all"
        >
          Ver pedidos
        </Link>
      </div>

      {/* Footer tiny */}
      <p className="mt-12 text-[11px] text-zinc-400 animate-fade-in" style={{ animationDelay: "500ms" }}>
        Kuadra · Sistema de gestión de producción
      </p>
    </div>
  );
}
