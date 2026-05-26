import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  FormControl,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  DeleteOutline,
  FolderOutlined,
  Search as SearchIcon,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Clear as ClearIcon,
} from '@mui/icons-material';
import TextField from '@mui/material/TextField';

const AttributesManager = ({
  attributes,
  onAddGroup,
  onRemoveGroup,
  onGroupNameChange,
  onAddItem,
  onRemoveItem,
  onItemChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const toggleGroup = (groupIdx) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupIdx]: !prev[groupIdx],
    }));
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const query = searchQuery.trim().toLowerCase();

  const filteredGroups = attributes.map((group, originalIdx) => {
    const isGroupNameMatch = group.groupName.toLowerCase().includes(query);

    const matchedItems = group.items.map((item, originalItemIdx) => ({
      ...item,
      originalItemIdx,
    })).filter(item =>
      item.key.toLowerCase().includes(query) ||
      (item.value && item.value.toLowerCase().includes(query))
    );

    const hasMatch = isGroupNameMatch || matchedItems.length > 0;

    return {
      ...group,
      originalIdx,
      matchedItems: query ? matchedItems : group.items.map((item, idx) => ({ ...item, originalItemIdx: idx })),
      hasMatch,
    };
  }).filter(group => !query || group.hasMatch);

  return (
    <Box className="attributes-manager-container">
      <Box className="product-attributes-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <Typography variant="h6" style={{ fontWeight: 700, fontSize: '1rem' }}>
            Характеристики товару
          </Typography>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)' }}>
            Групуйте характеристики за розділами для відображення на сайті.
          </p>
        </div>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={onAddGroup}
          className="product-add-attribute-btn"
          style={{ textTransform: 'none', fontSize: '0.8rem' }}
        >
          Додати групу
        </Button>
      </Box>

      {attributes.length > 0 && (
        <FormControl className="specs-search-bar" fullWidth style={{ marginBottom: '16px' }}>
          <TextField
            size="small"
            placeholder="Швидкий пошук характеристик (напр. діагональ, RAM)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" style={{ color: 'rgba(255,255,255,0.4)' }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch} style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </FormControl>
      )}

      <div className="product-groups-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredGroups.map((group) => {
          const groupIdx = group.originalIdx;
          const isCollapsed = !query && !!collapsedGroups[groupIdx];
          const itemCount = group.items.length;

          return (
            <Box
              key={groupIdx}
              className="specs-group-card"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                overflow: 'hidden',
              }}
            >
              <Box
                className="specs-group-header"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onClick={() => toggleGroup(groupIdx)}
              >
                {isCollapsed ? (
                  <KeyboardArrowDown fontSize="small" style={{ color: 'rgba(255,255,255,0.4)' }} />
                ) : (
                  <KeyboardArrowUp fontSize="small" style={{ color: 'rgba(255,255,255,0.4)' }} />
                )}

                <FolderOutlined style={{ opacity: 0.6, fontSize: '1.2rem' }} />

                <FormControl
                  style={{ flex: 1 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <TextField
                    size="small"
                    variant="standard"
                    placeholder="Назва групи (напр. Екран, Процесор)"
                    value={group.groupName}
                    onChange={(e) => onGroupNameChange(groupIdx, e.target.value)}
                    fullWidth
                    InputProps={{
                      disableUnderline: true,
                      style: {
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        color: '#fff',
                        padding: '2px 0',
                      }
                    }}
                  />
                </FormControl>

                {isCollapsed && (
                  <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.4)', marginRight: '8px' }}>
                    {itemCount} {itemCount === 1 ? 'характеристика' : itemCount < 5 ? 'характеристики' : 'характеристик'}
                  </Typography>
                )}

                <IconButton
                  color="error"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveGroup(groupIdx);
                  }}
                  title="Видалити групу"
                  style={{ opacity: 0.7 }}
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              </Box>

              {!isCollapsed && (
                <Box style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <div className="product-attributes-list">
                    {group.matchedItems.map((item) => {
                      const itemIdx = item.originalItemIdx;
                      return (
                        <Box
                          key={itemIdx}
                          className="product-attribute-row"
                        >
                          <div className="mui-form-control">
                            <TextField
                              label="Назва характеристики"
                              size="small"
                              value={item.key}
                              onChange={(event) => onItemChange(groupIdx, itemIdx, 'key', event.target.value)}
                              placeholder="Наприклад: Розмір екрана"
                              fullWidth
                            />
                          </div>
                          <div className="mui-form-control">
                            <TextField
                              label="Значення"
                              size="small"
                              value={item.value}
                              onChange={(event) => onItemChange(groupIdx, itemIdx, 'value', event.target.value)}
                              placeholder="Наприклад: 6.1 дюймів"
                              fullWidth
                            />
                          </div>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => onRemoveItem(groupIdx, itemIdx)}
                            disabled={group.items.length <= 1}
                            className="product-remove-attribute-btn"
                          >
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                        </Box>
                      );
                    })}
                  </div>

                  {!query && (
                    <Box style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '12px' }}>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => onAddItem(groupIdx)}
                        style={{ textTransform: 'none', fontSize: '0.72rem', fontWeight: 600, color: '#60a5fa' }}
                      >
                        Додати характеристику
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          );
        })}

        {filteredGroups.length === 0 && (
          <Box style={{ textAlign: 'center', padding: '32px', opacity: 0.5, border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '8px' }}>
            {query ? 'Нічого не знайдено за вашим запитом' : 'Немає характеристик. Натисніть "Додати групу", щоб почати.'}
          </Box>
        )}
      </div>
    </Box>
  );
};

export default AttributesManager;
