import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import GridViewIcon from "@mui/icons-material/GridView";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import LaptopMacIcon from "@mui/icons-material/LaptopMac";
import TabletMacIcon from "@mui/icons-material/TabletMac";
import CategoryIcon from "@mui/icons-material/Category";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { getCategories } from "../../../services/categoryService.js";
import { getProducts } from "../../../services/productService.js";
import "./MegaMenu.scss";

const iconMap = {
  smartphone: SmartphoneIcon,
  phone: SmartphoneIcon,
  phones: SmartphoneIcon,
  laptop: LaptopMacIcon,
  laptops: LaptopMacIcon,
  tablet: TabletMacIcon,
  tablets: TabletMacIcon,
  category: CategoryIcon,
  categoryicon: CategoryIcon,
};

const getCategoryLabel = (category) => category?.description || category?.name || "Категорія";

const getCategoryIcon = (category) => {
  const key = String(category?.icon || category?.name || "").toLowerCase();
  return iconMap[key] || CategoryIcon;
};

const getBrandLink = (brand, categoryName) => {
  const params = new URLSearchParams({ brand });
  return categoryName ? `/catalog/${categoryName}?${params.toString()}` : `/catalog?${params.toString()}`;
};

const MegaMenu = ({ mode = "desktop", onClose }) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategoryName, setActiveCategoryName] = useState("");
  const [isMobileCatalogOpen, setIsMobileCatalogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadMenuData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [categoriesData, productsData] = await Promise.all([
          getCategories(),
          getProducts(),
        ]);

        if (!isMounted) return;

        setCategories(categoriesData);
        setProducts(productsData);

        if (categoriesData.length > 0) {
          setActiveCategoryName((current) => current || categoriesData[0].name);
        }
      } catch (err) {
        if (isMounted) setError(err.message || "Не вдалося завантажити меню");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadMenuData();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeCategory = useMemo(
    () => categories.find((category) => category.name === activeCategoryName) || categories[0],
    [activeCategoryName, categories],
  );

  const brandsByCategory = useMemo(() => {
    const grouped = new Map();

    products.forEach((product) => {
      if (!product.category || !product.brand) return;
      if (!grouped.has(product.category)) grouped.set(product.category, new Set());
      grouped.get(product.category).add(product.brand);
    });

    return grouped;
  }, [products]);

  const getCategoryBrands = (categoryName) =>
    Array.from(brandsByCategory.get(categoryName) || []).sort((a, b) => a.localeCompare(b));

  const renderCategoryButton = (category) => {
    const Icon = getCategoryIcon(category);
    const isActive = category.name === activeCategory?.name;

    return (
      <Link
        to={`/catalog/${category.name}`}
        key={category.id || category.name}
        className={`mega-menu-category${isActive ? " is-active" : ""}`}
        onMouseEnter={() => setActiveCategoryName(category.name)}
        onFocus={() => setActiveCategoryName(category.name)}
        onClick={onClose}
      >
        <span className="mega-menu-category__content">
          <Icon className="mega-menu-category__icon" />
          <span>{getCategoryLabel(category)}</span>
        </span>
        <ChevronRightIcon className="mega-menu-category__arrow" />
      </Link>
    );
  };

  const renderCategoryDetails = (category) => {
    if (!category) return null;

    const categoryBrands = getCategoryBrands(category.name);

    return (
      <div className="mega-menu-details">
        <div className="mega-menu-details__header">
          <div>
            <p className="mega-menu-eyebrow">Категорія</p>
            <h3>{getCategoryLabel(category)}</h3>
          </div>
          <span className="mega-menu-count">{category.count || 0} товарів</span>
        </div>

        <div className="mega-menu-section">
          <div className="mega-menu-section__title">
            <StorefrontIcon />
            <span>Бренди в категорії</span>
          </div>

          {categoryBrands.length > 0 ? (
            <div className="mega-menu-brand-grid">
              {categoryBrands.map((brand) => (
                <Link
                  key={`${category.name}-${brand}`}
                  to={getBrandLink(brand, category.name)}
                  className="mega-menu-brand-card"
                  onClick={onClose}
                >
                  <span className="mega-menu-brand-card__name">{brand}</span>
                  <ArrowForwardIcon className="mega-menu-brand-card__arrow" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="mega-menu-empty">Для цієї категорії поки немає брендів.</p>
          )}
        </div>
      </div>
    );
  };

  if (mode === "mobile") {
    return (
      <div className="mobile-catalog-accordion">
        <button
          type="button"
          className="mobile-menu-link mobile-catalog-trigger"
          onClick={() => setIsMobileCatalogOpen((isOpen) => !isOpen)}
        >
          <span>Каталог</span>
          <KeyboardArrowDownIcon className={isMobileCatalogOpen ? "is-open" : ""} />
        </button>

        {isMobileCatalogOpen && (
          <div className="mobile-catalog-panel">
            <Link to="/catalog" className="mobile-catalog-all" onClick={onClose}>
              Усі товари
            </Link>

            {isLoading && <p className="mega-menu-empty">Завантаження категорій...</p>}
            {error && <p className="mega-menu-empty">{error}</p>}

            {categories.map((category) => {
              const Icon = getCategoryIcon(category);
              const isExpanded = activeCategoryName === category.name;
              const categoryBrands = getCategoryBrands(category.name);

              return (
                <div className="mobile-catalog-group" key={category.id || category.name}>
                  <button
                    type="button"
                    className={`mobile-catalog-category${isExpanded ? " is-active" : ""}`}
                    onClick={() =>
                      setActiveCategoryName((current) =>
                        current === category.name ? "" : category.name,
                      )
                    }
                  >
                    <span>
                      <Icon />
                      {getCategoryLabel(category)}
                    </span>
                    <KeyboardArrowDownIcon />
                  </button>

                  {isExpanded && (
                    <div className="mobile-catalog-details">
                      <Link
                        to={`/catalog/${category.name}`}
                        className="mobile-catalog-all"
                        onClick={onClose}
                      >
                        Усі товари категорії
                      </Link>

                      {categoryBrands.map((brand) => (
                        <Link
                          key={`${category.name}-${brand}`}
                          to={getBrandLink(brand, category.name)}
                          className="mobile-catalog-brand"
                          onClick={onClose}
                        >
                          {brand}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        className="mega-menu-backdrop"
        aria-label="Закрити каталог"
        onClick={onClose}
      />
      <div className="mega-menu-shell" role="dialog" aria-label="Каталог товарів">
        <aside className="mega-menu-sidebar">
          <Link to="/catalog" className="mega-menu-all-link" onClick={onClose}>
            <GridViewIcon />
            <span>Усі товари</span>
          </Link>

          {isLoading && <p className="mega-menu-empty">Завантаження категорій...</p>}
          {error && <p className="mega-menu-empty">{error}</p>}
          {!isLoading && !error && categories.length === 0 && (
            <p className="mega-menu-empty">Категорії поки не додані.</p>
          )}

          {categories.map(renderCategoryButton)}
        </aside>

        <section className="mega-menu-main">
          <div className="mega-menu-main__scroll">{renderCategoryDetails(activeCategory)}</div>
        </section>
      </div>
    </>
  );
};

export default MegaMenu;
