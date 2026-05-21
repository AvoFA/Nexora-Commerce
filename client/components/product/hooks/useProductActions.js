import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../../context/AuthContext.jsx";
import { useCompare } from "../../../hooks/useCompare.js";
import { useCart } from "../../../hooks/useCart.js";

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
    dispatch({ type: "ADD_ITEM", payload: product });
    toast.success(`${product.name} додано в кошик!`);
  };

  const handleGoToCart = () => {
    if (!productId) return;
    navigate("/cart", { state: { fromProduct: productId } });
  };

  const handleOpenWishlist = () => {
    if (!isAuthenticated) {
      toast.error("Увійдіть, щоб додати товар до списку бажань");
      return;
    }

    setIsWishlistModalOpen(true);
  };

  const handleCloseWishlist = () => {
    setIsWishlistModalOpen(false);
  };

  const handleToggleCompare = () => {
    if (!product || !productId) return;

    if (checkIsCompared(productId)) {
      removeFromCompare(productId);
      toast.success("Видалено з порівняння");
    } else {
      addToCompare(product);
    }
  };

  return {
    productId,
    isInCart,
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
