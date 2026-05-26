import { GROUP_MAPPING } from "./compare.constants.js";

export const getStubRating = (id) => {
  if (!id) return { rating: 4.2, count: 28 };

  const hash = String(id)
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const rating = (3.5 + (hash % 15) / 10).toFixed(1);
  const count = 8 + (hash % 120);

  return { rating: parseFloat(rating), count };
};

export const hasDiff = (values) => {
  if (values.length <= 1) return false;
  const normalized = values.map((value) => String(value).trim().toLowerCase());
  return new Set(normalized).size > 1;
};

export const normalizeAttributes = (attributes) => {
  if (!attributes || !Array.isArray(attributes)) return [];

  // Check if it's already in the new grouped format
  if (attributes.length > 0 && attributes[0].groupName !== undefined) {
    return attributes;
  }

  // Otherwise, group on the fly
  const getGroupName = (key) => {
    if (!key) return "Інші характеристики";
    const trimmedKey = key.trim();
    for (const [groupName, keys] of Object.entries(GROUP_MAPPING)) {
      if (keys.some(k => k.toLowerCase() === trimmedKey.toLowerCase())) {
        return groupName;
      }
    }
    return "Інші характеристики";
  };

  const groupsMap = {};
  attributes.forEach((attr) => {
    if (attr && attr.key) {
      const groupName = getGroupName(attr.key);
      if (!groupsMap[groupName]) {
        groupsMap[groupName] = [];
      }
      groupsMap[groupName].push({
        key: attr.key.trim(),
        value: attr.value != null ? String(attr.value).trim() : "",
      });
    }
  });

  return Object.entries(groupsMap).map(([groupName, items]) => ({
    groupName,
    items,
  }));
};
