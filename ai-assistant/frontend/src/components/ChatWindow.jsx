import React, { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";

const API_BASE = process.env.REACT_APP_API_BASE || window.location.origin;

export default function ChatWindow({ sessionId }) {
  const [messages, setMessages] = useState([
    {
      role: "agent",
      content:
        "I can draft and send emails, search your inbox, check your calendar, and schedule meetings. What do you need?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((m) => [
          ...m,
          { role: "agent", content: data.error || "Something went wrong." },
        ]);
      } else {
        setMessages((m) => [...m, { role: "agent", content: data.reply }]);
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "agent", content: "Couldn't reach the backend. Is the server running?" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 20px",
        }}
      >
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} content={m.content} />
        ))}
        {loading && (
          <div style={{ color: "var(--ink-soft)", fontSize: 14, marginTop: 4 }}>
            Working on it…
          </div>
        )}
      </div>

      <div
        style={{
          borderTop: "1px solid var(--line)",
          padding: 14,
          display: "flex",
          gap: 10,
          background: "var(--paper)",
        }}
      >
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me to email someone or set up a meeting…"
          style={{
            flex: 1,
            resize: "none",
            padding: "10px 12px",
            borderRadius: 4,
            border: "1px solid var(--line)",
            fontFamily: "inherit",
            fontSize: 15,
            background: "#fff",
            color: "var(--ink)",
          }}
        />
        <button
          onClick={send}
          disabled={loading}
          style={{
            padding: "0 18px",
            borderRadius: 4,
            border: "none",
            background: "var(--accent)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: loading ? "default" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
