import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  Add,
  Balance,
  ChevronLeft,
  ChevronRight,
  Close,
  DeleteOutline,
  KeyboardArrowDown,
  ShoppingCartOutlined,
  Star,
} from "@mui/icons-material";
import { useCart } from "../../hooks/useCart.js";
import { useCompare } from "../../hooks/useCompare.js";
import {
  getCategoryDisplay,
  getProductCategoryKey,
} from "../../utils/categories.js";
import { formatPrice } from "../../utils/formatPrice.js";
import "./ComparePage.scss";

const CARD_WIDTH = 235;

const getStubRating = (id) => {
  if (!id) return { rating: 4.2, count: 28 };

  const hash = String(id)
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const rating = (3.5 + (hash % 15) / 10).toFixed(1);
  const count = 8 + (hash % 120);

  return { rating: parseFloat(rating), count };
};

const EMPTY_VALUE = "—";

const getAttrValue = (product, key) => {
  if (!product.attributes || !Array.isArray(product.attributes)) {
    return EMPTY_VALUE;
  }

  const attr = product.attributes.find((item) => item.key === key);
  return attr?.value != null ? String(attr.value) : EMPTY_VALUE;
};

const hasDiff = (values) => {
  if (values.length <= 1) return false;
  const normalized = values.map((value) => String(value).trim().toLowerCase());
  return new Set(normalized).size > 1;
};

const SpecRow = ({ label, values, showDiffOnly, totalCount }) => {
  const isDiff = hasDiff(values);
  if (showDiffOnly && !isDiff) return null;

  return (
    <div className={`cmp-spec-block${isDiff ? " cmp-spec-block--diff" : ""}`}>
      <div className="cmp-attrs__header">
        <span className="cmp-attrs__name">{label}</span>
      </div>
      <div className="cmp-attrs__values">
        {values.map((value, index) => (
          <div
            key={`${label}-${index}`}
            className={`cmp-attr-val${isDiff ? " cmp-attr-val--diff" : ""}`}
          >
            {value}
          </div>
        ))}
        {Array.from({ length: totalCount - values.length }).map(
          (_, index) => (
            <div
              key={`${label}-empty-${index}`}
              className="cmp-attr-val cmp-attr-val--empty"
            />
          ),
        )}
      </div>
    </div>
  );
};

const ComparePage = () => {
  const { compareItems, removeFromCompare } = useCompare();
  const { dispatch } = useCart();
  const [showDiffOnly, setShowDiffOnly] = useState(false);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const [isStickyCompact, setIsStickyCompact] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");
  const [isListOpen, setIsListOpen] = useState(false);
  const [normalProductsHeight, setNormalProductsHeight] = useState(0);
  const [normalProductsOffset, setNormalProductsOffset] = useState(0);

  const scrollRef = useRef(null);
  const headerRef = useRef(null);
  const tableRef = useRef(null);
  const listPickerRef = useRef(null);
  const normalProductsRef = useRef(null);
  const isSyncingScroll = useRef(false);

  const compareGroups = useMemo(() => {
    const groups = new Map();

    compareItems.forEach((product) => {
      const categoryKey = getProductCategoryKey(product);
      const current = groups.get(categoryKey) || {
        key: categoryKey,
        label: getCategoryDisplay(categoryKey),
        items: [],
      };
      current.items.push(product);
      groups.set(categoryKey, current);
    });

    return Array.from(groups.values());
  }, [compareItems]);

  const activeGroup = useMemo(
    () =>
      compareGroups.find((group) => group.key === activeCategory) ||
      compareGroups[0],
    [activeCategory, compareGroups],
  );

  const activeCompareItems = activeGroup?.items || [];
  const count = activeCompareItems.length;
  const totalCount = count === 1 ? 2 : count;

  useEffect(() => {
    if (compareGroups.length === 0) {
      setActiveCategory("");
      setIsListOpen(false);
      return;
    }

    if (!compareGroups.some((group) => group.key === activeCategory)) {
      setActiveCategory(compareGroups[0].key);
    }
  }, [activeCategory, compareGroups]);

  useEffect(() => {
    if (!isListOpen) return undefined;

    const handleClickOutside = (event) => {
      if (!listPickerRef.current?.contains(event.target)) {
        setIsListOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isListOpen]);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const canScroll = el.scrollWidth > el.clientWidth + 4;
    setShowLeft(canScroll && el.scrollLeft > 4);
    setShowRight(
      canScroll && el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    );
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
    if (headerRef.current) {
      headerRef.current.scrollLeft = 0;
    }
    updateArrows();
  }, [activeCategory, updateArrows]);

  useEffect(() => {
    const bodyScroll = scrollRef.current;
    const headerScroll = headerRef.current;
    if (!bodyScroll) return undefined;

    const syncScrollLeft = (source, target) => {
      if (!target || isSyncingScroll.current) return;

      isSyncingScroll.current = true;
      target.scrollLeft = source.scrollLeft;
      window.requestAnimationFrame(() => {
        isSyncingScroll.current = false;
      });
    };

    const handleBodyScroll = () => {
      updateArrows();
      syncScrollLeft(bodyScroll, headerScroll);
    };

    const handleHeaderScroll = () => {
      syncScrollLeft(headerScroll, bodyScroll);
    };

    updateArrows();
    bodyScroll.addEventListener("scroll", handleBodyScroll, { passive: true });
    headerScroll?.addEventListener("scroll", handleHeaderScroll, {
      passive: true,
    });
    window.addEventListener("resize", updateArrows);

    return () => {
      bodyScroll.removeEventListener("scroll", handleBodyScroll);
      headerScroll?.removeEventListener("scroll", handleHeaderScroll);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, count, showDiffOnly]);

  useEffect(() => {
    const updateStickyState = () => {
      const root = tableRef.current;
      if (!root) return;

      const navbarHeight =
        Number.parseInt(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--navbar-height",
          ),
          10,
        ) || 64;
      const productsRow = root.querySelector(".cmp-products-shell--normal");
      const toolbar = root.querySelector(".cmp-toolbar--sticky");
      if (!productsRow || !toolbar) return;

      const toolbarBottom = Math.max(
        navbarHeight,
        toolbar.getBoundingClientRect().bottom,
      );
      setIsStickyCompact(
        productsRow.getBoundingClientRect().bottom <= toolbarBottom + 4,
      );
    };

    updateStickyState();
    window.addEventListener("scroll", updateStickyState, { passive: true });
    window.addEventListener("resize", updateStickyState);

    return () => {
      window.removeEventListener("scroll", updateStickyState);
      window.removeEventListener("resize", updateStickyState);
    };
  }, [count]);

  useEffect(() => {
    const el = normalProductsRef.current;
    if (!el) return undefined;

    const updateMetrics = () => {
      const wrapper = el.closest(".cmp-main-canvas-wrapper");
      const wrapperTop = wrapper?.getBoundingClientRect().top || 0;
      const productsTop = el.getBoundingClientRect().top || 0;

      setNormalProductsHeight(el.offsetHeight || 0);
      setNormalProductsOffset(Math.max(0, productsTop - wrapperTop));
    };

    updateMetrics();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateMetrics);
      return () => window.removeEventListener("resize", updateMetrics);
    }

    const observer = new ResizeObserver(updateMetrics);
    observer.observe(el);

    return () => observer.disconnect();
  }, [activeCategory, count, showDiffOnly]);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;

    const firstCard = el.querySelector(".cmp-product-card");
    const step = firstCard?.offsetWidth || CARD_WIDTH;
    const currentIndex = Math.round(el.scrollLeft / step);
    const nextLeft = Math.max(0, currentIndex + direction) * step;

    el.scrollTo({
      left: Math.min(nextLeft, el.scrollWidth - el.clientWidth),
      behavior: "smooth",
    });
  };

  const handleAddToCart = (product) => {
    dispatch({ type: "ADD_ITEM", payload: { ...product, id: product._id || product.id } });
  };

  const handleClearGroup = (items) => {
    items.forEach((product) => {
      removeFromCompare(product._id || product.id);
    });
    setIsListOpen(false);
  };

  const handleClearActiveGroup = () => {
    handleClearGroup(activeCompareItems);
  };

  const handleClearAllGroups = () => {
    handleClearGroup(compareItems);
  };

  const handleSelectGroup = (categoryKey) => {
    setActiveCategory(categoryKey);
    setIsListOpen(false);
  };

  const attrKeys = useMemo(() => {
    const keys = new Set();
    activeCompareItems.forEach((product) => {
      (product.attributes || []).forEach((attr) => {
        if (attr.key) keys.add(attr.key);
      });
    });
    return Array.from(keys);
  }, [activeCompareItems]);

  const allSpecs = useMemo(() => {
    const basic = [
      {
        label: "Ціна",
        values: activeCompareItems.map((product) =>
          product.price != null ? formatPrice(product.price) : EMPTY_VALUE,
        ),
      },
      {
        label: "Бренд",
        values: activeCompareItems.map((product) => product.brand || EMPTY_VALUE),
      },
    ];

    const attrs = attrKeys.map((key) => ({
      label: key,
      values: activeCompareItems.map((product) => getAttrValue(product, key)),
    }));

    return [...basic, ...attrs];
  }, [activeCompareItems, attrKeys]);

  const visibleSpecs = showDiffOnly
    ? allSpecs.filter((spec) => hasDiff(spec.values))
    : allSpecs;

  const renderProductCards = (isCompact = false) => (
    <>
      {activeCompareItems.map((product) => {
        const id = product._id || product.id;
        const img = product.image || product.imageUrl;
        const { rating, count: reviewCount } = getStubRating(id);

        return (
          <div
            key={`${isCompact ? "compact-" : ""}${id}`}
            className={`cmp-product-card${isCompact ? " cmp-product-card--compact" : ""}`}
          >
            <button
              className="cmp-product-card__remove"
              onClick={() => removeFromCompare(id)}
              title="Прибрати з порівняння"
            >
              <Close sx={{ fontSize: 16 }} />
            </button>

            <Link to={`/product/${id}`} className="cmp-product-card__img-link">
              {img ? (
                <img
                  src={img}
                  alt={product.name}
                  className="cmp-product-card__img"
                />
              ) : (
                <div className="cmp-product-card__no-img">Фото відсутнє</div>
              )}
            </Link>

            <Link to={`/product/${id}`} className="cmp-product-card__name">
              {product.name}
            </Link>

            <div className="cmp-product-card__rating">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={`${id}-rating-${index}`}
                  fontSize="inherit"
                  className={`cmp-product-card__rating-star${
                    index < Math.round(rating)
                      ? " cmp-product-card__rating-star--filled"
                      : ""
                  }`}
                />
              ))}
              <span className="cmp-product-card__rating-count">
                ({reviewCount})
              </span>
            </div>

            <div className="cmp-product-card__footer">
              <span className="cmp-product-card__price">{formatPrice(product.price)}</span>
              <button
                className="cmp-product-card__cart"
                onClick={() => handleAddToCart(product)}
                title="В кошик"
              >
                <ShoppingCartOutlined sx={{ fontSize: 18 }} />
              </button>
            </div>
          </div>
        );
      })}

      {count === 1 && (
        <div
          className={`cmp-product-card cmp-product-card--placeholder${isCompact ? " cmp-product-card--compact" : ""}`}
        >
          <Link to="/catalog" className="cmp-placeholder-link">
            <div className="cmp-placeholder-icon">
              <Add sx={{ fontSize: 40 }} />
            </div>
            <div className="cmp-placeholder-text">
              Додайте ще один товар для порівняння
            </div>
          </Link>
        </div>
      )}
    </>
  );

  return (
    <div className="cmp-page">
      <div className="container">
        <div className="cmp-content-card">
          <header className="cmp-header">
            <div className="cmp-header__left">
              <h1 className="cmp-header__title">
                <Balance sx={{ fontSize: 32 }} />
                Порівняння товарів
              </h1>
              <p className="cmp-header__subtitle">
                Знайдіть найкраще рішення для ваших потреб
              </p>
            </div>
          </header>

          {compareItems.length === 0 ? (
            <div className="cmp-empty">
              <div className="cmp-empty__icon">⚖️</div>
              <h2>Список порівняння порожній</h2>
              <p>Додайте товари через іконку ваги на картках каталогу</p>
              <Link to="/catalog" className="btn-primary">
                Перейти до каталогу
              </Link>
            </div>
          ) : (
            <div className="cmp-tbl" ref={tableRef}>
              <div
                className={`cmp-main-canvas-wrapper${isStickyCompact ? " cmp-main-canvas-wrapper--compact" : ""}`}
                style={{
                  "--cmp-normal-products-height": normalProductsHeight
                    ? `${normalProductsHeight}px`
                    : undefined,
                  "--cmp-normal-products-offset": normalProductsOffset
                    ? `${normalProductsOffset}px`
                    : undefined,
                }}
              >
                <div
                  className={`cmp-sticky-stack${isStickyCompact ? " cmp-sticky-stack--compact" : ""}`}
                >
                  <div className="cmp-toolbar cmp-toolbar--sticky">
                    <div
                      className={`cmp-list-picker${isListOpen ? " is-open" : ""}`}
                      ref={listPickerRef}
                    >
                      <span className="cmp-list-picker__label">
                        Список порівняння
                      </span>
                      <button
                        type="button"
                        className={`cmp-list-picker__trigger${isListOpen ? " is-open" : ""}`}
                        onClick={() => setIsListOpen((value) => !value)}
                        aria-haspopup="listbox"
                        aria-expanded={isListOpen}
                      >
                        <span>{activeGroup?.label || "Поточний список"}</span>
                        <KeyboardArrowDown sx={{ fontSize: 20 }} />
                      </button>

                      {isListOpen && (
                        <div
                          className="cmp-list-menu"
                          role="listbox"
                          aria-label="Списки порівняння"
                        >
                          <div className="cmp-list-menu__header">
                            <strong>Списки порівняння</strong>
                            <button
                              type="button"
                              className="cmp-list-menu__clear-all"
                              onClick={handleClearAllGroups}
                              aria-label="Видалити всі списки"
                            >
                              <DeleteOutline sx={{ fontSize: 18 }} />
                            </button>
                          </div>
                          <div className="cmp-list-menu__items">
                            {compareGroups.map((group) => (
                              <div
                                key={group.key}
                                className={`cmp-list-menu__item${
                                  group.key === activeGroup?.key
                                    ? " is-active"
                                    : ""
                                }`}
                                onClick={() => handleSelectGroup(group.key)}
                                onKeyDown={(event) => {
                                  if (
                                    event.key === "Enter" ||
                                    event.key === " "
                                  ) {
                                    event.preventDefault();
                                    handleSelectGroup(group.key);
                                  }
                                }}
                                role="option"
                                aria-selected={group.key === activeGroup?.key}
                                tabIndex={0}
                              >
                                <span>
                                  <strong>{group.label}</strong>
                                  <small>
                                    У порівнянні: {group.items.length}
                                  </small>
                                </span>
                                <button
                                  type="button"
                                  className="cmp-list-menu__delete"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleClearGroup(group.items);
                                  }}
                                  aria-label={`Очистити ${group.label}`}
                                >
                                  <DeleteOutline sx={{ fontSize: 18 }} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="cmp-toolbar__actions">
                      <Link to="/catalog" className="cmp-toolbar-add">
                        <Add sx={{ fontSize: 20 }} />
                        <span>Додати товар</span>
                      </Link>
                      <button
                        className="cmp-clear"
                        onClick={handleClearActiveGroup}
                      >
                        <DeleteOutline sx={{ fontSize: 20 }} />
                        <span>Видалити весь перелік</span>
                      </button>
                    </div>

                    <label className="cmp-toggle">
                      <span className="cmp-toggle__track">
                        <input
                          type="checkbox"
                          className="cmp-toggle__input"
                          checked={showDiffOnly}
                          onChange={(event) =>
                            setShowDiffOnly(event.target.checked)
                          }
                        />
                        <span className="cmp-toggle__thumb" />
                      </span>
                      <span className="cmp-toggle__label">
                        Тільки відмінності
                      </span>
                    </label>
                  </div>

                  <div
                    className={`cmp-compact-products-layer${isStickyCompact ? " cmp-compact-products-layer--visible" : ""}`}
                  >
                    <button
                      className={`cmp-tbl__control cmp-tbl__control--compact cmp-tbl__control--left${
                        showLeft ? " cmp-tbl__control--visible" : ""
                      }`}
                      onClick={() => scroll(-1)}
                      aria-label="Прокрутити ліворуч"
                    >
                      <ChevronLeft sx={{ fontSize: 22 }} />
                    </button>
                    <div
                      className={`cmp-header-sync-scroll${isStickyCompact ? " cmp-header-sync-scroll--visible" : ""}`}
                      ref={headerRef}
                    >
                      <div className="cmp-header-sync-inner">
                        <div
                          className={`cmp-products-shell cmp-products-shell--compact${isStickyCompact ? " cmp-products-shell--compact-visible" : ""}`}
                        >
                          <div className="cmp-tbl__products">
                            {renderProductCards(true)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      className={`cmp-tbl__control cmp-tbl__control--compact cmp-tbl__control--right${
                        showRight ? " cmp-tbl__control--visible" : ""
                      }`}
                      onClick={() => scroll(1)}
                      aria-label="Прокрутити праворуч"
                    >
                      <ChevronRight sx={{ fontSize: 22 }} />
                    </button>
                  </div>
                </div>

                <button
                  className={`cmp-tbl__control cmp-tbl__control--normal cmp-tbl__control--left${
                    showLeft ? " cmp-tbl__control--visible" : ""
                  }`}
                  onClick={() => scroll(-1)}
                  aria-label="Прокрутити ліворуч"
                >
                  <ChevronLeft sx={{ fontSize: 28 }} />
                </button>
                <div className="cmp-main-canvas-scroll" ref={scrollRef}>
                  <div className="cmp-main-canvas-inner">
                    <div
                      className="cmp-products-shell cmp-products-shell--normal"
                      ref={normalProductsRef}
                    >
                      <div className="cmp-tbl__products">
                        {renderProductCards()}
                      </div>
                    </div>

                    <div className="cmp-tbl__attrs">
                      {visibleSpecs.length === 0 ? (
                        <div className="cmp-no-diff">
                          Усі характеристики однакові — товари ідентичні
                        </div>
                      ) : (
                        visibleSpecs.map((spec) => (
                          <SpecRow
                            key={spec.label}
                            label={spec.label}
                            values={spec.values}
                            showDiffOnly={showDiffOnly}
                            totalCount={totalCount}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
                <button
                  className={`cmp-tbl__control cmp-tbl__control--normal cmp-tbl__control--right${
                    showRight ? " cmp-tbl__control--visible" : ""
                  }`}
                  onClick={() => scroll(1)}
                  aria-label="Прокрутити праворуч"
                >
                  <ChevronRight sx={{ fontSize: 28 }} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparePage;
