import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GridViewIcon from "@mui/icons-material/GridView";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import LaptopMacIcon from "@mui/icons-material/LaptopMac";
import TabletMacIcon from "@mui/icons-material/TabletMac";
import CategoryIcon from "@mui/icons-material/Category";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SearchIcon from "@mui/icons-material/Search";
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
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
      if (onClose) onClose();
    }
  };

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
            <h3>{getCategoryLabel(category)}</h3>
            <p className="mega-menu-category-meta">{category.count || 0} товарів у категорії</p>
          </div>
          <Link
            to={`/catalog/${category.name}`}
            className="mega-menu-see-all-link"
            onClick={onClose}
          >
            <span>Дивитися всі</span>
            <ArrowForwardIcon />
          </Link>
        </div>

        <div className="cat-menu-cont__submenus">
          {categoryBrands.length > 0 ? (
            categoryBrands.map((brand) => {
              const brandProducts = products
                .filter((p) => p.category === category.name && p.brand === brand)
                .slice(0, 5);
              const firstProductImg =
                brandProducts[0]?.image || brandProducts[0]?.imageUrl || null;

              return (
                <div key={brand} className="cat-menu-cont__submenu">
                  <Link
                    to={getBrandLink(brand, category.name)}
                    className="cat-menu-cont__top-link"
                    onClick={onClose}
                  >
                    <div className="row">
                      <div className="cat-menu-cont__img-wr mob">
                        {firstProductImg ? (
                          <img
                            src={firstProductImg}
                            className="cat-menu-cont__img"
                            alt=""
                          />
                        ) : (
                          <SmartphoneIcon className="cat-menu-cont__img" />
                        )}
                      </div>
                      {brand}
                    </div>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="cat-menu-cont__ic mob"
                    >
                      <path
                        d="M3.5 1L7.79289 5.29289C8.18342 5.68342 8.18342 6.31658 7.79289 6.70711L3.5 11"
                        stroke="#737679"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </Link>

                  {brandProducts.map((p) => (
                    <Link
                      key={p._id || p.id}
                      to={`/product/${p._id || p.id}`}
                      className="cat-menu-cont__subsubmenu"
                      onClick={onClose}
                    >
                      {p.name}
                    </Link>
                  ))}

                  <Link
                    to={getBrandLink(brand, category.name)}
                    className="cat-menu-cont__subsubmenu cat-menu-cont__subsubmenu_seeall"
                    onClick={onClose}
                  >
                    Дивитися всі
                  </Link>
                </div>
              );
            })
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
        <span>{"\u041a\u0430\u0442\u0430\u043b\u043e\u0433"}</span>
        <KeyboardArrowDownIcon className={isMobileCatalogOpen ? "is-open" : ""} />
        </button>

        {isMobileCatalogOpen && (
          <div className="mobile-catalog-panel">
            <Link to="/catalog" className="mobile-catalog-all" onClick={onClose}>
              {"\u0423\u0441\u0456 \u0442\u043e\u0432\u0430\u0440\u0438"}
            </Link>

            {isLoading && <p className="mega-menu-empty">{"\u0417\u0430\u0432\u0430\u043d\u0442\u0430\u0436\u0435\u043d\u043d\u044f..."}</p>}
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
                        {"\u0423\u0441\u0456 \u0442\u043e\u0432\u0430\u0440\u0438 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0456\u0457"}
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

  if (mode === "mobile-drawer") {
    return (
      <>
        <form className="mobile-catalog-search-form" onSubmit={handleSearchSubmit}>
          <img src="/assets/logo/nexora-symbol.svg" alt="Nexora" className="mobile-catalog-logo" />
          <div className="mobile-catalog-search-input-wrapper">
            <input
              type="text"
              placeholder={"\u041f\u043e\u0448\u0443\u043a \u0442\u043e\u0432\u0430\u0440\u0456\u0432"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mobile-catalog-search-input"
            />
            <button type="submit" className="mobile-catalog-search-btn" aria-label="Search">
              <SearchIcon />
            </button>
          </div>
        </form>

        <div className="catalog-menu cat-menu common-template__menu">
          <div className="cat-menu__items q-pa-sm cursor-pointer hide-scrollbar">
            <Link
              to="/catalog"
              className={`cat-menu__items__item row no-wrap items-center${!activeCategoryName ? " cat-menu__items__item_selected" : ""}`}
              onClick={onClose}
            >
              <GridViewIcon className={`cat-menu__top-image block${!activeCategoryName ? " cat-menu__top-image_selected" : ""}`} />
              <span className={`cat-menu__top-name${!activeCategoryName ? " cat-menu__top-name_selected" : ""}`}>
                {"\u0423\u0441\u0456 \u0442\u043e\u0432\u0430\u0440\u0438"}
              </span>
            </Link>

            {isLoading && <p className="mega-menu-empty">{"\u0417\u0430\u0432\u0430\u043d\u0442\u0430\u0436\u0435\u043d\u043d\u044f..."}</p>}
            {error && <p className="mega-menu-empty">{error}</p>}

            {!isLoading && !error && categories.map((category) => {
              const Icon = getCategoryIcon(category);
              const isActive = activeCategoryName === category.name;
              return (
                <button
                  key={category.id || category.name}
                  type="button"
                  className={`cat-menu__items__item row no-wrap items-center${isActive ? " cat-menu__items__item_selected" : ""}`}
                  onClick={() => setActiveCategoryName(category.name)}
                >
                  <Icon className={`cat-menu__top-image block${isActive ? " cat-menu__top-image_selected" : ""}`} />
                  <span className={`cat-menu__top-name${isActive ? " cat-menu__top-name_selected" : ""}`}>
                    {getCategoryLabel(category)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="catolog-menu-content cat-menu-cont cat-menu__content row no-wrap cat-menu__content--visible">
            <div id="submenus" className="cat-menu-cont__submenus hide-scrollbar cat-menu-cont__submenus-cms">
              {activeCategory ? (
                <>
                  <Link
                    to={`/catalog/${activeCategory.name}`}
                    className="cat-menu-cont__all-products-link"
                    onClick={onClose}
                  >
                    <span>
                      Дивитися всі {getCategoryLabel(activeCategory).toLowerCase()}
                    </span>
                    <ArrowForwardIcon />
                  </Link>

                  {getCategoryBrands(activeCategory.name).map((brand) => {
                    const brandProducts = products
                      .filter((p) => p.category === activeCategory.name && p.brand === brand)
                      .slice(0, 5);
                    const firstProductImg = brandProducts[0]?.image || brandProducts[0]?.imageUrl || null;

                    return (
                      <div key={brand} className="cat-menu-cont__submenu q-py-sm q-px-sm">
                        <Link
                          to={getBrandLink(brand, activeCategory.name)}
                          className="cat-menu-cont__top-link row no-wrap items-center"
                          onClick={onClose}
                        >
                          <div className="row no-wrap items-center">
                            <div className="cat-menu-cont__img-wr mob row items-center">
                              {firstProductImg ? (
                                <img src={firstProductImg} className="cat-menu-cont__img" alt="" />
                              ) : (
                                <SmartphoneIcon className="cat-menu-cont__img" />
                              )}
                            </div>
                            {brand}
                          </div>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="cat-menu-cont__ic mob">
                            <path d="M3.5 1L7.79289 5.29289C8.18342 5.68342 8.18342 6.31658 7.79289 6.70711L3.5 11" stroke="#737679" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </Link>

                        {brandProducts.map((p) => (
                          <Link
                            key={p._id || p.id}
                            to={`/product/${p._id || p.id}`}
                            className="cat-menu-cont__subsubmenu block"
                            onClick={onClose}
                          >
                            {p.name}
                          </Link>
                        ))}
                        <Link
                          to={getBrandLink(brand, activeCategory.name)}
                          className="cat-menu-cont__subsubmenu cat-menu-cont__subsubmenu_seeall icon-comfy block"
                          onClick={onClose}
                        >
                          {"\u0414\u0438\u0432\u0438\u0442\u0438\u0441\u044f \u0432\u0441\u0456"}
                        </Link>
                      </div>
                    );
                  })}

                  {getCategoryBrands(activeCategory.name).length === 0 && (
                    <p className="mega-menu-empty">{"\u0414\u043b\u044f \u0446\u0456\u0454\u0457 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0456\u0457 \u043f\u043e\u043a\u0438 \u043d\u0435\u043c\u0430\u0454 \u0431\u0440\u0435\u043d\u0434\u0456\u0432."}</p>
                  )}
                </>
              ) : (
                <p className="mega-menu-empty">{"\u0412\u0438\u0431\u0435\u0440\u0456\u0442\u044c \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0456\u044e"}</p>
              )}
            </div>
          </div>
        </div>
      </>
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
            <span className="mega-menu-category__content">
              <GridViewIcon />
              <span>Усі товари</span>
            </span>
            <ChevronRightIcon className="mega-menu-category__arrow" />
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
