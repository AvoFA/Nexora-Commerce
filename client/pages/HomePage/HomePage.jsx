// Головна сторінка додатку
import { useState, useEffect } from 'react';
import { getProducts } from '../../services/productService.js';
import ProductList from '../../components/catalog/ProductList/ProductList.jsx';
import { Link } from 'react-router-dom';
import HeroSection from '../../components/common/HeroSection/HeroSection.jsx';
import CategoryCards from '../../components/common/CategoryCards/CategoryCards.jsx';
import RecentlyViewedSection from '../../components/product/RecentlyViewedSection/RecentlyViewedSection.jsx';
import Benefits from '../../components/common/Benefits/Benefits.jsx';
import './HomePage.scss';

const HomePage = () => {
  const [popularProducts, setPopularProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Завантаження товарів для секції "Популярні"
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const allProducts = await getProducts();

        // Фільтруємо товари по цінових сегментах
        const budget = allProducts.filter(p => p.price < 20000);
        const midRange = allProducts.filter(p => p.price >= 20000 && p.price < 50000);
        const premium = allProducts.filter(p => p.price >= 50000);

        // Формуємо мікс товарів: по 2 з кожної категорії
        const recommendedProducts = [
          ...budget.slice(0, 2),
          ...midRange.slice(0, 2),
          ...premium.slice(0, 2)
        ];

        setPopularProducts(recommendedProducts);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);



  if (error) return <div>Помилка: {error}</div>;

  return (
    <div className="homepage">
      {/* Головний банер */}
      <HeroSection />

      {/* Категорії товарів */}
      <CategoryCards />

      {/* Останні переглянуті товари */}
      <RecentlyViewedSection />

      {/* Секція популярних товарів */}
      <section className="product-section">
        <div className="section-header centered">
          <h2 className="section-title"><span>Товари на будь-який смак</span></h2>
        </div>

        <ProductList products={popularProducts} isLoading={isLoading} />

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Link to="/catalog" className="btn-primary">
            Переглянути каталог
          </Link>
        </div>
      </section>

      {/* Блок переваг */}
      <Benefits />
    </div>
  );
};

export default HomePage;
