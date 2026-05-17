import { Link } from "react-router-dom";
import { DeleteOutline, DriveFileRenameOutline, FavoriteBorder, MoreVert } from "@mui/icons-material";
import { formatPrice } from "../../../utils/formatPrice.js";
import WishlistProductRow from "./WishlistProductRow.jsx";

const WishlistBoard = ({
  activeList,
  products,
  totalPrice,
  isMenuOpen,
  setIsMenuOpen,
  onRename,
  onClear,
  onDelete,
  onAddToCart,
  onRemoveProduct,
  onToggleCompare,
  isCompared,
}) => {
  return (
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
                <button type="button" onClick={onRename}>
                  <DriveFileRenameOutline />
                  Перейменувати
                </button>
                <button type="button" onClick={onClear} disabled={products.length === 0}>
                  <DeleteOutline />
                  Очистити список
                </button>
                <button type="button" className="danger" onClick={onDelete}>
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
            const productId = product?._id || product?.id;
            return (
              <WishlistProductRow
                key={productId}
                product={product}
                onAddToCart={onAddToCart}
                onRemove={onRemoveProduct}
                onToggleCompare={onToggleCompare}
                isCompared={isCompared}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistBoard;
