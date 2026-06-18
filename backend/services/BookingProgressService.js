import { normalizeBookingDraft } from "./BookingEntityExtractor.js";

export function buildBookingProgress(draft = {}, requiredFields = []) {
  const normalizedDraft = normalizeBookingDraft(draft);
  const fields = requiredFields.length ? requiredFields : Object.keys(normalizedDraft).filter((field) => field !== "language");
  const collected = fields
    .filter((field) => String(normalizedDraft[field] || "").trim())
    .map((field) => ({ field, value: normalizedDraft[field] }));
  const missing = fields.filter((field) => !String(normalizedDraft[field] || "").trim());
  const total = Math.max(1, fields.length);
  return {
    draft: normalizedDraft,
    requiredFields: fields,
    collected,
    missing,
    progress: {
      filled: collected.length,
      total: fields.length,
      percent: Math.round((collected.length / total) * 100)
    }
  };
}

