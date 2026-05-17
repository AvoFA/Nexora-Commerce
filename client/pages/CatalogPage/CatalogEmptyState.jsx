import SearchOffIcon from "@mui/icons-material/SearchOff";

const CatalogEmptyState = ({ error }) => {
  return (
    <div className="catalog-empty-state" role="status">
      <div className="empty-icon-wrapper">
        <SearchOffIcon className="empty-icon" />
      </div>
      <h2>
        {error
          ? "Сервер тимчасово недоступний"
          : "Нічого не знайдено"}
      </h2>
      <p>
        {error
          ? "Перевірте підключення до інтернету та спробуйте пізніше."
          : "На жаль, за вашим запитом нічого не знайдено. Спробуйте скинути фільтри."}
      </p>
    </div>
  );
};

export default CatalogEmptyState;
