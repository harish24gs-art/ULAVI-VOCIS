import { supportedTravelLanguages, languageSpecificDictionary } from "./TravelEntityDictionary.js";

const services = [
  "airport transfer",
  "ground transfer",
  "long distance transfer",
  "cross border transfer",
  "hourly package",
  "medical equipment transfer",
  "chauffeur service",
  "tour package"
];

const englishTemplates = [
  "I need {service}",
  "book {service}",
  "arrange {service}",
  "need pickup for {service}",
  "want {service} tomorrow",
  "can you send {service}",
  "I want to go to {place}",
  "pickup from {place}",
  "drop me at {place}",
  "need car for {count} people"
];

const languageTemplates = {
  Tamil: ["{service} வேணும்", "{place} போகணும்", "{place} வரைக்கும் போகணும்", "பிக்கப் பண்ணுங்க", "ட்ராப் பண்ணுங்க", "{count} பேர் பயணம்"],
  Tanglish: ["{service} venum", "{place} poganum", "{place} varaikum poganum", "pickup pannunga", "drop pannunga", "{count} peru travel"],
  Hindi: ["{service} chahiye", "{place} jana hai", "{place} tak jana hai", "pickup karna", "drop karna", "{count} log travel karenge"],
  Malayalam: ["{service} venam", "{place} pokanam", "pickup venam", "drop cheyyanam"],
  Kannada: ["{service} beku", "{place} hogbeku", "pickup madi", "drop madi"],
  Telugu: ["{service} kavali", "{place} vellali", "pickup cheyyandi", "drop cheyyandi"],
  Bengali: ["{service} chai", "{place} jete hobe", "pickup lagbe", "drop kore din"],
  Urdu: ["{service} chahiye", "{place} jana hai", "pickup karna", "drop karna"],
  Arabic: ["اريد {service}", "اذهب الى {place}", "استلام من {place}", "توصيل الى {place}"],
  Malay: ["saya perlukan {service}", "nak pergi {place}", "pickup di {place}", "hantar ke {place}"],
  French: ["je veux {service}", "aller a {place}", "prise en charge a {place}", "deposez moi a {place}"],
  Chinese: ["我要{service}", "去{place}", "从{place}接我", "送我到{place}"],
  Japanese: ["{service} が必要です", "{place} に行きたい", "{place} で迎えに来て", "{place} まで送って"],
  Korean: ["{service} 필요해요", "{place} 가고 싶어요", "{place}에서 픽업", "{place}까지 데려다 주세요"]
};

const places = ["airport", "Chennai", "Coimbatore", "Villivakkam", "hotel", "station", "hospital"];
const counts = ["1", "2", "3", "4", "5", "10"];

function fill(template, service, place, count) {
  return template
    .replace("{service}", service)
    .replace("{place}", place)
    .replace("{count}", count);
}

export const TravelIntentPatterns = supportedTravelLanguages.flatMap((language) => {
  const templates = languageTemplates[language] || englishTemplates;
  const languageIntents = languageSpecificDictionary[language]?.travel_intents || [];
  const generated = [];
  for (const template of templates) {
    for (const service of services) generated.push(fill(template, service, places[generated.length % places.length], counts[generated.length % counts.length]));
    for (const place of places) generated.push(fill(template, services[generated.length % services.length], place, counts[generated.length % counts.length]));
  }
  return [...languageIntents, ...generated].map((pattern) => ({
    language,
    category: "travel_intent",
    normalizedValue: "travel_booking_request",
    pattern
  }));
});
