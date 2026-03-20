"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";

export default function BuscarForm({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = inputRef.current?.value.trim();
    if (q) {
      router.push(`/seguimiento?q=${encodeURIComponent(q)}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          ref={inputRef}
          type="text"
          defaultValue={defaultValue}
          placeholder="Tu nombre o número de teléfono..."
          className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          autoFocus
        />
      </div>
      <button
        type="submit"
        className="text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95 shrink-0"
        style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}
      >
        Buscar
      </button>
    </form>
  );
}
