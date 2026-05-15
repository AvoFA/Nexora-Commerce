import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Add,
  Balance,
  ChevronLeft,
  ChevronRight,
  Close,
  DeleteOutline,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import { toast } from "sonner";
import { useCart } from "../../hooks/useCart.js";
import { useCompare } from "../../hooks/useCompare.js";
import "./ComparePage.scss";

const CARD_WIDTH = 235;

const getAttrValue = (product, key) => {
  if (!product.attributes || !Array.isArray(product.attributes)) return "—";
  const attr = product.attributes.find((item) => item.key === key);
  return attr?.value != null ? String(attr.value) : "—";
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
      <div className="cmp-attrs__values-scroll cmp-scroll-sync">
        <div className="cmp-attrs__values">
          {values.map((value, index) => (
            <div
              key={`${label}-${index}`}
              className={`cmp-attr-val${isDiff ? " cmp-attr-val--diff" : ""}`}
            >
              {value}
            </div>
          ))}
          {Array.from({ length: totalCount - values.length }).map((_, index) => (
            <div key={`${label}-empty-${index}`} className="cmp-attr-val cmp-attr-val--empty" />
          ))}
        </div>
      </div>
    </div>
  );
};

const ComparePage = () => {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const { dispatch } = useCart();
  const [showDiffOnly, setShowDiffOnly] = useState(false);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const scrollRef = useRef(null);
  const tableRef = useRef(null);
  const isSyncingScroll = useRef(false);
  const count = compareItems.length;
  const totalCount = count === 1 ? 2 : count;

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const canScroll = el.scrollWidth > el.clientWidth + 4;
    setShowLeft(canScroll && el.scrollLeft > 4);
    setShowRight(canScroll && el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const root = tableRef.current;
    if (!root) return undefined;

    const scrollContainers = Array.from(root.querySelectorAll(".cmp-scroll-sync"));
    if (scrollContainers.length === 0) return undefined;

    const syncScroll = (event) => {
      if (isSyncingScroll.current) return;
      isSyncingScroll.current = true;

      const nextScrollLeft = event.currentTarget.scrollLeft;
      scrollContainers.forEach((container) => {
        if (container !== event.currentTarget) {
          container.scrollLeft = nextScrollLeft;
        }
      });

      updateArrows();
      window.requestAnimationFrame(() => {
        isSyncingScroll.current = false;
      });
    };

    scrollRef.current = scrollContainers[0];
    updateArrows();
    scrollContainers.forEach((container) => {
      container.addEventListener("scroll", syncScroll, { passive: true });
    });
    window.addEventListener("resize", updateArrows);

    return () => {
      scrollContainers.forEach((container) => {
        container.removeEventListener("scroll", syncScroll);
      });
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, count, showDiffOnly]);

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
    dispatch({ type: "ADD_ITEM", payload: product });
    toast.success(`${product.name} додано в кошик!`);
  };

  const attrKeys = useMemo(() => {
    const keys = new Set();
    compareItems.forEach((product) => {
      (product.attributes || []).forEach((attr) => {
        if (attr.key) keys.add(attr.key);
      });
    });
    return Array.from(keys);
  }, [compareItems]);

  const allSpecs = useMemo(() => {
    const basic = [
      {
        label: "Ціна",
        values: compareItems.map((product) =>
          product.price != null ? `${product.price} ₴` : "—",
        ),
      },
      {
        label: "Бренд",
        values: compareItems.map((product) => product.brand || "—"),
      },
    ];

    const attrs = attrKeys.map((key) => ({
      label: key,
      values: compareItems.map((product) => getAttrValue(product, key)),
    }));

    return [...basic, ...attrs];
  }, [compareItems, attrKeys]);

  const visibleSpecs = showDiffOnly
    ? allSpecs.filter((spec) => hasDiff(spec.values))
    : allSpecs;

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

            {count > 0 && (
              <div className="cmp-toolbar">
                <label className="cmp-toggle">
                  <span className="cmp-toggle__track">
                    <input
                      type="checkbox"
                      className="cmp-toggle__input"
                      checked={showDiffOnly}
                      onChange={(event) => setShowDiffOnly(event.target.checked)}
                    />
                    <span className="cmp-toggle__thumb" />
                  </span>
                  <span className="cmp-toggle__label">Тільки відмінності</span>
                </label>

                <div className="cmp-toolbar__actions">
                  <Link to="/catalog" className="cmp-toolbar-add">
                    <Add sx={{ fontSize: 20 }} />
                    <span>Додати товар</span>
                  </Link>
                  <button className="cmp-clear" onClick={clearCompare}>
                    <DeleteOutline sx={{ fontSize: 20 }} />
                    <span>Очистити</span>
                  </button>
                </div>
              </div>
            )}
          </header>

          {count === 0 ? (
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
              <button
                className={`cmp-tbl__control cmp-tbl__control--left${
                  showLeft ? " cmp-tbl__control--visible" : ""
                }`}
                onClick={() => scroll(-1)}
                aria-label="Прокрутити ліворуч"
              >
                <ChevronLeft sx={{ fontSize: 28 }} />
              </button>

              <div className="cmp-tbl__scroll cmp-scroll-sync" ref={scrollRef}>
                <div className="cmp-tbl__products">
                  {compareItems.map((product) => {
                    const id = product._id || product.id;
                    const img = product.image || product.imageUrl;

                    return (
                      <div key={id} className="cmp-product-card">
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
                            <div className="cmp-product-card__no-img">
                              Фото відсутнє
                            </div>
                          )}
                        </Link>

                        <Link to={`/product/${id}`} className="cmp-product-card__name">
                          {product.name}
                        </Link>

                        <div className="cmp-product-card__footer">
                          <span className="cmp-product-card__price">
                            {product.price} ₴
                          </span>
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
                    <div className="cmp-product-card cmp-product-card--placeholder">
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

              <button
                className={`cmp-tbl__control cmp-tbl__control--right${
                  showRight ? " cmp-tbl__control--visible" : ""
                }`}
                onClick={() => scroll(1)}
                aria-label="Прокрутити праворуч"
              >
                <ChevronRight sx={{ fontSize: 28 }} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparePage;
