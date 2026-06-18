# Ulavi Vocis 3.0 Architecture

## Goal

Ulavi Vocis is an AI voice concierge for transportation and travel services. It detects language, identifies service type, collects missing booking details conversationally, creates a lead, and triggers customer and operations notifications.

## Frontend

- React with Vite.
- Tailwind CSS for responsive styling.
- Framer Motion for screen and card motion.
- Simple state in `src/App.jsx`.
- Screens:
  - Home: service discovery and start conversation.
  - Chat: voice recorder, text chat, language indicator, summary.
  - Review: editable collected details.
  - Success: reference number and notification status.

## Backend

- Node.js and Express.
- API routes:
  - `POST /api/conversation/message`
  - `POST /api/conversation/voice`
  - `POST /api/leads`
  - `GET /api/health`
- Services:
  - `conversationService`: language, service, detail collection, missing fields.
  - `openaiService`: server-only chat completion and transcription.
  - `leadService`: Supabase persistence.
  - `notificationService`: SendGrid and Twilio WhatsApp.

## Data Flow

1. User speaks or types naturally.
2. Frontend sends audio or text to the backend.
3. Backend transcribes voice when needed.
4. Backend detects language and service.
5. Backend merges newly found details into the draft.
6. Backend asks only for the next missing detail.
7. When complete, frontend shows Review.
8. User confirms.
9. Backend stores the lead and messages in Supabase.
10. Backend sends email and WhatsApp confirmations and operations alerts.

## Security

- OpenAI, Supabase service role, SendGrid, and Twilio secrets stay in backend environment variables.
- Frontend never calls OpenAI, Twilio, SendGrid, or Supabase directly.
- Supabase row-level security is enabled. The backend uses the service role key.

## Demo Mode

If API keys are missing, text chat still works using rule-based extraction. Lead submission returns a demo reference and skips external notifications.
