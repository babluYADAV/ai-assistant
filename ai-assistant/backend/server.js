import express from "express";
import cors from "cors";
import "dotenv/config";

import { runAgent } from "./src/agent.js";
import {
  getAuthUrl,
  exchangeCodeForTokens,
  isAuthorized,
} from "./src/config/googleAuth.js";

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("CORS policy rejected this origin"));
    },
    credentials: true,
  })
);
app.use(express.json());

app.get("/auth/status", (req, res) => {
  res.json({ authorized: isAuthorized() });
});

app.get("/auth/google", (req, res) => {
  res.redirect(getAuthUrl());
});

app.get("/auth/google/callback", async (req, res) => {
  try {
    await exchangeCodeForTokens(req.query.code);

    const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
    res.redirect(`${frontendOrigin}?connected=true`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Google authorization failed. Check server logs.");
  }
});

app.post("/api/chat", async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message || !sessionId) {
    return res.status(400).json({ error: "message and sessionId are required" });
  }

  if (!isAuthorized()) {
    return res.status(401).json({
      error: "Google account not connected yet. Visit /auth/google first.",
    });
  }

  try {
    const reply = await runAgent(sessionId, message);
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Agent failed to process the request." });
  }
});

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`AI assistant backend running on http://localhost:${PORT}`);
  });
}

export default app;
