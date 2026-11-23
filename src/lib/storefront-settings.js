export const DEFAULT_WHATSAPP_PHONE = "2349066455450";

export function normalizeWhatsAppPhone(value) {
  if (typeof value !== "string" || !/^\+?[\d\s()-]+$/.test(value.trim())) {
    return null;
  }

  const phone = value.replace(/\D/g, "");
  return phone.length >= 8 && phone.length <= 15 ? phone : null;
}
