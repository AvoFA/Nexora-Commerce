import ProductCard from "../../components/catalog/ProductCard/ProductCard.jsx";

const SimilarProducts = ({ similarProducts }) => {
  if (!similarProducts || similarProducts.length === 0) return null;

  return (
    <div className="similar-products-section">
      <h2 className="section-title">Схожі товари</h2>
      <p className="section-subtitle">Вам також можуть сподобатися</p>
      <div className="similar-products-grid">
        {similarProducts.map((similarProduct) => (
          <ProductCard key={similarProduct.id} product={similarProduct} />
        ))}
      </div>
    </div>
  );
};

export default SimilarProducts;
