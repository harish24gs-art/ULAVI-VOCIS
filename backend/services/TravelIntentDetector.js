import { TravelIntentPatterns } from "./TravelIntentPatterns.js";

const servicePatterns = [
  {
    serviceType: "Airport Transfer",
    patterns: [/airport|air port|terminal|flight|changi|sin\b|maa\b|aeroport/i, /விமான|ஏர்போர்ட்|एयरपोर्ट|हवाई/i]
  },
  {
    serviceType: "Ground Transfer",
    patterns: [/ground transfer|city ride|local ride|cab|taxi|hotel pickup|station pickup/i, /லோக்கல்|நகர|शहर|टैक्सी/i]
  },
  {
    serviceType: "Long Distance Transfer",
    patterns: [/long distance|outstation|intercity|another city|coimbatore|madurai|trichy|bangalore/i, /தூர|வேறு ஊர்|दूसरे शहर/i]
  },
  {
    serviceType: "Cross Border Transfer",
    patterns: [/cross border|border|johor|malaysia|singapore to malaysia|immigration/i, /எல்லை|बॉर्डर|सीमा/i]
  },
  {
    serviceType: "Day / Hourly Packages",
    patterns: [/hourly|hours package|day package|full day|half day|chauffeur/i, /மணிநேர|நாள் முழுக்க|घंटे|पूरा दिन/i]
  },
  {
    serviceType: "Tour Packages",
    patterns: [/tour package|tour|holiday|vacation|sightseeing|family vacation|destination planning/i, /சுற்றுலா|டூர்|விடுமுறை|यात्रा पैकेज|टूर|छुट्टी/i]
  },
  {
    serviceType: "Medical Equipment Transfer",
    patterns: [/medical equipment|wheelchair|stretcher|oxygen|hospital bed|patient/i, /மருத்துவ|வீல்சேர்|ஆக்சிஜன்|अस्पताल|व्हीलचेयर/i]
  }
];

function scorePattern(pattern, text) {
  return pattern.test(text) ? 1 : 0;
}

export function detectTravelIntent(text, currentService = "") {
  const value = String(text || "");
  const scored = servicePatterns.map((service) => {
    const hits = service.patterns.reduce((sum, pattern) => sum + scorePattern(pattern, value), 0);
    return { serviceType: service.serviceType, hits };
  });

  for (const item of TravelIntentPatterns.slice(0, 900)) {
    const pattern = String(item.pattern || "").toLowerCase();
    if (pattern.length > 4 && value.toLowerCase().includes(pattern)) {
      scored.push({ serviceType: item.normalizedValue || currentService || "", hits: 1 });
    }
  }

  const best = scored.filter((item) => item.hits > 0).sort((a, b) => b.hits - a.hits)[0];
  if (!best) return { serviceType: currentService || "", confidence: currentService ? 0.58 : 0, matched: [] };

  return {
    serviceType: servicePatterns.some((item) => item.serviceType === best.serviceType) ? best.serviceType : currentService || "",
    confidence: Number(Math.min(0.95, 0.55 + best.hits * 0.18).toFixed(2)),
    matched: [best.serviceType]
  };
}
