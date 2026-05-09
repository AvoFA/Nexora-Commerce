import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../hooks/useCart.js';
import ProductCard from '../../components/catalog/ProductCard/ProductCard.jsx';
import ClearFavoritesConfirmModal from '../../components/common/ClearFavoritesConfirmModal/ClearFavoritesConfirmModal.jsx';
import { getFavorites, clearAllFavorites } from '../../services/favoritesService.js';
import { toast } from 'sonner';
import {
  ShoppingCart,
  DeleteOutline,
  FavoriteBorder,
  Person
} from '@mui/icons-material';
import './FavoritesPage.scss';

const FavoritesPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { dispatch } = useCart();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    fetchFavoritesData();
  }, [isAuthenticated]);

  const fetchFavoritesData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const data = await getFavorites(token);

      if (data.success) {
        setFavorites(data.favorites);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Помилка завантаження улюблених товарів');
    } finally {
      setLoading(false);
    }
  };

  // Обчислення загальної вартості
  const calculateTotalPrice = () => {
    return favorites.reduce((total, product) => total + (product.price || 0), 0);
  };

  // Додати все в кошик
  const handleAddAllToCart = () => {
    if (favorites.length === 0) return;

    favorites.forEach(product => {
      dispatch({ type: 'ADD_ITEM', payload: product });
    });

    toast.success(`Додано ${favorites.length} товарів в кошик!`);
  };

  // Відкрити діалог підтвердження очищення
  const handleClearAll = () => {
    if (favorites.length === 0) return;
    setIsClearModalOpen(true);
  };

  // Підтвердити очищення улюблених
  const confirmClearAll = async () => {
    try {
      const token = localStorage.getItem('token');
      const result = await clearAllFavorites(token);

      if (result.success) {
        setFavorites([]);
        toast.success('Улюблені очищено!');
        setIsClearModalOpen(false);
      } else {
        toast.error('Не вдалося очистити улюблені');
      }
    } catch (error) {
      toast.error('Помилка при очищенні улюблених');
    }
  };

  // Закрити діалог
  const handleCloseModal = () => {
    setIsClearModalOpen(false);
  };

  // Обробка зміни улюблених для динамічного оновлення
  const handleFavoriteChange = (productId, isAdded) => {
    if (!isAdded) {
      // Якщо товар видалено з улюблених, прибрати з локального стану
      setFavorites(prev => prev.filter(f => f._id !== productId));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="favorites-page not-auth">
        <div className="container">
          <div className="auth-message">
            <FavoriteBorder sx={{ fontSize: 80, color: '#3A86FF', mb: 2 }} />
            <h2>Увійдіть щоб переглянути улюблені товари</h2>
            <p>Зберігайте ваші улюблені товари для швидкого доступу</p>
            <Link to="/catalog" className="btn-primary">
              Переглянути каталог
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="favorites-page loading">
        <div className="container">
          <div className="loading-message">Завантаження...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorites-page error">
        <div className="container">
          <div className="error-message">
            <h2>Помилка завантаження</h2>
            <p>{error}</p>
            <button className="btn-secondary" onClick={fetchFavoritesData}>
              Спробувати знову
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalPrice = calculateTotalPrice();

  return (
    <div className="favorites-page">
      <div className="container">
        {/* Header з профілем та статистикою */}
        <div className="favorites-header-card">
          <div className="user-section">
            <div className="user-avatar">
              <Person sx={{ fontSize: 40 }} />
            </div>
            <div className="user-details">
              <h1>Мої улюблені</h1>
              <p className="user-greeting">Привіт, {user?.name || 'Користувач'}! 👋</p>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>

          <div className="favorites-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <FavoriteBorder />
              </div>
              <div className="stat-info">
                <span className="stat-value">{favorites.length}</span>
                <span className="stat-label">товарів</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <ShoppingCart />
              </div>
              <div className="stat-info">
                <span className="stat-value">{totalPrice.toLocaleString()} ₴</span>
                <span className="stat-label">загальна вартість</span>
              </div>
            </div>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="empty-favorites">
            <div className="empty-content">
              <FavoriteBorder sx={{ fontSize: 100, color: '#3A86FF', mb: 2 }} />
              <h2>У вас поки що немає улюблених товарів</h2>
              <p>Додайте будь-який товар до улюблених, натиснувши на червоне серце ❤️</p>
              <Link to="/catalog" className="btn-primary">
                Переглянути каталог
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Панель масових дій */}
            <div className="bulk-actions-panel">
              <div className="panel-title">
                <span>Обрано товарів: {favorites.length}</span>
              </div>
              <div className="panel-actions">
                <button
                  className="btn-primary btn-with-icon"
                  onClick={handleAddAllToCart}
                >
                  <ShoppingCart sx={{ fontSize: 20 }} />
                  Додати все в кошик
                </button>
                <button
                  className="btn-danger btn-with-icon"
                  onClick={handleClearAll}
                >
                  <DeleteOutline sx={{ fontSize: 20 }} />
                  Очистити улюблені
                </button>
              </div>
            </div>

            {/* Сітка товарів */}
            <div className="favorites-grid">
              {favorites.map((product) => (
                <div key={product._id} className="favorite-item">
                  <ProductCard
                    product={product}
                    onFavoriteChange={handleFavoriteChange}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Діалог підтвердження очищення улюблених */}
        <ClearFavoritesConfirmModal
          isOpen={isClearModalOpen}
          onClose={handleCloseModal}
          onConfirm={confirmClearAll}
          favoritesCount={favorites.length}
        />
      </div>
    </div>
  );
};

export default FavoritesPage;
