import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AddCircleOutline, Close } from "@mui/icons-material";
import { toast } from "sonner";
import { useAuth } from "../../../context/AuthContext.jsx";
import {
  addProductToWishlistList,
  createWishlistList,
  getWishlist,
  removeProductFromWishlistList,
} from "../../../services/wishlistService.js";
import "./WishlistPickerModal.scss";

const isAuthError = (error) => error?.status === 401 || error?.status === 403;

const WishlistPickerModal = ({ isOpen, onClose, product, onWishlistChange }) => {
  const { updateWishlistProductIds, logout } = useAuth();
  const [lists, setLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListTouched, setNewListTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentListId, setCurrentListId] = useState("");

  const productId = product?._id || product?.id;

  const canSubmit = useMemo(() => {
    if (submitting || loadError) return false;
    if (isCreating) return true;
    return Boolean(selectedListId);
  }, [isCreating, loadError, selectedListId, submitting]);

  const showNewListError = isCreating && newListTouched && newListName.trim().length === 0;
  const isSubmitVisuallyInactive = isCreating && newListName.trim().length === 0;
  const isAlreadyInWishlist = Boolean(currentListId);
  const canRemoveFromSelectedList = isAlreadyInWishlist && !isCreating && selectedListId === currentListId;

  const getProductListId = (wishlistLists) => (
    wishlistLists.find((list) =>
      (list.products || []).some((item) => {
        const itemId = item?._id || item?.id || item;
        return itemId?.toString() === productId?.toString();
      })
    )?._id || ""
  );

  const handleAuthError = (error) => {
    if (!isAuthError(error)) return false;

    logout();
    onClose();
    toast.error("Сесія завершилась. Увійдіть ще раз.");
    return true;
  };

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const loadLists = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const token = localStorage.getItem("token");
        const data = await getWishlist(token);
        const nextLists = data.wishlistLists || [];
        const productListId = getProductListId(nextLists);
        setLists(nextLists);
        setCurrentListId(productListId);
        setSelectedListId(productListId || nextLists[0]?._id || "");
        setIsCreating(false);
        setNewListName("");
        setNewListTouched(false);
        updateWishlistProductIds(data.wishlistProductIds || []);
      } catch (error) {
        if (!handleAuthError(error)) {
          setLists([]);
          setCurrentListId("");
          setSelectedListId("");
          setLoadError("Не вдалося завантажити списки бажань");
        }
      } finally {
        setLoading(false);
      }
    };

    loadLists();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !productId) return null;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    if (isCreating && newListName.trim().length === 0) {
      setNewListTouched(true);
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      let targetListId = selectedListId;

      if (isCreating) {
        const created = await createWishlistList(newListName.trim(), token);
        const createdLists = created.wishlistLists || [];
        targetListId = createdLists[createdLists.length - 1]?._id;
      }

      if (!targetListId) {
        toast.error("Оберіть список бажань");
        return;
      }

      const data = await addProductToWishlistList(targetListId, productId, token);
      updateWishlistProductIds(data.wishlistProductIds || []);
      toast.success(isAlreadyInWishlist ? "Товар переміщено" : "Товар додано до списку бажань");
      onWishlistChange?.(data);
      onClose();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error("Не вдалося додати товар");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveFromWishlist = async () => {
    if (!canRemoveFromSelectedList || submitting) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const data = await removeProductFromWishlistList(currentListId, productId, token);
      updateWishlistProductIds(data.wishlistProductIds || []);
      toast.success("Товар видалено зі списку бажань");
      onWishlistChange?.(data);
      onClose();
    } catch (error) {
      if (!handleAuthError(error)) {
        toast.error("Не вдалося видалити товар");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="wishlist-picker-overlay" onClick={onClose}>
      <div className="wishlist-picker-modal" onClick={(event) => event.stopPropagation()}>
        <button className="wishlist-picker-close" onClick={onClose} aria-label="Закрити">
          <Close />
        </button>

        <h3>{isAlreadyInWishlist ? "Список для товару" : "У якому списку розмістити?"}</h3>

        {loading ? (
          <div className="wishlist-picker-loading">Завантаження списків...</div>
        ) : loadError ? (
          <div className="wishlist-picker-loading">{loadError}</div>
        ) : (
          <div className="wishlist-picker-options">
            {lists.map((list) => (
              <label
                key={list._id}
                className={`wishlist-picker-option${!isCreating && selectedListId === list._id ? " selected" : ""}`}
              >
                <input
                  type="radio"
                  name="wishlist-list"
                  checked={!isCreating && selectedListId === list._id}
                  onChange={() => {
                    setIsCreating(false);
                    setNewListTouched(false);
                    setSelectedListId(list._id);
                  }}
                />
                <span className="wishlist-picker-radio" aria-hidden="true" />
                <span className="wishlist-picker-name">{list.name}</span>
                <small>{list.products?.length || 0}</small>
              </label>
            ))}

            <button
              type="button"
              className={`wishlist-picker-create${isCreating ? " active" : ""}`}
              onClick={() => {
                setIsCreating(true);
                setNewListTouched(false);
              }}
            >
              <AddCircleOutline />
              <span>Додати у новий список</span>
            </button>

            {isCreating && (
              <div className="wishlist-picker-field">
                <input
                  className={`wishlist-picker-input${showNewListError ? " error" : ""}`}
                  value={newListName}
                  onBlur={() => setNewListTouched(true)}
                  onChange={(event) => setNewListName(event.target.value)}
                  placeholder="Назва нового списку"
                  aria-invalid={showNewListError}
                  autoFocus
                />
                {showNewListError && (
                  <div className="wishlist-picker-error">Поле обов'язкове до заповнення</div>
                )}
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          className={`wishlist-picker-submit${isSubmitVisuallyInactive ? " inactive" : ""}`}
          disabled={!canSubmit || loading}
          onClick={handleSubmit}
        >
          {submitting ? "Збереження..." : isAlreadyInWishlist ? "Зберегти" : "Додати"}
        </button>

        {canRemoveFromSelectedList && !loading && !loadError && (
          <button
            type="button"
            className="wishlist-picker-remove"
            disabled={submitting}
            onClick={handleRemoveFromWishlist}
          >
            Видалити зі списку
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default WishlistPickerModal;
