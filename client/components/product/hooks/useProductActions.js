import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.jsx";
import { useCompare } from "../../../hooks/useCompare.js";
import { useCart } from "../../../hooks/useCart.js";
import { openAuthModal } from "../../../utils/authModalEvents.js";
import { getAnchorRect, showCompareRemovedToast } from "../../../utils/notifications.js";

const getProductId = (product) => product?._id || product?.id;

export const useProductActions = (product) => {
  const navigate = useNavigate();
  const { state, dispatch } = useCart();
  const { addToCompare, removeFromCompare, isCompared: checkIsCompared } = useCompare();
  const { isAuthenticated, isWishlisted: checkIsWishlisted } = useAuth();
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);

  const productId = getProductId(product);
  const isInCart = Boolean(
    product &&
      state?.items?.some(
        (item) =>
          item.id === product._id ||
          item.id === product.id ||
          item._id === product._id
      )
  );
  const isWishlisted = productId ? checkIsWishlisted(productId) : false;
  const isCompared = productId ? checkIsCompared(productId) : false;

  const handleAddToCart = () => {
    if (!product) return;
    dispatch({ type: "ADD_ITEM", payload: { ...product, id: productId } });
  };

  const handleGoToCart = () => {
    if (!productId) return;
    navigate("/cart", { state: { fromProduct: productId } });
  };

  const handleOpenWishlist = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    setIsWishlistModalOpen(true);
  };

  const handleCloseWishlist = () => {
    setIsWishlistModalOpen(false);
  };

  const handleToggleCompare = (event) => {
    if (!product || !productId) return;

    if (checkIsCompared(productId)) {
      removeFromCompare(productId);
      showCompareRemovedToast(getAnchorRect(event));
    } else {
      addToCompare(product, { anchor: getAnchorRect(event) });
    }
  };

  return {
    productId,
    isInCart,
    isAuthenticated,
    isWishlisted,
    isCompared,
    isWishlistModalOpen,
    handleAddToCart,
    handleGoToCart,
    handleOpenWishlist,
    handleCloseWishlist,
    handleToggleCompare,
  };
};
