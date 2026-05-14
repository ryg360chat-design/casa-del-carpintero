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
      className={`flex-1 text-[10px] font-medium px-2 py-1 rounded-lg border transition-all disabled:opacity-40 ${
        variant === "next"
          ? "border-blue-200 text-blue-600 hover:bg-blue-50 active:bg-blue-100"
          : "border-zinc-200 text-zinc-500 hover:bg-zinc-50 active:bg-zinc-100"
      }`}
    >
      {pending ? "···" : label}
    </button>
  );
}
