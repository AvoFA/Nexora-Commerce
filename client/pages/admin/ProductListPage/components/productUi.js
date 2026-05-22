import React from 'react';

export const getProductStockState = (stockValue) => {
  const stock = Number(stockValue) || 0;

  if (stock <= 0) {
    return {
      key: 'out',
      label: 'Немає',
      detail: '0 шт.',
    };
  }

  if (stock <= 5) {
    return {
      key: 'low',
      label: 'Мало',
      detail: `${stock} шт.`,
    };
  }

  return {
    key: 'in',
    label: 'В наявності',
    detail: `${stock} шт.`,
  };
};

export { escapeRegExp, highlightMatch } from "../../../../utils/searchHighlight";
