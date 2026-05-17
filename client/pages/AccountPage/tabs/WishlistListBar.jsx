import { Add } from "@mui/icons-material";

const WishlistListBar = ({ lists, activeListId, onListClick, onCreateClick }) => {
  return (
    <div className="wishlist-list-tabs">
      <button
        className="wishlist-create-wide"
        type="button"
        onClick={onCreateClick}
        title="Створити новий список"
      >
        <Add />
        <span>Створити список</span>
      </button>

      {lists.map((list) => (
        <button
          key={list._id}
          type="button"
          className={`wishlist-list-tab${activeListId === list._id ? " active" : ""}`}
          onClick={() => onListClick(list._id)}
        >
          {list.name} <span>({list.products?.length || 0})</span>
        </button>
      ))}
    </div>
  );
};

export default WishlistListBar;
