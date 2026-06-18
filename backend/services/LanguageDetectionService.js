import { languageSpecificDictionary, supportedTravelLanguages } from "./TravelEntityDictionary.js";

const scriptSignals = [
  { language: "Tamil", pattern: /[\u0B80-\u0BFF]/u, weight: 0.96 },
  { language: "Malayalam", pattern: /[\u0D00-\u0D7F]/u, weight: 0.96 },
  { language: "Kannada", pattern: /[\u0C80-\u0CFF]/u, weight: 0.96 },
  { language: "Telugu", pattern: /[\u0C00-\u0C7F]/u, weight: 0.96 },
  { language: "Bengali", pattern: /[\u0980-\u09FF]/u, weight: 0.96 },
  { language: "Hindi", pattern: /[\u0900-\u097F]/u, weight: 0.9 },
  { language: "Urdu", pattern: /[\u0600-\u06FF]/u, weight: 0.9 },
  { language: "Arabic", pattern: /[\u0600-\u06FF]/u, weight: 0.86 },
  { language: "Chinese", pattern: /[\u4E00-\u9FFF]/u, weight: 0.96 },
  { language: "Japanese", pattern: /[\u3040-\u30FF]/u, weight: 0.96 },
  { language: "Korean", pattern: /[\uAC00-\uD7AF]/u, weight: 0.96 }
];

const romanSignals = {
  Tanglish: [
    "poganum", "venum", "irunthu", "varaikum", "pannunga", "pannu", "enga", "ethana", "peru", "vanakkam",
    "maathu", "maatru", "badhilaga", "pathu", "kaalai", "maalai"
  ],
  Hindi: ["jana hai", "chahiye", "subah", "shaam", "raat", "kitne", "log", "naam", "badal do", "haan", "nahi"],
  French: ["bonjour", "merci", "aeroport", "prise en charge", "deposer", "chauffeur", "combien", "demain"],
  Malay: ["nak", "pergi", "hantar", "ambil", "kereta", "lapangan", "terima kasih"],
  English: ["need", "pickup", "drop", "airport", "transfer", "passengers", "tomorrow", "morning", "email", "whatsapp"]
};

function normalizeText(value) {
  return String(value || "").normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
}

function dictionaryScore(language, text) {
  const dictionary = languageSpecificDictionary[language] || {};
  const expressions = Object.values(dictionary).flat().slice(0, 180);
  if (!expressions.length) return 0;
  const hits = expressions.filter((entry) => {
    const candidate = String(entry || "").toLowerCase();
    return candidate.length >= 2 && text.includes(candidate);
  }).length;
  return Math.min(0.28, hits * 0.035);
}

export function detectTravelLanguage(text, fallback = "English") {
  const normalized = normalizeText(text);
  if (!normalized) return { language: fallback || "English", confidence: 0.35, signals: ["empty"] };

  const scored = new Map();
  const signals = [];

  for (const signal of scriptSignals) {
    if (signal.pattern.test(text)) {
      scored.set(signal.language, Math.max(scored.get(signal.language) || 0, signal.weight));
      signals.push(`script:${signal.language}`);
    }
  }

  for (const [language, terms] of Object.entries(romanSignals)) {
    const hits = terms.filter((term) => normalized.includes(term)).length;
    if (hits) {
      scored.set(language, Math.max(scored.get(language) || 0, Math.min(0.82, 0.42 + hits * 0.09)));
      signals.push(`roman:${language}:${hits}`);
    }
  }

  for (const language of supportedTravelLanguages) {
    const score = dictionaryScore(language, normalized);
    if (score) scored.set(language, Math.max(scored.get(language) || 0, 0.38 + score));
  }

  if (!scored.size) {
    return { language: fallback || "English", confidence: fallback ? 0.46 : 0.52, signals: ["fallback"] };
  }

  const [language, confidence] = [...scored.entries()].sort((a, b) => b[1] - a[1])[0];
  return {
    language,
    confidence: Number(Math.min(0.98, confidence).toFixed(2)),
    signals
  };
}

