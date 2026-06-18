import {
  categorySeedDictionary,
  languageSpecificDictionary,
  numberVariantDictionary,
  supportedTravelLanguages
} from "./TravelEntityDictionary.js";
import { LocationAliasDictionary } from "./LocationAliasDictionary.js";
import { TranscriptionCorrectionDictionary } from "./TranscriptionCorrectionDictionary.js";
import { TravelIntentPatterns } from "./TravelIntentPatterns.js";

function row(language, category, normalizedValue, synonyms = [], slangVariants = [], transcriptionMistakes = []) {
  return {
    language,
    category,
    normalizedValue,
    synonyms: [...new Set(synonyms.filter(Boolean))],
    slangVariants: [...new Set(slangVariants.filter(Boolean))],
    transcriptionMistakes: [...new Set(transcriptionMistakes.filter(Boolean))]
  };
}

function categoryRowsForLanguage(language) {
  const specific = languageSpecificDictionary[language] || {};
  return Object.entries(categorySeedDictionary).map(([category, seed]) => {
    const extra = specific[category] || [];
    return row(
      language,
      category,
      seed.normalizedValue,
      seed.universal,
      extra,
      [...seed.universal, ...extra].map((item) => item.replace(/\s+/g, ""))
    );
  });
}

function numberRowsForLanguage(language) {
  return (numberVariantDictionary[language] || numberVariantDictionary.English).map(([normalizedValue, ...variants]) =>
    row(language, "passenger_count", normalizedValue, variants, variants.map((variant) => `${variant} people`), variants.map((variant) => `${variant}s`))
  );
}

function intentRowsForLanguage(language) {
  return TravelIntentPatterns
    .filter((item) => item.language === language)
    .map((item) => row(language, item.category, item.normalizedValue, [item.pattern], [], []));
}

function locationRowsForLanguage(language) {
  return Object.entries(LocationAliasDictionary).map(([normalizedValue, aliases]) =>
    row(language, "location", normalizedValue, aliases, aliases.filter((alias) => alias.length <= 14), [])
  );
}

function transcriptionRowsForLanguage(language) {
  return Object.entries(TranscriptionCorrectionDictionary).map(([normalizedValue, mistakes]) =>
    row(language, "transcription_correction", normalizedValue, [normalizedValue], [], mistakes)
  );
}

function editCommandRowsForLanguage(language) {
  const variants = {
    English: ["update", "change", "correct", "replace", "remove", "clear", "delete"],
    Tamil: ["மாற்று", "மாத்து", "பதிலாக", "நீக்கு", "அழி", "திருத்து"],
    Tanglish: ["maatru", "maathu", "badhilaga", "badilaga", "neeku", "clear pannu"],
    Hindi: ["badlo", "badal do", "sahi karo", "hatao", "nikalo"],
    French: ["changer", "remplacer", "corriger", "supprimer", "effacer"],
    Chinese: ["更改", "更新", "修改", "删除", "清除"]
  };
  const languageVariants = variants[language] || variants.English;
  return row(language, "edit_command", "edit_booking_detail", languageVariants, languageVariants, []);
}

export const TravelLanguageDataset = supportedTravelLanguages.flatMap((language) => [
  ...categoryRowsForLanguage(language),
  ...numberRowsForLanguage(language),
  ...intentRowsForLanguage(language),
  ...locationRowsForLanguage(language),
  ...transcriptionRowsForLanguage(language),
  editCommandRowsForLanguage(language)
]);

export function getTravelLanguageDatasetSummary() {
  const byLanguage = {};
  const expressionCountByLanguage = {};
  for (const item of TravelLanguageDataset) {
    byLanguage[item.language] = (byLanguage[item.language] || 0) + 1;
    expressionCountByLanguage[item.language] =
      (expressionCountByLanguage[item.language] || 0) +
      1 +
      item.synonyms.length +
      item.slangVariants.length +
      item.transcriptionMistakes.length;
  }
  return {
    languages: Object.keys(byLanguage).length,
    rows: TravelLanguageDataset.length,
    expressions: Object.values(expressionCountByLanguage).reduce((sum, count) => sum + count, 0),
    rowsByLanguage: byLanguage,
    expressionsByLanguage: expressionCountByLanguage
  };
}

export default TravelLanguageDataset;
