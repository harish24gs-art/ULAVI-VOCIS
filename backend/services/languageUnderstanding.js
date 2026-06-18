const CURRENT_YEAR = 2026;

const numberWords = new Map([
  ["zero", 0], ["oh", 0], ["o", 0], ["nil", 0],
  ["one", 1], ["first", 1], ["won", 1],
  ["two", 2], ["second", 2], ["too", 2], ["to", 2],
  ["three", 3], ["third", 3], ["tree", 3],
  ["four", 4], ["forth", 4], ["for", 4],
  ["five", 5], ["fifth", 5],
  ["six", 6], ["sixth", 6],
  ["seven", 7], ["seventh", 7],
  ["eight", 8], ["eighth", 8], ["ate", 8],
  ["nine", 9], ["ninth", 9],
  ["ten", 10], ["tenth", 10],
  ["eleven", 11], ["eleventh", 11],
  ["twelve", 12], ["twelfth", 12],
  ["thirteen", 13], ["fourteen", 14], ["fifteen", 15], ["sixteen", 16],
  ["seventeen", 17], ["eighteen", 18], ["nineteen", 19], ["twenty", 20],
  ["twenty one", 21], ["twenty two", 22], ["twenty three", 23], ["twenty four", 24],
  ["twenty five", 25], ["twenty six", 26], ["twenty seven", 27], ["twenty eight", 28],
  ["twenty nine", 29], ["thirty", 30], ["thirty one", 31],

  ["onnu", 1], ["oru", 1], ["rendu", 2], ["irandu", 2], ["randu", 2],
  ["moonu", 3], ["moonru", 3], ["moodu", 3], ["naalu", 4], ["nalu", 4],
  ["anju", 5], ["ainthu", 5], ["aaru", 6], ["aru", 6], ["elu", 7], ["ezhu", 7],
  ["ettu", 8], ["ettu", 8], ["onbadhu", 9], ["ombathu", 9], ["pathu", 10],
  ["patthu", 10], ["pathinonnu", 11], ["padhinonnu", 11], ["pannirendu", 12],
  ["panirendu", 12], ["pannendu", 12], ["pannandu", 12], ["pannendu", 12],
  ["pathimoonu", 13], ["pathinaalu", 14], ["pathinanju", 15], ["pathinaru", 16],
  ["pathinezhu", 17], ["pathinettu", 18], ["pathonbadhu", 19], ["irubathu", 20],

  ["ஒன்று", 1], ["ஒன்னு", 1], ["ஒரு", 1], ["முதல்", 1], ["மொதல்", 1],
  ["இரண்டு", 2], ["ரெண்டு", 2], ["ரண்டு", 2], ["இரண்டாம்", 2],
  ["மூன்று", 3], ["மூனு", 3], ["மூணு", 3],
  ["நான்கு", 4], ["நாலு", 4],
  ["ஐந்து", 5], ["அஞ்சு", 5],
  ["ஆறு", 6], ["ஆரு", 6],
  ["ஏழு", 7], ["எழு", 7],
  ["எட்டு", 8], ["எட்டாம்", 8],
  ["ஒன்பது", 9], ["ஒம்பது", 9],
  ["பத்து", 10], ["பத்தாம்", 10],
  ["பதினொன்று", 11], ["பதினோரு", 11], ["பதினோராம்", 11], ["பதினோறாம்", 11],
  ["பன்னிரண்டு", 12], ["பன்னிரெண்டு", 12], ["பன்னெண்டு", 12], ["பனிரெண்டு", 12],
  ["பனிரண்டு", 12], ["பன்னிரண்டாம்", 12], ["பன்னெண்டாம்", 12], ["பலடா", 12],
  ["பதிமூன்று", 13], ["பதினான்கு", 14], ["பதினைந்து", 15], ["பதினாறு", 16],
  ["பதினேழு", 17], ["பதினெட்டு", 18], ["பத்தொன்பது", 19], ["இருபது", 20],

  ["एक", 1], ["पहला", 1], ["दो", 2], ["दूसरा", 2], ["तीन", 3], ["चार", 4],
  ["पांच", 5], ["पाँच", 5], ["छह", 6], ["सात", 7], ["आठ", 8], ["नौ", 9],
  ["दस", 10], ["ग्यारह", 11], ["बारह", 12], ["तेरह", 13], ["चौदह", 14],
  ["पंद्रह", 15], ["सोलह", 16], ["सत्रह", 17], ["अठारह", 18], ["उन्नीस", 19],
  ["बीस", 20],

  ["un", 1], ["une", 1], ["deux", 2], ["trois", 3], ["quatre", 4], ["cinq", 5],
  ["six", 6], ["sept", 7], ["huit", 8], ["neuf", 9], ["dix", 10],
  ["onze", 11], ["douze", 12], ["treize", 13], ["quatorze", 14], ["quinze", 15],
  ["seize", 16], ["vingt", 20],

  ["satu", 1], ["dua", 2], ["tiga", 3], ["empat", 4], ["lima", 5],
  ["enam", 6], ["tujuh", 7], ["lapan", 8], ["sembilan", 9], ["sepuluh", 10],

  ["ஒன்", 1], ["டூ", 2], ["த்ரீ", 3], ["ஃபோர்", 4], ["போர்", 4],
  ["ஃபைவ்", 5], ["பைவ்", 5], ["சிக்ஸ்", 6], ["செவன்", 7], ["எயிட்", 8],
  ["நைன்", 9], ["டென்", 10], ["லெவன்", 11], ["ட்வெல்வ்", 12]
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
  ["செவன்", 7], ["செவண்", 7],
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
  const tokens = normalizeText(text)
    .toLowerCase()
    .replace(/[-–—,/()]+/g, " ")
    .match(/[\p{L}\p{M}\p{N}]+/gu) || [];

  const digits = [];
  let repeat = 1;
  let sawSpokenDigit = false;

  for (const token of tokens) {
    const multiplier = phoneRepeatWords.get(token);
    if (multiplier) {
      repeat = multiplier;
      continue;
    }

    let digit = "";
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
  ["january", 1], ["jan", 1], ["janvier", 1], ["जनवरी", 1], ["ஜனவரி", 1],
  ["february", 2], ["feb", 2], ["fevrier", 2], ["février", 2], ["फरवरी", 2], ["பிப்ரவரி", 2],
  ["march", 3], ["mar", 3], ["mars", 3], ["मार्च", 3], ["மார்ச்", 3],
  ["april", 4], ["apr", 4], ["avril", 4], ["अप्रैल", 4], ["ஏப்ரல்", 4],
  ["may", 5], ["mai", 5], ["मई", 5], ["மே", 5],
  ["june", 6], ["jun", 6], ["juin", 6], ["जून", 6], ["ஜூன்", 6], ["ஜுன்", 6],
  ["july", 7], ["jul", 7], ["juillet", 7], ["जुलाई", 7], ["ஜூலை", 7], ["ஜுலை", 7],
  ["august", 8], ["aug", 8], ["aout", 8], ["août", 8], ["अगस्त", 8], ["ஆகஸ்ட்", 8],
  ["september", 9], ["sep", 9], ["septembre", 9], ["सितंबर", 9], ["செப்டம்பர்", 9],
  ["october", 10], ["oct", 10], ["octobre", 10], ["अक्टूबर", 10], ["அக்டோபர்", 10],
  ["november", 11], ["nov", 11], ["novembre", 11], ["नवंबर", 11], ["நவம்பர்", 11],
  ["december", 12], ["dec", 12], ["decembre", 12], ["décembre", 12], ["दिसंबर", 12], ["டிசம்பர்", 12]
]);

const placeAliases = [
  ["Chennai Airport", ["chennai airport", "madras airport", "maa airport", "சென்னை airport", "சென்னை விமான நிலையம்"]],
  ["Chennai", ["chennai", "chenai", "channai", "madras", "சென்னை", "சென்னையிலிருந்து", "சென்னையில்ருந்து", "சென்னையில்", "சென்னைக்கு"]],
  ["Coimbatore", ["coimbatore", "coimbator", "kovai", "கோயம்பத்தூர்", "கோயம்பத்தூரில்", "கோயம்பத்தூருக்கு", "கோவை", "கோவைக்கு"]],
  ["Madurai", ["madurai", "மதுரை", "மதுரையில்", "மதுரைக்கு"]],
  ["Madurai Airport", ["madurai airport", "மதுரை airport", "மதுரை விமான நிலையம்"]],
  ["Trichy", ["trichy", "tiruchirappalli", "திருச்சி", "திருச்சிக்கு"]],
  ["Changi Airport", ["changi", "changi airport", "sin airport", "singapore airport"]],
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

function normalizeText(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/\b([ap])\s*\.?\s*m\.?\b/gi, "$1m")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, "\"")
    .replace(/[.,!?;]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactDate(day, month, year = CURRENT_YEAR) {
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y)) return "";
  if (d < 1 || d > 31 || m < 1 || m > 12 || y < CURRENT_YEAR || y > 2100) return "";
  return `${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}.${y}`;
}

function findWordNumber(text, max = 100) {
  const value = normalizeText(text).toLowerCase();
  const numeric = value.match(/\b\d{1,3}\b/)?.[0];
  if (numeric && Number(numeric) <= max) return Number(numeric);
  const matches = [...numberWords.entries()]
    .filter(([, number]) => number <= max)
    .map(([word, number]) => {
      const index = value.indexOf(word.toLowerCase());
      return { word, number, index };
    })
    .filter((match) => match.index >= 0)
    .sort((a, b) => a.index - b.index || b.word.length - a.word.length);
  return matches[0]?.number || null;
}

export function extractKnownPlace(text) {
  const value = normalizeText(text).toLowerCase();
  const hits = [];
  for (const [canonical, aliases] of placeAliases) {
    for (const alias of aliases) {
      const index = value.indexOf(alias.toLowerCase());
      if (index >= 0) hits.push({ canonical, index, length: alias.length });
    }
  }
  return hits.sort((a, b) => a.index - b.index || b.length - a.length)[0]?.canonical || "";
}

export function extractRoutePlaces(text) {
  const value = normalizeText(text);
  const lower = value.toLowerCase();
  const matches = [];
  for (const [canonical, aliases] of placeAliases) {
    for (const alias of aliases) {
      const index = lower.indexOf(alias.toLowerCase());
      if (index >= 0) matches.push({ canonical, index, length: alias.length });
    }
  }
  const sorted = matches.sort((a, b) => a.index - b.index || b.length - a.length);
  return {
    pickup: sorted[0]?.canonical || "",
    dropoff: sorted.find((item) => item.canonical !== sorted[0]?.canonical)?.canonical || ""
  };
}

export function parseDatePhrase(text) {
  const value = normalizeText(text);
  const lower = value.toLowerCase();
  if (/\btomorrow\b/i.test(value)) return "Tomorrow";
  if (/\btoday\b/i.test(value)) return "Today";

  const numeric = value.match(/\b(\d{1,2})[./-](\d{1,2})(?:[./-](\d{2,4}))?\b/);
  if (numeric) return compactDate(numeric[1], numeric[2], numeric[3]?.length === 2 ? `20${numeric[3]}` : numeric[3] || CURRENT_YEAR);

  for (const [monthName, month] of monthWords) {
    const monthKey = monthName.toLowerCase();
    const asciiMonth = /^[a-z]+$/.test(monthKey);
    const monthRegex = asciiMonth
      ? new RegExp(`\\b${monthKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i")
      : null;
    const regexMatch = monthRegex ? lower.match(monthRegex) : null;
    const index = asciiMonth ? (regexMatch?.index ?? -1) : lower.indexOf(monthKey);
    if (index < 0) continue;
    const before = lower.slice(Math.max(0, index - 80), index);
    const after = lower.slice(index + monthName.length, index + monthName.length + 80);
    const day = findWordNumber(after, 31) || findWordNumber(before, 31);
    const year = value.match(/\b(20\d{2})\b/)?.[1] || CURRENT_YEAR;
    if (day) return compactDate(day, month, year);
  }
  return "";
}

export function parseTimePhrase(text) {
  const value = normalizeText(text);
  const lower = value.toLowerCase();
  const meridiem = /(pm|evening|night|tonight|மாலை|இரவு|நைட்|ஈவ்னிங்|shaam|रात)/i.test(value)
    ? "PM"
    : "AM";
  const explicit = value.match(/\b(\d{1,2})(?::(\d{2})|\.(\d{1,2}))?\s*(am|pm)\b/i);
  if (explicit) return `${Number(explicit[1])}:${String(explicit[2] || explicit[3] || "00").padStart(2, "0")} ${explicit[4].toUpperCase()}`;
  const clock = value.match(/\b(\d{1,2})(?::(\d{2})|\.(\d{1,2}))?\s*(?:o'?clock|clock)\b/i);
  const tamilClockSignal = /(மணி|மணிக்கு|நேரம்|காலை|மார்னிங்|கிளாக்|ஓக்ளாக்|ஒக்ளாக்)/.test(value);
  const wordHour = findWordNumber(value, 12);
  const hour = clock ? Number(clock[1]) : wordHour;
  if ((clock || tamilClockSignal || /\b(morning|afternoon|evening|night|time|pickup)\b/i.test(value)) && hour >= 1 && hour <= 12) {
    return `${hour}:${String(clock?.[2] || clock?.[3] || "00").padStart(2, "0")} ${meridiem}`;
  }
  return "";
}

export function parsePassengerPhrase(text) {
  const value = normalizeText(text);
  if (!/(passenger|passengers|pax|people|persons|travellers?|adults?|பேர்|பயணம்|டிராவல்|travel|log|लोग|passagers)/i.test(value)) return "";
  const number = findWordNumber(value, 99);
  return number ? String(number) : "";
}

export function parsePackageHoursPhrase(text) {
  const value = normalizeText(text);
  if (!/(hours?|hrs?|hourly|package|chauffeur|மணிநேரம்|எத்தனை மணி நேரம்|பேக்கேஜ்|heures?)/i.test(value)) return "";
  const number = findWordNumber(value, 24);
  return number ? String(number) : "";
}

export function parsePhonePhrase(text) {
  const value = normalizeText(text);
  const directMatches = [...value.matchAll(/\+?\d(?:[\d\s().-]*\d){7,}/g)].map((match) => match[0]);
  for (const direct of directMatches) {
    const cleaned = cleanPhoneDigits(direct, direct.trim().startsWith("+"));
    if (cleaned) return cleaned;
  }
  return spokenPhoneDigits(value);
}

export function extractEmailPhrase(text) {
  const direct = String(text || "").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
  if (direct) return direct.toLowerCase();
  let value = normalizeText(text).toLowerCase();
  value = value
    .replace(/\s+(at the rate|at rate|at)\s+/g, "@")
    .replace(/\s+(dot|டாட்|டோட்|புள்ளி)\s+/g, ".")
    .replace(/\s+/g, "");
  const recovered = value.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/)?.[0];
  return recovered || "";
}

export function extractNamePhrase(text) {
  let value = normalizeText(text);
  const english = value.match(/\b(?:my name is|name is|i am|this is|booking (?:for|under)|book (?:for|under|in))\s+([\p{L}][\p{L}\s.'-]{1,60})/iu)?.[1];
  if (english) return cleanName(english);
  value = value
    .replace(/\b(?:booking|book|name|contact|customer|update|change|correct|set|to|as|is)\b/gi, " ")
    .replace(/(?:இந்த|புக்கிங்|வந்து|பெயரில்|நேமில்|புக்|பண்ணிக்கோ|செய்யலாம்|யாருடைய|பெயர்|பெயர்ல|என்|என்னோட)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleanName(value);
}

function cleanName(value) {
  const cleaned = normalizeText(value).replace(/[^\p{L}\p{M}\s.'-]/gu, " ").replace(/\s+/g, " ").trim();
  if (!cleaned || cleaned.length < 2 || cleaned.length > 60) return "";
  if (/(whatsapp|email|gmail|number|phone|pickup|drop|date|time)/i.test(cleaned)) return "";
  return /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]+$/u.test(cleaned) ? cleaned : "";
}

export function numberFromLanguage(text, max = 100) {
  return findWordNumber(text, max);
}
