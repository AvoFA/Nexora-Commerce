import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Close } from "@mui/icons-material";
import { useCompare } from "../../../hooks/useCompare.js";
import "./CompareTable.scss";

const CompareTable = ({ products }) => {
  const { removeFromCompare } = useCompare();
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);

  // Збираємо всі унікальні ключі характеристик (attributes)
  const allAttributeKeys = useMemo(() => {
    const keys = new Set();
    products.forEach((product) => {
      if (product.attributes && Array.isArray(product.attributes)) {
        product.attributes.forEach((attr) => {
          if (attr.key) keys.add(attr.key);
        });
      }
    });
    return Array.from(keys);
  }, [products]);

  // Функція для визначення, чи відрізняються значення в рядку
  const hasDifference = (getValueFunc) => {
    if (products.length <= 1) return false;
    const firstValue = getValueFunc(products[0]);
    return products.some((p) => getValueFunc(p) !== firstValue);
  };

  const basicSpecs = [
    {
      key: "price",
      label: "Цена",
      render: (p) => `${p.price} ₴`,
    },
    {
      key: "brand",
      label: "Бренд",
      render: (p) => p.brand || "—",
    },
    {
      key: "category",
      label: "Категория",
      render: (p) => p.category || "—",
    },
  ];

  // Визначаємо, які рядки показувати
  const filterRow = (getValueFunc) => {
    if (!showDifferencesOnly) return true;
    return hasDifference(getValueFunc);
  };

  return (
    <div className="compare-table-container">
      <div className="compare-table-controls">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showDifferencesOnly}
            onChange={(e) => setShowDifferencesOnly(e.target.checked)}
          />
          Показывать только отличия
        </label>
      </div>

      <div className="table-scroll-wrapper">
        <table className="compare-table">
          <thead>
            <tr>
              <th className="feature-col">Характеристика</th>
              {products.map((product) => (
                <th key={product.id || product._id} className="product-col">
                  <div className="product-card-mini">
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCompare(product.id || product._id)}
                      title="Удалить из сравнения"
                    >
                      <Close fontSize="small" />
                    </button>
                    <Link to={`/product/${product.id || product._id}`}>
                      <img
                        src={product.image || product.imageUrl || "/placeholder.jpg"}
                        alt={product.name}
                        className="product-img"
                      />
                      <h4 className="product-name">{product.name}</h4>
                    </Link>
                    <div className="product-price">{product.price} ₴</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Базові характеристики */}
            <tr className="section-header">
              <td colSpan={products.length + 1}>Основные характеристики</td>
            </tr>
            {basicSpecs.map((spec) => {
              if (!filterRow(spec.render)) return null;
              
              const isDiff = hasDifference(spec.render);
              
              return (
                <tr key={spec.key} className={isDiff ? "row-diff" : ""}>
                  <td className="feature-name">{spec.label}</td>
                  {products.map((product) => (
                    <td key={`${product.id}-${spec.key}`}>
                      {spec.render(product)}
                    </td>
                  ))}
                </tr>
              );
            })}

            {/* Додаткові характеристики з attributes */}
            {allAttributeKeys.length > 0 && (
              <>
                <tr className="section-header">
                  <td colSpan={products.length + 1}>Дополнительные характеристики</td>
                </tr>
                {allAttributeKeys.map((attrKey) => {
                  const getAttrValue = (p) => {
                    if (!p.attributes) return "—";
                    const attr = p.attributes.find((a) => a.key === attrKey);
                    return attr ? attr.value : "—";
                  };

                  if (!filterRow(getAttrValue)) return null;

                  const isDiff = hasDifference(getAttrValue);

                  return (
                    <tr key={attrKey} className={isDiff ? "row-diff" : ""}>
                      <td className="feature-name">{attrKey}</td>
                      {products.map((product) => (
                        <td key={`${product.id}-${attrKey}`}>
                          {getAttrValue(product)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompareTable;
