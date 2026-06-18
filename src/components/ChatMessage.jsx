import { motion } from "framer-motion";
import { CheckCheck, Square, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";

const languageCodes = {
  English: "en-US",
  Tamil: "ta-IN",
  Tanglish: "en-IN",
  Hindi: "hi-IN",
  French: "fr-FR",
  Arabic: "ar-SA",
  Malay: "ms-MY",
  Chinese: "zh-CN",
  Japanese: "ja-JP",
  Korean: "ko-KR",
  Urdu: "ur-PK",
  Malayalam: "ml-IN",
  Telugu: "te-IN",
  Kannada: "kn-IN",
  Bengali: "bn-IN",
  Vietnamese: "vi-VN"
};

export default function ChatMessage({ message, voiceResponsesEnabled = true }) {
  const isUser = message.role === "user";
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (isSpeaking && window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [isSpeaking]);

  function stopSpeaking() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }

  function listen() {
    if (!message.content) return;
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") {
      setIsSpeaking(true);
      window.setTimeout(() => setIsSpeaking(false), 1400);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.content);
    utterance.lang = languageCodes[message.language] || "en-US";
    utterance.rate = 0.94;
    utterance.pitch = 1;
    utterance.onend = () => window.setTimeout(() => setIsSpeaking(false), 1600);
    utterance.onerror = () => window.setTimeout(() => setIsSpeaking(false), 900);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`max-w-[min(720px,86%)] ${isUser ? "text-right" : "text-left"}`}>
        <div
          className={`rounded-[24px] px-5 py-4 text-[15px] leading-7 shadow-[0_16px_40px_rgba(17,46,129,0.1)] ${
            isUser
              ? "border border-[#0066DA]/20 bg-[#112E81] text-white"
              : "border border-[#112E81]/10 bg-white text-[#212529]"
          }`}
        >
          {message.content}
        </div>
        <div className={`mt-2 flex items-center gap-2 text-xs text-[#64748B] ${isUser ? "justify-end" : "justify-start"}`}>
          <span>{message.time || "10:30 AM"}</span>
          {isUser && <CheckCheck size={14} className="text-[#0066DA]" />}
          {!isUser && message.language && <span className="font-semibold text-[#0066DA]">{message.language}</span>}
          {!isUser && voiceResponsesEnabled && (
            <button
              type="button"
              onClick={isSpeaking ? stopSpeaking : listen}
              className="inline-flex items-center gap-1 rounded-full border border-[#112E81]/10 bg-white px-2 py-1 text-[11px] font-bold text-[#475569] transition hover:border-[#0066DA]/35 hover:text-[#112E81]"
            >
              {isSpeaking ? <Square size={11} /> : <Volume2 size={12} />}
              {isSpeaking ? "Stop" : "Listen"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
