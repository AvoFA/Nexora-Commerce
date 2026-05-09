import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../../../services/categoryService';
import CategoryCardsSkeleton from './CategoryCardsSkeleton';
import './CategoryCards.scss';

// Список категорий для отображения на главной
const FEATURED_CATEGORIES = ['phones', 'laptops', 'tablets'];

const CategoryCards = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        // Показываем только избранные категории для демо
        const featured = data.filter(cat => FEATURED_CATEGORIES.includes(cat.name));
        setCategories(featured);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <CategoryCardsSkeleton />;
  }

  if (!categories.length) {
    return null;
  }

  const getDisplayName = (category) => {
    const nameMap = {
      'phones': 'Смартфони',
      'laptops': 'Ноутбуки',
      'tablets': 'Планшети'
    };
    return nameMap[category.name] || category.description;
  };

  return (
    <section className="category-cards-section">
      <div className="category-cards-container">
        {categories.map((category) => (
          <Link
            to={`/catalog/${category.name}`}
            key={category.id || category.name}
            className={`category-card ${category.name}`}
            style={{ backgroundImage: `url(${category.image})` }}
          >
            <div className="category-card-overlay"></div>
            <h3 className="category-card-title">{getDisplayName(category)}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryCards;
