import { createPortal } from "react-dom";

const WishlistListDialog = ({
  mode,
  listName,
  listNameTouched,
  setListName,
  setListNameTouched,
  onClose,
  onSave,
}) => {
  if (!mode) return null;

  const showListNameError = Boolean(mode) && listNameTouched && listName.trim().length === 0;
  const isListSaveVisuallyInactive = Boolean(mode) && listName.trim().length === 0;

  return createPortal(
    <div className="wishlist-dialog-overlay" onClick={onClose}>
      <div className="wishlist-dialog" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="wishlist-dialog-close" onClick={onClose}>
          ×
        </button>
        <h3>{mode === "create" ? "Створити новий список" : "Перейменувати список"}</h3>
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
          <button type="button" className="btn-secondary" onClick={onClose}>
            Скасувати
          </button>
          <button
            type="button"
            className={`btn-primary${isListSaveVisuallyInactive ? " inactive" : ""}`}
            onClick={onSave}
          >
            {mode === "create" ? "Створити" : "Зберегти"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WishlistListDialog;
