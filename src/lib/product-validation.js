import { PRODUCT_CATEGORIES } from "@/lib/catalog";

export function isValidProduct(body) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const images = body.images === undefined ? [] : body.images;
  return (
    typeof body.title === "string" &&
    body.title.trim().length > 0 &&
    body.title.trim().length <= 120 &&
    typeof body.description === "string" &&
    body.description.trim().length > 0 &&
    body.description.trim().length <= 2000 &&
    Number.isSafeInteger(body.price) &&
    body.price > 0 &&
    body.price <= 100_000_000 &&
    typeof body.isPublished === "boolean" &&
    PRODUCT_CATEGORIES.some(({ id }) => id === body.category) &&
    Array.isArray(images) &&
    images.length <= 5 &&
    images.every((url) =>
      typeof url === "string" &&
      url.startsWith(`https://res.cloudinary.com/${cloudName}/image/upload/`)
    )
  );
}
