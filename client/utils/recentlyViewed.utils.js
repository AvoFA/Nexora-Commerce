/**
 * Utilities for managing recently viewed products in localStorage.
 */

const STORAGE_KEY = 'recently_viewed_products';
const MAX_RECENTLY_VIEWED = 12;

/**
 * Gets the list of recently viewed products from localStorage.
 * @returns {Array} List of products
 */
export const getRecentlyViewed = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error parsing recently viewed products:', error);
    return [];
  }
};

/**
 * Adds a product to the recently viewed list.
 * @param {Object} product The product object to add
 */
export const addRecentlyViewed = (product) => {
  if (!product || (!product._id && !product.id)) return;

  try {
    const currentList = getRecentlyViewed();
    const productId = product._id || product.id;

    // Filter out if already exists to move it to the front
    const filteredList = currentList.filter(p => (p._id || p.id) !== productId);

    // Create a minimal product object to save space in localStorage
    const minimalProduct = {
      _id: productId,
      name: product.name,
      image: product.image || product.imageUrl,
      price: product.price,
      compareAtPrice: product.compareAtPrice || null,
      category: product.category,
      brand: product.brand,
      slug: product.slug
    };

    // Add to the beginning
    const newList = [minimalProduct, ...filteredList].slice(0, MAX_RECENTLY_VIEWED);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    
    // Dispatch a custom event so other components can listen to changes
    window.dispatchEvent(new Event('recentlyViewedChanged'));
  } catch (error) {
    console.error('Error adding to recently viewed products:', error);
  }
};

/**
 * Removes a specific product from the recently viewed list.
 * @param {string} productId The ID of the product to remove
 */
export const removeRecentlyViewed = (productId) => {
  try {
    const currentList = getRecentlyViewed();
    const newList = currentList.filter(p => (p._id || p.id) !== productId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    window.dispatchEvent(new Event('recentlyViewedChanged'));
  } catch (error) {
    console.error('Error removing from recently viewed products:', error);
  }
};

/**
 * Clears all recently viewed products.
 */
export const clearRecentlyViewed = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('recentlyViewedChanged'));
  } catch (error) {
    console.error('Error clearing recently viewed products:', error);
  }
};
