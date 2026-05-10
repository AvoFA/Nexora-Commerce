import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Close, Balance, ArrowBack, ShoppingCartOutlined, Add, DeleteOutline } from "@mui/icons-material";
import { useCompare } from "../../hooks/useCompare.js";
import { useCart } from "../../hooks/useCart.js";
import { toast } from "sonner";
import "./ComparePage.scss";

// ─── Значення атрибуту ────────────────────────────────────────────────────────
const getAttrValue = (product, key) => {
  if (!product.attributes || !Array.isArray(product.attributes)) return "—";
  const attr = product.attributes.find((a) => a.key === key);
  return attr?.value != null ? String(attr.value) : "—";
};

// ─── Чи є відмінність ─────────────────────────────────────────────────────────
const hasDiff = (values) => {
  if (values.length <= 1) return false;
  return new Set(values.map((v) => String(v).trim().toLowerCase())).size > 1;
};

// ─── Рядок: заголовок + значення ─────────────────────────────────────────────
const SpecBlock = ({ label, values, showDiffOnly, totalColumns }) => {
  const isDiff = hasDiff(values);
  if (showDiffOnly && !isDiff) return null;

  return (
    <>
      {/* Назва характеристики — по центру, на весь рядок */}
      <tr className={`cmp-spec-header${isDiff ? " cmp-spec-header--diff" : ""}`}>
        <td colSpan={totalColumns}>{label}</td>
      </tr>
      {/* Значення — кожне під своїм товаром */}
      <tr className="cmp-spec-values">
        {values.map((val, i) => (
          <td key={i} className={isDiff ? "cmp-spec-values__td--diff" : ""}>
            {val}
          </td>
        ))}
        {/* Додаємо порожню клітинку, якщо стовпців менше ніж totalColumns (тобто 1) */}
        {Array.from({ length: totalColumns - values.length }).map((_, i) => (
          <td key={`empty-${i}`} className="cmp-spec-values__empty"></td>
        ))}
      </tr>
    </>
  );
};

// ─── Сторінка ─────────────────────────────────────────────────────────────────
const ComparePage = () => {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const { dispatch } = useCart();
  const [showDiffOnly, setShowDiffOnly] = useState(false);

  const count = compareItems.length;
  const totalColumns = Math.max(2, count);

  const handleAddToCart = (product) => {
    dispatch({ type: "ADD_ITEM", payload: product });
    toast.success(`${product.name} додано в кошик!`);
  };

  // Зібрати всі ключі атрибутів
  const attrKeys = useMemo(() => {
    const keys = new Set();
    compareItems.forEach((p) =>
      (p.attributes || []).forEach((a) => { if (a.key) keys.add(a.key); })
    );
    return Array.from(keys);
  }, [compareItems]);

  // Базові характеристики
  const basicSpecs = [
    { label: "Ціна",  values: compareItems.map((p) => p.price != null ? `${p.price} ₴` : "—") },
    { label: "Бренд", values: compareItems.map((p) => p.brand || "—") },
  ];

  const attrSpecs = attrKeys.map((key) => ({
    label: key,
    values: compareItems.map((p) => getAttrValue(p, key)),
  }));

  const allSpecs = [...basicSpecs, ...attrSpecs];
  const visibleSpecs = showDiffOnly
    ? allSpecs.filter((s) => hasDiff(s.values))
    : allSpecs;

  return (
    <div className="cmp-page">

      {/* ── Шапка ─────────────────────────────────────────────────────────── */}
      <div className="cmp-header">
        <div className="cmp-header__left">
          <h1 className="cmp-header__title">
            <Balance sx={{ fontSize: 26 }} />
            Порівняння товарів
          </h1>
        </div>

        {count > 0 && (
          <div className="cmp-toolbar">
            <label className="cmp-toggle">
              <span className="cmp-toggle__track">
                <input
                  type="checkbox"
                  className="cmp-toggle__input"
                  checked={showDiffOnly}
                  onChange={(e) => setShowDiffOnly(e.target.checked)}
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
                <span>Видалити весь перелік</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Порожній стан ─────────────────────────────────────────────────── */}
      {count === 0 ? (
        <div className="cmp-empty">
          <div className="cmp-empty__icon">⚖️</div>
          <h2>Список порівняння порожній</h2>
          <p>Додайте товари через іконку ваги на картках каталогу</p>
          <Link to="/catalog" className="btn-primary">Перейти до каталогу</Link>
        </div>
      ) : (
        <div className="cmp-table-wrap">
          <table className="cmp-table">
            <colgroup>
              {Array.from({ length: totalColumns }).map((_, i) => (
                <col key={i} width={`${100 / totalColumns}%`} />
              ))}
            </colgroup>

            {/* ── Картки товарів ─────────────────────────────────────────── */}
            <thead>
              <tr className="cmp-products-row">
                {compareItems.map((product) => {
                  const id = product._id || product.id;
                  const img = product.image || product.imageUrl;
                  return (
                    <th key={id} className="cmp-product-cell">
                      {/* Кнопка видалення — помітна */}
                      <button
                        className="cmp-product-cell__remove"
                        onClick={() => removeFromCompare(id)}
                        title="Прибрати з порівняння"
                      >
                        <Close sx={{ fontSize: 16 }} />
                      </button>

                      {/* Зображення */}
                      <Link to={`/product/${id}`} className="cmp-product-cell__img-link">
                        {img
                          ? <img src={img} alt={product.name} className="cmp-product-cell__img" />
                          : <div className="cmp-product-cell__no-img">Фото відсутнє</div>
                        }
                      </Link>

                      {/* Назва */}
                      <Link to={`/product/${id}`} className="cmp-product-cell__name">
                        {product.name}
                      </Link>

                      {/* Ціна + Кошик в один рядок */}
                      <div className="cmp-product-cell__footer">
                        <span className="cmp-product-cell__price">{product.price} ₴</span>
                        <button
                          className="cmp-product-cell__cart"
                          onClick={() => handleAddToCart(product)}
                          title="В кошик"
                        >
                          <ShoppingCartOutlined sx={{ fontSize: 18 }} />
                        </button>
                      </div>
                    </th>
                  );
                })}

                {/* Плейсхолдер для другого товару, якщо додано лише один */}
                {count === 1 && (
                  <th className="cmp-product-cell cmp-product-cell--placeholder">
                    <Link to="/catalog" className="cmp-placeholder-link">
                      <div className="cmp-placeholder-icon">
                        <Add sx={{ fontSize: 40 }} />
                      </div>
                      <div className="cmp-placeholder-text">
                        Додайте ще один товар для порівняння
                      </div>
                    </Link>
                  </th>
                )}
              </tr>
            </thead>

            {/* ── Характеристики ─────────────────────────────────────────── */}
            <tbody>
              {visibleSpecs.length === 0 ? (
                <tr>
                  <td colSpan={totalColumns} className="cmp-no-diff">
                    Усі характеристики однакові — товари ідентичні
                  </td>
                </tr>
              ) : (
                visibleSpecs.map((spec) => (
                  <SpecBlock
                    key={spec.label}
                    label={spec.label}
                    values={spec.values}
                    showDiffOnly={showDiffOnly}
                    totalColumns={totalColumns}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ComparePage;
