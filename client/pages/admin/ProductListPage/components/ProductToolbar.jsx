import AdminRefreshButton from '../../../../components/admin/common/AdminRefreshButton.jsx';
import AdminSearchInput from '../../../../components/admin/common/AdminSearchInput.jsx';
import CustomSelect from '../../../../components/common/CustomSelect/CustomSelect.jsx';
import ProductFilterCombobox from './ProductFilterCombobox.jsx';

const SORT_OPTIONS = [
  { value: 'default', label: 'Без сортування' },
  { value: 'name_asc', label: 'Назва: А-Я' },
  { value: 'name_desc', label: 'Назва: Я-А' },
  { value: 'price_asc', label: 'Ціна: дешевші' },
  { value: 'price_desc', label: 'Ціна: дорожчі' },
  { value: 'stock_asc', label: 'Залишок: менше' },
  { value: 'stock_desc', label: 'Залишок: більше' },
];

const ProductToolbar = ({
  searchTerm,
  onSearchChange,
  onSearchClear,
  category,
  onCategoryChange,
  categories,
  brand,
  onBrandChange,
  brands,
  sortValue,
  onSortChange,
  onRefresh,
  isLoading,
}) => {
  const categoryOptions = [
    { value: 'all', label: 'Усі категорії' },
    ...categories.map((cat) => ({
      value: cat.name,
      label: cat.description || cat.name,
    })),
  ];

  const brandOptions = [
    { value: 'all', label: 'Усі бренди' },
    ...brands.map((brandItem) => ({
      value: brandItem.name,
      label: brandItem.name,
    })),
  ];

  return (
    <div className="product-toolbar-card">
      <div className="product-toolbar-layout">
        <AdminSearchInput
          value={searchTerm}
          onChange={onSearchChange}
          onClear={onSearchClear}
          placeholder="Пошук товарів за назвою..."
          disabled={isLoading}
        />

        <div className="product-toolbar-controls">
          <ProductFilterCombobox
            id="product-category-filter"
            value={category}
            onChange={onCategoryChange}
            options={categoryOptions}
            placeholder="Категорія"
            disabled={isLoading}
          />

          <ProductFilterCombobox
            id="product-brand-filter"
            value={brand}
            onChange={onBrandChange}
            options={brandOptions}
            placeholder="Бренд"
            disabled={isLoading}
          />

          <CustomSelect
            id="product-sort"
            value={sortValue}
            onChange={onSortChange}
            options={SORT_OPTIONS}
            isLoading={isLoading}
            className="product-filter-select product-sort-select"
          />
        </div>

        <div className="product-toolbar-actions">
          <AdminRefreshButton
            onClick={onRefresh}
            isLoading={isLoading}
            title="Оновити товари"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductToolbar;
