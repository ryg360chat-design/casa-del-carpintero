"use client";

const PASOS = ["En cola", "En corte", "En tapacantos", "Listo"];

const PASO_LABEL: Record<string, string> = {
  "En cola": "En espera",
  "En corte": "En corte",
  "En tapacantos": "Tapacantos",
  "Listo": "Listo ✓",
};

export default function BarraProgreso({ estado }: { estado: string }) {
  const pasoActual = PASOS.indexOf(estado);
  const esListo = estado === "Listo";

  return (
    <div className="px-5 py-5 border-b border-zinc-100">
      {/* Barra de fondo */}
      <div className="relative mb-6">
        {/* Track */}
        <div className="absolute top-3.5 left-0 right-0 h-1 bg-zinc-100 rounded-full" />

        {/* Fill animado */}
        <div
          className={`absolute top-3.5 left-0 h-1 rounded-full transition-all duration-700 ease-out ${esListo ? "bg-zinc-900" : "animate-shimmer"}`}
          style={{
            width: esListo
              ? "100%"
              : pasoActual === 0
              ? "8%"
              : pasoActual === 1
              ? "40%"
              : pasoActual === 2
              ? "72%"
              : "100%",
          }}
        />

        {/* Pasos */}
        <div className="relative flex justify-between">
          {PASOS.map((paso, idx) => {
            const done = esListo ? true : idx < pasoActual;
            const current = !esListo && idx === pasoActual;

            return (
              <div key={paso} className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                    done
                      ? "bg-zinc-900 border-zinc-900"
                      : current
                      ? "bg-white border-zinc-900 animate-pulse-ring"
                      : "bg-white border-zinc-200"
                  }`}
                >
                  {done ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : current ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 block" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-zinc-200 block" />
                  )}
                </div>
                <span
                  className={`text-xs mt-2 font-semibold text-center leading-tight max-w-[64px] ${
                    done || current ? "text-zinc-900" : "text-zinc-300"
                  }`}
                >
                  {PASO_LABEL[paso]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mensaje de estado actual */}
      {!esListo && pasoActual >= 0 && (
        <div className="flex items-center gap-2 bg-zinc-50 rounded-lg px-3 py-2">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 animate-pulse shrink-0" />
          <p className="text-xs text-zinc-600 font-medium">
            {pasoActual === 0 && "Tu pedido está en la fila, pronto lo procesamos."}
            {pasoActual === 1 && "Estamos cortando tus piezas ahora mismo."}
            {pasoActual === 2 && "Aplicando los tapacantos, casi listo."}
          </p>
        </div>
      )}
      {esListo && (
        <div className="flex items-center gap-2 bg-zinc-900 rounded-lg px-3 py-2">
          <span className="text-sm">🎉</span>
          <p className="text-xs text-white font-semibold">¡Tu pedido está listo para retirar!</p>
        </div>
      )}
    </div>
  );
}
