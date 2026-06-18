import { Globe2, Languages } from "lucide-react";

const languageNames = [
  "English",
  "தமிழ்",
  "Tanglish",
  "हिन्दी",
  "Français",
  "العربية",
  "Malay",
  "中文",
  "日本語",
  "한국어",
  "اردو",
  "বাংলা",
  "తెలుగు",
  "ಕನ್ನಡ",
  "മലയാളം"
];

export default function AppRail({ language = "English", onLanguageChange }) {
  return (
    <aside className="hidden min-h-[calc(100vh-24px)] w-72 shrink-0 flex-col justify-between rounded-[28px] border border-white/15 bg-black/58 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl xl:flex">
      <div>
        <div className="mb-9 w-full text-left">
          <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl border border-champagne/35 bg-champagne/10 text-3xl font-black text-champagne">
            U
          </div>
          <div className="text-center text-4xl font-semibold tracking-[0.18em] text-white">ULAVI</div>
          <div className="mt-1 text-center text-sm tracking-[0.44em] text-champagne">VOCIS</div>
          <div className="mt-4 text-center text-xs uppercase tracking-[0.16em] text-white/45">
            AI voice travel assistant
          </div>
        </div>

        <div className="rounded-3xl border border-blue-400/25 bg-blue-600/12 p-5 shadow-[0_0_35px_rgba(58,104,255,0.18)]">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">Concierge mode</div>
          <div className="mt-3 text-2xl font-bold text-white">Voice-first</div>
          <p className="mt-2 text-sm leading-6 text-white/55">
            Speak naturally. Vocis detects, collects, and summarizes while keeping your language.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <button
          type="button"
          onClick={() => onLanguageChange?.(language === "English" ? "Tamil" : "English")}
          className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white"
        >
          <div className="flex items-center gap-3">
            <Globe2 size={22} />
            <span>{language || "English"}</span>
          </div>
          <span className="text-white/45">⌄</span>
        </button>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-4 flex items-center gap-3 text-white">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-500/20 text-blue-200">
              <Languages size={18} />
            </div>
            <div className="font-semibold">We speak your language</div>
          </div>
          <div className="text-sm leading-6 text-white/58">15+ languages supported</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {["🇬🇧", "🇮🇳", "🇲🇾", "🇫🇷", "🇨🇳"].map((flag) => (
              <span key={flag} className="grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-black/35 text-lg">
                {flag}
              </span>
            ))}
            <span className="grid h-8 min-w-8 place-items-center rounded-full border border-white/20 bg-white/10 px-2 text-xs text-white">+10</span>
          </div>
          <div className="mt-4 flex max-h-24 flex-wrap gap-2 overflow-hidden">
            {languageNames.slice(0, 10).map((item) => (
              <button
                key={item}
                onClick={() => onLanguageChange?.(item)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 hover:text-white"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
