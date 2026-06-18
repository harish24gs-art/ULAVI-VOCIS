import { normalizeBookingDraft } from "./BookingEntityExtractor.js";

const draftKeyMap = {
  service: "serviceType",
  serviceType: "serviceType",
  pickupLocation: "pickup",
  pickup: "pickup",
  dropoffLocation: "dropoff",
  dropoff: "dropoff",
  date: "date",
  time: "time",
  passengers: "passengers",
  luggage: "notes",
  name: "name",
  whatsapp: "phone",
  phone: "phone",
  email: "email",
  equipment: "equipment",
  packageHours: "packageHours"
};

function validValue(key, value) {
  const text = String(value || "").trim();
  if (!text) return false;
  if (/^(hello|hi|hey|vanakkam|ok|okay|yes|no)$/i.test(text)) return false;
  if ((key === "pickup" || key === "dropoff") && /\d{5,}/.test(text)) return false;
  if (key === "email") return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(text);
  if (key === "phone") return text.replace(/\D/g, "").length >= 8;
  if (key === "passengers") return Number(text) > 0 || /\d/.test(text);
  return true;
}

export function mergeValidatedEntities(currentDraft = {}, entities = {}, { force = false } = {}) {
  const next = { ...currentDraft };
  for (const [entityKey, rawValue] of Object.entries(entities || {})) {
    const draftKey = draftKeyMap[entityKey];
    if (!draftKey) continue;
    const value = String(rawValue || "").trim();
    if (!validValue(draftKey, value)) continue;
    if (force || !next[draftKey]) next[draftKey] = value;
  }
  return normalizeBookingDraft(next);
}

