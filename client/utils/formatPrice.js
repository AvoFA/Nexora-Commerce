/**
 * Formats a numeric price value into a Ukrainian locale string with the ₴ symbol.
 * Use this everywhere a price needs to be displayed to the user.
 *
 * @param {number|string|null|undefined} value - The price to format.
 * @returns {string} Formatted price string, e.g. "46 798 ₴"
 *
 * @example
 * formatPrice(46798)   // "46 798 ₴"
 * formatPrice(0)       // "0 ₴"
 * formatPrice(null)    // "0 ₴"
 */
export const formatPrice = (value) =>
  `${Number(value || 0).toLocaleString("uk-UA")} ₴`;

export const hasProductDiscount = (product) => {
  const price = Number(product?.price || 0);
  const compareAtPrice = Number(product?.compareAtPrice || 0);

  return price > 0 && compareAtPrice > price;
};

export const getProductDiscountAmount = (product) => {
  if (!hasProductDiscount(product)) return 0;

  return Number(product.compareAtPrice) - Number(product.price);
};
