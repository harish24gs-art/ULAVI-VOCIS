import { extractEmail } from "./BookingEntityExtractor.js";

export function normalizeEmail(value) {
  const direct = extractEmail(value);
  if (direct) return direct.toLowerCase();
  const text = String(value || "")
    .toLowerCase()
    .replace(/\s+at\s+/g, "@")
    .replace(/\s+dot\s+/g, ".")
    .replace(/\s+/g, "");
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(text) ? text : "";
}

