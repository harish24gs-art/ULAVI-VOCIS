import { LocationAliasDictionary } from "./LocationAliasDictionary.js";
import { TranscriptionCorrectionDictionary } from "./TranscriptionCorrectionDictionary.js";

const DEFAULT_YEAR = 2026;

function norm(value) {
  const cleaned = String(value || "")
    .normalize("NFKC")
    .replace(/\b([ap])\s*\.?\s*m\.?\b/gi, "$1m")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, "\"")
    .replace(/[.,!?;]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return applyTranscriptionCorrections(cleaned);
}

function applyTranscriptionCorrections(value) {
  let output = String(value || "");
  for (const [normalizedValue, variants] of Object.entries(TranscriptionCorrectionDictionary)) {
    for (const variant of variants) {
      output = output.replace(new RegExp(`\\b${variant.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "giu"), normalizedValue);
    }
  }
  return output;
}

function stripMarks(value) {
  return norm(value).toLowerCase();
}

function titleCase(value) {
  return norm(value)
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

const locationAliases = [
  ...Object.entries(LocationAliasDictionary),
  ["Chennai Airport", ["chennai international airport", "chennai airport", "madras airport", "maa airport", "சென்னை airport", "சென்னை விமான நிலையம்"]],
  ["Chennai", ["chennai", "chenai", "channai", "madras", "சென்னை", "சென்னையிலிருந்து", "சென்னையில்ருந்து", "சென்னையில்", "சென்னைக்கு"]],
  ["Coimbatore", ["coimbatore", "coimbator", "kovai", "கோயம்பத்தூர்", "கோயம்பத்தூரில்", "கோயம்பத்தூருக்கு", "கோவை", "கோவைக்கு"]],
  ["Villivakkam", ["villivakkam", "villiwakkam", "வில்லிவாக்கம்", "வில்லிவாக்கத்துக்கு", "வில்லிவாக்கம் வரைக்கும்"]],
  ["Madurai Airport", ["madurai airport", "மதுரை airport", "மதுரை விமான நிலையம்"]],
  ["Madurai", ["madurai", "மதுரை", "மதுரையில்", "மதுரைக்கு"]],
  ["Trichy", ["trichy", "tiruchirappalli", "திருச்சி", "திருச்சிக்கு"]],
  ["Changi Airport", ["changi airport", "changi", "sin airport", "singapore airport"]],
  ["Johor Bahru", ["johor bahru", "johor", "jb", "ஜோஹோர்", "ஜொஹோர்"]],
  ["Singapore", ["singapore", "சிங்கப்பூர்"]],
  ["Kuala Lumpur", ["kuala lumpur", "kl", "கோலாலம்பூர்"]],
  ["KLIA", ["klia", "kuala lumpur airport"]],
  ["Bangalore", ["bangalore", "bengaluru", "பெங்களூர்"]],
  ["Hyderabad", ["hyderabad", "ஹைதராபாத்"]],
  ["Mumbai", ["mumbai", "bombay", "மும்பை"]],
  ["Delhi", ["delhi", "new delhi", "டெல்லி"]],
  ["Salem", ["salem", "சேலம்"]],
  ["Erode", ["erode", "ஈரோடு"]],
  ["Tiruppur", ["tiruppur", "திருப்பூர்"]]
];

const travelWords = [
  "poganum", "poanum", "ponum", "poga", "pogum", "poren", "porom", "varanum", "varaikum", "varai",
  "irunthu", "irundhu", "la", "ku", "kku", "le", "lendhu", "senthu", "reach", "towards", "to", "from",
  "drop", "dropoff", "drop off", "pickup", "pick up", "location", "place", "please", "need", "want", "go",
  "போகணும்", "போகனும்", "போனும்", "போக வேண்டும்", "வரணும்", "வரைக்கும்", "வரை", "இருந்து", "லிருந்து",
  "ல", "க்கு", "கிட்ட", "ட்ராப்", "டிராப்", "பிக்கப்", "பிக்", "பண்ணு", "பண்ணிக்கோ", "செய்யணும்",
  "तक", "जाना", "जाना है", "से", "को", "पर", "ड्रॉप", "पिकअप", "पहुंचना",
  "jusqu", "jusqu a", "vers", "deposer", "prise", "charge",
  "到", "去", "接", "送"
];

const fieldAliases = {
  pickup: "pickupLocation",
  pickuplocation: "pickupLocation",
  pickuppoint: "pickupLocation",
  pickupaddress: "pickupLocation",
  from: "pickupLocation",
  source: "pickupLocation",
  "pick up": "pickupLocation",
  "pick-up": "pickupLocation",
  பிக்கப்: "pickupLocation",
  pickupஇடம்: "pickupLocation",
  drop: "dropoffLocation",
  dropoff: "dropoffLocation",
  dropofflocation: "dropoffLocation",
  dropoffpoint: "dropoffLocation",
  dropoffaddress: "dropoffLocation",
  destination: "dropoffLocation",
  to: "dropoffLocation",
  "drop off": "dropoffLocation",
  "drop-off": "dropoffLocation",
  ட்ராப்: "dropoffLocation",
  டிராப்: "dropoffLocation",
  date: "date",
  traveldate: "date",
  தேதி: "date",
  time: "time",
  pickuptime: "time",
  நேரம்: "time",
  passengers: "passengers",
  passenger: "passengers",
  people: "passengers",
  pax: "passengers",
  பேர்: "passengers",
  name: "name",
  contactname: "name",
  customername: "name",
  பெயர்: "name",
  phone: "whatsapp",
  phonenumber: "whatsapp",
  number: "whatsapp",
  mobile: "whatsapp",
  mobilenumber: "whatsapp",
  whatsapp: "whatsapp",
  whatsappnumber: "whatsapp",
  contactnumber: "whatsapp",
  வாட்ஸப்: "whatsapp",
  email: "email",
  mail: "email"
};

const updateWords = [
  "update", "change", "correct", "set", "modify", "replace", "edit", "make", "revise",
  "remove", "clear", "delete", "erase",
  "maatru", "maathu", "mathu", "badhilaga", "badilaga", "replace pannu", "change pannu", "update pannu",
  "மாற்று", "மாத்து", "மாற்றவும்", "பதிலாக", "பதிலா", "சரி செய்", "திருத்து", "நீக்கு", "அழி", "க்ளியர்",
  "badlo", "badal", "badal do", "sahi karo", "hatao", "nikalo", " बदल", "हटाओ", "सही",
  "changer", "remplacer", "corriger", "supprimer", "effacer",
  "更改", "更新", "修改", "删除", "清除"
];

const removeWords = ["remove", "clear", "delete", "erase", "நீக்கு", "அழி", "க்ளியர்", "hatao", "nikalo", "supprimer", "effacer", "删除", "清除"];

const numberWords = new Map([
  ["zero", 0], ["oh", 0], ["o", 0],
  ["one", 1], ["oru", 1], ["onnu", 1], ["ஒன்று", 1], ["ஒன்னு", 1], ["ஒரு", 1], ["एक", 1],
  ["two", 2], ["rendu", 2], ["irandu", 2], ["இரண்டு", 2], ["ரெண்டு", 2], ["दो", 2],
  ["three", 3], ["moonu", 3], ["மூன்று", 3], ["மூனு", 3], ["तीन", 3],
  ["four", 4], ["naalu", 4], ["நான்கு", 4], ["நாலு", 4], ["चार", 4],
  ["five", 5], ["anju", 5], ["ஐந்து", 5], ["அஞ்சு", 5], ["पांच", 5], ["पाँच", 5],
  ["six", 6], ["aaru", 6], ["ஆறு", 6], ["छह", 6],
  ["seven", 7], ["ezhu", 7], ["elu", 7], ["ஏழு", 7], ["सात", 7],
  ["eight", 8], ["ettu", 8], ["எட்டு", 8], ["आठ", 8],
  ["nine", 9], ["onbadhu", 9], ["ஒன்பது", 9], ["नौ", 9],
  ["ten", 10], ["pathu", 10], ["பத்து", 10], ["டென்", 10], ["दस", 10],
  ["eleven", 11], ["pathinonnu", 11], ["பதினொன்று", 11], ["ग्यारह", 11],
  ["twelve", 12], ["pannirendu", 12], ["pannendu", 12], ["பன்னிரண்டு", 12], ["பன்னிரெண்டு", 12], ["बारह", 12],
  ["thirteen", 13], ["பதிமூன்று", 13], ["तेरह", 13],
  ["fourteen", 14], ["பதினான்கு", 14], ["चौदह", 14],
  ["fifteen", 15], ["pathinanju", 15], ["பதினைந்து", 15], ["पंद्रह", 15],
  ["sixteen", 16], ["பதினாறு", 16], ["सोलह", 16],
  ["seventeen", 17], ["பதினேழு", 17], ["सत्रह", 17],
  ["eighteen", 18], ["பதினெட்டு", 18], ["अठारह", 18],
  ["nineteen", 19], ["பத்தொன்பது", 19], ["उन्नीस", 19],
  ["twenty", 20], ["இருபது", 20], ["बीस", 20],
  ["thirty", 30], ["முப்பது", 30]
]);

const digitWords = new Map([...numberWords.entries()].filter(([, value]) => value >= 0 && value <= 9));

for (const [word, digit] of [
  ["nil", 0], ["nill", 0], ["ஜீரோ", 0], ["சீரோ", 0], ["ஓ", 0],
  ["won", 1], ["ஒன்", 1], ["வன்", 1],
  ["too", 2], ["to", 2], ["டூ", 2], ["டு", 2],
  ["tree", 3], ["த்ரீ", 3], ["திரி", 3],
  ["for", 4], ["fore", 4], ["ஃபோர்", 4], ["போர்", 4], ["போ", 4],
  ["பைவ்", 5], ["பைவு", 5], ["ஃபைவ்", 5],
  ["சிக்ஸ்", 6], ["சிக்சு", 6],
  ["செவன்", 7], ["செவண்", 7], ["station", 7],
  ["ate", 8], ["எயிட்", 8], ["ஏட்", 8],
  ["நைன்", 9], ["நயின்", 9]
]) {
  digitWords.set(word, digit);
}

for (const ambiguousGrammarWord of ["to", "for"]) {
  digitWords.delete(ambiguousGrammarWord);
}

const phoneRepeatWords = new Map([
  ["double", 2], ["doubled", 2], ["twice", 2], ["டபுள்", 2], ["டபுல்", 2], ["ரெட்டை", 2], ["இரட்டை", 2],
  ["triple", 3], ["tripple", 3], ["thrice", 3], ["ட்ரிபிள்", 3], ["டிரிபிள்", 3], ["மூன்று முறை", 3]
]);

const phoneTensWords = new Map([
  ["twenty", 2], ["thirty", 3], ["forty", 4], ["fourty", 4], ["fifty", 5],
  ["sixty", 6], ["seventy", 7], ["eighty", 8], ["ninety", 9],
  ["இருபது", 2], ["முப்பது", 3], ["நாற்பது", 4], ["ஐம்பது", 5],
  ["அறுபது", 6], ["எழுபது", 7], ["எண்பது", 8], ["தொண்ணூறு", 9]
]);

function isValidPhoneDigits(digits, hadPlus = false) {
  if (!digits) return false;
  if (hadPlus) return digits.length >= 8 && digits.length <= 15;
  return digits.length >= 10 && digits.length <= 15;
}

function cleanPhoneDigits(raw, hadPlus = false) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!isValidPhoneDigits(digits, hadPlus)) return "";
  return hadPlus ? `+${digits}` : digits;
}

function spokenPhoneDigits(text) {
  const tokens = norm(text)
    .toLowerCase()
    .replace(/[-–—,/()]+/g, " ")
    .match(/[\p{L}\p{M}\p{N}]+/gu) || [];

  const digits = [];
  let repeat = 1;
  let sawSpokenDigit = false;

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const multiplier = phoneRepeatWords.get(token);
    if (multiplier) {
      repeat = multiplier;
      continue;
    }

    let digit = "";
    const tensDigit = phoneTensWords.get(token);
    if (tensDigit) {
      digits.push(String(tensDigit));
      const nextToken = tokens[index + 1];
      if (digitWords.has(nextToken) && digitWords.get(nextToken) > 0 && digitWords.get(nextToken) <= 9) {
        digits.push(String(digitWords.get(nextToken)));
        index += 1;
      } else {
        digits.push("0");
      }
      repeat = 1;
      sawSpokenDigit = true;
      continue;
    }

    if (/^\d+$/.test(token)) {
      if (token.length === 1) {
        digit = token;
      } else {
        digits.push(...token.split(""));
        repeat = 1;
        continue;
      }
    } else if (digitWords.has(token)) {
      digit = String(digitWords.get(token));
      sawSpokenDigit = true;
    }

    if (digit) {
      for (let i = 0; i < repeat; i += 1) digits.push(digit);
      repeat = 1;
    }
  }

  const joined = digits.join("");
  return sawSpokenDigit && isValidPhoneDigits(joined) ? joined : "";
}

const monthWords = new Map([
  ["january", 1], ["jan", 1], ["ஜனவரி", 1], ["जनवरी", 1],
  ["february", 2], ["feb", 2], ["பிப்ரவரி", 2], ["फरवरी", 2],
  ["march", 3], ["mar", 3], ["மார்ச்", 3], ["मार्च", 3],
  ["april", 4], ["apr", 4], ["ஏப்ரல்", 4], ["अप्रैल", 4],
  ["may", 5], ["மே", 5], ["मई", 5],
  ["june", 6], ["jun", 6], ["ஜூன்", 6], ["ஜுன்", 6], ["जून", 6],
  ["july", 7], ["jul", 7], ["ஜூலை", 7], ["ஜுலை", 7], ["जुलाई", 7],
  ["august", 8], ["aug", 8], ["ஆகஸ்ட்", 8], ["अगस्त", 8],
  ["september", 9], ["sep", 9], ["செப்டம்பர்", 9], ["सितंबर", 9],
  ["october", 10], ["oct", 10], ["அக்டோபர்", 10], ["अक्टूबर", 10],
  ["november", 11], ["nov", 11], ["நவம்பர்", 11], ["नवंबर", 11],
  ["december", 12], ["dec", 12], ["டிசம்பர்", 12], ["दिसंबर", 12]
]);

function findNumber(text, max = 99) {
  const value = stripMarks(text);
  const numeric = value.match(/\b\d{1,3}\b/)?.[0];
  if (numeric && Number(numeric) <= max) return Number(numeric);
  const matches = [...numberWords.entries()]
    .filter(([, number]) => number <= max)
    .map(([word, number]) => ({ number, index: value.indexOf(word.toLowerCase()), length: word.length }))
    .filter((item) => item.index >= 0)
    .sort((a, b) => a.index - b.index || b.length - a.length);
  return matches[0]?.number || null;
}

function findLastNumber(text, max = 99) {
  const value = stripMarks(text);
  const digitMatches = [...value.matchAll(/\b\d{1,3}\b/g)]
    .map((match) => ({ number: Number(match[0]), index: match.index || 0, length: match[0].length }))
    .filter((item) => item.number <= max);
  const wordMatches = [...numberWords.entries()]
    .filter(([, number]) => number <= max)
    .map(([word, number]) => ({ number, index: value.lastIndexOf(word.toLowerCase()), length: word.length }))
    .filter((item) => item.index >= 0);
  return [...digitMatches, ...wordMatches].sort((a, b) => b.index - a.index || b.length - a.length)[0]?.number || null;
}

function isoDate(day, month, year = DEFAULT_YEAR) {
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y)) return "";
  if (d < 1 || d > 31 || m < 1 || m > 12 || y < DEFAULT_YEAR || y > 2100) return "";
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function extractDate(text) {
  const value = norm(text);
  if (/\btomorrow\b/i.test(value)) return "Tomorrow";
  if (/\btoday\b/i.test(value)) return "Today";
  const iso = value.match(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/);
  if (iso) return isoDate(iso[3], iso[2], iso[1]);
  const numeric = value.match(/\b(\d{1,2})[./-](\d{1,2})(?:[./-](\d{2,4}))?\b/);
  if (numeric) return isoDate(numeric[1], numeric[2], numeric[3]?.length === 2 ? `20${numeric[3]}` : numeric[3] || DEFAULT_YEAR);

  const lower = stripMarks(value);
  for (const [month, monthNumber] of monthWords) {
    const key = month.toLowerCase();
    const index = lower.indexOf(key);
    if (index < 0) continue;
    const before = lower.slice(Math.max(0, index - 70), index);
    const after = lower.slice(index + key.length, index + key.length + 70);
    const day = findNumber(after, 31) || findLastNumber(before, 31);
    const year = value.match(/\b(20\d{2})\b/)?.[1] || DEFAULT_YEAR;
    if (day) return isoDate(day, monthNumber, year);
  }
  return "";
}

export function extractTime(text) {
  const value = norm(text);
  const lower = stripMarks(value);
  const meridiem = /(pm|evening|night|tonight|மாலை|இரவு|நைட்|ஈவ்னிங்|shaam|रात)/i.test(value) ? "PM" : "AM";
  const explicit = value.match(/\b(\d{1,2})(?::(\d{2})|\.(\d{1,2}))?\s*(am|pm)\b/i);
  if (explicit) return `${String(Number(explicit[1])).padStart(2, "0")}:${String(explicit[2] || explicit[3] || "00").padStart(2, "0")} ${explicit[4].toUpperCase()}`;
  const clock = lower.match(/\b(\d{1,2})(?::(\d{2})|\.(\d{1,2}))?\s*(?:o'?clock|clock)\b/i);
  const hasSignal = /(morning|afternoon|evening|night|time|pickup|clock|காலை|மார்னிங்|நேரம்|மணி|கிளாக்|ஓ கிளாக்|ஓக்ளாக்|बजे)/i.test(value);
  const clockIndex = lower.search(/o'?clock|o clock|clock|கிளாக்|ஓ கிளாக்|ஓக்ளாக்|மணி|बजे/i);
  const clockWindow = clockIndex >= 0 ? lower.slice(Math.max(0, clockIndex - 48), clockIndex) : "";
  const withoutDates = lower.replace(/(?:january|february|march|april|may|june|july|august|september|october|november|december|ஜனவரி|பிப்ரவரி|மார்ச்|ஏப்ரல்|மே|ஜூன்|ஜூலை|ஆகஸ்ட்|செப்டம்பர்|அக்டோபர்|நவம்பர்|டிசம்பர்)\s+\S+/gi, "");
  let hour = clock ? Number(clock[1]) : findLastNumber(clockWindow, 12) || findLastNumber(withoutDates, 12);
  if (/(?:ten|டென்|பத்து|दस)\s*(?:o'?clock|o clock|clock|ஓ கிளாக்|கிளாக்|மணி|बजे)/i.test(value)) hour = 10;
  if (hasSignal && hour >= 1 && hour <= 12) {
    return `${String(hour).padStart(2, "0")}:${String(clock?.[2] || clock?.[3] || "00").padStart(2, "0")} ${meridiem}`;
  }
  return "";
}

export function extractPassengers(text) {
  const match = String(text || "").match(/(.{0,60})(passenger|passengers|pax|people|persons|travellers?|adults?|peru|motham|mottam|total|members?|பேர்|மொத்தம்|பயணம்|டிராவல்|लोग|यात्री|passagers)/i);
  if (!match) return "";
  const number = findLastNumber(match[1], 99) || findNumber(text, 99);
  return number || "";
}

export function extractPhone(text) {
  const value = norm(text);
  const directMatches = [...value.matchAll(/\+?\d(?:[\d\s().-]*\d){7,}/g)].map((match) => match[0]);
  for (const direct of directMatches) {
    const cleaned = cleanPhoneDigits(direct, direct.trim().startsWith("+"));
    if (cleaned) return cleaned;
  }
  return spokenPhoneDigits(value);
}

export function extractEmail(text) {
  const direct = String(text || "").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
  if (direct) return direct.toLowerCase();
  const recovered = norm(text)
    .toLowerCase()
    .replace(/\s+(at the rate|at rate|at)\s+/g, "@")
    .replace(/\s+(dot|டாட்|டோட்|புள்ளி)\s+/g, ".")
    .replace(/\s+/g, "")
    .match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/)?.[0];
  return recovered || "";
}

export function extractName(text) {
  const value = norm(text);
  const patterns = [
    /\b(?:my\s+name\s+is|name\s+is|i\s+am|i'm|this\s+is|call\s+me|contact\s+name\s+is|customer\s+name\s+is)\s+([\p{L}\p{M}][\p{L}\p{M}\s.'-]{1,60})/iu,
    /\b(?:booking\s+(?:name\s+)?(?:is|for|under|in)|book\s+(?:it\s+)?(?:for|under|in))\s+([\p{L}\p{M}][\p{L}\p{M}\s.'-]{1,60})/iu,
    /\b(?:mera\s+naam|naam\s+hai|naam\s+se|booking\s+naam\s+se)\s+([\p{L}\p{M}][\p{L}\p{M}\s.'-]{1,60})/iu,
    /(?:என்\s+(?:பெயர்|பேர்)|என்னோட\s+(?:பெயர்|பேர்)|பெயர்|பேர்|புக்கிங்\s+பெயர்)\s+([\p{L}\p{M}][\p{L}\p{M}\s.'-]{1,60})/iu,
    /([\p{L}\p{M}][\p{L}\p{M}\s.'-]{1,60})\s+(?:name\s+la|name\s+le|பெயரில்|பெயர்ல|நேமில்|naam\s+se|ke\s+naam)/iu
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern)?.[1];
    const cleaned = cleanNameCandidate(match);
    if (cleaned) return cleaned;
  }

  const fallback = cleanNameCandidate(value);
  const hasNameSignal = /\b(name|booking|book|contact|customer|call me|naam|mera naam)\b/i.test(value) ||
    /(பெயர்|பேர்|பெயரில்|பெயர்ல|நேமில்|புக்கிங்)/u.test(value);
  const looksLikeOnlyName = /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]{1,40}$/u.test(value) && value.trim().split(/\s+/).length <= 4;
  return hasNameSignal || looksLikeOnlyName ? fallback : "";
}

function cleanNameCandidate(value) {
  let cleaned = norm(value)
    .replace(/\b(?:booking|book|name|contact|customer|update|change|correct|set|to|as|is|for|under|in|please|pls|kindly|la|le|ku|ke|ka|ki|hai|hain|ji)\b/gi, " ")
    .replace(/\b(?:whatsapp|email|gmail|number|phone|mobile|pickup|drop|date|time|airport|transfer|passenger|passengers|people|pax)\b[\s\S]*$/i, " ")
    .replace(/(?:இந்த|புக்கிங்|வந்து|பெயரில்|நேமில்|புக்|பண்ணிக்கோ|பண்ணுங்க|செய்யலாம்|யாருடைய|பெயர்|பெயர்ல|பேர்|என்|என்னோட|க்கு|ல|ஆக|தான்|டா|டி)/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  cleaned = cleaned.split(/\b(?:whatsapp|email|phone|number|pickup|drop|date|time)\b/i)[0].trim();
  if (!cleaned || cleaned.length < 2 || cleaned.length > 60) return "";
  if (/\d/.test(cleaned)) return "";
  if (/(airport|transfer|pickup|drop|passenger|luggage|hotel|tour|package|confirm|submit)/i.test(cleaned)) return "";
  if (!/^[\p{L}\p{M}][\p{L}\p{M}\s.'-]+$/u.test(cleaned)) return "";
  return /[^\u0000-\u007F]/.test(cleaned) ? cleaned : titleCase(cleaned);
}

export function extractLocation(text) {
  const value = norm(text);
  const lower = stripMarks(value);
  const hits = [];
  for (const [canonical, aliases] of locationAliases) {
    for (const alias of aliases) {
      const index = lower.indexOf(alias.toLowerCase());
      if (index >= 0) hits.push({ canonical, index, length: alias.length });
    }
  }
  if (hits.length) return hits.sort((a, b) => a.index - b.index || b.length - a.length)[0].canonical;

  let cleaned = ` ${value} `;
  for (const word of travelWords.sort((a, b) => b.length - a.length)) {
    cleaned = cleaned.replace(new RegExp(`(^|\\s)${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=\\s|$)`, "giu"), " ");
  }
  cleaned = cleaned
    .replace(/\b(?:i|we|need|want|go|going|should|would|like|enga|enna|vanthu|வந்து|என்னா|எங்கே|எனக்கு)\b/giu, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned || /^(yes|no|ok|okay|hello|hi|vanakkam)$/i.test(cleaned)) return "";
  if (/\d{2,}/.test(cleaned)) return "";
  return /[^\u0000-\u007F]/.test(cleaned) ? cleaned : titleCase(cleaned);
}

export function extractRoute(text) {
  const value = norm(text);
  const fromTo = value.match(/\bfrom\s+(.+?)\s+to\s+(.+?)(?:$|\s+on\s+|\s+at\s+|\s+for\s+|\s+tomorrow|\s+today)/i);
  if (fromTo) {
    return {
      pickupLocation: extractLocation(fromTo[1]),
      dropoffLocation: extractLocation(fromTo[2])
    };
  }
  return {};
}

export function extractBookingEntities(text, { targetField = "" } = {}) {
  const route = extractRoute(text);
  const date = extractDate(text);
  const time = extractTime(text);
  const passengers = extractPassengers(text);
  const whatsapp = extractPhone(text);
  const email = extractEmail(text);
  const entities = {
    pickupLocation: route.pickupLocation || "",
    dropoffLocation: route.dropoffLocation || "",
    date,
    time,
    passengers,
    name: extractName(text),
    whatsapp,
    email
  };

  const field = normalizeFieldName(targetField);
  if (field === "pickupLocation") entities.pickupLocation = extractLocation(text);
  if (field === "dropoffLocation") entities.dropoffLocation = extractLocation(text);
  if (field === "date") entities.date = date || extractDate(text);
  if (field === "time") entities.time = time || extractTime(text);
  if (field === "passengers") entities.passengers = passengers || findNumber(text, 99) || "";
  if (field === "whatsapp") entities.whatsapp = whatsapp;
  if (field === "email") entities.email = email;
  if (field === "name") entities.name = extractName(text);
  return entities;
}

export function normalizeFieldName(value) {
  const raw = norm(value).toLowerCase();
  const compact = raw
    .replace(/\b(?:the|new|old|current|please|my|this|booking|detail|details|field|value|location|loc|idam|இடம்)\b/giu, "")
    .replace(/[^\p{L}\p{M}a-z]/giu, "")
    .toLowerCase();
  return fieldAliases[raw] || fieldAliases[compact] || "";
}

export function isEditCommand(text) {
  const lower = stripMarks(text);
  return updateWords.some((word) => lower.includes(word.toLowerCase())) || /\b(?:should be|is wrong)\b/i.test(text || "");
}

function splitEditCommand(text) {
  const value = norm(text);
  const english = value.match(/\b(?:update|change|correct|set|modify|replace|edit|make|revise)\s+(?:the\s+)?([\p{L}\p{M}a-z\s-]+?)\s+(?:to|as|with)\s+(.+)$/iu);
  if (english) return { field: english[1], value: english[2], remove: false };

  const tamil = value.match(/([\p{L}\p{M}a-z\s-]+?)\s*(?:பதிலாக|பதிலா|மாற்று|மாத்து|change pannu|update pannu|maatru|maathu|badhilaga|badilaga)\s+(.+)$/iu);
  if (tamil) return { field: tamil[1], value: tamil[2], remove: false };

  const hindi = value.match(/([\p{L}\p{M}a-z\s-]+?)\s*(?:badal do|badlo|बदल|सही)\s+(.+)$/iu);
  if (hindi) return { field: hindi[1], value: hindi[2], remove: false };

  const removal = value.match(/\b(?:remove|clear|delete|erase|நீக்கு|அழி|hatao|nikalo|supprimer|effacer|删除|清除)\s+(?:the\s+)?([\p{L}\p{M}a-z\s-]+?)$/iu);
  if (removal) return { field: removal[1], value: "", remove: true };

  const lower = stripMarks(value);
  for (const word of removeWords) {
    const index = lower.indexOf(word.toLowerCase());
    if (index < 0) continue;
    const before = value.slice(0, index).trim();
    const after = value.slice(index + word.length).trim();
    return { field: after || before, value: "", remove: true };
  }

  const genericUpdateWords = updateWords.filter((word) => !removeWords.includes(word));
  for (const word of genericUpdateWords) {
    const index = lower.indexOf(word.toLowerCase());
    if (index < 0) continue;
    const before = value.slice(0, index).trim();
    const after = value.slice(index + word.length).replace(/^(?:to|as|with|க்கு|ஆக|से|को)\s+/i, "").trim();
    if (before && after) return { field: before, value: after, remove: false };
  }
  return null;
}

export function extractFieldValue(field, text) {
  const normalized = normalizeFieldName(field) || field;
  const entities = extractBookingEntities(text, { targetField: normalized });
  if (normalized === "pickupLocation" || normalized === "pickup") return entities.pickupLocation || extractLocation(text);
  if (normalized === "dropoffLocation" || normalized === "dropoff") return entities.dropoffLocation || extractLocation(text);
  if (normalized === "date") return entities.date;
  if (normalized === "time") return entities.time;
  if (normalized === "passengers") return entities.passengers || findNumber(text, 99) || "";
  if (normalized === "whatsapp" || normalized === "phone") return entities.whatsapp;
  if (normalized === "email") return entities.email;
  if (normalized === "name") return entities.name || extractName(text);
  return "";
}

export function applyBookingEditCommand(text, draft) {
  const command = splitEditCommand(text);
  if (!command) return { draft, handled: false };
  const field = normalizeFieldName(command.field);
  if (!field) return { draft, handled: false };

  const next = { ...draft };
  const draftKey = field === "pickupLocation" ? "pickup" : field === "dropoffLocation" ? "dropoff" : field === "whatsapp" ? "phone" : field;
  if (command.remove) {
    next[draftKey] = "";
    return { draft: next, handled: true };
  }
  const cleanValue = extractFieldValue(field, command.value);
  if (cleanValue) next[draftKey] = cleanValue;
  return { draft: next, handled: true };
}

export function normalizeBookingDraft(draft) {
  const next = { ...draft };
  if (next.pickup) next.pickup = extractFieldValue("pickupLocation", next.pickup) || next.pickup;
  if (next.dropoff) next.dropoff = extractFieldValue("dropoffLocation", next.dropoff) || next.dropoff;
  if (next.date) next.date = extractDate(next.date) || next.date;
  if (next.time) next.time = extractTime(next.time) || next.time;
  if (next.passengers) next.passengers = String(extractPassengers(String(next.passengers)) || findNumber(String(next.passengers), 99) || next.passengers);
  if (next.phone) next.phone = extractPhone(next.phone) || next.phone;
  if (next.email) next.email = extractEmail(next.email) || next.email;
  if (next.name) next.name = extractName(next.name) || next.name;
  return next;
}
