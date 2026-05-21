import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';

const MIN_POPOVER_WIDTH = 280;
const MAX_POPOVER_WIDTH = 360;
const VIEWPORT_GAP = 16;

const ProductFilterCombobox = ({
  id,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  className = '',
}) => {
  const rootRef = useRef(null);
  const popoverRef = useRef(null);
  const inputRef = useRef(null);
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) || options[0],
    [options, value],
  );
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [popoverStyle, setPopoverStyle] = useState(null);

  const visibleOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return options;

    return options.filter((option) =>
      option.label.toLowerCase().includes(normalizedQuery),
    );
  }, [options, query]);

  const updatePopoverPosition = () => {
    const triggerRect = rootRef.current?.getBoundingClientRect();
    if (!triggerRect) return;

    const width = Math.min(
      MAX_POPOVER_WIDTH,
      Math.max(MIN_POPOVER_WIDTH, triggerRect.width),
    );
    const left = Math.min(
      Math.max(VIEWPORT_GAP, triggerRect.left),
      window.innerWidth - width - VIEWPORT_GAP,
    );

    setPopoverStyle({
      width,
      left,
      top: triggerRect.bottom + 6,
    });
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    updatePopoverPosition();

    const handlePointerDown = (event) => {
      const insideTrigger = rootRef.current?.contains(event.target);
      const insidePopover = popoverRef.current?.contains(event.target);

      if (!insideTrigger && !insidePopover) {
        setIsOpen(false);
        setQuery('');
      }
    };

    const handleViewportChange = () => {
      updatePopoverPosition();
    };

    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const openMenu = () => {
    if (disabled) return;
    setIsOpen(true);
    setQuery('');
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const closeMenu = () => {
    setIsOpen(false);
    setQuery('');
  };

  const selectOption = (option) => {
    onChange(option.value);
    closeMenu();
  };

  const handleKeyDown = (event) => {
    if (!isOpen && ['ArrowDown', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      openMenu();
      return;
    }

    if (!isOpen) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, visibleOptions.length - 1));
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    }

    if (event.key === 'Enter' && visibleOptions[activeIndex]) {
      event.preventDefault();
      selectOption(visibleOptions[activeIndex]);
    }

    if (event.key === 'Escape') {
      closeMenu();
    }
  };

  const canClear = selectedOption && selectedOption.value !== options[0]?.value;

  const popover = isOpen && popoverStyle
    ? createPortal(
        <div
          ref={popoverRef}
          className="product-filter-popover"
          style={{
            width: `${popoverStyle.width}px`,
            left: `${popoverStyle.left}px`,
            top: `${popoverStyle.top}px`,
          }}
          onKeyDown={handleKeyDown}
        >
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            className="product-filter-search"
          />

          <div className="product-filter-options" role="listbox" aria-labelledby={id}>
            {visibleOptions.length === 0 ? (
              <div className="product-filter-empty">Нічого не знайдено</div>
            ) : (
              visibleOptions.map((option, index) => {
                const selected = option.value === value;
                const active = index === activeIndex;

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`product-filter-option ${selected ? 'is-selected' : ''} ${active ? 'is-active' : ''}`.trim()}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectOption(option)}
                    role="option"
                    aria-selected={selected}
                  >
                    <span>{option.label}</span>
                    {selected && <CheckIcon />}
                  </button>
                );
              })
            )}
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <div
        ref={rootRef}
        className={`product-filter-combobox ${isOpen ? 'is-open' : ''} ${className}`.trim()}
        onKeyDown={handleKeyDown}
      >
        <button
          type="button"
          className="product-filter-trigger"
          onClick={openMenu}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className={selectedOption?.value === options[0]?.value ? 'is-placeholder' : ''}>
            {selectedOption?.label || placeholder}
          </span>
          <ExpandMoreIcon className="product-filter-trigger-icon" />
        </button>

        {canClear && (
          <button
            type="button"
            className="product-filter-clear"
            onClick={(event) => {
              event.stopPropagation();
              onChange(options[0].value);
              closeMenu();
            }}
            disabled={disabled}
            title="Скинути фільтр"
          >
            <CloseIcon />
          </button>
        )}
      </div>
      {popover}
    </>
  );
};

export default ProductFilterCombobox;
