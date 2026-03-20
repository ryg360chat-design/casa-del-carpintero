"use client";

import { useTransition } from "react";
import { cancelarPedido } from "@/app/actions";

export default function CancelarPedidoBtn({ pedidoId }: { pedidoId: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("¿Cancelar este pedido? Esta acción no se puede deshacer.")) return;
    startTransition(async () => { await cancelarPedido(pedidoId); });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-500 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all press-effect disabled:opacity-50"
    >
      {pending ? (
        <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      )}
      {pending ? "Cancelando..." : "Cancelar pedido"}
    </button>
  );
}
