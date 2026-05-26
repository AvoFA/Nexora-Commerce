import React, { useState, useRef } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  Title,
  FormatListBulleted,
  Image as ImageIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { parseMarkdown } from '../../../../utils/markdown.js';

const ProductDescriptionSection = ({ description, onChange }) => {
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef(null);

  const insertMarkdown = (before, after = '', defaultText = 'текст') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    const replacement = before + (selectedText || defaultText) + after;
    const newText = text.substring(0, start) + replacement + text.substring(end);

    onChange('description', newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + (selectedText || defaultText).length
      );
    }, 0);
  };

  const previewHtml = parseMarkdown(description || '');

  return (
    <Box className="product-form-section product-description-section">
      <Box className="product-section-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <Typography variant="subtitle2" className="product-field-title">
          Опис товару (форматування Markdown)
        </Typography>

        <Box className="editor-mode-toggle" style={{ display: 'flex', gap: '4px', background: 'rgba(255, 255, 255, 0.03)', padding: '2px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Button
            size="small"
            onClick={() => setIsPreview(false)}
            variant={!isPreview ? 'contained' : 'text'}
            startIcon={<EditIcon style={{ fontSize: 14 }} />}
            style={{
              textTransform: 'none',
              fontSize: '0.75rem',
              padding: '2px 8px',
              minWidth: 'auto',
              boxShadow: 'none',
              background: !isPreview ? 'rgba(96, 165, 250, 0.16)' : 'transparent',
              color: !isPreview ? '#60a5fa' : 'rgba(255,255,255,0.6)',
            }}
          >
            Редагувати
          </Button>
          <Button
            size="small"
            onClick={() => setIsPreview(true)}
            variant={isPreview ? 'contained' : 'text'}
            startIcon={<VisibilityIcon style={{ fontSize: 14 }} />}
            style={{
              textTransform: 'none',
              fontSize: '0.75rem',
              padding: '2px 8px',
              minWidth: 'auto',
              boxShadow: 'none',
              background: isPreview ? 'rgba(96, 165, 250, 0.16)' : 'transparent',
              color: isPreview ? '#60a5fa' : 'rgba(255,255,255,0.6)',
            }}
          >
            Передпрогляд
          </Button>
        </Box>
      </Box>

      {!isPreview ? (
        <Box className="product-markdown-editor">
          <div className="markdown-toolbar">
            <Button
              size="small"
              onClick={() => insertMarkdown('**', '**')}
              className="markdown-toolbar-btn"
              title="Жирний (**текст**)"
            >
              <FormatBold fontSize="small" />
            </Button>
            <Button
              size="small"
              onClick={() => insertMarkdown('*', '*')}
              className="markdown-toolbar-btn"
              title="Курсив (*текст*)"
            >
              <FormatItalic fontSize="small" />
            </Button>
            <Button
              size="small"
              onClick={() => insertMarkdown('### ')}
              className="markdown-toolbar-btn"
              title="Заголовок (### Текст)"
            >
              <Title fontSize="small" />
            </Button>
            <Button
              size="small"
              onClick={() => insertMarkdown('- ')}
              className="markdown-toolbar-btn"
              title="Список (- Пункт)"
            >
              <FormatListBulleted fontSize="small" />
            </Button>
            <Button
              size="small"
              onClick={() => insertMarkdown('![опис картинки](', ')', 'посилання_на_зображення') }
              className="markdown-toolbar-btn"
              title="Вставити фото (![опис](посилання))"
            >
              <ImageIcon fontSize="small" />
            </Button>
          </div>

          <TextField
            inputRef={textareaRef}
            multiline
            minRows={10}
            maxRows={15}
            placeholder="Введіть опис товару... Ви можете використовувати розмітку Markdown або кнопки над цим полем для додавання заголовків, жирного тексту, списків та картинок."
            value={description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            fullWidth
            InputProps={{
              className: 'markdown-editor-input'
            }}
          />
        </Box>
      ) : (
        <div
          className="product-description-preview-pane"
          style={{
            minHeight: '260px',
            maxHeight: '380px',
          }}
        >
          {previewHtml ? (
            <div
              className="rich-description-render"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          ) : (
            <div className="preview-pane-empty">
              Опис порожній. Переключіться на режим редагування та введіть опис.
            </div>
          )}
        </div>
      )}
    </Box>
  );
};

export default ProductDescriptionSection;
