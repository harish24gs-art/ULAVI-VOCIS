import OpenAI, { toFile } from "openai";

let client;

function getClient() {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

export async function transcribeAudio(audioBase64, mimeType) {
  const openai = getClient();
  if (!openai) {
    const err = new Error("OpenAI transcription is not configured");
    err.status = 503;
    throw err;
  }

  const buffer = Buffer.from(audioBase64, "base64");
  const file = await toFile(buffer, `voice.${mimeType.includes("mp4") ? "mp4" : "webm"}`, {
    type: mimeType
  });

  const transcript = await openai.audio.transcriptions.create({
    file,
    model: process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-mini-transcribe",
    prompt:
      "The audio may be English, Tamil, Tanglish, Hindi, French, Arabic, Malay, Chinese, Japanese, Korean, Urdu, Bengali, Telugu, Kannada, or Malayalam. Preserve the user's language and script. For Tanglish, keep Tamil words in Roman letters. Do not translate during transcription. Keep phone numbers, emails, dates, and place names exactly as spoken."
  });

  return transcript.text || "";
}

export async function completeConversation({ draft, messages, userMessage, supportedLanguages, services }) {
  const openai = getClient();
  if (!openai) return null;

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
    response_format: { type: "json_object" },
    temperature: 0.25,
    messages: [
      {
        role: "system",
        content: [
          "You are Ulavi Vocis 3.0, an AI voice concierge for transportation and travel services.",
          "You are not a travel planner. You collect transportation lead details conversationally.",
          `Supported languages: ${supportedLanguages.join(", ")}.`,
          `Allowed service types: ${services.join(", ")}.`,
          "Absolute language rule: detect the language/style of the latest userMessage every turn and reply only in that same language/style.",
          "English in means friendly English out. Tamil Unicode in means Tamil Unicode out. Tanglish in means Tanglish Roman letters out, never Tamil Unicode. French in means French out. Hindi in means Hindi out.",
          "Use 1-2 natural emojis per reply. Keep replies short, warm, and user-friendly.",
          "If a serviceType is already present, never ask which service they need again. Continue with the next missing booking detail.",
          "Ask only for missing information. Acknowledge the detail briefly, then ask one concise question unless ready for review.",
          "Return strict JSON with keys: language, draft, reply.",
          "draft keys: serviceType, name, email, phone, pickup, dropoff, date, time, passengers, equipment, packageHours, notes."
        ].join(" ")
      },
      {
        role: "user",
        content: JSON.stringify({ currentDraft: draft, recentMessages: messages.slice(-8), userMessage })
      }
    ]
  });

  const content = response.choices[0]?.message?.content || "{}";
  return JSON.parse(content);
}

export async function extractTravelEntitiesWithOpenAI({ text, draft = {}, messages = [], supportedLanguages = [], services = [] }) {
  const openai = getClient();
  if (!openai) return null;

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_EXTRACTION_MODEL || process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
    response_format: { type: "json_object" },
    temperature: 0,
    messages: [
      {
        role: "system",
        content: [
          "Extract travel booking entities from natural multilingual speech transcripts.",
          "Return ONLY valid JSON. Do not explain.",
          `Supported languages: ${supportedLanguages.join(", ")}.`,
          `Allowed services: ${services.join(", ")}.`,
          "Normalize conversational phrases into clean operational values.",
          "Never store filler words such as poganum, varaikum, jana hai, pickup pannunga, drop pannunga, please, need.",
          "Examples: 'coimbatore poganum' -> dropoffLocation 'Coimbatore'.",
          "'villivakkam varaikum' -> dropoffLocation 'Villivakkam'.",
          "'morning ten o clock' -> time '10:00 AM'.",
          "'motham pathu peru' -> passengers 10.",
          "Keys: service, pickupLocation, dropoffLocation, date, time, passengers, luggage, name, email, whatsapp, language, confidence.",
          "Use empty strings for unknown fields."
        ].join(" ")
      },
      {
        role: "user",
        content: JSON.stringify({
          currentDraft: draft,
          recentMessages: messages.slice(-8),
          transcript: text
        })
      }
    ]
  });

  return JSON.parse(response.choices[0]?.message?.content || "{}");
}
