import { extractDate, extractTime } from "./BookingEntityExtractor.js";

export function normalizeTravelDate(value) {
  return extractDate(value) || "";
}

export function normalizeTravelTime(value) {
  return extractTime(value) || "";
}

