import { extractFieldValue } from "./BookingEntityExtractor.js";
import { LocationAliasDictionary } from "./LocationAliasDictionary.js";
import { resolveAirport } from "./AirportResolver.js";

const fillerWords = [
  "poganum", "poanum", "ponum", "pogum", "poga", "varanum", "varaikum", "varai", "irunthu", "irundhu",
  "to", "towards", "reach", "drop", "dropoff", "drop off", "pickup", "pick up", "collect", "take me", "leave me",
  "jana hai", "tak", "se", "ko", "drop karna", "pickup karna",
  "போகணும்", "போகனும்", "போனும்", "வரைக்கும்", "வரை", "இருந்து", "லிருந்து", "ட்ராப்", "டிராப்", "பிக்கப்", "பிக்", "பண்ணு", "பண்ணிக்கோ",
  "जाना", "जाना है", "तक", "से", "को", "ड्रॉप", "पिकअप",
  "aller", "jusqu", "vers", "deposer", "prise en charge"
];

function normalize(value) {
  return String(value || "").normalize("NFKC").replace(/[.,!?;]+/g, " ").replace(/\s+/g, " ").trim();
}

function stripFillers(value) {
  let output = ` ${normalize(value)} `;
  for (const word of fillerWords) {
    output = output.replace(new RegExp(`\\s${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s`, "giu"), " ");
  }
  return output.replace(/\s+/g, " ").trim();
}

function titleCase(value) {
  return normalize(value)
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function resolveLocation(value, { field = "" } = {}) {
  const raw = normalize(value);
  if (!raw) return { value: "", type: "", confidence: 0, valid: false };

  const airport = resolveAirport(raw);
  if (airport.valid) return airport;

  const extracted = field ? extractFieldValue(field, raw) : extractFieldValue("pickupLocation", raw) || extractFieldValue("dropoffLocation", raw);
  if (extracted && extracted !== raw) {
    const resolved = resolveLocation(extracted);
    return resolved.valid ? resolved : { value: extracted, type: "location", confidence: 0.78, valid: true, source: "entity_extractor" };
  }

  const lower = raw.toLowerCase();
  for (const [normalizedValue, aliases] of Object.entries(LocationAliasDictionary)) {
    const matched = [normalizedValue, ...aliases].find((alias) => {
      const candidate = String(alias || "").toLowerCase();
      return candidate && (lower === candidate || lower.includes(candidate));
    });
    if (matched) {
      return { value: normalizedValue, type: "city", confidence: lower === String(matched).toLowerCase() ? 0.98 : 0.88, valid: true, source: "location_alias" };
    }
  }

  const cleaned = stripFillers(raw);
  if (!cleaned || /^(hello|hi|vanakkam|ok|yes|no)$/i.test(cleaned)) return { value: "", type: "", confidence: 0, valid: false };
  if (/\d{4,}/.test(cleaned)) return { value: "", type: "", confidence: 0, valid: false };

  return {
    value: /[^\u0000-\u007F]/.test(cleaned) ? cleaned : titleCase(cleaned),
    type: "location",
    confidence: cleaned !== raw ? 0.72 : 0.58,
    valid: cleaned.length >= 3,
    source: "cleaned_text"
  };
}

