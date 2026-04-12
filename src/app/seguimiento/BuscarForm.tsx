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
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm select-none">#</span>
        <input
          ref={inputRef}
          type="text"
          defaultValue={defaultValue}
          placeholder="Ej: 4AF2C1"
          maxLength={6}
          className="w-full pl-8 pr-4 py-3 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white uppercase tracking-widest font-mono"
          autoFocus
        />
      </div>
      <button
        type="submit"
        className="text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95 shrink-0"
        style={{ background: "linear-gradient(135deg, #1957A6 0%, #267A8C 100%)" }}
      >
        Buscar
      </button>
    </form>
  );
}
