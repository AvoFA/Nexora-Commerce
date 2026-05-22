import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Tooltip, IconButton } from '@mui/material';
import { WarningAmber, ArrowForward } from '@mui/icons-material';
import { toast } from 'sonner';
import { updateProduct } from '../../../../services/productService';
import StockInlineEditor from '@/components/admin/common/StockInlineEditor';

const LowStockWidget = ({ products = [], onRefresh }) => {
  const navigate = useNavigate();

  const handleStockUpdate = async (product, newStock) => {
    if (newStock < 0) {
      toast.error('Кількість товару не може бути меншою за 0');
      return;
    }

    const productId = product._id || product.id;

    try {
      // Pass the entire product object with updated stock as required by updateProduct API
      await updateProduct(productId, {
        ...product,
        stock: newStock
      });
      
      toast.success(`Залишок товару "${product.name}" змінено на ${newStock}`);
      
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Помилка оновлення залишку:', error);
      toast.error(`Не вдалося оновити залишок для "${product.name}"`);
      throw error;
    }
  };

  return (
    <div className="dashboard-bento-cell low-stock-cell">
      <div className="widget-header">
        <h3 className="widget-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <WarningAmber fontSize="small" style={{ opacity: 0.9, color: '#f59e0b' }} />
          Низький залишок товарів (Stock &le; 5)
        </h3>
        <button
          className="widget-action-btn"
          onClick={() => navigate('/admin/products?lowStock=true')}
        >
          Управління залишками
        </button>
      </div>

      <div className="widget-content" style={{ padding: 0 }}>
        {products.length === 0 ? (
          <div className="widget-empty-state">
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Всі товари в достатній кількості</p>
          </div>
        ) : (
          <div className="widget-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Зображення</th>
                  <th>Назва товару</th>
                  <th>Категорія</th>
                  <th>Поточний залишок</th>
                  <th className="actions-cell">Дії</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const productId = product._id || product.id;

                  return (
                    <tr key={productId}>
                      <td style={{ width: '60px' }}>
                        <img
                          src={product.image || 'https://via.placeholder.com/40'}
                          alt={product.name}
                          style={{
                            width: '40px',
                            height: '40px',
                            objectFit: 'contain',
                            borderRadius: '4px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '2px'
                          }}
                        />
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{product.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="category-badge">
                          {product.category?.name || (typeof product.category === 'string' ? product.category : '') || 'Без категорії'}
                        </span>
                      </td>
                      <td>
                        <StockInlineEditor
                          initialStock={product.stock ?? 0}
                          onSave={async (newStock) => {
                            await handleStockUpdate(product, newStock);
                          }}
                        />
                      </td>
                      <td className="actions-cell">
                        <Tooltip title="Редагувати товар" arrow>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/products?search=${product.name}`)}
                            sx={{
                              color: 'var(--primary-color, #3b82f6)',
                              '&:hover': {
                                background: 'rgba(59, 130, 246, 0.1)'
                              }
                            }}
                          >
                            <ArrowForward fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LowStockWidget;
