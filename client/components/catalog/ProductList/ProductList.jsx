import ProductCard from '../ProductCard/ProductCard.jsx';
import ProductCardSkeleton from '../ProductCard/ProductCardSkeleton.jsx';
import './ProductList.scss';

const getProductId = (product) => product?._id || product?.id;

// Відображає сітку карток товарів або скелетони
const ProductList = ({ products = [], isLoading = false }) => {
  // Режим завантаження: показуємо 8 скелетонів
  if (isLoading) {
    return (
      <div className="product-list">
        {Array.from(new Array(8)).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Якщо список порожній (і не завантажується)
  if (!products || products.length === 0) {
    return (
      <div className="product-list-empty">
        <p>Товари не знайдені</p>
      </div>
    );
  }

  return (
    <div className="product-list">
      {products.map(product => (
        <ProductCard
          key={getProductId(product)}
          product={product}
        />
      ))}
    </div>
  );
};

export default ProductList;
