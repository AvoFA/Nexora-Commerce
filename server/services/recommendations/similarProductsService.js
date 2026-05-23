const Product = require('../../models/Product');

/**
 * Logic for finding similar products (Up-sell & Alternatives)
 * Focuses on same category, price range -10% to +30%, and same brand priority.
 */
const getSimilarProducts = async (productId) => {
  const currentProduct = await Product.findById(productId);
  if (!currentProduct) {
    throw new Error('Product not found');
  }

  const { price, category, brand } = currentProduct;

  // Pricing strategy: -10% to +30% (Up-sell focus)
  const minPrice = price * 0.9;
  const maxPrice = price * 1.3;

  return await Product.find({
    _id: { $ne: productId },
    category: category,
    price: { $gte: minPrice, $lte: maxPrice }
  })
  .sort({
    // Priority 1: Same brand, Priority 2: Price proximity
    brand: brand === currentProduct.brand ? -1 : 1,
    price: 1
  })
  .limit(12)
  .lean();
};

module.exports = {
  getSimilarProducts
};
