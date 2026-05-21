import { History, VisibilityOutlined } from "@mui/icons-material";
import { toast } from "sonner";
import { useRecentlyViewed } from "../../../hooks/useRecentlyViewed.js";
import { useCart } from "../../../hooks/useCart.js";
import { useCompare } from "../../../hooks/useCompare.js";
import EmptyState from "../../../components/common/EmptyState/EmptyState.jsx";
import WishlistProductRow from "./WishlistProductRow.jsx";
import "../AccountPage.scss"; // Reuse account page styles

const RecentlyViewedTab = () => {
  const { products, clearRecentlyViewed, removeRecentlyViewed } = useRecentlyViewed();
  const { dispatch } = useCart();
  const { addToCompare, removeFromCompare, isCompared } = useCompare();

  const handleAddToCart = (product) => {
    const productId = product?._id || product?.id;
    dispatch({ type: "ADD_ITEM", payload: { ...product, id: productId } });
    toast.success(`${product.name} додано в кошик!`);
  };

  const handleToggleCompare = (product) => {
    const productId = product?._id || product?.id;
    if (isCompared(productId)) {
      removeFromCompare(productId);
      toast.success("Видалено з порівняння");
    } else {
      addToCompare(product);
    }
  };

  if (products.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="Останні переглянуті товари"
        description="Тут з'являться товари, які ви нещодавно переглядали. Поки що ваша історія переглядів порожня."
        action={{ label: "Перейти до каталогу", to: "/catalog" }}
        actionVariant="primary"
        className="account-empty-state"
      />
    );
  }

  return (
    <div className="account-tab-viewed">
      <div className="wishlist-module"> {/* Reuse wishlist-module for styling */}
        <div className="wishlist-toolbar">
          <div className="wishlist-heading">
            <h2 className="tab-title">
              <VisibilityOutlined sx={{ verticalAlign: 'middle', mr: 1.5, color: 'var(--primary-color)' }} />
              <span>Переглянуті товари</span>
            </h2>
            <p>Товари, якими ви цікавилися останнім часом.</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button 
              className="btn-text-danger" 
              onClick={clearRecentlyViewed}
            >
              Очистити історію
            </button>
          </div>
        </div>

        <div className="wishlist-product-list">
          {products.map((product) => (
            <WishlistProductRow 
              key={product._id || product.id} 
              product={product}
              onAddToCart={handleAddToCart}
              onRemove={removeRecentlyViewed}
              onToggleCompare={handleToggleCompare}
              isCompared={isCompared}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentlyViewedTab;
