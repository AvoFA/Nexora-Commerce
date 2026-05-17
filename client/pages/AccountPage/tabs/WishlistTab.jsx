import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Rating } from "@mui/material";
import {
  Add,
  Balance,
  DeleteOutline,
  DriveFileRenameOutline,
  FavoriteBorder,
  MoreVert,
  RateReview,
  ShoppingCart,
  Star,
} from "@mui/icons-material";
import { useAuth } from "../../../context/AuthContext.jsx";
import { useCompare } from "../../../hooks/useCompare.js";
import { useCart } from "../../../hooks/useCart.js";
import { formatPrice } from "../../../utils/formatPrice.js";
import {
  clearWishlistList,
  createWishlistList,
  deleteWishlistList,
  getWishlist,
  removeProductFromWishlistList,
  renameWishlistList,
} from "../../../services/wishlistService.js";

const getProductId = (product) => product?._id || product?.id;
const isAuthError = (error) => error?.status === 401 || error?.status === 403;
const getStubRating = (id) => {
  if (!id) return { rating: 4.2, count: 28 };
  const hash = String(id).split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const rating = (3.5 + (hash % 15) / 10).toFixed(1);
  const count = 8 + (hash % 120);
  return { rating: parseFloat(rating), count };
};

const WishlistTab = () => {
  const { isAuthenticated, updateWishlistProductIds, logout } = useAuth();
  const { dispatch } = useCart();
  const { addToCompare, removeFromCompare, isCompared } = useCompare();
  const [lists, setLists] = useState([]);
  const [activeListId, setActiveListId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [listDialogMode, setListDialogMode] = useState(null);
  const [listName, setListName] = useState("");
  const [listNameTouched, setListNameTouched] = useState(false);

  const activeList = useMemo(
    () => lists.find((list) => list._id === activeListId) || lists[0],
    [activeListId, lists],
  );

  const products = activeList?.products || [];
  const totalPrice = products.reduce(
    (total, product) => total + Number(product.price || 0),
    0,
  );

  const handleAuthError = (error) => {
    if (!isAuthError(error)) return false;

    logout();
    setLists([]);
    setActiveListId("");
    setError(null);
    toast.error("Сесія завершилась. Увійдіть ще раз.");
    return true;
  };

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const data = await getWishlist(token);
      const nextLists = data.wishlistLists || [];
      setLists(nextLists);
      updateWishlistProductIds(data.wishlistProductIds || []);

      if (!activeListId || !nextLists.some((list) => list._id === activeListId)) {
        setActiveListId(nextLists[0]?._id || "");
      }
    } catch (error) {
      if (!handleAuthError(error)) {
        setError(error.message || "Помилка завантаження списків бажань");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    fetchWishlist();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!listDialogMode) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [listDialogMode]);

  const openCreateDialog = () => {
    setListName("");
    setListNameTouched(false);
    setListDialogMode("create");
  };

  const openRenameDialog = () => {
    if (!activeList) return;
    setIsMenuOpen(false);
    setListName(activeList.name);
    setListNameTouched(false);
    setListDialogMode("rename");
  };

  const closeListDialog = () => {
    setListDialogMode(null);
    setListName("");
    setListNameTouched(false);
  };

  const handleSaveList = async () => {
    const name = listName.trim();
    if (!name) {
      setListNameTouched(true);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const data = listDialogMode === "rename" && activeList
        ? await renameWishlistList(activeList._id, name, token)
        : await createWishlistList(name, token);

      const nextLists = data.wishlistLists || [];
      setLists(nextLists);
      updateWishlistProductIds(data.wishlistProductIds || []);

      if (listDialogMode === "create") {
        setActiveListId(nextLists[nextLists.length - 1]?._id || "");
        toast.success("Список створено");
      } else {
        toast.success("Список перейменовано");
      }

      closeListDialog();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "Не вдалося зберегти список");
      }
    }
  };

  const showListNameError = Boolean(listDialogMode) && listNameTouched && listName.trim().length === 0;
  const isListSaveVisuallyInactive = Boolean(listDialogMode) && listName.trim().length === 0;

  const handleDeleteList = async () => {
    if (!activeList) return;
    setIsMenuOpen(false);
    if (!window.confirm(`Видалити список "${activeList.name}"?`)) return;

    try {
      const token = localStorage.getItem("token");
      const data = await deleteWishlistList(activeList._id, token);
      const nextLists = data.wishlistLists || [];
      setLists(nextLists);
      setActiveListId(nextLists[0]?._id || "");
      updateWishlistProductIds(data.wishlistProductIds || []);
      toast.success("Список видалено");
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "Не вдалося видалити список");
      }
    }
  };

  const handleClearList = async () => {
    if (!activeList || products.length === 0) return;
    setIsMenuOpen(false);
    if (!window.confirm(`Очистити список "${activeList.name}"?`)) return;

    try {
      const token = localStorage.getItem("token");
      const data = await clearWishlistList(activeList._id, token);
      setLists(data.wishlistLists || []);
      updateWishlistProductIds(data.wishlistProductIds || []);
      toast.success("Список очищено");
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "Не вдалося очистити список");
      }
    }
  };

  const handleRemoveProduct = async (productId) => {
    if (!activeList) return;

    try {
      const token = localStorage.getItem("token");
      const data = await removeProductFromWishlistList(activeList._id, productId, token);
      setLists(data.wishlistLists || []);
      updateWishlistProductIds(data.wishlistProductIds || []);
      toast.success("Товар видалено зі списку");
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error(error.message || "Не вдалося видалити товар");
      }
    }
  };

  const handleAddToCart = (product) => {
    dispatch({ type: "ADD_ITEM", payload: { ...product, id: getProductId(product) } });
    toast.success(`${product.name} додано в кошик!`);
  };

  const handleToggleCompare = (product) => {
    const productId = getProductId(product);

    if (isCompared(productId)) {
      removeFromCompare(productId);
      toast.success("Видалено з порівняння");
    } else {
      addToCompare(product);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="account-empty-state">
        <FavoriteBorder sx={{ fontSize: 72 }} />
        <h2>Увійдіть, щоб переглянути списки бажань</h2>
        <p>Зберігайте товари у власних списках та швидко повертайтеся до них пізніше.</p>
        <Link to="/catalog" className="btn-primary">
          Переглянути каталог
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="account-loading">Завантаження списків бажань...</div>;
  }

  if (error) {
    return (
      <div className="account-empty-state">
        <h2>Помилка завантаження</h2>
        <p>{error}</p>
        <button className="btn-secondary" onClick={fetchWishlist}>
          Спробувати знову
        </button>
      </div>
    );
  }

  return (
    <div className="wishlist-tab">
      <div className="wishlist-module">
        <div className="wishlist-toolbar">
          <div className="wishlist-heading">
            <h2>Списки бажань</h2>
            <p>Створюйте окремі добірки товарів для майбутніх покупок.</p>
          </div>

          <div className="wishlist-list-tabs">
            <button
              className="wishlist-create-wide"
              type="button"
              onClick={openCreateDialog}
              title="Створити новий список"
            >
              <Add />
              <span>Створити список</span>
            </button>

            {lists.map((list) => (
              <button
                key={list._id}
                type="button"
                className={`wishlist-list-tab${activeList?._id === list._id ? " active" : ""}`}
                onClick={() => setActiveListId(list._id)}
              >
                {list.name} <span>({list.products?.length || 0})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="wishlist-board">
          <div className="wishlist-board-head">
            <div className="wishlist-board-title">
              <h3>{activeList?.name || "Обране"}</h3>
              <p>{products.length} товарів у списку</p>
            </div>

            <div className="wishlist-board-right">
              <div className="wishlist-current-total">
                <strong>{formatPrice(totalPrice)}</strong>
                <span>у поточному списку</span>
              </div>
              <div className="wishlist-more-wrap">
                <button
                  type="button"
                  className="wishlist-more-btn"
                  onClick={() => setIsMenuOpen((value) => !value)}
                  aria-label="Дії зі списком"
                >
                  <MoreVert />
                </button>
                {isMenuOpen && (
                  <div className="wishlist-menu">
                    <button type="button" onClick={openRenameDialog}>
                      <DriveFileRenameOutline />
                      Перейменувати
                    </button>
                    <button type="button" onClick={handleClearList} disabled={products.length === 0}>
                      <DeleteOutline />
                      Очистити список
                    </button>
                    <button type="button" className="danger" onClick={handleDeleteList}>
                      <DeleteOutline />
                      Видалити список
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="wishlist-board-empty">
              <FavoriteBorder sx={{ fontSize: 42 }} />
              <h2>У цьому списку поки немає товарів</h2>
              <p>Натисніть серце на товарі та оберіть список, куди його додати.</p>
              <Link to="/catalog" className="btn-primary">
                Перейти до каталогу
              </Link>
            </div>
          ) : (
            <div className="wishlist-product-list">
              {products.map((product) => {
                const productId = getProductId(product);
                const imgSrc = product.image || product.imageUrl;
                const { rating, count } = getStubRating(productId);
                const price = Number(product.price || 0);

                return (
                  <article key={productId} className="wishlist-product-row">
                    <Link to={`/product/${productId}`} className="wishlist-product-img">
                      {imgSrc ? <img src={imgSrc} alt={product.name} /> : <span>No image</span>}
                    </Link>
                    <div className="wishlist-product-info">
                      <Link to={`/product/${productId}`}>{product.name}</Link>
                      <div className="wishlist-product-rating-link">
                        <div className="wishlist-product-stars">
                          <Rating
                            value={rating}
                            precision={0.5}
                            readOnly
                            emptyIcon={<Star fontSize="inherit" />}
                            sx={{
                              fontSize: "1rem",
                              color: "#fbbf24",
                              "& .MuiRating-iconEmpty": { color: "#475569" },
                              "& .MuiSvgIcon-root": { fontSize: "inherit" },
                            }}
                          />
                        </div>
                        <div className="wishlist-product-review-count">
                          <RateReview />
                          <span>{count}</span>
                        </div>
                      </div>
                      <div className="wishlist-product-price-row">
                        <strong>{formatPrice(price)}</strong>
                        <button
                          type="button"
                          className="wishlist-cart-btn"
                          onClick={() => handleAddToCart(product)}
                          aria-label="Додати до кошика"
                        >
                          <ShoppingCart />
                        </button>
                      </div>
                    </div>
                    <div className="wishlist-product-actions">
                      <button
                        type="button"
                        className="wishlist-row-remove"
                        onClick={() => handleRemoveProduct(productId)}
                        aria-label="Р’РёРґР°Р»РёС‚Рё Р·С– СЃРїРёСЃРєСѓ"
                        title="Р’РёРґР°Р»РёС‚Рё Р·С– СЃРїРёСЃРєСѓ"
                      >
                        <DeleteOutline />
                      </button>
                      <button
                        type="button"
                        className={`wishlist-row-compare${isCompared(productId) ? " active" : ""}`}
                        onClick={() => handleToggleCompare(product)}
                        aria-label={isCompared(productId) ? "РЈ РїРѕСЂС–РІРЅСЏРЅРЅС–" : "РџРѕСЂС–РІРЅСЏС‚Рё"}
                        title={isCompared(productId) ? "РЈ РїРѕСЂС–РІРЅСЏРЅРЅС–" : "РџРѕСЂС–РІРЅСЏС‚Рё"}
                      >
                        <Balance />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {listDialogMode && createPortal(
        <div className="wishlist-dialog-overlay" onClick={closeListDialog}>
          <div className="wishlist-dialog" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="wishlist-dialog-close" onClick={closeListDialog}>
              ×
            </button>
            <h3>{listDialogMode === "create" ? "Створити новий список" : "Перейменувати список"}</h3>
            <label htmlFor="wishlist-list-name">Назва списку</label>
            <input
              id="wishlist-list-name"
              className={showListNameError ? "error" : ""}
              value={listName}
              onBlur={() => setListNameTouched(true)}
              onChange={(event) => setListName(event.target.value)}
              placeholder="Введіть назву..."
              aria-invalid={showListNameError}
              autoFocus
            />
            {showListNameError && (
              <div className="wishlist-dialog-error">Поле обов'язкове до заповнення</div>
            )}
            <div className="wishlist-dialog-actions">
              <button type="button" className="btn-secondary" onClick={closeListDialog}>
                Скасувати
              </button>
              <button
                type="button"
                className={`btn-primary${isListSaveVisuallyInactive ? " inactive" : ""}`}
                onClick={handleSaveList}
              >
                {listDialogMode === "create" ? "Створити" : "Зберегти"}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
};

export default WishlistTab;
