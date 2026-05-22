import React, { useState, useEffect } from 'react';
import { CircularProgress } from '@mui/material';

const StockInlineEditor = ({ initialStock, onSave }) => {
  const [localStock, setLocalStock] = useState(initialStock);
  const [inputValue, setInputValue] = useState(String(initialStock));
  const [isSaving, setIsSaving] = useState(false);

  // Keep local state in sync if initialStock changes from parent
  useEffect(() => {
    setLocalStock(initialStock);
    setInputValue(String(initialStock));
  }, [initialStock]);

  const saveValue = async (val) => {
    if (val === initialStock) return;
    setIsSaving(true);
    try {
      await onSave(val);
    } catch (error) {
      // Revert if saving failed
      setLocalStock(initialStock);
      setInputValue(String(initialStock));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDecrease = (e) => {
    e.stopPropagation();
    if (localStock <= 0 || isSaving) return;
    const nextVal = Math.max(0, localStock - 1);
    setLocalStock(nextVal);
    setInputValue(String(nextVal));
    saveValue(nextVal);
  };

  const handleIncrease = (e) => {
    e.stopPropagation();
    if (isSaving) return;
    const nextVal = localStock + 1;
    setLocalStock(nextVal);
    setInputValue(String(nextVal));
    saveValue(nextVal);
  };

  const handleChange = (e) => {
    const val = e.target.value;
    // Allow digits only or empty string (for typing ease)
    if (val === '' || /^\d+$/.test(val)) {
      setInputValue(val);
    }
  };

  const handleBlur = () => {
    const parsed = parseInt(inputValue, 10);
    if (isNaN(parsed) || parsed < 0) {
      // Reset if invalid input
      setInputValue(String(localStock));
    } else {
      setLocalStock(parsed);
      setInputValue(String(parsed));
      saveValue(parsed);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur(); // Blur triggers the save logic
    }
  };

  const handleContainerClick = (e) => {
    // Prevent event bubbling to parent list elements or table rows
    e.stopPropagation();
  };

  const getStockClass = () => {
    if (localStock === 0) return 'stock-out';
    if (localStock <= 5) return 'stock-low';
    return 'stock-in';
  };

  return (
    <div 
      className={`product-stock-inline-edit ${getStockClass()}`}
      onClick={handleContainerClick}
    >
      <button
        type="button"
        className="stock-inline-btn decrease"
        onClick={handleDecrease}
        disabled={isSaving || localStock <= 0}
        title="Зменшити залишок"
      >
        –
      </button>

      <div className={`stock-input-wrapper${isSaving ? ' is-saving' : ''}`}>
        {isSaving && (
          <CircularProgress 
            size={10} 
            color="inherit" 
            className="stock-saving-spinner" 
            style={{ width: '10px', height: '10px' }}
          />
        )}
        <input
          type="text"
          className="stock-input-field"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
        />
        <span className="stock-input-suffix">шт.</span>
      </div>

      <button
        type="button"
        className="stock-inline-btn increase"
        onClick={handleIncrease}
        disabled={isSaving}
        title="Збільшити залишок"
      >
        +
      </button>
    </div>
  );
};

export default StockInlineEditor;
