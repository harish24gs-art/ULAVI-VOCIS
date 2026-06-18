import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Home from "./pages/Home.jsx";
import Chat from "./pages/Chat.jsx";
import Review from "./pages/Review.jsx";
import Success from "./pages/Success.jsx";
import ReadyModal from "./components/ReadyModal.jsx";
import SubmissionCelebration from "./components/SubmissionCelebration.jsx";
import Toast from "./components/Toast.jsx";
import { sendMessage, sendVoice, submitLead } from "./services/api.js";

const initialDraft = {
  serviceType: "",
  language: "",
  name: "",
  email: "",
  phone: "",
  pickup: "",
  dropoff: "",
  date: "",
  time: "",
  passengers: "",
  equipment: "",
  packageHours: "",
  notes: ""
};

const welcomeMessage = {
  role: "assistant",
  content:
    "Welcome to Ulavi Vocis. Tell me what transport service you need, in any language you prefer.",
  language: "English"
};

const serviceRequired = {
  "Airport Transfer": ["serviceType", "pickup", "dropoff", "date", "time", "passengers", "name", "phone", "email"],
  "Ground Transfer": ["serviceType", "pickup", "dropoff", "date", "time", "passengers", "name", "phone", "email"],
  "Long Distance Transfer": ["serviceType", "pickup", "dropoff", "date", "time", "passengers", "name", "phone", "email"],
  "Cross Border Transfer": ["serviceType", "pickup", "dropoff", "date", "time", "passengers", "name", "phone", "email"],
  "Day / Hourly Packages": ["serviceType", "pickup", "dropoff", "date", "time", "passengers", "packageHours", "name", "phone", "email"],
  "Tour Packages": ["serviceType", "pickup", "dropoff", "date", "passengers", "name", "phone", "email"],
  "Medical Equipment Transfer": ["serviceType", "pickup", "dropoff", "date", "time", "equipment", "name", "phone", "email"]
};

const serviceIntros = {
  "Airport Transfer": "Airport transfer selected ✈️ Nice, where should we pick you up from?",
  "Ground Transfer": "Ground transfer selected 🚘 Great, where should the pickup be?",
  "Long Distance Transfer": "Long distance transfer selected 🛣️ Lovely, where should the trip start?",
  "Cross Border Transfer": "Cross-border transfer selected 🌏 Smooth choice. Where should pickup be?",
  "Day / Hourly Packages": "Hourly chauffeur package selected ⏳ Nice, where should your driver pick you up?",
  "Tour Packages": "Tour package selected 🗺️ Lovely, where should your journey start?",
  "Medical Equipment Transfer": "Medical equipment transfer selected 🧰 Understood. Where should pickup be?"
};

const languageAliases = {
  "தமிழ்": "Tamil",
  "हिन्दी": "Hindi",
  "Français": "French",
  "العربية": "Arabic"
};

const cleanLanguageAliases = {
  ...languageAliases,
  தமிழ்: "Tamil",
  हिन्दी: "Hindi",
  Français: "French",
  العربية: "Arabic",
  اردو: "Urdu",
  বাংলা: "Bengali",
  తెలుగు: "Telugu",
  ಕನ್ನಡ: "Kannada",
  മലയാളം: "Malayalam",
  中文: "Chinese",
  日本語: "Japanese",
  한국어: "Korean"
};

const serviceEmoji = {
  "Airport Transfer": "✈️",
  "Ground Transfer": "🚘",
  "Long Distance Transfer": "🛣️",
  "Cross Border Transfer": "🌏",
  "Day / Hourly Packages": "⏳",
  "Tour Packages": "🗺️",
  "Medical Equipment Transfer": "🏥"
};

const localizedPickupQuestion = {
  English: "Nice, where should we pick you up from?",
  Tamil: "நன்று, எங்கிருந்து உங்களை அழைத்துச் செல்ல வேண்டும்?",
  Tanglish: "Super, enga pickup panna vendum?",
  Hindi: "Achha, pickup kahan se karna hai?",
  French: "Parfait, ou devons-nous vous prendre en charge?",
  Arabic: "رائع، من أين نأخذك؟"
};

const storageKey = "ulavi_vocis_session";
const storageVersion = 3;

function requiredForService(serviceType) {
  return serviceRequired[serviceType] || (serviceType ? serviceRequired["Ground Transfer"] : []);
}

function progressForDraft(draft, requiredFields) {
  const activeFields = requiredFields.length ? requiredFields : requiredForService(draft.serviceType);
  const total = Math.max(activeFields.length, 1);
  const filled = activeFields.filter((field) => String(draft[field] || "").trim()).length;
  return { filled, total, percent: Math.round((filled / total) * 100) };
}

function missingForDraft(draft, requiredFields) {
  const activeFields = requiredFields.length ? requiredFields : requiredForService(draft.serviceType);
  return activeFields.filter((field) => !String(draft[field] || "").trim());
}

function normalizeLanguage(language) {
  return cleanLanguageAliases[language] || language || "English";
}

function introForService(serviceType, language) {
  const normalizedLanguage = normalizeLanguage(language);
  const question = localizedPickupQuestion[normalizedLanguage] || localizedPickupQuestion.English;
  return `${serviceType} selected ${serviceEmoji[serviceType] || "✨"} ${question}`;
}

function loadSession() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
    if (saved.version !== storageVersion) throw new Error("Stale session");
    const draft = { ...initialDraft, ...(saved.draft || {}) };
    const requiredFields = saved.requiredFields?.length ? saved.requiredFields : requiredForService(draft.serviceType);
    const missingFields = saved.missingFields?.length ? saved.missingFields : missingForDraft(draft, requiredFields);
    return {
      screen: saved.screen === "review" ? "review" : saved.messages?.length > 1 ? "chat" : "home",
      messages: saved.messages?.length ? saved.messages : [welcomeMessage],
      draft,
      missingFields,
      requiredFields,
      progress: progressForDraft(draft, requiredFields)
    };
  } catch {
    return {
      screen: "home",
      messages: [welcomeMessage],
      draft: initialDraft,
      missingFields: [],
      requiredFields: [],
      progress: { filled: 0, total: 1, percent: 0 }
    };
  }
}

export default function App() {
  const savedSession = useMemo(loadSession, []);
  const [screen, setScreen] = useState(savedSession.screen);
  const [messages, setMessages] = useState(savedSession.messages);
  const [draft, setDraft] = useState(savedSession.draft);
  const [missingFields, setMissingFields] = useState(savedSession.missingFields);
  const [requiredFields, setRequiredFields] = useState(savedSession.requiredFields);
  const [progress, setProgress] = useState(savedSession.progress);
  const [isThinking, setIsThinking] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [readyModalOpen, setReadyModalOpen] = useState(false);
  const [celebrationOpen, setCelebrationOpen] = useState(false);

  const readyForReview = useMemo(() => {
    return draft.serviceType && missingFields.length === 0 && messages.length > 1;
  }, [draft.serviceType, missingFields.length, messages.length]);

  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ version: storageVersion, screen, messages, draft, missingFields, requiredFields, progress })
      );
    } catch {
      // Local storage can fail in private windows; the app still works without persistence.
    }
  }, [screen, messages, draft, missingFields, requiredFields, progress]);

  useEffect(() => {
    if (screen === "success") setReadyModalOpen(false);
  }, [screen]);

  function applyConversationResult(result) {
    const nextDraft = { ...initialDraft, ...(result.draft || {}) };
    const nextRequiredFields = result.requiredFields?.length ? result.requiredFields : requiredForService(nextDraft.serviceType);
    setDraft(nextDraft);
    setRequiredFields(nextRequiredFields);
    setMissingFields(result.missingFields?.length ? result.missingFields : missingForDraft(nextDraft, nextRequiredFields));
    setProgress(progressForDraft(nextDraft, nextRequiredFields));
    if (result.readyForReview) setReadyModalOpen(true);
  }

  function handleLanguageChange(language) {
    const normalized = normalizeLanguage(language);
    setDraft((current) => ({ ...current, language: normalized }));
  }

  function showSuccess(result, message) {
    setSuccess(result);
    setReadyModalOpen(false);
    setScreen("success");
    setCelebrationOpen(true);
    setToast({ type: "success", message });
    window.setTimeout(() => setCelebrationOpen(false), 3600);
  }

  function startConversation(serviceType) {
    if (!serviceType) {
      setScreen("chat");
      return;
    }
    const required = requiredForService(serviceType);
    const activeLanguage = normalizeLanguage(draft.language || "English");
    setDraft((current) => ({ ...current, serviceType, language: current.language || "English" }));
    setRequiredFields(required);
    setMissingFields(required.filter((field) => field !== "serviceType"));
    setProgress({ filled: 1, total: required.length, percent: Math.round(100 / required.length) });
    setMessages([
      {
        role: "assistant",
        content: serviceIntros[serviceType] || "Service selected 😊 Where should pickup be?",
        language: "English"
      }
    ]);
    setMessages([
      {
        role: "assistant",
        content: introForService(serviceType, activeLanguage),
        language: activeLanguage
      }
    ]);
    setScreen("chat");
  }

  async function handleConversation(text) {
    if (!text.trim()) return;
    setError("");
    const userMessage = { role: "user", content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setIsThinking(true);

    try {
      const result = await sendMessage({ message: text, draft, messages: nextMessages });
      applyConversationResult(result);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: result.reply, language: result.language }
      ]);
    } catch (err) {
      setError(err.message);
      setToast({ type: "error", message: err.message });
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "I could not reach the concierge service. Please try again.",
          language: draft.language || "English"
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  }

  async function handleVoice(audioBase64, mimeType) {
    setError("");
    setIsThinking(true);
    try {
      const result = await sendVoice({ audioBase64, mimeType, draft, messages });
      const userText = String(result.transcript || "").trim();
      if (!userText) {
        setToast({ type: "error", message: "I could not hear that clearly. Please try again." });
        if (result.reply) {
          setMessages((current) => [
            ...current,
            { role: "assistant", content: result.reply, language: result.language || draft.language || "English" }
          ]);
        }
        return;
      }
      if (readyForReview && isAffirmative(userText)) {
        setReadyModalOpen(false);
        const submitted = await submitLead({ draft, messages: [...messages, { role: "user", content: userText }] });
        showSuccess(submitted, "Lead submitted from voice confirmation.");
        return;
      }
      applyConversationResult(result);
      setMessages((current) => [
        ...current,
        { role: "user", content: userText },
        { role: "assistant", content: result.reply, language: result.language }
      ]);
    } catch (err) {
      setError(err.message);
      setToast({ type: "error", message: err.message });
    } finally {
      setIsThinking(false);
    }
  }

  async function handleSubmitLead() {
    setError("");
    setIsThinking(true);
    try {
      setReadyModalOpen(false);
      const result = await submitLead({ draft, messages });
      showSuccess(result, "Lead saved and notifications processed.");
    } catch (err) {
      setError(err.message);
      setToast({ type: "error", message: err.message });
    } finally {
      setIsThinking(false);
    }
  }

  function isAffirmative(text) {
    return /\b(yes|yeah|yep|confirm|submit|send|ok|okay|sure|go ahead|haan|ha|oui|d'accord|sari|aamam|aama|ama|aam|seri|send pannunga|confirm pannunga)\b/i.test(text || "") ||
      /(ஆம்|ஆமாம்|சரி|உறுதி|அனுப்பு|சமர்ப்பி|கன்ஃபர்ம்|அப்படியே|செய்யலாம்)/.test(text || "");
  }

  async function handleReviewVoice(audioBase64, mimeType) {
    setError("");
    setIsThinking(true);
    try {
      const result = await sendVoice({
        audioBase64,
        mimeType,
        draft,
        messages: [
          ...messages,
          { role: "assistant", content: "Please say yes to submit, or tell me what detail to change." }
        ]
      });
      const transcript = result.transcript || "";
      if (isAffirmative(transcript)) {
        setReadyModalOpen(false);
        const submitted = await submitLead({ draft, messages: [...messages, { role: "user", content: transcript }] });
        showSuccess(submitted, "Lead submitted from voice confirmation.");
        return;
      }
      applyConversationResult(result);
      setMessages((current) => [
        ...current,
        { role: "user", content: transcript || "Voice update" },
        { role: "assistant", content: result.reply, language: result.language }
      ]);
      setToast({ type: "success", message: "Updated the review details from your voice." });
    } catch (err) {
      setError(err.message);
      setToast({ type: "error", message: err.message });
    } finally {
      setIsThinking(false);
    }
  }

  function handleDraftChange(nextDraft) {
    const nextRequiredFields = requiredFields.length ? requiredFields : requiredForService(nextDraft.serviceType);
    setDraft(nextDraft);
    setRequiredFields(nextRequiredFields);
    setMissingFields(missingForDraft(nextDraft, nextRequiredFields));
    setProgress(progressForDraft(nextDraft, nextRequiredFields));
  }

  function handleReset() {
    setMessages([welcomeMessage]);
    setDraft(initialDraft);
    setMissingFields([]);
    setRequiredFields([]);
    setProgress({ filled: 0, total: 1, percent: 0 });
    setSuccess(null);
    setError("");
    setReadyModalOpen(false);
    setCelebrationOpen(false);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Ignore storage cleanup failures.
    }
    setScreen("home");
  }

  function handleNewConversation() {
    setMessages([welcomeMessage]);
    setDraft(initialDraft);
    setMissingFields([]);
    setRequiredFields([]);
    setProgress({ filled: 0, total: 1, percent: 0 });
    setSuccess(null);
    setError("");
    setReadyModalOpen(false);
    setCelebrationOpen(false);
    setScreen("chat");
  }

  return (
    <main className="min-h-screen bg-ink text-pearl">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <SubmissionCelebration open={celebrationOpen} />
      <ReadyModal
        draft={draft}
        open={readyModalOpen}
        progress={progress}
        isSubmitting={isThinking}
        onClose={() => setReadyModalOpen(false)}
        onVoiceConfirm={handleReviewVoice}
        onReview={() => {
          setReadyModalOpen(false);
          setScreen("review");
        }}
      />
      <AnimatePresence mode="wait">
        {screen === "home" && (
          <Home
            key="home"
            language={draft.language || "English"}
            onLanguageChange={handleLanguageChange}
            onStart={startConversation}
          />
        )}
        {screen === "chat" && (
          <Chat
            key="chat"
            draft={draft}
            error={error}
            isThinking={isThinking}
            messages={messages}
            missingFields={missingFields}
            progress={progress}
            requiredFields={requiredFields}
            readyForReview={readyForReview}
            onBack={() => setScreen("home")}
            onSend={handleConversation}
            onVoice={handleVoice}
            onVoiceError={(message) => setToast({ type: "error", message })}
            onReview={() => setScreen("review")}
            onServiceSelect={startConversation}
            onLanguageChange={handleLanguageChange}
            onNewConversation={handleNewConversation}
          />
        )}
        {screen === "review" && (
          <Review
            key="review"
            draft={draft}
            error={error}
            isSubmitting={isThinking}
            progress={progress}
            requiredFields={requiredFields}
            onBack={() => setScreen("chat")}
            onChange={handleDraftChange}
            onVoiceConfirm={handleReviewVoice}
            onSubmit={handleSubmitLead}
          />
        )}
        {screen === "success" && (
          <Success key="success" result={success} onReset={handleReset} />
        )}
      </AnimatePresence>
    </main>
  );
}
