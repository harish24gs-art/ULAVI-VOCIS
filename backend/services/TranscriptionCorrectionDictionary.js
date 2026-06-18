export const TranscriptionCorrectionDictionary = {
  coimbatore: ["koyambuthur", "koimbatore", "koyambatore", "coimbator", "koyamputhur", "கோயமுத்தூர்"],
  villivakkam: ["villivakam", "willyvakkam", "willywelcome", "villivakkum", "villiwakkam", "வில்லிவாகம்"],
  chennai: ["chenai", "channai", "chainai", "சன்னை", "செனை"],
  "chennai airport": ["chenai airport", "channai airport", "chennai air port", "madras airport"],
  madurai: ["madhurai", "mathurai", "madraei"],
  trichy: ["tiruchy", "trichi", "tiruchirapalli"],
  pickup: ["pick up", "pikkup", "pic up", "piku", "பிக்கோப்"],
  dropoff: ["drop off", "drop of", "drop-off", "டிராப் ஆப்"],
  airport: ["air port", "aero port", "airpot", "aerport", "ஏர்போட்"],
  passengers: ["passangers", "passinger", "pessengers", "பாசஞ்சர்ஸ்"],
  luggage: ["laggage", "lugage", "luggages", "லக்கேஜ்"],
  tomorrow: ["tomoro", "tommorow", "tomarrow"],
  morning: ["mornin", "morningg", "மார்னிங்"],
  evening: ["eveing", "evenin", "ஈவ்னிங்"],
  whatsapp: ["whats app", "watsapp", "whatsapp number", "வாட்ஸப்"],
  email: ["e mail", "gmail id", "mail id", "இமெயில்"]
};

export const TranscriptionCorrectionEntries = Object.entries(TranscriptionCorrectionDictionary).flatMap(([normalizedValue, variants]) =>
  variants.map((variant) => ({ normalizedValue, variant }))
);

export function correctTranscriptionToken(value) {
  const input = String(value || "").toLowerCase().trim();
  for (const [normalizedValue, variants] of Object.entries(TranscriptionCorrectionDictionary)) {
    if (input === normalizedValue || variants.some((variant) => variant.toLowerCase() === input)) return normalizedValue;
  }
  return value;
}
