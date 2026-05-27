import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../../../services/categoryService';
import { getCategoryDisplay } from '../../../utils/categories';
import CategoryCardsSkeleton from './CategoryCardsSkeleton';
import './CategoryCards.scss';

// Categories to display on homepage
const FEATURED_CATEGORIES = ['phones', 'laptops', 'tablets'];

const CategoryCards = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        // Show only featured categories
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
            <h3 className="category-card-title">
              {category.description || getCategoryDisplay(category.name)}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryCards;
