import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart.js";
import ClearCartConfirmModal from "../../components/common/ClearCartConfirmModal/ClearCartConfirmModal.jsx";
import { toast } from "sonner";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useState, useEffect, useRef } from "react";
import { formatPrice } from "../../utils/formatPrice.js";
import EmptyState from "../../components/common/EmptyState/EmptyState.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import WishlistPickerModal from "../../components/common/WishlistPickerModal/WishlistPickerModal.jsx";
import { openAuthModal } from "../../utils/authModalEvents.js";
import "./CartPage.scss";

const CartPage = () => {
  // Отримуємо товари з глобального стану
  const { state, dispatch } = useCart();
  const { items } = state;
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const { isAuthenticated, isWishlisted } = useAuth();
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [selectedProductForWishlist, setSelectedProductForWishlist] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const fromProduct = location.state?.fromProduct || state.lastAddedProductId;

  const totalsRef = useRef(null);
  const [isTotalsVisible, setIsTotalsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsTotalsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
      }
    );

    if (totalsRef.current) {
      observer.observe(totalsRef.current);
    }

    return () => {
      if (totalsRef.current) {
        observer.unobserve(totalsRef.current);
      }
    };
  }, [items]);

  // Розумна кнопка "Назад"
  const handleBack = () => {
    if (fromProduct) {
      navigate(`/product/${fromProduct}`);
    } else {
      navigate(-1);
    }
  };

  // Обробники кількості товарів
  const handleIncrease = (id) => {
    const itemToAdd = items.find((item) => item.id === id);
    if (itemToAdd) {
      dispatch({ type: "ADD_ITEM", payload: itemToAdd });
    }
  };

  const handleDecrease = (id) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };

  const handleRemove = (id, name) => {
    dispatch({ type: "CLEAR_ITEM", payload: id });
    toast.success(`"${name}" видалено з кошика`);
  };

  // Перемикання вибору товару
  const handleToggleSelection = (id) => {
    dispatch({ type: "TOGGLE_ITEM_SELECTION", payload: id });
  };

  // Додати товар до списку бажань
  const handleOpenWishlist = (item) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setSelectedProductForWishlist(item);
    setIsWishlistModalOpen(true);
  };

  // Відкрити діалог очищення кошика
  const handleClearAllCart = () => {
    if (items.length === 0) return;
    setIsClearModalOpen(true);
  };

  // Підтвердити очищення кошика
  const confirmClearAllCart = () => {
    dispatch({ type: "CLEAR_CART" });
    toast.success("Кошик очищено!");
    setIsClearModalOpen(false);
  };

  // Закрити діалог
  const handleCloseClearModal = () => {
    setIsClearModalOpen(false);
  };

  // Функція для відмінювання слів (товар, товари, товарів)
  const getPlural = (count, one, few, many) => {
    const n = Math.abs(count) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return many;
    if (n1 > 1 && n1 < 5) return few;
    if (n1 === 1) return one;
    return many;
  };

  // Рахуємо загальну вартість замовлення (тільки для вибраних товарів)
  const totalPrice = items.reduce((total, item) => {
    if (item.selected === false) return total;
    return total + item.price * item.quantity;
  }, 0);

  // Рахуємо загальну кількість одиниць (тільки для вибраних товарів)
  const selectedItemsCount = items.reduce((total, item) => {
    if (item.selected === false) return total;
    return total + item.quantity;
  }, 0);

  // Рахуємо загальну кількість одиниць (всього в кошику)
  const totalItems = items.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  const handleCheckoutClick = (e) => {
    if (selectedItemsCount === 0) {
      e.preventDefault();
      toast.error("Будь ласка, оберіть хоча б один товар для оформлення");
    }
  };

  // Стан пустого кошика
  if (items.length === 0) {
    return (
      <div className="cart-page">
        <EmptyState
          icon={ShoppingBagOutlinedIcon}
          title="Ваш кошик порожній"
          description="Додайте товари, щоб розпочати покупки"
          action={{ label: "Перейти до каталогу", to: "/catalog" }}
          className="cart-empty-state"
        />
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-title-row">
        <button
          className="cart-back-btn"
          onClick={handleBack}
          title={fromProduct ? "Назад до товару" : "Назад до покупок"}
        >
          <ArrowBackIcon />
        </button>
        <h1 className="page-title">
          Ваш кошик <span className="cart-title-count">{totalItems} {getPlural(totalItems, "товар", "товари", "товарів")}</span>
        </h1>
      </div>

      <div className="cart-container">
        {/* Список товарів */}
        <div className="cart-items-list">
          <div className="cart-header">
            <button
              className="btn-clear-cart"
              onClick={handleClearAllCart}
              title="Видалити все з кошика"
            >
              <DeleteForeverIcon fontSize="small" />
              Видалити все
            </button>
          </div>
          {items.map((item) => {
            const productId = item.id || item._id;
            return (
              <div key={item.id} className="cart-item-card">
                <div className="cart-item-checkbox">
                  <input
                    type="checkbox"
                    checked={item.selected !== false}
                    onChange={() => handleToggleSelection(item.id)}
                  />
                </div>

                <div className="cart-item-image">
                  <img src={item.image} alt={item.name} />
                </div>

                <div className="cart-item-details">
                  <Link to={`/product/${productId}`} className="cart-item-title">
                    {item.name}
                  </Link>

                  <div className="cart-item-actions">
                    <button
                      className={`cart-item-action-btn wishlist${isWishlisted(productId) ? " active" : ""}`}
                      onClick={() => handleOpenWishlist(item)}
                      title="В обране"
                    >
                      {isWishlisted(productId) ? (
                        <FavoriteIcon fontSize="small" />
                      ) : (
                        <FavoriteBorderIcon fontSize="small" />
                      )}
                      <span>В обране</span>
                    </button>

                    <button
                      className="cart-item-action-btn remove"
                      onClick={() => handleRemove(item.id, item.name)}
                      title="Видалити товар"
                    >
                      <DeleteForeverIcon fontSize="small" />
                      <span>Видалити</span>
                    </button>
                  </div>
                </div>

                <div className="cart-item-right-block">
                  <p className="cart-item-price">{formatPrice(item.price)}</p>

                  <div className="cart-item-quantity">
                    <button
                      onClick={() => handleDecrease(item.id)}
                      title="Зменшити"
                    >
                      <RemoveIcon fontSize="small" />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => handleIncrease(item.id)}
                      title="Збільшити"
                    >
                      <AddIcon fontSize="small" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Підсумок замовлення */}
        <div className="cart-summary" ref={totalsRef}>
          <h2>Підсумок замовлення</h2>
          <div className="card-content">
            <div className="summary-row">
              <span>{selectedItemsCount} {getPlural(selectedItemsCount, "товар", "товари", "товарів")} на суму:</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>

            <div className="summary-total">
              <strong>Всього до сплати:</strong>
              <strong>{formatPrice(totalPrice)}</strong>
            </div>

            <Link
              to="/checkout"
              className={`btn-checkout${selectedItemsCount === 0 ? " disabled" : ""}`}
              onClick={handleCheckoutClick}
            >
              Оформити замовлення
            </Link>
            <Link to="/catalog" className="btn-continue-shopping">
              Продовжити покупки
            </Link>
          </div>
        </div>
      </div>

      {/* Мобільна липка кнопка оформлення */}
      {selectedItemsCount > 0 && (
        <div className={`cart-mobile-sticky-checkout ${isTotalsVisible ? "is-hidden" : ""}`}>
          <Link
            to="/checkout"
            className="btn-checkout-sticky"
            onClick={handleCheckoutClick}
          >
            <span>Оформити замовлення</span>
            <span className="sticky-divider">|</span>
            <span className="sticky-price-value">{formatPrice(totalPrice)}</span>
          </Link>
        </div>
      )}

      {/* Діалог підтвердження очищення кошика */}
      <ClearCartConfirmModal
        isOpen={isClearModalOpen}
        onClose={handleCloseClearModal}
        onConfirm={confirmClearAllCart}
        itemsCount={items.length}
      />

      {/* Діалог вибору списку бажань */}
      {isWishlistModalOpen && (
        <WishlistPickerModal
          isOpen={isWishlistModalOpen}
          onClose={() => setIsWishlistModalOpen(false)}
          product={selectedProductForWishlist}
        />
      )}
    </div>
  );
};

export default CartPage;
