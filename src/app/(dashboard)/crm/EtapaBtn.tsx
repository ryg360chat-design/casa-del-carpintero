"use client";

import { useTransition } from "react";
import { moverEtapaCrm } from "./actions";

interface Props {
  clienteId: string;
  etapaDestino: string;
  label: string;
  variant: "prev" | "next";
}

export default function EtapaBtn({ clienteId, etapaDestino, label, variant }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        startTransition(() => { moverEtapaCrm(clienteId, etapaDestino).catch(() => {}); });
      }}
      disabled={pending}
      className={`flex-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all disabled:opacity-40 ${
        variant === "next"
          ? "border-blue-300 text-blue-600 bg-white hover:bg-blue-50 active:bg-blue-100"
          : "border-zinc-300 text-zinc-600 bg-white hover:bg-zinc-100 active:bg-zinc-200"
      }`}
    >
      {pending ? "···" : label}
    </button>
  );
}
