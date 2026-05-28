import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Backdrop, Box, Fade, Modal, Typography } from '@mui/material';
import {
  Close as CloseIcon,
  UploadFile as UploadFileIcon,
  Code as CodeIcon,
  ErrorOutline as ErrorIcon,
  CheckCircleOutline as CheckIcon,
  DataObject as JsonIcon,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { importProducts } from '../../../../services/productService.js';
import './ProductImportModal.scss';

const JSON_EXAMPLE = `[
  {
    "name": "iPhone 15 Pro",
    "price": 47999,
    "stock": 10,
    "brand": "Apple",
    "category": "phones",
    "description": "Flagship smartphone"
  }
]`;

const parseJson = (raw) => {
  if (!raw.trim()) return { items: [], error: null };
  try {
    const parsed = JSON.parse(raw.trim());
    const arr = Array.isArray(parsed) ? parsed : [parsed];
    if (arr.length === 0) return { items: [], error: 'Порожній масив' };

    const invalid = arr.filter(
      (item) => !item.name || item.price === undefined || item.price === null
    );
    if (invalid.length > 0) {
      return {
        items: [],
        error: `${invalid.length} товар(ів) без обов'язкових полів: name, price`,
      };
    }
    return { items: arr, error: null };
  } catch {
    return { items: [], error: 'Невалідний JSON — перевірте синтаксис' };
  }
};

const PreviewCard = ({ item, index }) => {
  const specsCount = Array.isArray(item.attributes)
    ? item.attributes.reduce((acc, g) => acc + (g.items?.length || 0), 0)
    : 0;

  return (
    <div className="import-preview-card">
      <div className="preview-card-info">
        <span className="preview-card-name">{item.name}</span>
        <div className="preview-card-meta">
          <span className="preview-meta-chip chip-price">
            {Number(item.price).toLocaleString('uk-UA')} ₴
          </span>
          {item.brand && (
            <span className="preview-meta-chip chip-brand">{item.brand}</span>
          )}
          {item.category && (
            <span className="preview-meta-chip chip-cat">{item.category}</span>
          )}
          {item.stock !== undefined && (
            <span className="preview-meta-chip">в наявності: {item.stock}</span>
          )}
          {specsCount > 0 && (
            <span className="preview-meta-chip chip-specs">
              {specsCount} характеристик
            </span>
          )}
        </div>
      </div>
      <span className="preview-card-index">#{index + 1}</span>
    </div>
  );
};

const ProductImportModal = ({ open, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [rawText, setRawText] = useState('');
  const [items, setItems] = useState([]);
  const [jsonError, setJsonError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFile, setDroppedFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setActiveTab(0);
      setRawText('');
      setItems([]);
      setJsonError(null);
      setDroppedFile(null);
      setIsDragging(false);
    }
  }, [open]);

  useEffect(() => {
    if (activeTab === 1) {
      const { items: parsed, error } = parseJson(rawText);
      setItems(parsed);
      setJsonError(error);
    }
  }, [rawText, activeTab]);

  const handleFileLoad = useCallback((file) => {
    if (!file) return;
    if (!file.name.endsWith('.json')) {
      setJsonError('Дозволено лише .json файли');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const { items: parsed, error } = parseJson(text);
      setDroppedFile(file);
      setItems(parsed);
      setJsonError(error);
    };
    reader.readAsText(file);
  }, []);

  const handleFileInputChange = (e) => {
    handleFileLoad(e.target.files[0]);
  };

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      handleFileLoad(file);
    },
    [handleFileLoad]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleImport = async () => {
    if (items.length === 0 || jsonError) return;

    setIsImporting(true);
    try {
      const result = await importProducts(items);
      toast.success(`Імпортовано ${result.count} товарів!`);
      if (result.errors?.length) {
        toast.warning(`Пропущено ${result.errors.length} невалідних записів`);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Помилка імпорту');
    } finally {
      setIsImporting(false);
    }
  };

  const canImport = items.length > 0 && !jsonError;

  return (
    <Modal
      open={open}
      onClose={isImporting ? undefined : onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 250,
          className: 'admin-modal-backdrop',
        },
      }}
    >
      <Fade in={open} timeout={250}>
        <Box className="admin-modal-wrapper">
          <div className="admin-modal-card admin-solid-card import-modal-card">
            <button onClick={onClose} className="admin-modal-close-btn" disabled={isImporting}>
              <CloseIcon />
            </button>

            <div className="admin-modal-header">
              <Typography variant="h5" component="h2">
                Імпорт товарів
              </Typography>
              <p className="product-modal-subtitle">
                Завантажте .json файл або вставте JSON-рядок для масового додавання товарів
              </p>
            </div>

            <div className="import-modal-tabs">
              <button
                type="button"
                className={`import-tab-btn${activeTab === 0 ? ' is-active' : ''}`}
                onClick={() => setActiveTab(0)}
              >
                <UploadFileIcon />
                Завантажити файл
              </button>
              <button
                type="button"
                className={`import-tab-btn${activeTab === 1 ? ' is-active' : ''}`}
                onClick={() => setActiveTab(1)}
              >
                <CodeIcon />
                Вставити текст
              </button>
            </div>

            <div className="import-modal-body">
              {activeTab === 0 && (
                <>
                  <div
                    className={`import-drop-zone${isDragging ? ' is-dragging' : ''}${droppedFile && !jsonError ? ' has-file' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                  >
                    <span className="drop-zone-icon">
                      {droppedFile && !jsonError ? <CheckIcon /> : <JsonIcon />}
                    </span>

                    {droppedFile && !jsonError ? (
                      <>
                        <p className="drop-zone-title">Файл завантажено</p>
                        <span className="drop-zone-filename">
                          <UploadFileIcon sx={{ fontSize: '0.9rem' }} />
                          {droppedFile.name}
                        </span>
                        <p className="drop-zone-hint">
                          Натисніть, щоб замінити файл
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="drop-zone-title">
                          Перетягніть .json сюди або натисніть для вибору
                        </p>
                        <p className="drop-zone-hint">
                          Підтримується масив об'єктів або одиночний об'єкт товару
                        </p>
                      </>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileInputChange}
                    />
                  </div>
                </>
              )}

              {activeTab === 1 && (
                <>
                  <textarea
                    id="import-json-textarea"
                    className={`import-textarea${jsonError && rawText.trim() ? ' has-error' : ''}`}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder={JSON_EXAMPLE}
                    spellCheck={false}
                    autoComplete="off"
                  />
                  <p className="import-json-hint">
                    Поля: <code>name</code> і <code>price</code> — обов'язкові.
                    Необов'язкові: <code>stock</code>, <code>brand</code>,{' '}
                    <code>category</code>, <code>description</code>, <code>attributes</code>
                  </p>
                </>
              )}

              {jsonError && (
                <div className="import-error-banner">
                  <ErrorIcon />
                  <span>{jsonError}</span>
                </div>
              )}

              {items.length > 0 && !jsonError && (
                <>
                  <div className="import-preview-header">
                    <p className="import-preview-title">Попередній перегляд</p>
                    <span className="import-preview-badge">
                      <CheckIcon sx={{ fontSize: '0.75rem' }} />
                      {items.length} товарів
                    </span>
                  </div>
                  <div className="import-preview-list">
                    {items.map((item, idx) => (
                      <PreviewCard key={idx} item={item} index={idx} />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="import-modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={isImporting}
              >
                Скасувати
              </button>
              <button
                type="button"
                className="btn-primary btn-with-icon"
                onClick={handleImport}
                disabled={!canImport || isImporting}
              >
                <UploadFileIcon />
                {isImporting
                  ? 'Імпортується...'
                  : canImport
                  ? `Імпортувати ${items.length} товарів`
                  : 'Імпортувати'}
              </button>
            </div>
          </div>
        </Box>
      </Fade>
    </Modal>
  );
};

export default ProductImportModal;
