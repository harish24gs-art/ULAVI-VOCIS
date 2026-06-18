# Ulavi Vocis 3.0

Production-ready starter for Ulavi's AI voice concierge. It replaces the single-file prototype with a React/Vite frontend and an Express backend that keeps all secrets server-side.

## Run Locally

```bash
npm install
npm run dev
```

Frontend: `http://127.0.0.1:5173`

Backend: `http://127.0.0.1:3000`

## Environment

Copy `.env.example` to `.env` and fill the values you want to enable.

Text chat and lead review work without provider keys. Voice transcription requires `OPENAI_API_KEY`. Supabase, SendGrid, and Twilio are skipped until configured.

## Database

Run `database/schema.sql` in Supabase SQL editor.

## Structure

```text
src/
  App.jsx
  components/
  pages/
  services/
  styles/
backend/
  server.js
  routes/
  controllers/
  services/
  middleware/
database/
docs/
```

## Key APIs

- `POST /api/conversation/message`
- `POST /api/conversation/voice`
- `POST /api/leads`
- `GET /api/health`
