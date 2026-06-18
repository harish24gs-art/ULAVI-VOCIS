import { motion } from "framer-motion";
import { Bell, Keyboard, MoreHorizontal, Plus, Send, Sparkles, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ChatMessage from "../components/ChatMessage.jsx";
import SummaryPanel from "../components/SummaryPanel.jsx";
import VoiceRecorder from "../components/VoiceRecorder.jsx";
import { services } from "../services/serviceCatalog.js";

const labels = {
  serviceType: "service type",
  pickup: "pickup location",
  dropoff: "dropoff location",
  date: "date",
  time: "time",
  passengers: "passenger count",
  name: "contact name",
  phone: "phone number",
  email: "email address",
  equipment: "medical equipment",
  packageHours: "package hours",
  notes: "notes"
};

const mainLanguages = [
  "English",
  "தமிழ்",       // Tamil
  "Tanglish",    // Keep as-is since it's mixed Tamil+English
  "हिन्दी",      // Hindi
  "Français",    // French
  "العربية"      // Arabic
];

const voicePreferenceKey = "ulavi_voice_responses_enabled";

const moreLanguages = [
  "Bahasa Melayu",  // Malay
  "中文",           // Chinese
  "日本語",         // Japanese
  "한국어",         // Korean
  "اردو",           // Urdu
  "বাংলা",         // Bengali
  "తెలుగు",        // Telugu
  "ಕನ್ನಡ",         // Kannada
  "മലയാളം",       // Malayalam
  "Tiếng Việt",    // Vietnamese
  "Español",       // Spanish
  "Deutsch",       // German
  "Italiano",      // Italian
  "Português",     // Portuguese
  "Русский",       // Russian
  "ไทย",           // Thai
  "Bahasa Indonesia", // Indonesian
  "मराठी",         // Marathi
  "ગુજરાતી",       // Gujarati
  "ਪੰਜਾਬੀ",        // Punjabi
  "සිංහල",        // Sinhala
  "Nederlands",    // Dutch
  "Türkçe",        // Turkish
  "Svenska"        // Swedish
];

function detectedLanguage(language) {
  return language || "English";
}

function languageBadge(language) {
  return `${detectedLanguage(language)} Detected`;
}

export default function Chat({
  draft,
  error,
  isThinking,
  messages,
  missingFields,
  progress,
  requiredFields,
  readyForReview,
  onSend,
  onVoice,
  onVoiceError,
  onReview,
  onServiceSelect,
  onLanguageChange,
  onNewConversation
}) {
  const [text, setText] = useState("");
  const [activeMenu, setActiveMenu] = useState("");
  const [voiceResponsesEnabled, setVoiceResponsesEnabled] = useState(() => {
    try {
      return localStorage.getItem(voicePreferenceKey) !== "0";
    } catch {
      return true;
    }
  });
  const inputRef = useRef(null);
  const messageEndRef = useRef(null);
  const voiceStatus = isThinking ? "Understanding your request..." : "TAP TO SPEAK";
  const visibleServices = draft.serviceType
    ? services.filter((service) => service.title === draft.serviceType)
    : services;

  function submit(event) {
    event.preventDefault();
    const value = text.trim();
    if (!value) return;
    setText("");
    onSend(value);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function editField(field) {
    setText(`${labels[field] || field}: `);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, isThinking]);

  useEffect(() => {
    if (!isThinking) inputRef.current?.focus();
  }, [isThinking]);

  useEffect(() => {
    try {
      localStorage.setItem(voicePreferenceKey, voiceResponsesEnabled ? "1" : "0");
    } catch {
      // Preference persistence is optional.
    }
    if (!voiceResponsesEnabled && window.speechSynthesis) window.speechSynthesis.cancel();
  }, [voiceResponsesEnabled]);

  useEffect(() => {
    function closeMenus(event) {
      if (!activeMenu) return;
      if (event.target.closest("[data-chat-menu]")) return;
      setActiveMenu("");
    }
    document.addEventListener("pointerdown", closeMenus);
    return () => document.removeEventListener("pointerdown", closeMenus);
  }, [activeMenu]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="min-h-screen overflow-hidden bg-[#F8F9FA] text-[#212529]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(0,198,141,0.12),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(0,102,218,0.1),transparent_30%),linear-gradient(135deg,#F8F9FA,#ffffff_52%,#EDF3FB)]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1500px] flex-col px-4 py-4 sm:px-6">
        <header className="flex flex-wrap items-center justify-between gap-4 pb-4">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#112E81]/15 bg-[#112E81] text-lg font-black text-white shadow-[0_12px_30px_rgba(17,46,129,0.14)]">
              U
            </div>
            <div>
              <div className="text-xl font-semibold tracking-[0.2em] text-[#112E81]">ULAVI</div>
              <div className="text-xs tracking-[0.44em] text-[#00C68D]">VOCIS</div>
            </div>
            <div className="hidden h-12 w-px bg-[#112E81]/12 md:block" />
            <div className="hidden md:block">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black text-[#112E81]">Speak Naturally</h1>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#00C68D]/10 px-3 py-1 text-sm font-bold text-[#007B61]">
                  <span className="h-2 w-2 rounded-full bg-[#00C68D] shadow-[0_0_12px_rgba(0,198,141,0.55)]" />
                  Online
                </span>
              </div>
            </div>
          </div>

          <div className="relative flex items-center gap-3">
            <div className="relative" data-chat-menu>
            <button
              type="button"
              onClick={() => setActiveMenu(activeMenu === "notifications" ? "" : "notifications")}
              className="grid h-11 w-11 place-items-center rounded-full border border-[#112E81]/12 bg-white text-[#112E81] shadow-sm hover:bg-[#F1F5F9]"
              aria-label="Notifications"
            >
              <Bell size={19} />
            </button>
            {activeMenu === "notifications" && (
              <div className="absolute right-0 z-30 mt-3 w-72 rounded-2xl border border-[#112E81]/10 bg-white p-4 text-left shadow-[0_24px_80px_rgba(17,46,129,0.16)]">
                <div className="text-sm font-black text-[#112E81]">Notifications</div>
                <div className="mt-3 space-y-3 text-sm text-[#475569]">
                  <div className="rounded-xl bg-[#F8F9FA] p-3">Voice concierge is online and ready.</div>
                  <div className="rounded-xl bg-[#F8F9FA] p-3">Booking progress updates appear here.</div>
                  <div className="rounded-xl bg-[#F8F9FA] p-3">Email and WhatsApp confirmations are enabled after submission.</div>
                </div>
              </div>
            )}
            </div>
            <div className="relative hidden sm:block" data-chat-menu>
            <button
              type="button"
              onClick={() => setActiveMenu(activeMenu === "more" ? "" : "more")}
              className="grid h-11 w-11 place-items-center rounded-full border border-[#112E81]/12 bg-white text-[#112E81] shadow-sm hover:bg-[#F1F5F9]"
              aria-label="More options"
            >
              <MoreHorizontal size={21} />
            </button>
            {activeMenu === "more" && (
              <div className="absolute right-0 z-30 mt-3 w-64 rounded-2xl border border-[#112E81]/10 bg-white p-2 text-left shadow-[0_24px_80px_rgba(17,46,129,0.16)]">
                <button
                  type="button"
                  onClick={() => setVoiceResponsesEnabled((current) => !current)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left hover:bg-[#F8F9FA]"
                >
                  <span>
                    <span className="block text-sm font-black text-[#112E81]">Voice Responses</span>
                    <span className="mt-1 block text-xs leading-5 text-[#64748B]">
                      {voiceResponsesEnabled ? "Listen buttons are available." : "Listen buttons are hidden."}
                    </span>
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-black ${voiceResponsesEnabled ? "bg-[#00C68D]/12 text-[#007B61]" : "bg-[#E5E7EB] text-[#64748B]"}`}>
                    {voiceResponsesEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                    {voiceResponsesEnabled ? "ON" : "OFF"}
                  </span>
                </button>
                {[
                  ["Help center", "Our support team is available 24/7."],
                  ["Privacy", "Conversation details stay protected."],
                  ["Clear session", "Use + to begin a fresh request."]
                ].map(([title, body]) => (
                  <button key={title} type="button" className="block w-full rounded-xl px-3 py-3 text-left hover:bg-[#F8F9FA]">
                    <div className="text-sm font-black text-[#112E81]">{title}</div>
                    <div className="mt-1 text-xs leading-5 text-[#64748B]">{body}</div>
                  </button>
                ))}
              </div>
            )}
            </div>
            <button
              type="button"
              onClick={() => setActiveMenu(activeMenu === "new" ? "" : "new")}
              className="inline-grid h-11 w-11 place-items-center rounded-full border border-[#0066DA]/20 bg-[#112E81] text-white shadow-[0_12px_26px_rgba(17,46,129,0.18)] hover:bg-[#0066DA]"
              aria-label="New conversation options"
              data-chat-menu
            >
              <Plus size={23} />
            </button>
            {activeMenu === "new" && (
              <div className="absolute right-6 top-16 z-30 w-64 rounded-2xl border border-[#112E81]/10 bg-white p-2 text-left shadow-[0_24px_80px_rgba(17,46,129,0.16)]" data-chat-menu>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMenu("");
                    onNewConversation?.();
                  }}
                  className="block w-full rounded-xl px-3 py-3 text-left hover:bg-[#F8F9FA]"
                >
                  <div className="text-sm font-black text-[#112E81]">Start new request</div>
                  <div className="mt-1 text-xs leading-5 text-[#64748B]">Clear this chat and begin again.</div>
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="grid flex-1 gap-5 lg:grid-cols-[minmax(0,4fr)_minmax(240px,1fr)]">
          <main className="flex h-[calc(100vh-96px)] min-h-[690px] flex-col overflow-hidden rounded-[30px] border border-[#112E81]/10 bg-white shadow-[0_24px_80px_rgba(17,46,129,0.12)]">
            <section className="relative shrink-0 overflow-visible border-b border-[#112E81]/10 bg-[linear-gradient(135deg,#112E81_0%,#0066DA_58%,#0F766E_100%)] px-4 py-5 text-center sm:px-8">
              <div className="pointer-events-none absolute inset-0 opacity-70">
                {Array.from({ length: 22 }).map((_, index) => (
                  <span
                    key={index}
                    className="ulavi-particle"
                    style={{
                      left: `${6 + ((index * 13) % 88)}%`,
                      top: `${8 + ((index * 19) % 78)}%`,
                      animationDelay: `${index * 150}ms`
                    }}
                  />
                ))}
              </div>

              <div className="relative mx-auto max-w-4xl">
                <button
                  type="button"
                  onClick={() => setVoiceResponsesEnabled((current) => !current)}
                  className={`absolute right-0 top-0 z-20 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black transition sm:text-sm ${
                    voiceResponsesEnabled
                      ? "border-white bg-white text-[#112E81] shadow-[0_8px_18px_rgba(255,255,255,0.16)]"
                      : "border-white/45 bg-white/18 text-white shadow-[0_8px_18px_rgba(0,0,0,0.08)] hover:bg-white/28"
                  }`}
                  aria-label={`Turn voice responses ${voiceResponsesEnabled ? "off" : "on"}`}
                >
                  {voiceResponsesEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  <span className="hidden sm:inline">Voice Responses</span>
                  {voiceResponsesEnabled ? "ON" : "OFF"}
                </button>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white px-4 py-2 text-sm font-black text-[#112E81] shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
                  <Sparkles size={16} />
                  {languageBadge(draft.language)}
                </div>
                <div className="flex items-center justify-center">
                  <div className="relative grid place-items-center">
                    <VoiceRecorder disabled={isThinking} onVoice={onVoice} onError={onVoiceError} variant="hero" />
                  </div>
                </div>
                <div className="mt-4 text-lg font-black tracking-[0.2em] text-white">{voiceStatus}</div>
                <div className="relative mt-4 flex flex-wrap justify-center gap-2">
                  {mainLanguages.map((language) => {
                    const selected = detectedLanguage(draft.language) === language;
                    return (
                      <button
                        key={language}
                        type="button"
                        onClick={() => onLanguageChange?.(language)}
                        className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                          selected
                            ? "border-white bg-white text-[#112E81] shadow-[0_8px_18px_rgba(255,255,255,0.16)]"
                            : "border-white/45 bg-white/18 text-white shadow-[0_8px_18px_rgba(0,0,0,0.08)] hover:border-white/70 hover:bg-white/28"
                        }`}
                      >
                        {language}
                      </button>
                    );
                  })}
                  <div className="relative" data-chat-menu>
                    <button
                      type="button"
                      onClick={() => setActiveMenu(activeMenu === "languages" ? "" : "languages")}
                      className="grid h-10 w-10 place-items-center rounded-full border border-white/45 bg-white/18 text-white shadow-[0_8px_18px_rgba(0,0,0,0.08)] transition hover:bg-white/28"
                      aria-label="More languages"
                    >
                      <MoreHorizontal size={19} />
                    </button>
                    {activeMenu === "languages" && (
                      <div className="absolute right-0 z-40 mt-3 grid max-h-72 w-60 gap-1 overflow-y-auto rounded-2xl border border-[#112E81]/10 bg-white p-2 text-left shadow-[0_24px_80px_rgba(17,46,129,0.18)]">
                        {moreLanguages.map((language) => (
                          <button
                            key={language}
                            type="button"
                            onClick={() => {
                              onLanguageChange?.(language);
                              setActiveMenu("");
                            }}
                            className="rounded-xl px-3 py-2 text-left text-sm font-bold text-[#212529] transition hover:bg-[#F1F5F9] hover:text-[#112E81]"
                          >
                            {language}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  {visibleServices.map((service) => (
                    <button
                      key={service.title}
                      type="button"
                      onClick={() => onServiceSelect?.(service.title)}
                      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${
                        draft.serviceType === service.title
                          ? "border-white bg-white text-[#112E81] shadow-[0_8px_18px_rgba(255,255,255,0.14)]"
                          : "border-white/45 bg-white/18 text-white shadow-[0_8px_18px_rgba(0,0,0,0.08)] hover:border-white/70 hover:bg-white/28"
                      }`}
                    >
                      {service.title}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-8">
              <div className="mx-auto mb-6 w-fit rounded-full border border-[#112E81]/10 bg-[#F8F9FA] px-4 py-2 text-sm text-[#64748B]">
                Today
              </div>

              <div className="space-y-6">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={`${message.role}-${index}-${message.content.slice(0, 12)}`}
                    message={message}
                    voiceResponsesEnabled={voiceResponsesEnabled}
                  />
                ))}
                {isThinking && (
                  <div className="flex justify-start">
                    <div className="rounded-[24px] border border-[#112E81]/10 bg-[#F8F9FA] px-5 py-4 text-[#212529] shadow-[0_18px_50px_rgba(17,46,129,0.1)]">
                      <div className="mb-2">Generating travel assistance...</div>
                      <span className="inline-flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-[#0066DA]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-[#0066DA] [animation-delay:120ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-[#0066DA] [animation-delay:240ms]" />
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messageEndRef} />
              </div>
            </div>

            <form onSubmit={submit} className="shrink-0 border-t border-[#112E81]/10 bg-white p-4 sm:p-5">
              {error && <div className="mb-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
              <div className="relative flex items-center gap-3 rounded-[28px] border border-[#112E81]/10 bg-[#F8F9FA] p-3 shadow-[0_18px_50px_rgba(17,46,129,0.1)]">
                <input
                  ref={inputRef}
                  value={text}
                  disabled={isThinking}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Speak or type your request..."
                  className="h-12 min-w-0 flex-1 bg-transparent px-2 text-base text-[#212529] outline-none placeholder:text-[#64748B]"
                />
                <Keyboard size={22} className="hidden text-[#64748B] sm:block" />
                <button
                  disabled={isThinking || !text.trim()}
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#0066DA] text-white transition hover:bg-[#112E81] disabled:cursor-not-allowed disabled:opacity-45"
                  aria-label="Send message"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </main>

          <div className="lg:sticky lg:top-4 lg:self-start">
            <SummaryPanel
              draft={draft}
              missingFields={missingFields}
              progress={progress}
              requiredFields={requiredFields}
              onReview={onReview}
              onEdit={editField}
            />
            {readyForReview && (
              <button
                onClick={onReview}
                className="mt-4 w-full rounded-2xl bg-[#0066DA] px-5 py-4 text-sm font-bold text-white shadow-[0_12px_28px_rgba(0,102,218,0.18)] transition hover:bg-[#112E81]"
              >
                Review collected details
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
