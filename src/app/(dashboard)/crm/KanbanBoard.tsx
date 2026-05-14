"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useState, useTransition } from "react";
import Link from "next/link";
import { moverEtapaCrm } from "./actions";

const ETAPAS = [
  { key: "prospecto",  label: "Prospecto",  color: "text-zinc-600",   bg: "bg-zinc-50",    border: "border-zinc-200",   dot: "bg-zinc-400" },
  { key: "contactado", label: "Contactado", color: "text-sky-600",    bg: "bg-sky-50",     border: "border-sky-200",    dot: "bg-sky-500" },
  { key: "activo",     label: "Activo",     color: "text-green-600",  bg: "bg-green-50",   border: "border-green-200",  dot: "bg-green-500" },
  { key: "frecuente",  label: "Frecuente",  color: "text-violet-600", bg: "bg-violet-50",  border: "border-violet-200", dot: "bg-violet-500" },
  { key: "inactivo",   label: "Inactivo",   color: "text-red-400",    bg: "bg-red-50",     border: "border-red-200",    dot: "bg-red-400" },
];

export type KanbanCard = {
  id: string;
  nombre: string;
  telefono?: string | null;
  etapa_crm?: string | null;
  totalPedidos: number;
  totalFacturado: number;
  pedidosActivos: number;
  ultimoPedido?: string | null;
};

// ── Card draggable ───────────────────────────────────────────────────────────
function DraggableCard({ card, isDragOverlay = false }: { card: KanbanCard; isDragOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: card.id });

  const style = isDragOverlay
    ? { rotate: "2deg" }
    : { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.3 : 1 };

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      style={style}
      className={`border border-zinc-200 rounded-xl bg-white shadow-sm overflow-hidden select-none ${
        isDragOverlay ? "shadow-xl border-blue-300 rotate-1" : "hover:shadow-md hover:border-zinc-300 transition-shadow"
      }`}
    >
      {/* Grab handle + info */}
      <div
        {...(!isDragOverlay ? { ...listeners, ...attributes } : {})}
        className="px-4 pt-3 pb-1 cursor-grab active:cursor-grabbing"
      >
        {/* Handle bar visual */}
        <div className="flex justify-center mb-2">
          <div className="w-8 h-1 rounded-full bg-zinc-200" />
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {card.nombre[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-zinc-900 text-sm truncate">{card.nombre}</div>
            {card.telefono && <div className="text-xs text-zinc-400 truncate">{card.telefono}</div>}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-100 pb-2">
          <span className="text-zinc-400">{card.totalPedidos} pedido{card.totalPedidos !== 1 ? "s" : ""}</span>
          <span className="font-semibold text-zinc-700">{card.totalFacturado > 0 ? `S/ ${card.totalFacturado.toFixed(0)}` : "—"}</span>
          {card.pedidosActivos > 0
            ? <span className="text-blue-500 font-medium">{card.pedidosActivos} activo{card.pedidosActivos !== 1 ? "s" : ""}</span>
            : <span className="text-zinc-300">sin activos</span>
          }
        </div>
      </div>

      {/* Ver detalle — separate from drag handle */}
      {!isDragOverlay && (
        <Link
          href={`/crm/${card.id}`}
          className="block text-center text-[10px] text-zinc-400 hover:text-blue-600 hover:bg-blue-50 py-1.5 border-t border-zinc-100 transition-colors"
        >
          Ver detalle →
        </Link>
      )}
    </div>
  );
}

// ── Columna droppable ────────────────────────────────────────────────────────
function DroppableColumn({
  etapa,
  cards,
  isOver,
}: {
  etapa: typeof ETAPAS[number];
  cards: KanbanCard[];
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({ id: etapa.key });

  return (
    <div className="flex-1 min-w-[220px] flex flex-col gap-3 self-stretch">
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border ${etapa.border} ${etapa.bg}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${etapa.dot}`} />
          <span className={`text-sm font-semibold ${etapa.color}`}>{etapa.label}</span>
        </div>
        <span className={`text-sm font-bold ${etapa.color} bg-white/60 px-2 py-0.5 rounded-full`}>{cards.length}</span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2.5 flex-1 min-h-[160px] rounded-xl p-1 transition-colors ${
          isOver ? "bg-blue-50/60 ring-2 ring-blue-300 ring-dashed" : ""
        }`}
      >
        {cards.length === 0 && !isOver && (
          <div className="border-2 border-dashed border-zinc-200 rounded-xl flex-1 flex items-center justify-center text-zinc-400 text-xs">
            Arrastra clientes aquí
          </div>
        )}
        {cards.map((card) => (
          <DraggableCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}

// ── Board principal ──────────────────────────────────────────────────────────
export default function KanbanBoard({ initialCards }: { initialCards: KanbanCard[] }) {
  const [etapas, setEtapas] = useState<Record<string, string>>(
    Object.fromEntries(initialCards.map((c) => [c.id, c.etapa_crm ?? "activo"]))
  );
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  function handleDragStart(event: DragStartEvent) {
    const card = initialCards.find((c) => c.id === event.active.id);
    setActiveCard(card ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    setOverId(event.over ? String(event.over.id) : null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    setOverId(null);
    const { active, over } = event;
    if (!over) return;
    const newEtapa = String(over.id);
    const cardId = String(active.id);
    if (etapas[cardId] === newEtapa) return;

    // Optimistic update
    setEtapas((prev) => ({ ...prev, [cardId]: newEtapa }));

    // Persist
    startTransition(() => {
      moverEtapaCrm(cardId, newEtapa).catch(() => {
        // Revert on error
        setEtapas((prev) => ({ ...prev, [cardId]: etapas[cardId] }));
      });
    });
  }

  // Build cards per column from local etapa state
  const cardsByEtapa: Record<string, KanbanCard[]> = Object.fromEntries(
    ETAPAS.map((e) => [e.key, []])
  );
  for (const card of initialCards) {
    const etapa = etapas[card.id] ?? "activo";
    if (cardsByEtapa[etapa]) cardsByEtapa[etapa].push(card);
    else cardsByEtapa["activo"].push(card);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        className="flex gap-4 overflow-x-auto pb-4"
        style={{ marginLeft: "-24px", marginRight: "-24px", paddingLeft: "24px", paddingRight: "24px" }}
      >
        {ETAPAS.map((etapa) => (
          <DroppableColumn
            key={etapa.key}
            etapa={etapa}
            cards={cardsByEtapa[etapa.key] ?? []}
            isOver={overId === etapa.key}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeCard && <DraggableCard card={activeCard} isDragOverlay />}
      </DragOverlay>
    </DndContext>
  );
}
