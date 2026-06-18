import { completeConversation, transcribeAudio } from "./openaiService.js";
import {
  applyBookingEditCommand,
  extractBookingEntities,
  extractFieldValue,
  isEditCommand as isBookingEditCommand,
  normalizeBookingDraft
} from "./BookingEntityExtractor.js";
import { buildBookingProgress } from "./BookingProgressService.js";
import { mergeValidatedEntities } from "./ConversationMemoryManager.js";
import { extractTravelEntities } from "./TravelEntityExtractor.js";
import {
  extractEmailPhrase,
  extractKnownPlace,
  extractNamePhrase,
  extractRoutePlaces,
  numberFromLanguage,
  parseDatePhrase,
  parsePackageHoursPhrase,
  parsePassengerPhrase,
  parsePhonePhrase,
  parseTimePhrase
} from "./languageUnderstanding.js";
import { inferPhoneCountry, phoneValidationMessage, validatePhoneForTravel } from "./PhoneValidationRules.js";

export const supportedLanguages = [
  "English",
  "Tamil",
  "Tanglish",
  "Hindi",
  "French",
  "Arabic",
  "Malay",
  "Chinese",
  "Japanese",
  "Korean",
  "Urdu",
  "Bengali",
  "Telugu",
  "Kannada",
  "Malayalam"
];

export const serviceTypes = [
  "Airport Transfer",
  "Ground Transfer",
  "Long Distance Transfer",
  "Cross Border Transfer",
  "Day / Hourly Packages",
  "Tour Packages",
  "Medical Equipment Transfer"
];

const commonRequired = ["serviceType", "pickup", "dropoff", "date"];
const serviceRequired = {
  "Airport Transfer": [...commonRequired, "time", "passengers", "name", "phone", "email"],
  "Ground Transfer": [...commonRequired, "time", "passengers", "name", "phone", "email"],
  "Long Distance Transfer": [...commonRequired, "time", "passengers", "name", "phone", "email"],
  "Cross Border Transfer": [...commonRequired, "time", "passengers", "name", "phone", "email"],
  "Day / Hourly Packages": [...commonRequired, "time", "passengers", "packageHours", "name", "phone", "email"],
  "Tour Packages": [...commonRequired, "passengers", "name", "phone", "email"],
  "Medical Equipment Transfer": [...commonRequired, "time", "equipment", "name", "phone", "email"]
};

const questionCopy = {
  English: {
    serviceType: "Which transport service should we arrange? 🚘",
    name: "Lovely, who is this booking for? 😊",
    phone: "What WhatsApp number should we use for confirmation? 📱",
    email: "Which email should receive the confirmation? 📩",
    pickup: "Great, where should the pickup be? 📍",
    dropoff: "Nice. Where should we drop you off? 🛣️",
    date: "What date should we arrange this for? 🗓️",
    time: "What pickup time works best? ⏰",
    passengers: "How many passengers will travel? 👥",
    equipment: "What medical equipment needs to be transferred? 🧰",
    packageHours: "How many hours should the chauffeur package cover? ⏳"
  },
  Tamil: {
    serviceType: "எந்த போக்குவரத்து சேவை வேண்டும்? 🚘",
    name: "சரி, இந்த booking யாருடைய பெயரில் செய்யலாம்? 😊",
    phone: "உறுதிப்படுத்த WhatsApp எண் என்ன? 📱",
    email: "Confirmation அனுப்ப வேண்டிய email என்ன? 📩",
    pickup: "Pickup இடம் எங்கே? 📍",
    dropoff: "Dropoff இடம் எங்கே? 🛣️",
    date: "எந்த தேதிக்கு ஏற்பாடு செய்யலாம்? 🗓️",
    time: "Pickup நேரம் என்ன? ⏰",
    passengers: "எத்தனை பேர் பயணம் செய்கிறார்கள்? 👥",
    equipment: "எந்த medical equipment transfer செய்ய வேண்டும்? 🧰",
    packageHours: "Chauffeur package எத்தனை மணிநேரம் வேண்டும்? ⏳"
  },
  Tanglish: {
    serviceType: "Entha transport service arrange pannalam? 🚘",
    name: "Super, booking yar name la podalam? 😊",
    phone: "Confirmation ku WhatsApp number enna? 📱",
    email: "Confirmation email enga send pannalam? 📩",
    pickup: "Nice, pickup enga irukkum? 📍",
    dropoff: "Dropoff location enga? 🛣️",
    date: "Entha date ku arrange pannalam? 🗓️",
    time: "Pickup time enna? ⏰",
    passengers: "Ethana passengers travel pannuvanga? 👥",
    equipment: "Enna medical equipment transfer panna vendum? 🧰",
    packageHours: "Chauffeur package ethana hours venum? ⏳"
  },
  Hindi: {
    serviceType: "Kaunsi transport service arrange karni hai? 🚘",
    name: "Badhiya, booking kis naam se karni hai? 😊",
    phone: "Confirmation ke liye WhatsApp number kya hai? 📱",
    email: "Confirmation email kis address par bhejein? 📩",
    pickup: "Pickup location kya hai? 📍",
    dropoff: "Dropoff location kya hai? 🛣️",
    date: "Kis date ke liye arrange karna hai? 🗓️",
    time: "Pickup time kya rahega? ⏰",
    passengers: "Kitne passengers travel karenge? 👥",
    equipment: "Kaunsa medical equipment transfer karna hai? 🧰",
    packageHours: "Chauffeur package kitne hours ke liye chahiye? ⏳"
  },
  French: {
    serviceType: "Quel service de transport devons-nous organiser ? 🚘",
    name: "Tres bien, a quel nom devons-nous faire la reservation ? 😊",
    phone: "Quel numero WhatsApp utiliser pour la confirmation ? 📱",
    email: "A quelle adresse email envoyer la confirmation ? 📩",
    pickup: "Parfait, quel est le lieu de prise en charge ? 📍",
    dropoff: "Ou devons-nous vous deposer ? 🛣️",
    date: "Pour quelle date devons-nous organiser cela ? 🗓️",
    time: "Quelle heure de prise en charge convient ? ⏰",
    passengers: "Combien de passagers voyageront ? 👥",
    equipment: "Quel equipement medical doit etre transporte ? 🧰",
    packageHours: "Pour combien d'heures faut-il reserver le chauffeur ? ⏳"
  }
};

function normalize(value) {
  return String(value || "").trim();
}

const monthNames = {
  january: 1,
  jan: 1,
  february: 2,
  feb: 2,
  march: 3,
  mar: 3,
  april: 4,
  apr: 4,
  may: 5,
  june: 6,
  jun: 6,
  july: 7,
  jul: 7,
  august: 8,
  aug: 8,
  september: 9,
  sep: 9,
  sept: 9,
  october: 10,
  oct: 10,
  november: 11,
  nov: 11,
  december: 12,
  dec: 12,
  "\u0B9C\u0BA9\u0BB5\u0BB0\u0BBF": 1,
  "\u0BAA\u0BBF\u0BAA\u0BCD\u0BB0\u0BB5\u0BB0\u0BBF": 2,
  "\u0BAE\u0BBE\u0BB0\u0BCD\u0B9A\u0BCD": 3,
  "\u0B8F\u0BAA\u0BCD\u0BB0\u0BB2\u0BCD": 4,
  "\u0BAE\u0BC7": 5,
  "\u0B9C\u0BC2\u0BA9\u0BCD": 6,
  "\u0B9C\u0BC2\u0BB2\u0BC8": 7,
  "\u0B86\u0B95\u0BB8\u0BCD\u0B9F\u0BCD": 8,
  "\u0B9A\u0BC6\u0BAA\u0BCD\u0B9F\u0BAE\u0BCD\u0BAA\u0BB0\u0BCD": 9,
  "\u0B85\u0B95\u0BCD\u0B9F\u0BCB\u0BAA\u0BB0\u0BCD": 10,
  "\u0BA8\u0BB5\u0BAE\u0BCD\u0BAA\u0BB0\u0BCD": 11,
  "\u0B9F\u0BBF\u0B9A\u0BAE\u0BCD\u0BAA\u0BB0\u0BCD": 12
};

const numberWords = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  ezhu: 7,
  onnu: 1,
  rendu: 2,
  moonu: 3,
  naalu: 4,
  anju: 5,
  aaru: 6,
  elu: 7,
  ettu: 8,
  onbadhu: 9,
  pathu: 10,
  pathinonnu: 11,
  pannirendu: 12,
  "\u0B92\u0BA9\u0BCD\u0BB1\u0BC1": 1,
  "\u0B87\u0BB0\u0BA3\u0BCD\u0B9F\u0BC1": 2,
  "\u0BAE\u0BC2\u0BA9\u0BCD\u0BB1\u0BC1": 3,
  "\u0BA8\u0BBE\u0BA9\u0BCD\u0B95\u0BC1": 4,
  "\u0B90\u0BA8\u0BCD\u0BA4\u0BC1": 5,
  "\u0B86\u0BB1\u0BC1": 6,
  "\u0B8F\u0BB4\u0BC1": 7,
  "\u0B8E\u0B9F\u0BCD\u0B9F\u0BC1": 8,
  "\u0B92\u0BA9\u0BCD\u0BAA\u0BA4\u0BC1": 9,
  "\u0BAA\u0BA4\u0BCD\u0BA4\u0BC1": 10,
  "\u0BAA\u0BA4\u0BBF\u0BA9\u0BCA\u0BA9\u0BCD\u0BB1\u0BC1": 11,
  "\u0BAA\u0BA4\u0BBF\u0BA9\u0BCB\u0BB0\u0BBE\u0BAE\u0BCD": 11,
  "\u0BAA\u0BA4\u0BBF\u0BA9\u0BCB\u0BB1\u0BBE\u0BAE\u0BCD": 11,
  "\u0BAA\u0BA9\u0BCD\u0BA9\u0BBF\u0BB0\u0BC6\u0BA3\u0BCD\u0B9F\u0BC1": 12,
  "\u0BAA\u0BA9\u0BCD\u0BA9\u0BBF\u0BB0\u0BC6\u0BA3\u0BCD\u0B9F\u0BBE\u0BAE\u0BCD": 12,
  "\u0B9F\u0BC6\u0BA9\u0BCD": 10,
  "\u0B9A\u0BC6\u0BB5\u0BA9\u0BCD": 7
};

function numberFromWords(text) {
  const lower = normalize(text).toLowerCase();
  const digit = lower.match(/\b\d{1,4}\b/)?.[0];
  if (digit) return Number(digit);
  return numberWordOnly(lower);
}

function numberWordOnly(text) {
  const lower = normalize(text).toLowerCase();
  return Object.entries(numberWords)
    .map(([word, value]) => ({ value, index: lower.indexOf(word.toLowerCase()) }))
    .filter((match) => match.index >= 0)
    .sort((a, b) => a.index - b.index)[0]?.value || null;
}

function numberNearKeyword(text, keywordPattern) {
  const value = normalize(text);
  const match = value.match(new RegExp(`(.{0,48})\\b(?:${keywordPattern})\\b`, "i"));
  const nearby = match?.[1] || value;
  const candidates = [];
  for (const digitMatch of nearby.matchAll(/\b\d{1,3}\b/g)) {
    candidates.push({ value: Number(digitMatch[0]), index: digitMatch.index || 0 });
  }
  for (const [word, value] of Object.entries(numberWords)) {
    const index = nearby.toLowerCase().indexOf(word.toLowerCase());
    if (index >= 0) candidates.push({ value, index });
  }
  return candidates.sort((a, b) => b.index - a.index)[0]?.value || null;
}

function compactDate(day, month, year = "2026") {
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y)) return "";
  if (d < 1 || d > 31 || m < 1 || m > 12 || y < 2024 || y > 2100) return "";
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function parseNaturalDate(text) {
  const value = normalize(text);
  const bookingDate = extractFieldValue("date", value);
  if (bookingDate) return bookingDate;
  const languageDate = parseDatePhrase(value);
  if (languageDate) return languageDate;
  const lower = value.toLowerCase();
  if (/tomorrow/i.test(value)) return "Tomorrow";
  if (/today/i.test(value)) return "Today";
  const numeric = value.match(/\b(\d{1,2})[./-](\d{1,2})(?:[./-](\d{2,4}))?\b/);
  if (numeric) return compactDate(numeric[1], numeric[2], numeric[3] || "2026");
  for (const [monthName, month] of Object.entries(monthNames)) {
    if (lower.includes(monthName.toLowerCase())) {
      const beforeMonth = lower.split(monthName.toLowerCase())[0];
      const afterMonth = lower.split(monthName.toLowerCase()).slice(1).join(monthName.toLowerCase());
      const day = numberFromWords(beforeMonth) || numberFromWords(afterMonth);
      const yearMatch = value.match(/\b(20\d{2})\b/)?.[1];
      if (day) return compactDate(day, month, yearMatch || "2026");
    }
  }
  return "";
}

function parseNaturalTime(text, { allowLoose = false } = {}) {
  const value = normalize(text);
  const bookingTime = extractFieldValue("time", value);
  if (bookingTime) return bookingTime;
  const languageTime = parseTimePhrase(value);
  if (languageTime) return languageTime;
  const meridiem = /\b(pm|evening|night)\b/i.test(value) || /(ஈவ்னிங்|நைட்)/.test(value) ? "PM" : "AM";
  const explicit = value.match(/\b(\d{1,2})(?::(\d{2})|\.(\d{1,2}))?\s*(am|pm)\b/i);
  if (explicit) {
    return `${Number(explicit[1])}:${String(explicit[2] || explicit[3] || "00").padStart(2, "0")} ${explicit[4].toUpperCase()}`;
  }
  const looseClock = value.match(/\b(\d{1,2})(?::(\d{2})|\.(\d{1,2}))\b/);
  if (allowLoose && looseClock) {
    return `${Number(looseClock[1])}:${String(looseClock[2] || looseClock[3] || "00").padStart(2, "0")} ${meridiem}`;
  }
  const oclock = value.match(/\b(\d{1,2})(?::(\d{2})|\.(\d{1,2}))?\s*(?:o'?clock|clock)\b/i);
  const wordNumber = numberWordOnly(value) || (allowLoose ? numberFromWords(value) : null);
  const hour = oclock ? Number(oclock[1]) : wordNumber;
  const hasTimeSignal = allowLoose || /\b(morning|afternoon|evening|night|am|pm|clock|o'?clock|time|pickup time)\b/i.test(value) || /(மார்னிங்|ஆப்டர்நூன்|ஈவ்னிங்|நைட்|கிளாக்|ஓக்ளாக்|நேரம்)/.test(value);
  if (hasTimeSignal && hour && hour >= 1 && hour <= 12) {
    const minutes = oclock ? String(oclock[2] || oclock[3] || "00").padStart(2, "0") : "00";
    return `${hour}:${minutes} ${meridiem}`;
  }
  if (/^(morning|afternoon|evening|night)$/i.test(value)) return titleCase(value);
  return "";
}

function detectLanguage(text) {
  if (!text) return "";
  if (/[\u0B80-\u0BFF]/.test(text)) return "Tamil";
  if (/[\u0D00-\u0D7F]/.test(text)) return "Malayalam";
  if (/[\u0900-\u097F]/.test(text)) return "Hindi";
  if (/[\u0600-\u06FF]/.test(text)) return "Urdu";
  if (/[\u4E00-\u9FFF]/.test(text)) return "Chinese";
  if (/[\u3040-\u30FF]/.test(text)) return "Japanese";
  if (/[\uAC00-\uD7AF]/.test(text)) return "Korean";
  if (/\b(venum|iruku|irukka|enna|enga|la|ku|pannalam|sollunga|pickup venum|romba|semma|neenga|unga)\b/i.test(text)) return "Tanglish";
  if (/\b(namaste|mujhe|chahiye|karna|kitne|kya|hai|haan|accha)\b/i.test(text)) return "Hindi";
  if (/\b(bonjour|merci|chauffeur|aeroport|voiture|transport|parfait|depose|reservation|passagers)\b/i.test(text)) return "French";
  if (/\b(saya|perlukan|kereta|lapangan|terbang)\b/i.test(text)) return "Malay";
  return "English";
}

function recentUserLanguages(messages) {
  return messages
    .filter((message) => message.role === "user")
    .slice(-6)
    .map((message) => detectLanguage(message.content))
    .filter(Boolean);
}

function dominantLanguage(messages) {
  const counts = recentUserLanguages(messages).reduce((acc, language) => {
    acc[language] = (acc[language] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || ["", 0];
}

function resolveLanguage(message, previousDraft, messages) {
  const detected = detectLanguage(message) || previousDraft.language || "English";
  const [dominant, count] = dominantLanguage(messages);
  const previous = previousDraft.language;

  if (
    detected === "Urdu" &&
    previous &&
    previous !== "Urdu" &&
    count >= 2 &&
    dominant === previous
  ) {
    return previous;
  }

  if (detected === "English" && previous === "Urdu") return "English";
  if (detected === "Malayalam" && previous) return previous;
  if (detected === "French" || detected === "Tamil" || detected === "Tanglish" || detected === "Hindi") return detected;
  return detected || dominant || previous || "English";
}

function detectServiceType(text, currentService) {
  if (currentService) return currentService;
  const value = text.toLowerCase();
  if (/(cross border|johor|singapore to malaysia|malaysia to singapore|border)/.test(value)) return "Cross Border Transfer";
  if (/(medical|equipment|hospital|oxygen|wheelchair|ventilator)/.test(value)) return "Medical Equipment Transfer";
  if (/(tour|holiday|vacation|sightseeing|package trip|family vacation)/.test(value)) return "Tour Packages";
  if (/(hourly|chauffeur|day package|for the day|hours)/.test(value)) return "Day / Hourly Packages";
  if (/(airport|flight|changi|klia|pickup from airport|airport la)/.test(value)) return "Airport Transfer";
  if (/(long distance|intercity|outstation|city to city)/.test(value)) return "Long Distance Transfer";
  if (/(ground|local|city|transfer|car)/.test(value)) return "Ground Transfer";
  return "";
}

const updateFieldAliases = {
  service: "serviceType",
  servicetype: "serviceType",
  transport: "serviceType",
  pickup: "pickup",
  pickuplocation: "pickup",
  from: "pickup",
  drop: "dropoff",
  dropoff: "dropoff",
  dropofflocation: "dropoff",
  dropoffplace: "dropoff",
  dropoffaddress: "dropoff",
  droplocation: "dropoff",
  dropplace: "dropoff",
  destination: "dropoff",
  to: "dropoff",
  pickuppoint: "pickup",
  pickupplace: "pickup",
  pickupaddress: "pickup",
  date: "date",
  traveldate: "date",
  time: "time",
  pickuptime: "time",
  name: "name",
  contact: "name",
  contactname: "name",
  customername: "name",
  phone: "phone",
  phonenumber: "phone",
  number: "phone",
  mobile: "phone",
  mobilenumber: "phone",
  whatsapp: "phone",
  whatsappnumber: "phone",
  contactnumber: "phone",
  email: "email",
  mail: "email",
  passengers: "passengers",
  passenger: "passengers",
  pax: "passengers",
  people: "passengers",
  equipment: "equipment",
  medicalequipment: "equipment",
  hours: "packageHours",
  packagehours: "packageHours",
  notes: "notes",
  luggage: "notes"
};

function normalizeFieldName(value) {
  const compact = normalize(value)
    .replace(/\b(?:the|new|old|current|please|my|this|booking|detail|details|field|value|location|loc)\b/gi, "")
    .replace(/[^a-z]/gi, "")
    .toLowerCase();
  return updateFieldAliases[compact] || "";
}

function applyFieldValue(draft, field, rawValue, { force = false } = {}) {
  const answer = normalize(rawValue).replace(/^["']|["']$/g, "");
  if (!field || !answer) return draft;
  if (!force && draft[field]) return draft;

  const next = { ...draft };
  const number = answer.match(/\d+/)?.[0] || numberFromLanguage(answer) || numberFromWords(answer);

  if (field === "serviceType") {
    next.serviceType = detectServiceType(answer, "") || titleCase(answer);
  } else if (field === "name") {
    const cleaned = extractFieldValue("name", answer) || extractNamePhrase(answer) || answer.replace(/^(?:my\s+name\s+is|name\s+is|i\s+am|this\s+is)\s+/i, "");
    if (/^[\p{L}\p{M}][\p{L}\p{M}\s.'-]{1,60}$/u.test(cleaned)) next.name = /[^\u0000-\u007F]/.test(cleaned) ? cleaned : titleCase(cleaned);
  } else if (field === "phone") {
    const phone = extractFieldValue("whatsapp", answer) || parsePhonePhrase(answer) || answer.match(/(?:\+?\d[\d\s-]{7,}\d)/)?.[0];
    if (phone) next.phone = phone.replace(/\s+/g, " ").trim();
  } else if (field === "email") {
    const email = extractFieldValue("email", answer) || extractEmailPhrase(answer) || answer.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
    if (email) next.email = email;
  } else if (field === "date") {
    next.date = extractFieldValue("date", answer) || parseNaturalDate(answer) || titleCase(answer);
  } else if (field === "time") {
    next.time = extractFieldValue("time", answer) || parseNaturalTime(answer, { allowLoose: true }) || answer.toUpperCase();
  } else if (field === "passengers" && number) {
    next.passengers = extractFieldValue("passengers", answer) || number;
  } else if (field === "packageHours" && number) {
    next.packageHours = number;
  } else if (["pickup", "dropoff", "equipment", "notes"].includes(field)) {
    next[field] = field === "notes" ? answer : (extractFieldValue(field, answer) || extractKnownPlace(answer) || cleanPlaceAnswer(answer, field));
  }

  return cleanDraft(normalizeBookingDraft(next));
}

function applyExplicitUpdates(text, draft) {
  const bookingEdit = applyBookingEditCommand(text, draft);
  if (bookingEdit.handled) return cleanDraft(normalizeBookingDraft(bookingEdit.draft));
  const patterns = [
    /\b(?:update|change|correct|set|modify|replace)\s+(?:the\s+)?([a-z\s-]+?)\s+(?:to|as|with)\s+(.+)$/i,
    /\b([a-z\s-]+?)\s+(?:should be|is wrong.*?(?:to|as|with))\s+(.+)$/i
  ];
  let next = draft;
  const removeMatch = text.match(/\b(?:remove|clear|delete|erase)\s+(?:the\s+)?([a-z\s-]+?)(?:\s+(?:detail|details|field|value|number|location))?$/i);
  if (removeMatch) {
    const field = normalizeFieldName(removeMatch[1]);
    if (field) next = cleanDraft({ ...next, [field]: "" });
  }
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const field = normalizeFieldName(match[1]);
    if (field) next = applyFieldValue(next, field, match[2], { force: true });
  }
  return cleanDraft(normalizeBookingDraft(next));
}

function isExplicitEditCommand(text) {
  return isBookingEditCommand(text) ||
    /\b(?:update|change|correct|set|modify|replace|remove|clear|delete|erase)\b/i.test(text || "") ||
    /\b(?:should be|is wrong)\b/i.test(text || "");
}

function extractDetails(text, draft) {
  let next = { ...draft };
  const lower = text.toLowerCase();
  const entities = extractBookingEntities(text);
  const email = entities.email || extractEmailPhrase(text) || text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
  const phone = entities.whatsapp || parsePhonePhrase(text) || text.match(/(?:\+?\d[\d\s-]{7,}\d)/)?.[0];
  const passengers = text.match(/\b(\d{1,2})\s*(?:passengers?|pax|people|persons|travellers?)\b/i)?.[1] ||
    entities.passengers ||
    parsePassengerPhrase(text) ||
    (/\b(passengers?|pax|people|persons|travellers?|adults?)\b/i.test(text) ? numberNearKeyword(text, "passengers?|pax|people|persons|travellers?|adults?") : "");
  const packageHours = text.match(/\b(\d{1,2})\s*(?:hours?|hrs?)\b/i)?.[1] ||
    parsePackageHoursPhrase(text) ||
    (/\b(hours?|hrs?)\b/i.test(text) ? numberNearKeyword(text, "hours?|hrs?") : "");
  const hasNameSignal = /\b(?:my name is|name is|i am|this is|booking for|book for|contact name|customer name|update name|change name)\b/i.test(text) ||
    /(பெயர்|பெயரில்|நேமில்|புக்கிங்|யாருடைய)/.test(text);
  const name = hasNameSignal
    ? extractFieldValue("name", text) || extractNamePhrase(text) || text.match(/\b(?:my name is|name is|i am|this is)\s+([a-z][a-z\s]{1,40})/i)?.[1]
    : "";
  const fromTo = text.match(/\bfrom\s+(.+?)\s+to\s+(.+?)(?:$| tomorrow| today| on | at | for )/i);
  const routePlaces = extractRoutePlaces(text);

  next.language = detectLanguage(text) || next.language;
  next.serviceType = detectServiceType(text, next.serviceType);
  if (email) next.email = email;
  if (phone && !/\d{1,2}[./-]\d{1,2}[./-]\d{2,4}/.test(phone)) next.phone = phone.replace(/\s+/g, " ").trim();
  if (passengers) next.passengers = passengers;
  if (packageHours) next.packageHours = packageHours;
  if (name) next.name = /[^\u0000-\u007F]/.test(name) ? name : titleCase(name);
  if (!next.pickup && entities.pickupLocation) next.pickup = entities.pickupLocation;
  if (!next.dropoff && entities.dropoffLocation) next.dropoff = entities.dropoffLocation;
  if (fromTo) {
    next.pickup = extractKnownPlace(fromTo[1]) || titleCase(fromTo[1]);
    next.dropoff = extractKnownPlace(fromTo[2]) || titleCase(fromTo[2]);
  }
  if (!next.pickup && routePlaces.pickup && /(pickup|pick up|from|airport transfer|இருந்து|பிக்கப்|பிக்|எடுத்து)/i.test(text)) next.pickup = routePlaces.pickup;
  if (!next.dropoff && (routePlaces.dropoff || routePlaces.pickup) && /(drop|dropoff|drop off|to|destination|ட்ராப்|டிராப்|விடு|போடு)/i.test(text)) {
    next.dropoff = routePlaces.dropoff || routePlaces.pickup;
  }
  if (!next.pickup && !next.dropoff && routePlaces.pickup && routePlaces.dropoff) {
    next.pickup = routePlaces.pickup;
    next.dropoff = routePlaces.dropoff;
  }
  if (!next.pickup && /\bchangi\b/i.test(text)) next.pickup = "Changi Airport";
  if (!next.dropoff && /\bjohor bahru\b/i.test(text)) next.dropoff = "Johor Bahru";
  const naturalDate = entities.date || parseNaturalDate(text);
  if (naturalDate) next.date = naturalDate;
  const date = text.match(/\b(\d{1,2}[./-]\d{1,2}(?:[./-]\d{2,4})?)\b/)?.[1];
  const parsedDate = date ? parseNaturalDate(date) : "";
  if (parsedDate) next.date = parsedDate;
  const time = text.match(/\b(\d{1,2}(?::\d{2}|\.\d{1,2})?\s?(?:am|pm|o'?clock))\b/i)?.[1];
  if (time) next.time = time.toUpperCase();
  const naturalTime = entities.time || parseNaturalTime(text);
  if (naturalTime) next.time = naturalTime;
  if (next.serviceType === "Medical Equipment Transfer" && !next.equipment) {
    const equipment = text.match(/\b(?:transfer|move|send)\s+(.+?)(?:\s+from|\s+to|$)/i)?.[1];
    if (equipment && !/(transfer|pickup|need)/i.test(equipment)) next.equipment = equipment;
  }
  if (!next.notes && /(vip|child seat|wheelchair|urgent|fragile|female driver)/i.test(lower)) next.notes = text;
  next = applyExplicitUpdates(text, next);

  return cleanDraft(normalizeBookingDraft(next));
}

function applyDirectAnswer(text, draft, targetField) {
  const answer = normalize(text).replace(/^["']|["']$/g, "");
  if (!answer || !targetField || draft[targetField]) return draft;
  if (/^(yes|no|ok|okay|sure|cancel|stop)$/i.test(answer)) return draft;

  return normalizeBookingDraft(applyFieldValue(draft, targetField, answer));
}

function inferFieldFromLastAssistant(messages) {
  const lastAssistant = [...messages].reverse().find((message) => message.role === "assistant")?.content || "";
  const text = lastAssistant.toLowerCase();
  if (/(time|heure|pickup time|enna time)/.test(text)) return "time";
  if (/(pickup|prise en charge|pickup enga|pickup location)/.test(text)) return "pickup";
  if (/(dropoff|drop off|drop you off|depose|destination|dropoff location)/.test(text)) return "dropoff";
  if (/(date|tomorrow|when|entha date|kis date)/.test(text)) return "date";
  if (/(passenger|passagers|pax|persons|kitne)/.test(text)) return "passengers";
  if (/(whatsapp|phone|number|numero)/.test(text)) return "phone";
  if (/(email|mail)/.test(text)) return "email";
  if (/(name|naam|customer)/.test(text)) return "name";
  if (/(equipment|medical)/.test(text)) return "equipment";
  if (/(hours|hourly|chauffeur package)/.test(text)) return "packageHours";
  if (/(service|transport service)/.test(text)) return "serviceType";
  return "";
}

function titleCase(value) {
  return normalize(value)
    .replace(/[.,!?]+$/g, "")
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function cleanPlaceAnswer(value, targetField = "") {
  const original = normalize(value).replace(/[?!]+$/g, "").trim();
  const knownPlace = extractKnownPlace(original);
  if (knownPlace) return knownPlace;
  const directional =
    targetField === "pickup"
      ? original.match(/\bfrom\s+(.+?)(?:\s+to\b|$)/i)?.[1]
      : original.match(/\b(?:to|at)\s+(.+?)$/i)?.[1];
  let text = normalize(directional || original);

  const fillerPatterns = [
    /\b(?:pickup|pick up|dropoff|drop off|drop|location|place|please|need|want|should|would like|where|from|to|at|in)\b/gi,
    /\b(?:panna|pannum|pannunga|venum|vendum|irundhu|enga|enna|endral|la|ku)\b/gi,
    /(?:எங்கே|எங்கிருந்து|பிக்கப்|பிக்அப்|ட்ராப்|டிராப்|பண்ணணும்|பண்ணணுனா|பண்ண வேண்டும்|வேண்டும்|என்னவென்றால்|இருந்து|இடம்|என்றால்)/g,
    /(?:നിന്ന്|പിക്കോണ്ടോ|പിക്ക്|ഡ്രോപ്പ്|എവിടെ|വേണം)/g
  ];
  for (const pattern of fillerPatterns) text = text.replace(pattern, " ");
  text = text.replace(/\s+/g, " ").replace(/^[,.\s-]+|[,.\s-]+$/g, "").trim();

  if (targetField === "dropoff") {
    const tamilTokens = text.match(/[\u0B80-\u0BFF]+/g) || [];
    const likelyTamilPlace = tamilTokens
      .filter((token) => !/(எங்கே|என்ன|ட்ராப்|டிராப்|பண்ண|வேண்டும்|இடம்)/.test(token))
      .at(-1);
    if (likelyTamilPlace) text = likelyTamilPlace.replace(/(யில்|இல்|க்கு)$/u, "");
  }

  if (!text) return original;
  return /[^\u0000-\u007F]/.test(text) ? text : titleCase(text);
}

function cleanDraft(draft) {
  return Object.fromEntries(
    Object.entries(draft).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value || ""])
  );
}

function normalizeFieldForStorage(field, value) {
  const text = normalize(value);
  if (!text) return "";
  if (field === "date") return extractFieldValue("date", text) || parseDatePhrase(text) || text;
  if (field === "time") return extractFieldValue("time", text) || parseTimePhrase(text) || text;
  if (field === "phone") {
    const phone = extractFieldValue("whatsapp", text) || parsePhonePhrase(text) || text;
    return normalize(phone).replace(/\D/g, "");
  }
  if (field === "email") return extractFieldValue("email", text) || extractEmailPhrase(text) || text;
  if (field === "passengers") return String(extractFieldValue("passengers", text) || parsePassengerPhrase(text) || numberFromLanguage(text) || text);
  if (field === "packageHours") return parsePackageHoursPhrase(text) || String(numberFromLanguage(text, 24) || text);
  if (field === "pickup") return extractFieldValue("pickupLocation", text) || extractKnownPlace(text) || text;
  if (field === "dropoff") return extractFieldValue("dropoffLocation", text) || extractKnownPlace(text) || text;
  if (field === "name") return extractFieldValue("name", text) || extractNamePhrase(text) || text;
  return text;
}

function isGreetingOrNoise(value) {
  const text = normalize(value).toLowerCase().replace(/[.,!?]/g, " ");
  if (!text) return true;
  const compact = text.replace(/\s+/g, " ").trim();
  const greetings = [
    "hello",
    "hi",
    "hey",
    "good morning",
    "good afternoon",
    "good evening",
    "vanakkam",
    "வணக்கம்",
    "namaste",
    "bonjour",
    "salam",
    "ok",
    "okay",
    "yes",
    "no"
  ];
  if (greetings.includes(compact)) return true;
  return greetings.some((greeting) => compact.includes(greeting) && compact.replace(greeting, "").trim().length < 3);
}

function isValidPlace(value) {
  const text = normalize(value);
  if (isGreetingOrNoise(text)) return false;
  if (/\d{2,}/.test(text)) return false;
  const lower = text.toLowerCase();
  const placeSignals = /(airport|terminal|hotel|station|mall|street|road|st\b|avenue|ave\b|drive|dr\b|lane|ln\b|city|town|bus stop|office|hospital|clinic|changi|klia|johor|singapore|kuala lumpur|sentosa|marina|address|pickup|dropoff)/i;
  if (placeSignals.test(lower)) return true;
  if (/[\u0B80-\u0BFF\u0D00-\u0D7F\u0900-\u097F]/.test(text) && text.length >= 3) return true;
  const words = text.split(/\s+/).filter(Boolean);
  return ((words.length >= 2 && text.length >= 6) || /^[a-z][a-z.'-]{2,}$/i.test(text)) && !/^(good|hello|vanakkam|namaste|bonjour)\b/i.test(text);
}

function isValidDate(value) {
  const text = normalize(value);
  if (isGreetingOrNoise(text)) return false;
  if (parseDatePhrase(text)) return true;
  if (/^(today|tomorrow|tonight)$/i.test(text)) return true;
  if (/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i.test(text)) return true;
  if (parseNaturalDate(text)) return true;
  if (/\b\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s*\d{0,4}\b/i.test(text)) return true;
  return false;
}

function isValidTime(value) {
  const text = normalize(value);
  if (isGreetingOrNoise(text)) return false;
  if (parseTimePhrase(text)) return true;
  if (parseNaturalTime(text, { allowLoose: true })) return true;
  if (/\b\d{1,2}(?::\d{2})?\s?(am|pm)\b/i.test(text)) return true;
  if (/\b\d{1,2}(?::\d{2}|\.\d{1,2})?\s?(o'?clock)\b/i.test(text)) return true;
  if (/\b\d{1,2}\.\d{1,2}\b/.test(text)) return true;
  if (/^(morning|afternoon|evening|night)$/i.test(text)) return true;
  return false;
}

function isValidPassengerCount(value) {
  const text = normalize(value);
  if (isGreetingOrNoise(text)) return false;
  const number = Number(text.match(/\d+/)?.[0] || parsePassengerPhrase(text) || numberFromLanguage(text) || numberFromWords(text));
  return Number.isInteger(number) && number > 0 && number < 100;
}

function isValidName(value) {
  const text = normalize(value);
  if (isGreetingOrNoise(text)) return false;
  return /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]{1,60}$/u.test(text) && !/\d/.test(text);
}

function isValidPhone(value, draft = {}) {
  const extracted = parsePhonePhrase(value) || normalize(value);
  const country = inferPhoneCountry({ draft, value: extracted || value });
  return validatePhoneForTravel(extracted || value, { country }).valid;
}

function isValidEmail(value) {
  return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(extractEmailPhrase(value) || normalize(value));
}

function isValidEquipment(value) {
  const text = normalize(value);
  if (isGreetingOrNoise(text)) return false;
  return /(wheelchair|oxygen|bed|ventilator|monitor|stretcher|medical|equipment|machine|device|cylinder|chair)/i.test(text) || text.length >= 5;
}

function isValidPackageHours(value) {
  const number = Number(normalize(value).match(/\d+/)?.[0]);
  return Number.isInteger(number) && number > 0 && number <= 24;
}

function validateFieldValue(field, value, draft = {}) {
  if (!normalize(value)) return true;
  if (field === "pickup" || field === "dropoff") return isValidPlace(value);
  if (field === "date") return isValidDate(value);
  if (field === "time") return isValidTime(value);
  if (field === "passengers") return isValidPassengerCount(value);
  if (field === "name") return isValidName(value);
  if (field === "phone") return isValidPhone(value, draft);
  if (field === "email") return isValidEmail(value);
  if (field === "equipment") return isValidEquipment(value);
  if (field === "packageHours") return isValidPackageHours(value);
  return !isGreetingOrNoise(value);
}

function sanitizeDraftByRules(draft) {
  const next = cleanDraft(normalizeBookingDraft(draft));
  for (const field of Object.keys(next)) {
    next[field] = normalizeFieldForStorage(field, next[field]);
  }
  const invalidFields = [];
  for (const field of Object.keys(next)) {
    if (!validateFieldValue(field, next[field], next)) {
      next[field] = "";
      invalidFields.push(field);
    }
  }
  return { draft: next, invalidFields };
}

function requiredFieldsFor(draft) {
  if (!draft.serviceType) return ["serviceType"];
  return serviceRequired[draft.serviceType] || commonRequired;
}

function missingFieldsFor(draft) {
  return requiredFieldsFor(draft).filter((field) => !normalize(draft[field]));
}

function buildFallbackReply(draft, missingFields) {
  const language = draft.language || "English";
  if (missingFields.length === 0) {
    if (language === "Tamil") return "அருமை! எல்லா விவரங்களும் தயார் 😊 Review செய்து confirm பண்ணலாமா?";
    if (language === "Tanglish") return "Super! Details ready irukku 😊 Review pannitu confirm pannalama?";
    if (language === "Hindi") return "Badhiya! Details ready hain 😊 Review karke confirm kar dein?";
    if (language === "French") return "Parfait ! Les details sont prets 😊 Voulez-vous verifier et confirmer ?";
    return "Perfect, all details are ready 😊 Please review and confirm the lead.";
  }
  const copy = questionCopy[language] || questionCopy.English;
  return copy[missingFields[0]] || questionCopy.English[missingFields[0]];
}

function buildInvalidReply(draft, invalidFields) {
  const language = draft.language || "English";
  const field = invalidFields[0];
  const copy = questionCopy[language] || questionCopy.English;
  const question = copy[field] || questionCopy.English[field] || "Can you share that detail one more time?";
  if (field === "phone") return phoneValidationMessage(language);
  if (language === "Tamil") return `அந்த விவரம் சரியாக இல்லை. ${question}`;
  if (language === "Tanglish") return `Andha detail correct ah illa. ${question}`;
  if (language === "Hindi") return `Yeh detail sahi nahi lag rahi. ${question}`;
  if (language === "French") return `Ce detail ne semble pas valide. ${question}`;
  return `That detail does not look valid yet. ${question}`;
}

function mergeAiDraft(currentDraft, aiDraft) {
  const merged = { ...currentDraft };
  for (const [key, value] of Object.entries(aiDraft || {})) {
    if (key === "language") continue;
    if (value !== null && value !== undefined && String(value).trim()) merged[key] = String(value).trim();
  }
  return cleanDraft(merged);
}

export async function processConversationTurn({ message, draft = {}, messages = [] }) {
  const previousDraft = cleanDraft(draft);
  const explicitEdit = isExplicitEditCommand(message);
  const currentLanguage = resolveLanguage(message, previousDraft, messages);
  const previousMissingField = inferFieldFromLastAssistant(messages) || missingFieldsFor(previousDraft)[0];
  const intelligence = await extractTravelEntities({
    text: message,
    draft: previousDraft,
    messages,
    targetField: previousMissingField,
    supportedLanguages,
    services: serviceTypes,
    useOpenAI: process.env.ENABLE_OPENAI_EXTRACTION === "true"
  });
  const memoryDraft = mergeValidatedEntities(previousDraft, intelligence.entities, { force: explicitEdit });
  const extractedDraft = extractDetails(message, memoryDraft);
  const localDraft = explicitEdit
    ? { ...extractedDraft, language: currentLanguage }
    : applyDirectAnswer(message, { ...extractedDraft, language: currentLanguage }, previousMissingField);
  let result = null;

  if (!explicitEdit && process.env.ENABLE_OPENAI_CHAT === "true") {
    try {
      result = await completeConversation({
        draft: localDraft,
        messages,
        userMessage: message,
        supportedLanguages,
        services: serviceTypes
      });
    } catch (err) {
      console.warn("OpenAI conversation fallback:", err.message);
    }
  }

  const aiDraft = result?.draft ? mergeAiDraft(localDraft, result.draft) : localDraft;
  const language = currentLanguage;
  const sanitized = sanitizeDraftByRules({ ...aiDraft, language });
  const progressState = buildBookingProgress(sanitized.draft, requiredFieldsFor(sanitized.draft));
  const finalDraft = progressState.draft;
  const requiredFields = progressState.requiredFields;
  const missingFields = progressState.missing;
  const replyLanguage = result?.reply ? detectLanguage(result.reply) : "";
  const aiLanguageMatches =
    (!result?.language || result.language === language) &&
    (!replyLanguage || replyLanguage === language || (language === "English" && replyLanguage === "English"));
  const reply =
    sanitized.invalidFields.length > 0
      ? buildInvalidReply(finalDraft, sanitized.invalidFields)
      : aiLanguageMatches && result?.reply
        ? result.reply
        : buildFallbackReply(finalDraft, missingFields);

  return {
    language,
    draft: finalDraft,
    requiredFields,
    missingFields,
    progress: progressState.progress,
    readyForReview: missingFields.length === 0,
    reply
  };
}

export async function processVoiceTurn({ audioBase64, mimeType, draft = {}, messages = [] }) {
  let transcript = "";
  try {
    transcript = await transcribeAudio(audioBase64, mimeType);
  } catch (err) {
    console.error("Voice transcription failed:", err.message);
    return {
      language: draft.language || "English",
      draft,
      requiredFields: requiredFieldsFor(draft),
      missingFields: missingFieldsFor(draft),
      progress: buildBookingProgress(draft, requiredFieldsFor(draft)).progress,
      readyForReview: false,
      transcript: "",
      reply: "I could not understand the voice clearly. Please try again or type the answer."
    };
  }
  const result = await processConversationTurn({ message: transcript, draft, messages });
  return { ...result, transcript };
}
