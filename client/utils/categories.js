export const CATEGORY_LABELS = {
  phones: "Смартфони",
  smartphones: "Смартфони",
  laptops: "Ноутбуки",
  tablets: "Планшети",
  other: "Інше",
};

export const getCategoryDisplay = (categoryKey) => {
  if (!categoryKey) return CATEGORY_LABELS.other;

  return (
    CATEGORY_LABELS[categoryKey] ||
    String(categoryKey)
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
};

export const getProductCategoryKey = (product) =>
  product?.category || product?.categorySlug || product?.categoryName || "other";
