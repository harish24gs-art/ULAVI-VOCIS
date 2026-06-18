import { extractPhone } from "./BookingEntityExtractor.js";
import { inferPhoneCountry, validatePhoneForTravel } from "./PhoneValidationRules.js";

export function normalizePhone(value, defaultCountryCode = "+91", draft = {}) {
  const phone = extractPhone(value);
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  const country = inferPhoneCountry({ draft, value });
  const validation = validatePhoneForTravel(phone, { country });
  if (validation.valid) return validation.normalized;
  if (phone.startsWith("+")) return "";
  if (digits.length === 10 && defaultCountryCode) {
    const fallback = validatePhoneForTravel(`${defaultCountryCode}${digits}`, { country: "India" });
    return fallback.valid ? fallback.normalized : "";
  }
  return "";
}
