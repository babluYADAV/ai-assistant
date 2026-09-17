import React from "react";

export default function MessageBubble({ role, content }) {
  const isUser = role === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 14,
      }}
    >
      <div
        style={{
          maxWidth: "72%",
          padding: "10px 14px",
          borderRadius: 4,
          fontSize: 15,
          lineHeight: 1.5,
          background: isUser ? "var(--bubble-user)" : "var(--bubble-agent)",
          color: isUser ? "var(--bubble-user-text)" : "var(--ink)",
          border: isUser ? "none" : "1px solid var(--line)",
          whiteSpace: "pre-wrap",
        }}
      >
        {content}
      </div>
    </div>
  );
}
