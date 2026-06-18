import { extractBookingEntities, extractFieldValue, normalizeBookingDraft } from "./BookingEntityExtractor.js";
import { detectTravelLanguage } from "./LanguageDetectionService.js";
import { detectTravelIntent } from "./TravelIntentDetector.js";
import { resolveLocation } from "./LocationResolver.js";
import { normalizeTravelDate, normalizeTravelTime } from "./DateTimeNormalizer.js";
import { normalizeEmail } from "./EmailNormalizer.js";
import { normalizePhone } from "./PhoneNormalizer.js";
import { extractTravelEntitiesWithOpenAI } from "./openaiService.js";

function compact(value) {
  return String(value || "").trim();
}

function cleanEntities(entities = {}) {
  const output = {};
  for (const [key, value] of Object.entries(entities)) {
    if (value !== null && value !== undefined && String(value).trim()) output[key] = String(value).trim();
  }
  return output;
}

function hasNameSignal(text, targetField = "") {
  return targetField === "name" ||
    /\b(?:my\s+name\s+is|name\s+is|i\s+am|i'm|this\s+is|call\s+me|booking\s+(?:name\s+)?(?:is|for|under|in)|book\s+(?:it\s+)?(?:for|under|in)|contact\s+name|customer\s+name|update\s+(?:the\s+)?(?:contact\s+)?name|change\s+(?:the\s+)?(?:contact\s+)?name|set\s+(?:the\s+)?(?:contact\s+)?name)\b/i.test(text) ||
    /(பெயர்|பேர்|பெயரில்|நேமில்|புக்கிங்)/u.test(text);
}

function cleanNameValue(value) {
  return String(value || "")
    .replace(/^\s*(?:the|new|contact|customer|booking)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveRuleEntities(text, { draft = {}, targetField = "", fallbackLanguage = "English" } = {}) {
  const language = detectTravelLanguage(text, fallbackLanguage);
  const intent = detectTravelIntent(text, draft.serviceType || "");
  const rule = extractBookingEntities(text, { targetField });
  const allowName = hasNameSignal(text, targetField);
  const locationInput = /\bairport\b|விமான|एयरपोर्ट|aeroport/i.test(text) ? text : "";
  const entities = {
    service: intent.serviceType || "",
    language: language.language,
    pickupLocation: rule.pickupLocation,
    dropoffLocation: rule.dropoffLocation,
    date: normalizeTravelDate(text) || rule.date,
    time: normalizeTravelTime(text) || rule.time,
    passengers: rule.passengers,
    name: allowName ? cleanNameValue(rule.name) : "",
    whatsapp: normalizePhone(text) || rule.whatsapp,
    email: normalizeEmail(text) || rule.email
  };

  if (targetField === "pickup" || targetField === "pickupLocation") {
    entities.pickupLocation = resolveLocation(locationInput || extractFieldValue("pickupLocation", text) || text, { field: "pickupLocation" }).value;
  }
  if (targetField === "dropoff" || targetField === "dropoffLocation") {
    entities.dropoffLocation = resolveLocation(extractFieldValue("dropoffLocation", text) || text, { field: "dropoffLocation" }).value;
  }
  if (targetField === "date") entities.date = normalizeTravelDate(text) || extractFieldValue("date", text) || entities.date;
  if (targetField === "time") entities.time = normalizeTravelTime(text) || extractFieldValue("time", text) || entities.time;
  if (targetField === "passengers") entities.passengers = extractFieldValue("passengers", text) || entities.passengers;
  if (targetField === "name") entities.name = cleanNameValue(extractFieldValue("name", text) || entities.name);
  if (targetField === "phone" || targetField === "whatsapp") entities.whatsapp = normalizePhone(text) || extractFieldValue("whatsapp", text) || entities.whatsapp;
  if (targetField === "email") entities.email = normalizeEmail(text) || extractFieldValue("email", text) || entities.email;
  if (rule.pickupLocation) entities.pickupLocation = resolveLocation(rule.pickupLocation, { field: "pickupLocation" }).value || rule.pickupLocation;
  if (rule.dropoffLocation) entities.dropoffLocation = resolveLocation(rule.dropoffLocation, { field: "dropoffLocation" }).value || rule.dropoffLocation;

  return {
    language,
    intent,
    entities: cleanEntities(entities)
  };
}

export async function extractTravelEntities({
  text,
  draft = {},
  messages = [],
  targetField = "",
  supportedLanguages = [],
  services = [],
  useOpenAI = false
} = {}) {
  const ruleResult = resolveRuleEntities(text, {
    draft,
    targetField,
    fallbackLanguage: draft.language || "English"
  });

  let openAiEntities = {};
  if (useOpenAI) {
    try {
      const structured = await extractTravelEntitiesWithOpenAI({
        text,
        draft,
        messages,
        supportedLanguages,
        services
      });
      openAiEntities = cleanEntities({
        service: structured?.service || structured?.serviceType,
        pickupLocation: structured?.pickupLocation,
        dropoffLocation: structured?.dropoffLocation,
        date: structured?.date,
        time: structured?.time,
        passengers: structured?.passengers,
        luggage: structured?.luggage,
        name: structured?.name,
        whatsapp: structured?.whatsapp || structured?.phone,
        email: structured?.email
      });
    } catch (err) {
      console.warn("OpenAI entity extraction fallback:", err.message);
    }
  }

  const merged = cleanEntities({ ...openAiEntities, ...ruleResult.entities });
  const normalized = normalizeBookingDraft({
    serviceType: compact(merged.service),
    pickup: compact(merged.pickupLocation),
    dropoff: compact(merged.dropoffLocation),
    date: compact(merged.date),
    time: compact(merged.time),
    passengers: compact(merged.passengers),
    name: compact(merged.name),
    phone: compact(merged.whatsapp),
    email: compact(merged.email),
    notes: compact(merged.luggage),
    language: ruleResult.language.language
  });

  return {
    ...ruleResult,
    entities: cleanEntities({
      service: normalized.serviceType,
      pickupLocation: normalized.pickup,
      dropoffLocation: normalized.dropoff,
      date: normalized.date,
      time: normalized.time,
      passengers: normalized.passengers,
      name: normalized.name,
      whatsapp: normalized.phone,
      email: normalized.email,
      luggage: normalized.notes,
      language: normalized.language
    })
  };
}
