import { Add as AddIcon } from "@mui/icons-material";
import AdminRefreshButton from "../../../../components/admin/common/AdminRefreshButton.jsx";
import AdminSearchInput from "../../../../components/admin/common/AdminSearchInput.jsx";

const CategoryToolbar = ({
  searchTerm,
  onSearchChange,
  onSearchClear,
  onAddCategory,
  onRefresh,
  isLoading,
}) => {
  return (
    <div className="admin-solid-card category-toolbar-card">
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

          <button
            type="button"
            className="btn-primary btn-with-icon"
            onClick={onAddCategory}
          >
            <AddIcon sx={{ width: "20px", height: "20px" }} />
            Додати категорію
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryToolbar;
