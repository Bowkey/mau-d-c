export const DEFAULT_WHATSAPP_PHONE = "2349066455450";
export const DEFAULT_CEO_PROFILE = {
  name: "LUKE MAURINE OMOSINIZIBE",
  description: "A native of Yenagoa, Nigeria, and a graduate of Niger Delta University (NDU).",
  image: "",
};
export const DEFAULT_ANNOUNCEMENT = "A little color, a lot of craft — made and designed by Blukware";
export const DEFAULT_SHOP_ADDRESS = "White House Road, Agudama, Yenagoa";

export function normalizeWhatsAppPhone(value) {
  if (typeof value !== "string" || !/^\+?[\d\s()-]+$/.test(value.trim())) {
    return null;
  }

  const phone = value.replace(/\D/g, "");
  return phone.length >= 8 && phone.length <= 15 ? phone : null;
}

export function normalizeCeoProfile(value) {
  if (value === undefined || value === null) return { ...DEFAULT_CEO_PROFILE };
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("The CEO profile is invalid.");
  }

  const { name, description, image = "" } = value;
  if (
    typeof name !== "string" ||
    !name.trim() ||
    name.trim().length > 120 ||
    typeof description !== "string" ||
    !description.trim() ||
    description.trim().length > 1000 ||
    typeof image !== "string" ||
    image.length > 2000 ||
    (image !== "" && !image.startsWith("https://res.cloudinary.com/"))
  ) {
    throw new Error("The CEO profile is invalid.");
  }

  return {
    name: name.trim(),
    description: description.trim(),
    image,
  };
}

export function normalizeAnnouncement(value) {
  if (typeof value !== "string") return null;
  const announcement = value.trim();
  return announcement.length > 0 && announcement.length <= 200 ? announcement : null;
}

export function normalizeShopAddress(value) {
  if (typeof value !== "string") return null;
  const address = value.trim();
  return address.length > 0 && address.length <= 250 ? address : null;
}
