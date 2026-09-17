# AI Assistant — Email & Meeting Scheduling

A chat-based AI assistant that reads/sends Gmail and manages Google Calendar,
built with **React** (frontend), **Express + LangChain.js + OpenAI** (backend agent),
and the **Google APIs** (Gmail, Calendar) for the actual actions.

## How it works

```
React chat UI  --POST /api/chat-->  Express server  --LangChain AgentExecutor-->  OpenAI (gpt-4o)
                                                              |
                                                     tool calls as needed
                                                              |
                                          send_email / search_email (Gmail API)
                                          schedule_meeting / check_availability (Calendar API)
```

The OpenAI model decides, per message, whether it needs to call a tool (send an
email, check free/busy time, create a calendar event) or just reply in text. It
always restates what it's about to do before calling a tool that has real-world
side effects, per the system prompt in `backend/src/agent.js`.

## Project layout

```
ai-assistant/
├── backend/
│   ├── server.js                 Express app: /api/chat, Google OAuth routes
│   ├── src/agent.js              LangChain agent + system prompt + session memory
│   ├── src/tools/emailTools.js   send_email, search_email (Gmail API)
│   ├── src/tools/calendarTools.js schedule_meeting, check_availability (Calendar API)
│   ├── src/config/googleAuth.js  OAuth2 client + token persistence
│   └── .env.example
└── frontend/
    └── src/
        ├── App.jsx               Layout + "Connect Google" banner
        └── components/
            ├── ChatWindow.jsx    Message list + input, calls the backend
            └── MessageBubble.jsx
```

## Setup

### 1. Google Cloud Console
1. Create a project at https://console.cloud.google.com.
2. Enable the **Gmail API** and **Google Calendar API**.
3. Create an **OAuth 2.0 Client ID** (type: Web application).
4. Add `http://localhost:5000/auth/google/callback` as an authorized redirect URI.
5. Copy the client ID and secret.

### 2. OpenAI
Get an API key from https://platform.openai.com/api-keys.

### 3. Backend
```bash
cd backend
cp .env.example .env
# fill in OPENAI_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
npm install
npm run dev
```

### 4. Frontend
```bash
cd frontend
npm install
npm start
```

Open http://localhost:3000, click **Connect Google**, approve the consent
screen, and start chatting — e.g. "Email priya@acme.com asking to move
Thursday's sync to 4pm" or "Find a 30-minute slot tomorrow afternoon and set up
a call with dan@company.com about the Q3 roadmap."

## Deploy to Vercel

### Backend
1. Import the backend folder into a Vercel project as a Node.js app.
2. Set the project environment variables from `backend/.env.example`.
3. Set the callback URL in Google Cloud to `https://<your-backend-domain>/auth/google/callback`.
4. Deploy the app and copy the backend URL.

### Frontend
1. Import the frontend folder as a React app in Vercel.
2. Set `REACT_APP_API_BASE` to your deployed backend URL, for example `https://your-backend-url.vercel.app`.
3. Deploy the frontend.

> For a production deployment, the backend and frontend should usually be separate Vercel projects because the OAuth redirect and API base URL are different.

## Extending it

- **More tools**: add a new `tool(...)` in `src/tools/` (e.g. draft-only emails,
  reschedule/cancel events, Slack notifications) and register it in the `tools`
  array in `agent.js`.
- **Multi-user**: swap the in-memory `sessions` Map and the single `tokens.json`
  file for a real database keyed by user ID — right now the demo supports one
  connected Google account at a time.
- **Streaming replies**: swap `executor.invoke` for `executor.stream` and pipe
  tokens to the frontend over SSE or a websocket if you want the UI to type
  responses out live.
- **Guardrails**: the system prompt asks the model to confirm details before
  acting, but for production you may want a human-in-the-loop confirmation step
  in the UI before `send_email` / `schedule_meeting` actually fire.

## Security notes

This is a starter/demo. Before using it for real: store OAuth tokens encrypted
in a proper database (not a local JSON file), add authentication to your own
`/api/chat` endpoint, rate-limit it, and review OpenAI/Google API usage costs.
