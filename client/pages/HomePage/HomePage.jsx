import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../../services/productService.js';
import ProductList from '../../components/catalog/ProductList/ProductList.jsx';
import HeroSection from '../../components/common/HeroSection/HeroSection.jsx';
import CategoryCards from '../../components/common/CategoryCards/CategoryCards.jsx';
import RecentlyViewedSection from '../../components/product/RecentlyViewedSection/RecentlyViewedSection.jsx';
import Benefits from '../../components/common/Benefits/Benefits.jsx';
import './HomePage.scss';

const PRODUCT_LIMIT = 12;

const getCatalogSelection = (products) => {
  const budget = products.filter((product) => product.price < 20000);
  const midRange = products.filter(
    (product) => product.price >= 20000 && product.price < 50000
  );
  const premium = products.filter((product) => product.price >= 50000);

  return [
    ...budget.slice(0, 4),
    ...midRange.slice(0, 4),
    ...premium.slice(0, 4),
  ].slice(0, PRODUCT_LIMIT);
};

const HomePage = () => {
  const [searchParams] = useSearchParams();
  const variant = searchParams.get('uxVariant') === 'strong' ? 'strong' : 'polish';

  const [popularProducts, setPopularProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const allProducts = await getProducts();

        setPopularProducts(getCatalogSelection(allProducts));
      } catch (err) {
        setError(err.message || 'Не вдалося завантажити товари.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className={`homepage homepage--${variant}`}>
      <HeroSection variant={variant} />

      <div className="home-section-heading">
        <h2 className="section-title">
          <span>Обирайте за категорією</span>
        </h2>
      </div>
      <CategoryCards />

      <RecentlyViewedSection />

      <section className="product-section" aria-labelledby="budget-products-title">
        <div className="section-header">
          <div>
            <h2 className="section-title" id="budget-products-title">
              <span>Добірка з каталогу</span>
            </h2>
          </div>
        </div>

        {error ? (
          <div className="home-error-state" role="status">
            <strong>Товари тимчасово недоступні</strong>
            <span>{error}</span>
          </div>
        ) : (
          <ProductList products={popularProducts} isLoading={isLoading} />
        )}
      </section>

      <Benefits />
    </div>
  );
};

export default HomePage;
