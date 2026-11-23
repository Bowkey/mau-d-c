const serviceCategories = [
  { id: "service-sewing", label: "Sewing" },
  { id: "service-amendment", label: "Amendment" },
  { id: "service-training", label: "Training" },
  { id: "service-weaving", label: "Weaving" },
];

export const NAV_SECTIONS = [
  { id: "styles", label: "Styles", description: "All sewn designs" },
  { id: "sewing-materials", label: "Sewing materials", description: "Tools and supplies for every project" },
  { id: "fabrics", label: "Fabrics", description: "Find the right fabric for your next design" },
  { id: "sewing-accessories", label: "Sewing accessories", description: "Threads, zips, needles, tapes and more" },
  { id: "sewing-machine-parts", label: "Sewing machine Parts", description: "Needles, plates, ropes, reels and more" },
  // { id: "services", label: "Services", description: "Sewing, amendment, training and weaving", children: serviceCategories },
];

export const PRODUCT_CATEGORIES = NAV_SECTIONS
  .filter((section) => !section.children)
  .map(({ id, label }) => ({ id, label }))
  .concat(serviceCategories);

const legacyCategoryIds = {
  Dresses: "styles",
  Sets: "styles",
  Evening: "styles",
  Accessories: "sewing-accessories",
  Custom: "service-sewing",
};

const visibilityIds = [
  ...PRODUCT_CATEGORIES.map(({ id }) => id),
  "services",
];

export const DEFAULT_CATEGORY_VISIBILITY = Object.fromEntries(
  visibilityIds.map((id) => [id, true])
);

export function normalizeCategoryId(categoryId) {
  return Object.hasOwn(legacyCategoryIds, categoryId)
    ? legacyCategoryIds[categoryId]
    : categoryId;
}

export function getCategoryLabel(categoryId) {
  const normalizedId = normalizeCategoryId(categoryId);
  return PRODUCT_CATEGORIES.find(({ id }) => id === normalizedId)?.label || categoryId;
}

export function normalizeCategoryVisibility(value) {
  const visibility = { ...DEFAULT_CATEGORY_VISIBILITY };
  if (!value || typeof value !== "object" || Array.isArray(value)) return visibility;

  for (const id of visibilityIds) {
    if (typeof value[id] === "boolean") visibility[id] = value[id];
  }
  return visibility;
}

export function isCategoryAvailable(categoryId, visibility) {
  const normalizedId = normalizeCategoryId(categoryId);
  if (!PRODUCT_CATEGORIES.some(({ id }) => id === normalizedId)) return false;
  if (visibility[normalizedId] === false) return false;
  return !normalizedId.startsWith("service-") || visibility.services !== false;
}
