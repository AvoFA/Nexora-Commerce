// інтелектуальний каталог товарів із пошуком та фільтрацією

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import ProductList from "../../components/catalog/ProductList/ProductList.jsx";
import FilterSidebar from "../../components/catalog/FilterSidebar/FilterSidebar.jsx";
import {
  MenuItem,
  InputAdornment,
  Button,
  Box,
  Typography,
  Chip,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import FilterListIcon from "@mui/icons-material/FilterList";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

import Breadcrumbs from "../../components/common/Breadcrumbs/Breadcrumbs.jsx";
import Pagination from "../../components/common/Pagination/Pagination.jsx";
import "./CatalogPage.scss";

import CatalogToolbar from "./CatalogToolbar.jsx";
import CatalogSortMenu from "./CatalogSortMenu.jsx";
import CatalogEmptyState from "./CatalogEmptyState.jsx";

// Спеціальні хуки для логіки каталогу
import { useCatalogData } from "../../components/catalog/hooks/useCatalogData.js";
import { useCatalogSearch } from "../../components/catalog/hooks/useCatalogSearch.js";
import { useCatalogFilters } from "../../components/catalog/hooks/useCatalogFilters.js";

const CatalogPage = () => {
  // Параметри маршруту
  const { categoryName } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const navbarSearchQuery = searchParams.get("q");
  const brandQuery = searchParams.get("brand");

  // Управління станом та хуки
  const { allProducts, availableCategories, isLoading, error } =
    useCatalogData();
  const { performIntelligentSearch, shouldAutoSwitchCategory } =
    useCatalogSearch();
  const { applySidebarFilters, calculateAvailableBrands } = useCatalogFilters();
  const [availableBrands, setAvailableBrands] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [activeSidebarFilters, setActiveSidebarFilters] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [pageSearchQuery, setPageSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("priceAsc");

  const [pageTitle, setPageTitle] = useState("Каталог товарів");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // State для пагинації
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12); // Кількість товарів на сторінці
  const [loadedPagesRange, setLoadedPagesRange] = useState({ start: 1, end: 1 });

  const sortOptions = [
    { value: "priceAsc", label: "Від дешевих до дорогих" },
    { value: "priceDesc", label: "Від дорогих до дешевих" },
  ];

  // Обробляє зміни URL (категорія або пошуковий запит)
  useEffect(() => {
    if (categoryName) {
      setSelectedCategory(categoryName);
    } else {
      setSelectedCategory("all");
    }
  }, [categoryName]);

  useEffect(() => {
    if (navbarSearchQuery) {
      setPageSearchQuery(navbarSearchQuery);
    } else {
      setPageSearchQuery("");
    }
  }, [navbarSearchQuery]);

  // Оновлює заголовок сторінки динамічно
  useEffect(() => {
    if (pageSearchQuery) {
      setPageTitle(`По запиту «${pageSearchQuery}» знайшлося`);
    } else {
      const currentCategory = availableCategories.find(
        (cat) => cat.value === selectedCategory,
      );
      const categoryLabel = currentCategory && selectedCategory !== "all"
        ? currentCategory.label
        : "Каталог товарів";

      const selectedBrands = activeSidebarFilters?.brands || [];
      if (selectedBrands.length > 0) {
        const brandString = selectedBrands.join(", ");
        const base = categoryLabel === "Каталог товарів" ? "Товари" : categoryLabel;
        setPageTitle(`${base} ${brandString}`);
      } else {
        setPageTitle(categoryLabel);
      }
    }
  }, [pageSearchQuery, selectedCategory, activeSidebarFilters?.brands, availableCategories]);

  useEffect(() => {
    if (brandQuery) {
      setActiveSidebarFilters((current) => ({
        ...(current || {}),
        brands: [brandQuery],
      }));
      return;
    }

    setActiveSidebarFilters((current) => {
      if (!current?.brands?.length) return current;
      return {
        ...current,
        brands: [],
      };
    });
  }, [brandQuery]);

  // Закриття сортування при кліку зовні
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".catalog-sort-picker") && !event.target.closest(".sort-mobile-capsule-wrapper")) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Основна логіка фільтрації та сортування
  useEffect(() => {
    const filtered = processProducts(
      allProducts,
      selectedCategory,
      pageSearchQuery,
      activeSidebarFilters,
      sortOrder,
    );

    const brands = calculateAvailableBrands(allProducts, selectedCategory);

    setAvailableBrands(brands);
    setFilteredProducts(filtered.products);

    // Авто-переключення категорії, якщо пошук знайшов товари лише в одній
    if (!filtered.autoSwitch) return;

    setSelectedCategory(filtered.targetCategory);
    navigate(`/catalog/${filtered.targetCategory}`);
  }, [
    allProducts,
    selectedCategory,
    pageSearchQuery,
    activeSidebarFilters,
    sortOrder,
    availableCategories,
  ]);

  // Підрахунок активних фільтрів для лічильника на кнопці
  const getActiveFiltersCount = () => {
    if (!activeSidebarFilters) return 0;
    let count = 0;
    if (activeSidebarFilters.brands?.length) count += activeSidebarFilters.brands.length;
    if (activeSidebarFilters.memory?.length) count += activeSidebarFilters.memory.length;
    if (activeSidebarFilters.ram?.length) count += activeSidebarFilters.ram.length;
    if (activeSidebarFilters.minPrice > 0 || activeSidebarFilters.maxPrice > 0) count += 1;
    if (activeSidebarFilters.attributes) {
      count += Object.values(activeSidebarFilters.attributes).flat().length;
    }
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  // Блокування скролу фону при відкритих фільтрах або сортуванні
  useEffect(() => {
    // Сортування блокує скрол тільки на мобільних (де воно на весь екран)
    const isMobile = window.innerWidth < 992;

    if (isFiltersOpen) {
      document.body.classList.add("filters-open");
    } else {
      document.body.classList.remove("filters-open");
    }

    if (isSortOpen && isMobile) {
      document.body.classList.add("sort-open");
    } else {
      document.body.classList.remove("sort-open");
    }

    if (isFiltersOpen || (isSortOpen && isMobile)) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.classList.remove("filters-open");
      document.body.classList.remove("sort-open");
      document.body.style.overflow = "";
    };
  }, [isFiltersOpen, isSortOpen]);


  // Скидання сторінки на першу при зміні фільтрів
  useEffect(() => {
    setPage(1);
    setLoadedPagesRange({ start: 1, end: 1 });
  }, [pageSearchQuery, selectedCategory, activeSidebarFilters, sortOrder]);

  // Універсальна функція обробки даних (Пошук -> Фільтр -> Сортування)
  const processProducts = (
    products,
    category,
    searchQuery,
    filters,
    sorting,
  ) => {
    let processed = [...products];

    if (searchQuery) {
      // 1. Інтелектуальний пошук
      const results = performIntelligentSearch(processed, searchQuery);
      processed = results.products;

      // 2. Аналіз: чи треба перемкнути категорію?
      const autoSwitch = shouldAutoSwitchCategory(results.products, category);
      if (autoSwitch.shouldSwitch) {
        return {
          products: processed,
          autoSwitch: true,
          targetCategory: autoSwitch.targetCategory,
        };
      }
    } else {
      // Стандартний режим (без пошуку)
      if (category !== "all") {
        processed = processed.filter((p) => p.category === category);
      }

      if (filters) {
        processed = applySidebarFilters(processed, filters);
      }

      processed = sortProducts(processed, sorting);
    }

    return {
      products: processed,
      autoSwitch: false,
      targetCategory: null,
    };
  };

  // Сортує товари в вказаному порядку
  const sortProducts = (products, sortOrder) => {
    const sorted = [...products];

    switch (sortOrder) {
      case "priceAsc":
        return sorted.sort((a, b) => a.price - b.price);
      case "priceDesc":
        return sorted.sort((a, b) => b.price - a.price);
      default:
        return sorted.sort((a, b) => a.price - b.price);
    }
  };

  // Обробники бокової панелі фільтрів
  const handleApplyFilters = (filters) => {
    setActiveSidebarFilters(filters);
  };

  const handleResetFilters = () => {
    setActiveSidebarFilters(null);
    setIsFiltersOpen(false);
  };

  const handleRemoveFilter = (type, value) => {
    if (!activeSidebarFilters) return;
    const updated = { ...activeSidebarFilters };
    if (type === "brand") {
      updated.brands = updated.brands.filter((b) => b !== value);
    } else if (type === "memory") {
      updated.memory = updated.memory.filter((m) => m !== value);
    } else if (type === "ram") {
      updated.ram = updated.ram.filter((r) => r !== value);
    } else if (type === "price") {
      updated.minPrice = 0;
      updated.maxPrice = Infinity;
    }
    setActiveSidebarFilters(updated);
  };

  // Розрахунки пагинації
  const totalPages = Math.ceil(filteredProducts.length / perPage);
  const startIndex = (loadedPagesRange.start - 1) * perPage;
  const endIndex = loadedPagesRange.end * perPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // СТАН - помилка
  if (error) {
    return (
      <div className="catalog-error">
        <h2>Помилка завантаження</h2>
        <p>{error}</p>
      </div>
    );
  }

  // Генерація хлібних крихт
  const breadcrumbItems = [{ label: "Каталог товарів", path: "/catalog" }];

  if (categoryName && categoryName !== "all") {
    const currentCategory = availableCategories.find(
      (cat) => cat.value === categoryName,
    );
    breadcrumbItems.push({
      label: currentCategory ? currentCategory.label : categoryName,
      path: `/catalog/${categoryName}`,
    });
  }

  if (
    activeSidebarFilters &&
    activeSidebarFilters.brands &&
    activeSidebarFilters.brands.length === 1
  ) {
    breadcrumbItems.push({ label: activeSidebarFilters.brands[0], path: null });
  } else if (pageSearchQuery) {
    breadcrumbItems.push({ label: `Пошук: "${pageSearchQuery}"`, path: null });
  }

  if (breadcrumbItems.length > 0) {
    breadcrumbItems[breadcrumbItems.length - 1].path = null;
  }

  // ГОЛОВНИЙ РЕНДЕР
  return (
    <div className="catalog-page">
      <Breadcrumbs items={breadcrumbItems} />

      {isFiltersOpen && (
        <div
          className="filters-overlay"
          onClick={() => setIsFiltersOpen(false)}
          aria-label="Close filters"
        />
      )}

      <header className="catalog-header">
        <div className="catalog-heading">
          <h1 className="page-title">{pageTitle}</h1>
          <p className="catalog-summary">
            Знайдено {filteredProducts.length} товарів
          </p>
        </div>
      </header>

      <CatalogToolbar
        pageSearchQuery={pageSearchQuery}
        setPageSearchQuery={setPageSearchQuery}
        isSortOpen={isSortOpen}
        setIsSortOpen={setIsSortOpen}
        sortOptions={sortOptions}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        setIsFiltersOpen={setIsFiltersOpen}
        activeFiltersCount={activeFiltersCount}
        activeSidebarFilters={activeSidebarFilters}
        handleRemoveFilter={handleRemoveFilter}
        handleResetFilters={handleResetFilters}
        filteredProductsCount={filteredProducts.length}
        currentPage={page}
      />

      <div className="catalog-wrapper">
        <aside className={`catalog-sidebar ${isFiltersOpen ? "is-open" : ""}`}>
          <div className="filter-mobile__dialog">
            <div className="filter-mobile__dialog-header">
              <div className="filter-mobile__dialog-header-title">
                <div className="filter-mobile__dialog-header-title-label">
                  Фільтри
                </div>
                {activeFiltersCount > 0 && (
                  <div className="filter-mobile__dialog-header-title-badge">
                    {activeFiltersCount}
                  </div>
                )}
              </div>
              <div
                className="filter-mobile__dialog-header-close"
                onClick={() => setIsFiltersOpen(false)}
              >
                <CloseIcon />
              </div>
            </div>

            <div className="filter-mobile__dialog-content">
              {activeSidebarFilters && (activeSidebarFilters.brands?.length > 0 || activeSidebarFilters.memory?.length > 0 || activeSidebarFilters.ram?.length > 0 || activeSidebarFilters.minPrice > 0 || (activeSidebarFilters.maxPrice < Infinity && activeSidebarFilters.maxPrice > 0)) && (
                <div className="filter-mobile__dialog-selected-filters">
                  {activeSidebarFilters.brands?.map((brand) => (
                    <span key={brand} className="selected-filters__item">
                      Бренд: <span className="selected-filters__item-value">{brand}</span>
                    </span>
                  ))}
                  {activeSidebarFilters.memory?.map((mem) => (
                    <span key={mem} className="selected-filters__item">
                      Пам'ять: <span className="selected-filters__item-value">{mem}</span>
                    </span>
                  ))}
                  {activeSidebarFilters.ram?.map((ramVal) => (
                    <span key={ramVal} className="selected-filters__item">
                      ОЗУ: <span className="selected-filters__item-value">{ramVal}</span>
                    </span>
                  ))}
                  {(activeSidebarFilters.minPrice > 0 || (activeSidebarFilters.maxPrice < Infinity && activeSidebarFilters.maxPrice > 0)) && (
                    <span className="selected-filters__item">
                      Ціна: <span className="selected-filters__item-value">
                        {activeSidebarFilters.minPrice} - {activeSidebarFilters.maxPrice === Infinity ? '...' : activeSidebarFilters.maxPrice} ₴
                      </span>
                    </span>
                  )}
                  <span
                    className="selected-filters__item selected-filters__item--clear"
                    onClick={handleResetFilters}
                  >
                    Скинути всі
                  </span>
                </div>
              )}
              <FilterSidebar
                brands={availableBrands}
                categories={availableCategories.filter(
                  (category) => category.value !== "all",
                )}
                activeFilters={activeSidebarFilters}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
              />
            </div>

            <div className="filter-mobile__dialog-footer">
              <button
                className="filter-mobile__dialog-footer-button filter-mobile__dialog-footer-button--reset"
                onClick={handleResetFilters}
              >
                Скинути
              </button>
              <button
                className="filter-mobile__dialog-footer-button filter-mobile__dialog-footer-button--apply"
                onClick={() => setIsFiltersOpen(false)}
              >
                Готово
              </button>
            </div>
          </div>
        </aside>

        <main className="catalog-right">

          {filteredProducts.length > 0 ? (
            <>
              <ProductList products={currentProducts} isLoading={isLoading} />

              {/* Пагінація */}
              {totalPages > 1 && (
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  total={filteredProducts.length}
                  limit={perPage}
                  itemLabel="товарів"
                  onPageChange={(p) => {
                    setPage(p);
                    setLoadedPagesRange({ start: p, end: p });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  onLimitChange={(l) => {
                    setPerPage(l);
                    setPage(1);
                    setLoadedPagesRange({ start: 1, end: 1 });
                  }}
                  onLoadMore={() => {
                    setLoadedPagesRange((prev) => ({ ...prev, end: prev.end + 1 }));
                    setPage((prev) => prev + 1);
                  }}
                  hasMore={loadedPagesRange.end < totalPages}
                  simpleMode={true}
                  isLoading={isLoading}
                  className="catalog-pagination"
                />
              )}
            </>
          ) : (
            <>
              {isLoading ? (
                <ProductList isLoading={true} />
              ) : (
                <CatalogEmptyState error={error} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default CatalogPage;
