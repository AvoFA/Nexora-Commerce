import { History, VisibilityOutlined } from "@mui/icons-material";
import { useRecentlyViewed } from "../../../hooks/useRecentlyViewed.js";
import { useCart } from "../../../hooks/useCart.js";
import { useCompare } from "../../../hooks/useCompare.js";
import EmptyState from "../../../components/common/EmptyState/EmptyState.jsx";
import WishlistProductRow from "./WishlistProductRow.jsx";
import { getAnchorRect, showCompareRemovedToast } from "../../../utils/notifications.js";
import "../AccountPage.scss"; // Reuse account page styles

const RecentlyViewedTab = () => {
  const {
    products: viewedItems,
    clearRecentlyViewed,
    removeRecentlyViewed,
  } = useRecentlyViewed();
  const { dispatch } = useCart();
  const { addToCompare, removeFromCompare, isCompared } = useCompare();

  const handleAddToCart = (product) => {
    const productId = product?._id || product?.id;
    dispatch({ type: "ADD_ITEM", payload: { ...product, id: productId } });
  };

  const handleToggleCompare = (product, event) => {
    const productId = product?._id || product?.id;
    if (isCompared(productId)) {
      removeFromCompare(productId);
      showCompareRemovedToast(getAnchorRect(event));
    } else {
      addToCompare(product, { anchor: getAnchorRect(event) });
    }
  };

  if (!viewedItems.length) {
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
    <div className="wishlist-tab">
      <div className="wishlist-module">
        <div className="wishlist-toolbar">
          <div className="wishlist-toolbar-main">
            <div className="wishlist-heading">
              <h2 className="tab-title">
                <VisibilityOutlined sx={{ verticalAlign: 'middle', mr: 1.5, color: 'var(--primary-color)' }} />
                <span>Переглянуті товари</span>
              </h2>
              <p>Товари, якими ви цікавилися останнім часом.</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button
                type="button"
                className="btn-text-danger"
                onClick={clearRecentlyViewed}
              >
                Очистити історію
              </button>
            </div>
          </div>
        </div>

        <div className="wishlist-board">
          <div className="wishlist-products-list">
            {viewedItems.map((product) => (
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
    </div>
  );
};

export default RecentlyViewedTab;
