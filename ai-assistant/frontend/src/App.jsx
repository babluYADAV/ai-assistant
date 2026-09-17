import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import ChatWindow from "./components/ChatWindow";

const API_BASE = process.env.REACT_APP_API_BASE || window.location.origin;

function getSessionId() {
  let id = sessionStorage.getItem("assistant_session_id");
  if (!id) {
    id = uuidv4();
    sessionStorage.setItem("assistant_session_id", id);
  }
  return id;
}

export default function App() {
  const [sessionId] = useState(getSessionId);
  const [connected, setConnected] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/auth/status`)
      .then((r) => r.json())
      .then((d) => setConnected(d.authorized))
      .catch(() => setConnected(false));
  }, []);

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          padding: "20px 20px 16px",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <h1
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 600,
            fontSize: 24,
            margin: 0,
            color: "var(--ink)",
          }}
        >
          Your assistant
        </h1>
        <p style={{ margin: "4px 0 0", color: "var(--ink-soft)", fontSize: 14 }}>
          Handles email and scheduling, one request at a time.
        </p>

        {connected === false && (
          <div
            style={{
              marginTop: 14,
              padding: "10px 14px",
              background: "var(--accent-soft)",
              border: "1px solid var(--line)",
              borderRadius: 4,
              fontSize: 14,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span>Connect your Google account to send email and manage your calendar.</span>
            <a
              href={`${API_BASE}/auth/google`}
              style={{
                background: "var(--accent)",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: 4,
                fontWeight: 600,
                fontSize: 13,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Connect Google
            </a>
          </div>
        )}
      </header>

      <div style={{ flex: 1, minHeight: 0 }}>
        <ChatWindow sessionId={sessionId} />
      </div>
    </div>
  );
}
