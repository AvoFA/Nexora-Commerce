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
  Pagination,
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
  const perPage = 12; // Кількість товарів на сторінці

  const sortOptions = [
    { value: "priceAsc", label: "Від дешевих до дорогих" },
    { value: "priceDesc", label: "Від дорогих до дешевих" },
  ];

  // Обробляє зміни URL (категорія або пошуковий запит)
  useEffect(() => {
    if (categoryName) {
      setSelectedCategory(categoryName);
      const currentCategory = availableCategories.find(
        (cat) => cat.value === categoryName,
      );
      if (currentCategory) {
        setPageTitle(currentCategory.label);
      } else {
        setPageTitle("Каталог товарів");
      }
    } else if (navbarSearchQuery) {
      setPageSearchQuery(navbarSearchQuery);
      setPageTitle(`Результати пошуку: "${navbarSearchQuery}"`);
    } else {
      setPageTitle("Каталог товарів");
      setSelectedCategory("all");
      setPageSearchQuery("");
    }
  }, [categoryName, navbarSearchQuery, availableCategories]);

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
    if (isFiltersOpen || (isSortOpen && isMobile)) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFiltersOpen, isSortOpen]);


  // Скидання сторінки на першу при зміні фільтрів
  useEffect(() => {
    if (page !== 1) setPage(1);
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
    } else if (type === "price") {
      updated.minPrice = 0;
      updated.maxPrice = Infinity;
    }
    setActiveSidebarFilters(updated);
  };

  // Розрахунки пагинації
  const totalPages = Math.ceil(filteredProducts.length / perPage);
  const startIndex = (page - 1) * perPage;
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + perPage,
  );

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
        <div className="catalog-header-actions">
          <Button
            variant="outlined"
            className="filters-toggle-button"
            startIcon={<FilterListIcon />}
            onClick={() => setIsFiltersOpen(true)}
            sx={{
              display: "inline-flex",
              "@media (min-width: 992px)": { display: "none" },
            }}
            aria-label="Open filters"
          >
            Фільтри
          </Button>

          <CatalogSortMenu
            isSortOpen={isSortOpen}
            setIsSortOpen={setIsSortOpen}
            sortOptions={sortOptions}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            className="header-sort"
            variant="header"
          />
        </div>
      </header>

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
              {activeSidebarFilters && (activeSidebarFilters.brands?.length > 0 || activeSidebarFilters.memory?.length > 0 || activeSidebarFilters.minPrice > 0 || (activeSidebarFilters.maxPrice < Infinity && activeSidebarFilters.maxPrice > 0)) && (
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
          {/* активні чіпси перенесено всередину контрольного блоку */}
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
          />

          {filteredProducts.length > 0 ? (
            <>
              <ProductList products={currentProducts} isLoading={isLoading} />

              {/* Пагінація */}
              {totalPages > 1 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    mt: 4,
                    mb: 2,
                  }}
                >
                  {/* Текст зліва */}
                  <Typography
                    variant="body2"
                    sx={{
                      position: "absolute",
                      left: 0,
                      display: { xs: "none", md: "block" },
                      color: "rgba(255, 255, 255, 0.6)",
                    }}
                  >
                    Показано {startIndex + 1}-
                    {Math.min(startIndex + perPage, filteredProducts.length)} із{" "}
                    {filteredProducts.length}
                  </Typography>

                  {/* Пагинація по центру */}
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => {
                      setPage(value);
                      window.scrollTo(0, 0);
                    }}
                    color="primary"
                    shape="rounded"
                    showFirstButton
                    showLastButton
                    sx={{
                      mx: "auto",
                    }}
                    aria-label="Catalog pagination"
                  />
                </Box>
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
