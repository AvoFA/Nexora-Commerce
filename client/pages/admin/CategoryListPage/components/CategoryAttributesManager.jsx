import React, { useState } from 'react';
import { Button, FormControl, IconButton, TextField, Box, Typography, InputAdornment } from "@mui/material";
import {
  Add as AddIcon,
  DeleteOutline,
  FolderOutlined,
  Search as SearchIcon,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Clear as ClearIcon,
} from "@mui/icons-material";

const CategoryAttributesManager = ({
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
      item.key.toLowerCase().includes(query)
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
    <div className="category-form-section category-attributes-section">
      <div className="category-form-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div className="category-form-section-heading" style={{ marginBottom: 0 }}>
          <Typography variant="h6" style={{ fontWeight: 700, fontSize: '0.98rem', margin: 0 }}>
            Групи характеристик
          </Typography>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)' }}>
            Створіть групи та вкажіть назви характеристик за замовчуванням для цієї категорії.
          </p>
        </div>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={onAddGroup}
          className="category-add-attribute-btn"
        >
          Додати групу
        </Button>
      </div>

      {attributes.length > 0 && (
        <FormControl className="specs-search-bar" fullWidth style={{ marginBottom: '16px' }}>
          <TextField
            size="small"
            placeholder="Швидкий пошук характеристик..."
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

      <div className="category-groups-list" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filteredGroups.map((group) => {
          const groupIdx = group.originalIdx;
          const isCollapsed = !query && !!collapsedGroups[groupIdx];
          const itemCount = group.items.length;

          return (
            <Box
              key={groupIdx}
              className="specs-group-card"
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <Box
                className="specs-group-header"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  background: "rgba(255, 255, 255, 0.02)",
                  cursor: "pointer",
                  userSelect: "none",
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
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveGroup(groupIdx);
                  }}
                  disabled={attributes.length <= 1}
                  title="Видалити групу"
                  style={{ opacity: 0.7 }}
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              </Box>

              {!isCollapsed && (
                <Box style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <div className="category-attributes-list">
                    {group.matchedItems.map((item) => {
                      const itemIdx = item.originalItemIdx;
                      return (
                        <div
                          key={itemIdx}
                          className="category-attribute-row"
                          style={{ marginBottom: "8px" }}
                        >
                          <FormControl className="mui-form-control">
                            <TextField
                              size="small"
                              label="Назва характеристики (напр. Діагональ)"
                              value={item.key}
                              onChange={(e) => onItemChange(groupIdx, itemIdx, "key", e.target.value)}
                              placeholder="напр. Діагональ, RAM"
                            />
                          </FormControl>
                          <IconButton
                            color="error"
                            onClick={() => onRemoveItem(groupIdx, itemIdx)}
                            disabled={group.items.length <= 1}
                            className="category-remove-attribute-btn"
                          >
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                        </div>
                      );
                    })}
                  </div>

                  {!query && (
                    <Box style={{ display: "flex", justifyContent: "flex-start", marginTop: "12px" }}>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => onAddItem(groupIdx)}
                        style={{ textTransform: "none", fontSize: "0.72rem", fontWeight: 600, color: '#60a5fa' }}
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
    </div>
  );
};

export default CategoryAttributesManager;
