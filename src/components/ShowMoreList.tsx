"use client";
import React, { useState } from "react";

const PAGE_SIZE = 5;

export default function ShowMoreList({
  children,
  gap = "gap-4",
}: {
  children: React.ReactNode;
  gap?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const items = React.Children.toArray(children);
  const extras = items.length - PAGE_SIZE;
  const visible = expanded ? items : items.slice(0, PAGE_SIZE);

  return (
    <>
      <div className={`flex flex-col ${gap}`}>{visible}</div>

      {extras > 0 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-zinc-500 border border-dashed border-zinc-300 rounded-xl hover:border-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-all"
        >
          {expanded ? (
            <>
              Ver menos
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 15l-6-6-6 6"/>
              </svg>
            </>
          ) : (
            <>
              Ver {extras} más
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </>
          )}
        </button>
      )}
    </>
  );
}
