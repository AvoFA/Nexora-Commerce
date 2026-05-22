import AdminRefreshButton from "../../../../components/admin/common/AdminRefreshButton.jsx";
import AdminSearchInput from "../../../../components/admin/common/AdminSearchInput.jsx";

const CategoryToolbar = ({
  searchTerm,
  onSearchChange,
  onSearchClear,
  onRefresh,
  isLoading,
}) => {
  return (
    <div className="category-toolbar-card">
      <div className="category-toolbar-layout">
        <AdminSearchInput
          value={searchTerm}
          onChange={onSearchChange}
          onClear={onSearchClear}
          placeholder="Пошук категорій за назвою..."
          disabled={isLoading}
        />

        <div className="category-toolbar-actions">
          <AdminRefreshButton
            onClick={onRefresh}
            isLoading={isLoading}
            title="Оновити категорії"
          />
        </div>
      </div>
    </div>
  );
};

export default CategoryToolbar;
