import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getProductById,
  getSimilarProducts,
} from "../../services/productService.js";
import { useCart } from "../../hooks/useCart.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowBack,
  Favorite,
  FavoriteBorder,
  Balance,
} from "@mui/icons-material";
import { ShoppingCartOutlined, VisibilityOutlined, CheckCircle } from "@mui/icons-material";
import ProductCard from "../../components/catalog/ProductCard/ProductCard.jsx";
import Breadcrumbs from "../../components/common/Breadcrumbs/Breadcrumbs.jsx";
import ProductPageSkeleton from "./ProductPageSkeleton.jsx";
import { useCompare } from "../../hooks/useCompare.js";
import "./ProductPage.scss";

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { dispatch } = useCart();
  const { addToCompare, removeFromCompare, isCompared } = useCompare();
  const { isAuthenticated, isFavorite, addToFavorites, removeFromFavorites } =
    useAuth();

  // Завантажуємо дані товару по ID з URL
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        setError(err.message || String(err));
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Завантажуємо схожі товари (якщо основний товар знайдено)
  useEffect(() => {
    const fetchSimilarProducts = async () => {
      if (!id || !product) return;
      try {
        const similar = await getSimilarProducts(id);
        setSimilarProducts(similar);
      } catch (err) {
        console.warn("Помилка завантаження схожих товарів:", err);
        setSimilarProducts([]);
      }
    };
    fetchSimilarProducts();
  }, [id, product]);

  // Додавання товару в кошик
  const handleAddToCart = () => {
    if (!product) return;
    dispatch({ type: "ADD_ITEM", payload: product });
    toast.success(`${product.name} додано в кошик!`);
  };

  // Перемикач улюблених (Додати/Видалити)
  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("Увійдіть щоб додати в улюблені");
      return;
    }

    const favorite = isFavorite(product._id || product.id);
    if (favorite) {
      await removeFromFavorites(product._id || product.id);
      toast.success("Видалено з улюблених");
    } else {
      await addToFavorites(product._id || product.id);
      toast.success("Додано в улюблені");
    }
  };

  // Перемикач порівняння
  const handleToggleCompare = () => {
    if (!product) return;
    const productId = product._id || product.id;
    if (isCompared(productId)) {
      removeFromCompare(productId);
      toast.success("Видалено з порівняння");
    } else {
      addToCompare(product);
    }
  };

  if (isLoading) return <ProductPageSkeleton />;
  if (error) return <div>Помилка: {error}</div>;
  if (!product) return <div>Товар не знайдено.</div>;

  const imgSrc = product.image || product.imageUrl || null;

  // Формуємо масив для хлібних крихт
  const breadcrumbItems = [
    { label: "Каталог", path: "/catalog" },
    {
      label:
        product.category === "phones"
          ? "Смартфони"
          : product.category === "laptops"
            ? "Ноутбуки"
            : product.category === "tablets"
              ? "Планшети"
              : product.category,
      path: `/catalog?category=${product.category}`,
    },
    { label: product.name },
  ];

  return (
    <div className="product-page-wrapper">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="product-page-container">
        <div className="product-image-gallery">
          {imgSrc ? (
            <img src={imgSrc} alt={product.name} />
          ) : (
            <div className="product-image-placeholder">No image</div>
          )}
        </div>

        <div className="product-details">
          <div className="product-header">
            <div className="product-title-section">
              <h1>{product.name}</h1>
            </div>
            <div className="product-badges">
              <span className="badge brand-badge">{product.brand}</span>
              <span className="badge category-badge">
                {product.category === "phones"
                  ? "Смартфони"
                  : product.category === "laptops"
                    ? "Ноутбуки"
                    : product.category === "tablets"
                      ? "Планшети"
                      : product.category}
              </span>
              <span className="badge stock-badge in-stock">
                <CheckCircle sx={{ fontSize: "16px" }} />
                В наявності
              </span>
            </div>
          </div>
          <div className="price-row">
            <div className="price">{product.price.toLocaleString("uk-UA")} ₴</div>
            <div className="product-actions-icons">
              {/* Сердечко улюблені */}
              <button
                className={`product-favorite-button${isFavorite(product._id || product.id) ? " active" : ""}`}
                onClick={handleToggleFavorite}
                title={
                  isFavorite(product._id || product.id)
                    ? "Видалити з улюблених"
                    : "Додати в улюблені"
                }
              >
                {isFavorite(product._id || product.id) ? (
                  <Favorite sx={{ fontSize: "28px" }} />
                ) : (
                  <FavoriteBorder sx={{ fontSize: "28px" }} />
                )}
              </button>
              {/* Ваги порівняння */}
              <button
                className={`product-compare-button${isCompared(product._id || product.id) ? " active" : ""}`}
                onClick={handleToggleCompare}
                title={
                  isCompared(product._id || product.id)
                    ? "Видалити з порівняння"
                    : "Додати до порівняння"
                }
              >
                <Balance sx={{ fontSize: "28px" }} />
              </button>
            </div>
          </div>
          <p className="description">{product.description}</p>

          {/* Блок кнопок */}
          <div className="product-actions-wrapper">
            {/* 1. "Додати в кошик" */}
            <button
              className="btn-primary btn-with-icon"
              onClick={handleAddToCart}
            >
              <ShoppingCartOutlined sx={{ fontSize: "20px" }} />
              Додати в кошик
            </button>

            {/* 2. "Перейти до кошика" */}
            <Link to="/cart" className="btn-secondary">
              <VisibilityOutlined sx={{ fontSize: "20px" }} />
              Перейти до кошика
            </Link>
          </div>
          {/* /Блок кнопок */}

          <div className="attributes-list">
            <h3>Характеристики</h3>
            <ul className="attributes-simple-list">
              {product.attributes?.map((attr) => (
                <li key={attr.key}>
                  <strong>{attr.key}:</strong> {attr.value}
                </li>
              )) ?? <li>Немає характеристик</li>}
            </ul>
          </div>
        </div>
      </div>

      {/* Схожі товари */}
      {similarProducts.length > 0 && (
        <div className="similar-products-section">
          <h2>Схожі товари</h2>
          <p>Вам також можуть сподобатися</p>
          <div className="similar-products-grid">
            {similarProducts.map((similarProduct) => (
              <ProductCard key={similarProduct.id} product={similarProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
