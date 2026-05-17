import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { FavoriteBorder } from "@mui/icons-material";
import { useAuth } from "../../../context/AuthContext.jsx";
import { useCompare } from "../../../hooks/useCompare.js";
import { useCart } from "../../../hooks/useCart.js";
import {
  clearWishlistList,
  createWishlistList,
  deleteWishlistList,
  getWishlist,
  removeProductFromWishlistList,
  renameWishlistList,
} from "../../../services/wishlistService.js";
import WishlistListBar from "./WishlistListBar.jsx";
import WishlistBoard from "./WishlistBoard.jsx";
import WishlistListDialog from "./WishlistListDialog.jsx";

const getProductId = (product) => product?._id || product?.id;
const isAuthError = (error) => error?.status === 401 || error?.status === 403;

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
    [activeListId, lists]
  );

  const products = activeList?.products || [];
  const totalPrice = products.reduce(
    (total, product) => total + Number(product.price || 0),
    0
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

          <WishlistListBar
            lists={lists}
            activeListId={activeListId}
            onListClick={setActiveListId}
            onCreateClick={openCreateDialog}
          />
        </div>

        <WishlistBoard
          activeList={activeList}
          products={products}
          totalPrice={totalPrice}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          onRename={openRenameDialog}
          onClear={handleClearList}
          onDelete={handleDeleteList}
          onAddToCart={handleAddToCart}
          onRemoveProduct={handleRemoveProduct}
          onToggleCompare={handleToggleCompare}
          isCompared={isCompared}
        />
      </div>

      <WishlistListDialog
        mode={listDialogMode}
        listName={listName}
        listNameTouched={listNameTouched}
        setListName={setListName}
        setListNameTouched={setListNameTouched}
        onClose={closeListDialog}
        onSave={handleSaveList}
      />
    </div>
  );
};

export default WishlistTab;
