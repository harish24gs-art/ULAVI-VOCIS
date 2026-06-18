const airportAliases = {
  "Singapore Changi Airport": ["sin", "changi", "changi airport", "singapore airport", "singapore changi"],
  "Chennai International Airport": ["maa", "madras airport", "chennai airport", "meenambakkam airport", "chennai international"],
  "Kuala Lumpur International Airport": ["klia", "kuala lumpur airport", "kl airport"],
  "Coimbatore International Airport": ["coimbatore airport", "cjb", "kovai airport"],
  "Madurai Airport": ["madurai airport", "ixm"],
  "Kempegowda International Airport": ["blr", "bangalore airport", "bengaluru airport"],
  "Dubai International Airport": ["dxb", "dubai airport"],
  "Hamad International Airport": ["doh", "doha airport"]
};

function normalize(value) {
  return String(value || "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

export function resolveAirport(value) {
  const text = normalize(value);
  if (!text) return { value: "", type: "", confidence: 0, valid: false };

  for (const [airport, aliases] of Object.entries(airportAliases)) {
    const all = [airport, ...aliases].map(normalize);
    const matched = all.find((alias) => alias && (text === alias || text.includes(alias) || alias.includes(text)));
    if (matched) {
      return {
        value: airport,
        type: "airport",
        confidence: text === matched ? 0.98 : 0.88,
        valid: true,
        source: "airport_alias"
      };
    }
  }

  if (/\bairport\b|விமான|एयरपोर्ट|aeroport/i.test(value)) {
    return {
      value: String(value || "").trim(),
      type: "airport",
      confidence: 0.62,
      valid: true,
      source: "airport_signal"
    };
  }

  return { value: "", type: "", confidence: 0, valid: false };
}

