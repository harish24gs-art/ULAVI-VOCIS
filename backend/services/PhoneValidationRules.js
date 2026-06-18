const countryRules = [
  {
    country: "India",
    code: "+91",
    localPattern: /^[6-9]\d{9}$/,
    stripLeadingZeroForInternational: false,
    aliases: ["india", "chennai", "villivakkam", "t nagar", "anna nagar", "coimbatore", "madurai", "bengaluru", "hyderabad", "mumbai", "delhi"]
  },
  {
    country: "Singapore",
    code: "+65",
    localPattern: /^[89]\d{7}$/,
    stripLeadingZeroForInternational: false,
    aliases: ["singapore", "changi", "marina bay sands", "sentosa", "orchard", "jurong"]
  },
  {
    country: "Malaysia",
    code: "+60",
    localPattern: /^01\d{8,9}$/,
    stripLeadingZeroForInternational: true,
    aliases: ["malaysia", "klia", "kuala lumpur", "bukit bintang", "petronas", "genting", "penang", "langkawi", "johor"]
  },
  {
    country: "UAE",
    code: "+971",
    localPattern: /^05[02568]\d{7}$/,
    stripLeadingZeroForInternational: true,
    aliases: ["uae", "dubai", "burj khalifa", "dubai marina", "palm jumeirah", "abu dhabi"]
  },
  {
    country: "France",
    code: "+33",
    localPattern: /^0[67]\d{8}$/,
    stripLeadingZeroForInternational: true,
    aliases: ["france", "paris", "charles de gaulle", "eiffel", "louvre"]
  },
  {
    country: "Saudi Arabia",
    code: "+966",
    localPattern: /^05[0345]\d{7}$/,
    stripLeadingZeroForInternational: true,
    aliases: ["saudi", "saudi arabia", "riyadh", "jeddah", "makkah", "madinah"]
  },
  {
    country: "Japan",
    code: "+81",
    localPattern: /^0[789]0\d{8}$/,
    stripLeadingZeroForInternational: true,
    aliases: ["japan", "tokyo", "narita", "shibuya", "shinjuku", "osaka"]
  },
  {
    country: "China",
    code: "+86",
    localPattern: /^1[3-9]\d{9}$/,
    stripLeadingZeroForInternational: false,
    aliases: ["china", "beijing", "shanghai", "guangzhou", "shenzhen"]
  },
  {
    country: "Vietnam",
    code: "+84",
    localPattern: /^0[35789]\d{8}$/,
    stripLeadingZeroForInternational: true,
    aliases: ["vietnam", "ho chi minh", "hanoi", "da nang"]
  },
  {
    country: "Indonesia",
    code: "+62",
    localPattern: /^08\d{8,11}$/,
    stripLeadingZeroForInternational: true,
    aliases: ["indonesia", "jakarta", "bali", "surabaya"]
  },
  {
    country: "Thailand",
    code: "+66",
    localPattern: /^0[689]\d{8}$/,
    stripLeadingZeroForInternational: true,
    aliases: ["thailand", "bangkok", "phuket", "pattaya"]
  },
  {
    country: "South Korea",
    code: "+82",
    localPattern: /^010\d{8}$/,
    stripLeadingZeroForInternational: true,
    aliases: ["south korea", "korea", "seoul", "busan", "incheon"]
  },
  {
    country: "UK",
    code: "+44",
    localPattern: /^07\d{9}$/,
    stripLeadingZeroForInternational: true,
    aliases: ["uk", "united kingdom", "london", "manchester", "heathrow"]
  },
  {
    country: "USA",
    code: "+1",
    localPattern: /^[2-9]\d{2}[2-9]\d{6}$/,
    stripLeadingZeroForInternational: false,
    aliases: ["usa", "united states", "new york", "los angeles", "san francisco", "chicago"]
  },
  {
    country: "Australia",
    code: "+61",
    localPattern: /^04\d{8}$/,
    stripLeadingZeroForInternational: true,
    aliases: ["australia", "sydney", "melbourne", "brisbane", "perth"]
  }
];

const messages = {
  English: "That mobile number does not look valid for the selected country. Please share it again with country code if needed.",
  Tamil: "அந்த mobile number சரியாக இல்லை. தேவைப்பட்டால் country code உடன் மீண்டும் சொல்லுங்கள்.",
  Tanglish: "Andha mobile number correct ah illa. Country code oda one more time sollunga.",
  Hindi: "Yeh mobile number selected country ke liye valid nahi lag raha. Country code ke saath dobara batayein.",
  French: "Ce numero mobile ne semble pas valide pour le pays selectionne. Veuillez le redonner avec l'indicatif si besoin.",
  Arabic: "رقم الجوال غير صحيح لهذا البلد. يرجى إرساله مرة أخرى مع رمز الدولة إذا لزم الأمر."
};

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

function debugPhoneValidation(payload) {
  if (process.env.DEBUG_PHONE_VALIDATION === "false") return;
  console.info("[phone-validation]", JSON.stringify(payload));
}

export function inferPhoneCountry({ draft = {}, value = "" } = {}) {
  const haystack = [
    value,
    draft.phone,
    draft.pickup,
    draft.dropoff,
    draft.notes,
    draft.serviceType
  ].join(" ").toLowerCase();

  const digits = digitsOnly(value || draft.phone);
  const hasExplicitPrefix = /^\s*\+/.test(String(value || draft.phone || ""));
  const byCode = hasExplicitPrefix
    ? countryRules.find((rule) => digits.startsWith(rule.code.replace("+", "")))
    : null;
  if (byCode) return byCode.country;

  const indiaRule = countryRules.find((rule) => rule.country === "India");
  if (!hasExplicitPrefix && indiaRule?.localPattern.test(digits)) return "India";

  const byAlias = countryRules.find((rule) => rule.aliases.some((alias) => haystack.includes(alias)));
  return byAlias?.country || "India";
}

export function validatePhoneForTravel(value, { country = "India" } = {}) {
  const digits = digitsOnly(value);
  if (!digits) {
    const result = { valid: false, digits: "", country, normalized: "", reason: "no_digits" };
    debugPhoneValidation({ originalMessage: value, detectedCountry: country, extractedNumber: "", normalizedNumber: "", validationResult: false, reasonForFailure: result.reason });
    return result;
  }

  const hasExplicitPrefix = /^\s*\+/.test(String(value || ""));
  const explicitRule = hasExplicitPrefix
    ? countryRules.find((rule) => digits.startsWith(rule.code.replace("+", "")))
    : null;
  const rule = explicitRule || countryRules.find((item) => item.country === country) || countryRules[0];
  const countryCodeDigits = rule.code.replace("+", "");
  const candidates = [digits];
  if (digits.startsWith(countryCodeDigits) && digits.length > countryCodeDigits.length) {
    candidates.unshift(digits.slice(countryCodeDigits.length));
  }

  const local = candidates.find((candidate) => rule.localPattern.test(candidate)) || digits;
  let valid = rule.localPattern.test(local);
  let resolvedRule = rule;
  let resolvedLocal = local;

  if (!valid && !hasExplicitPrefix) {
    const indiaRule = countryRules.find((item) => item.country === "India");
    if (indiaRule?.localPattern.test(digits)) {
      valid = true;
      resolvedRule = indiaRule;
      resolvedLocal = digits;
    }
  }

  const internationalLocal = resolvedRule.stripLeadingZeroForInternational ? resolvedLocal.replace(/^0/, "") : resolvedLocal;
  const reason = valid
    ? ""
    : `expected ${rule.country} local number matching ${String(rule.localPattern)}`;
  const normalized = valid ? `${resolvedRule.code}${internationalLocal}` : "";
  debugPhoneValidation({
    originalMessage: value,
    detectedCountry: resolvedRule.country,
    extractedNumber: digits,
    normalizedNumber: normalized,
    validationResult: valid,
    reasonForFailure: reason
  });

  return {
    valid,
    digits,
    local: resolvedLocal,
    country: resolvedRule.country,
    normalized,
    reason
  };
}

export function phoneValidationMessage(language = "English") {
  return messages[language] || messages.English;
}

export { countryRules };
