# AI Assistant

A full-stack AI assistant that lets a user chat in the browser and have the backend use OpenAI plus Google APIs to manage Gmail and Google Calendar.

## What it does

- Chat with a React frontend
- Connect a Google account through OAuth
- Search and send Gmail messages
- Check calendar availability and create meeting events
- Keep a per-browser session ID for conversational context

## Tech stack

- Frontend: React, Create React App
- Backend: Express.js + Node.js
- AI orchestration: LangChain + OpenAI
- Google integrations: Gmail API and Calendar API

## Project structure

```text
ai-assistant/
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── server.js
│   ├── tokens.json
│   ├── vercel.json
│   └── src/
│       ├── agent.js
│       ├── config/
│       │   └── googleAuth.js
│       └── tools/
│           ├── calendarTools.js
│           └── emailTools.js
├── frontend/
│   ├── .env.example
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       ├── index.js
│       └── components/
│           ├── ChatWindow.jsx
│           └── MessageBubble.jsx
├── README.md
└── .gitignore
```

## Prerequisites

Before running the app locally, make sure you have:

- Node.js 18+
- npm
- A Google Cloud project
- An OpenAI API key

## 1) Set up Google Cloud

1. Go to the Google Cloud Console.
2. Create a new project or select an existing one.
3. Enable the Gmail API and Google Calendar API.
4. Create an OAuth 2.0 Client ID.
5. Add the redirect URI for local development:

   http://localhost:5000/auth/google/callback

6. Copy the client ID and client secret.

## 2) Set up environment variables

Create a .env file in the backend folder using the example file as a template:

```bash
cd backend
copy .env.example .env
```

Then update it with your values:

```env
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
PORT=5000
FRONTEND_ORIGIN=http://localhost:3000
```

Create the frontend environment file:

```bash
cd frontend
copy .env.example .env
```

Then set:

```env
REACT_APP_API_BASE=http://localhost:5000
```

## 3) Install and run locally

### Backend

```bash
cd backend
npm install
npm run dev
```

The backend will run at:

http://localhost:5000

### Frontend

In a second terminal:

```bash
cd frontend
npm install
npm start
```

The frontend will run at:

http://localhost:3000

## 4) Use the app

1. Open the frontend in your browser.
2. Click the Connect Google button.
3. Allow the requested Gmail and Calendar permissions.
4. Start chatting with prompts like:
   - "Send an email to jane@example.com with a meeting summary."
   - "Check my availability tomorrow afternoon and schedule a 30 minute meeting with dan@example.com."

## How it works

The UI sends a chat message to the backend at /api/chat. The backend runs the LangChain agent, which decides whether to respond with plain text or call one of the Google tools for Gmail or Calendar actions.

Example flow:

```text
React UI -> Express backend -> LangChain agent -> OpenAI
                                     |
                                     +-> Gmail tools
                                     +-> Calendar tools
```

## Deployment notes

This project is designed to be deployed with the frontend and backend as separate services.

### Backend on Vercel

1. Import the backend folder as a Node.js project in Vercel.
2. Set the same environment variables from backend/.env.example.
3. Update the Google OAuth redirect URI to the deployed backend URL:

   https://<your-backend-domain>/auth/google/callback

4. Deploy the backend and copy the URL.

### Frontend on Vercel

1. Import the frontend folder as a React app.
2. Set REACT_APP_API_BASE to your deployed backend URL.
3. Deploy the frontend.

> The OAuth flow depends on the backend URL being correct, so the frontend and backend should usually be kept separate in production.

## Important considerations

- The app currently stores Google OAuth tokens in backend/tokens.json for demo purposes.
- This is a starter project and is not production-hardened for multi-user use.
- For real usage, you should move token storage to a secure database and add authentication and rate limiting around the chat API.

## Useful commands

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm start
```

## License

This project is provided as a sample app for learning and experimentation.
