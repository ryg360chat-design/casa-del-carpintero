"use client";

import { useState, useRef, useEffect } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const WELCOME = `¡Hola! Soy el asistente de **Kuadra**. Puedo contarte cómo funciona el sistema, los planes y precios, o ayudarte a agendar una demo gratuita.

¿En qué te puedo ayudar hoy?`;

function renderBold(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((p, i) =>
    i % 2 === 1 ? <strong key={i}>{p}</strong> : p
  );
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const [rateLimited, setRateLimited] = useState(false);

  function resetConversation() {
    setMessages([{ role: "assistant", content: WELCOME }]);
    setRateLimited(false);
    setInput("");
  }

  async function send() {
    const text = input.trim();
    if (!text || loading || rateLimited) return;
    const updated: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(updated);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });
      if (res.status === 429) {
        setRateLimited(true);
        setMessages((m) => [...m, {
          role: "assistant",
          content: "Alcanzaste el límite de mensajes por ahora. Podés iniciar una nueva conversación o contactarnos directo por WhatsApp.",
        }]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.error) {
        setMessages((m) => [...m, { role: "assistant", content: "Hubo un problema técnico. Intentá de nuevo en un momento." }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: data.reply ?? "Hubo un error. Intentá de nuevo." }]);
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Sin conexión. Revisá tu internet e intentá de nuevo." }]);
    }
    setLoading(false);
  }

  return (
    <>
      {/* Botón flotante — desaparece cuando el chat está abierto */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: "fixed", bottom: 24, right: 24, zIndex: 9999,
            display: "flex", alignItems: "center", gap: 8,
            padding: "12px 20px", borderRadius: 999,
            background: "#c8472a", color: "#fff",
            fontSize: 13, fontWeight: 600,
            border: "none", cursor: "pointer",
            boxShadow: "0 4px 24px rgba(200,71,42,0.35)",
            fontFamily: "Inter, sans-serif",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.04)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 30px rgba(200,71,42,0.45)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 24px rgba(200,71,42,0.35)";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Hablar con nuestra IA · Gratis
        </button>
      )}

      {/* Panel de chat */}
      {open && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          width: 380, height: 500,
          display: "flex", flexDirection: "column",
          borderRadius: 20,
          boxShadow: "0 8px 48px rgba(0,0,0,0.3)",
          overflow: "hidden",
          fontFamily: "Inter, sans-serif",
        }}>
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px",
            background: "#c8472a",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "rgba(255,255,255,0.6)",
                animation: "pulse 2s infinite",
              }} />
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>Asistente Kuadra</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "rgba(255,255,255,0.7)", fontSize: 20, lineHeight: 1,
                padding: 4,
              }}
            >
              ×
            </button>
          </div>

          {/* Mensajes */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "12px 12px 8px",
            background: "#0f0f0f",
            display: "flex", flexDirection: "column", gap: 8,
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              }}>
                <div style={{
                  maxWidth: "85%",
                  padding: "8px 12px",
                  borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  fontSize: 13, lineHeight: 1.5,
                  ...(m.role === "user"
                    ? { background: "#c8472a", color: "#fff" }
                    : { background: "#1e1e1e", color: "#e0e0e0", border: "1px solid #2a2a2a" }
                  ),
                }}>
                  {renderBold(m.content)}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{
                  padding: "8px 14px", borderRadius: "18px 18px 18px 4px",
                  background: "#1e1e1e", border: "1px solid #2a2a2a",
                  color: "#9a9490", fontSize: 13,
                }}>
                  <span style={{ display: "inline-block", animation: "pulse 1.5s infinite" }}>Escribiendo…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Footer: escape WA + nueva conversación si rate limited */}
          <div style={{
            padding: "6px 12px", textAlign: "center",
            background: "#0f0f0f", borderTop: "1px solid #1e1e1e",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
          }}>
            {rateLimited && (
              <button
                onClick={resetConversation}
                style={{
                  background: "#c8472a", color: "#fff", border: "none",
                  borderRadius: 8, padding: "4px 10px", fontSize: 10,
                  fontWeight: 700, cursor: "pointer",
                }}
              >
                ↺ Nueva conversación
              </button>
            )}
            <a
              href="https://wa.me/593969000486?text=Hola,%20quiero%20saber%20más%20sobre%20Kuadra"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#6b6b6b", fontSize: 10, fontWeight: 600, textDecoration: "none" }}
            >
              ¿Preferís escribir directo? → WhatsApp
            </a>
          </div>

          {/* Input */}
          <div style={{
            display: "flex", gap: 8, padding: "10px 12px",
            background: "#141414", borderTop: "1px solid #1e1e1e",
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder={rateLimited ? "Iniciá nueva conversación ↑" : "Escribe tu pregunta…"}
              disabled={loading || rateLimited}
              style={{
                flex: 1, padding: "8px 12px", borderRadius: 12,
                background: "#1e1e1e", border: "1px solid #2a2a2a",
                color: rateLimited ? "#6b6b6b" : "#e0e0e0", fontSize: 13, outline: "none",
                fontFamily: "Inter, sans-serif",
              }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim() || rateLimited}
              style={{
                padding: "8px 14px", borderRadius: 12,
                background: "#c8472a", color: "#fff",
                border: "none", cursor: "pointer",
                fontSize: 16, fontWeight: 700,
                opacity: loading || !input.trim() || rateLimited ? 0.4 : 1,
                transition: "opacity 0.15s",
              }}
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
