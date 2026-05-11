// інтелектуальний каталог товарів із пошуком та фільтрацією

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import ProductList from "../../components/catalog/ProductList/ProductList.jsx";
import FilterSidebar from "../../components/catalog/FilterSidebar/FilterSidebar.jsx";
import {
  Select,
  MenuItem,
  FormControl,
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
import Breadcrumbs from "../../components/common/Breadcrumbs/Breadcrumbs.jsx";
import "./CatalogPage.scss";

// Спеціальні хуки для логіки каталогу
import { useCatalogData } from "../../components/catalog/hooks/useCatalogData.js";
import { useCatalogSearch } from "../../components/catalog/hooks/useCatalogSearch.js";
import { useCatalogFilters } from "../../components/catalog/hooks/useCatalogFilters.js";

const UI_CONFIG = {
  initialVisibleCategories: 5,
  loadingMessage: "Завантаження товарів...",
};

const CatalogPage = () => {
  // Параметри маршруту
  const { categoryName } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const navbarSearchQuery = searchParams.get("q");

  // Управління станом та хуки
  const { allProducts, availableCategories, isLoading, error } =
    useCatalogData();
  const { performIntelligentSearch, shouldAutoSwitchCategory } =
    useCatalogSearch();
  const { applySidebarFilters, calculateAvailableBrands } = useCatalogFilters();
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [activeSidebarFilters, setActiveSidebarFilters] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [pageSearchQuery, setPageSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("priceAsc");

  const [pageTitle, setPageTitle] = useState("Каталог товарів");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // State для пагинації
  const [page, setPage] = useState(1);
  const perPage = 12; // Кількість товарів на сторінці

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
        <Box
          className="filters-overlay"
          onClick={() => setIsFiltersOpen(false)}
          aria-label="Close filters"
        />
      )}

      <header className="catalog-header">
        <h1 className="page-title">{pageTitle}</h1>
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

          <div className="sort-select-wrapper">
            <label className="sort-label" htmlFor="sort-select">
              Сортувати:
            </label>
            <FormControl
              variant="outlined"
              size="small"
              className="mui-form-control sort-control"
            >
              <Select
                id="sort-select"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                MenuProps={{ className: "mui-select-menu" }}
                aria-label="Sort products"
              >
                <MenuItem value="priceAsc">Від дешевих до дорогих</MenuItem>
                <MenuItem value="priceDesc">Від дорогих до дешевих</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
      </header>

      <div className="catalog-wrapper">
        <aside className={`catalog-sidebar ${isFiltersOpen ? "is-open" : ""}`}>
          <FilterSidebar
            brands={availableBrands}
            categories={availableCategories.filter(
              (category) => category.value !== "all",
            )}
            activeFilters={activeSidebarFilters}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />
        </aside>

        <main className="catalog-right">
          {/* активні чіпси перенесено всередину контрольного блоку */}
          <div className="catalog-controls">
            {/* Пошук */}
            <div className="catalog-search">
              <TextField
                variant="outlined"
                size="small"
                className="mui-form-control"
                placeholder="Пошук у каталозі..."
                value={pageSearchQuery}
                onChange={(e) => setPageSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon className="search-icon" />
                    </InputAdornment>
                  ),
                }}
                aria-label="Search products"
              />
            </div>

            {/* Активні фільтри (chips) — тепер одразу під пошуком */}
            {activeSidebarFilters && (
              <div className="active-filters-container">
                {(activeSidebarFilters.minPrice > 0 ||
                  (activeSidebarFilters.maxPrice < Infinity &&
                    activeSidebarFilters.maxPrice)) && (
                  <Chip
                    label={`Ціна: ${activeSidebarFilters.minPrice?.toLocaleString() || 0} – ${activeSidebarFilters.maxPrice !== Infinity ? activeSidebarFilters.maxPrice?.toLocaleString() : "∞"} ₴`}
                    onDelete={() => handleRemoveFilter("price")}
                    className="filter-chip"
                  />
                )}
                {activeSidebarFilters.brands?.map((brand) => (
                  <Chip
                    key={`brand-${brand}`}
                    label={brand}
                    onDelete={() => handleRemoveFilter("brand", brand)}
                    className="filter-chip"
                  />
                ))}
                {activeSidebarFilters.memory?.map((mem) => (
                  <Chip
                    key={`mem-${mem}`}
                    label={mem}
                    onDelete={() => handleRemoveFilter("memory", mem)}
                    className="filter-chip"
                  />
                ))}
                {(activeSidebarFilters.minPrice > 0 ||
                  (activeSidebarFilters.maxPrice < Infinity &&
                    activeSidebarFilters.maxPrice) ||
                  activeSidebarFilters.brands?.length > 0 ||
                  activeSidebarFilters.memory?.length > 0) && (
                  <button
                    className="chips-clear-btn"
                    onClick={handleResetFilters}
                  >
                    Очистити все
                  </button>
                )}
              </div>
            )}

            {/* Категорії (чіпси категорій) — нижче */}
            <div className="category-buttons">
              {availableCategories
                .slice(
                  0,
                  showAllCategories
                    ? availableCategories.length
                    : UI_CONFIG.initialVisibleCategories,
                )
                .map((category) => (
                  <button
                    key={category.value}
                    className={`btn ${selectedCategory === category.value ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => {
                      if (category.value === "all") {
                        navigate("/catalog");
                      } else {
                        navigate(`/catalog/${category.value}`);
                      }
                    }}
                    aria-label={`Filter by ${category.label}`}
                  >
                    {category.label}
                  </button>
                ))}

              {availableCategories.length >
                UI_CONFIG.initialVisibleCategories && (
                <Button
                  className="btn btn-secondary"
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  sx={{
                    display: "inline-flex",
                    "@media (max-width: 991px)": { display: "none" },
                  }}
                  aria-label={
                    showAllCategories
                      ? "Show fewer categories"
                      : "Show more categories"
                  }
                >
                  {showAllCategories ? "Згорнути" : "Показати ще"}
                </Button>
              )}
            </div>
          </div>

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
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default CatalogPage;
