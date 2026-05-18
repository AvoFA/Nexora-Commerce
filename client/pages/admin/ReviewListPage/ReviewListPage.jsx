import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Avatar, CircularProgress, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Check as CheckIcon, Close as CloseIcon, Star as StarIcon, Undo as UndoIcon, HighlightOff as HighlightOffIcon } from '@mui/icons-material';
import { toast } from 'sonner';
import { getAdminReviews, updateReviewStatus } from '../../../services/reviewService';

import '../../../styles/_common.scss';
import '../../../styles/_mui-theme.scss';
import '../../../styles/_admin.scss';
import './ReviewListPage.scss';

const statusColorMap = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error'
};

const statusLabelMap = {
  pending: 'На модерації',
  approved: 'Опубліковано',
  rejected: 'Відхилено'
};

const ReviewListPage = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(null);
  const [activeFilter, setActiveFilter] = useState('pending');
  const [selectedReviewForModal, setSelectedReviewForModal] = useState(null);
  const navigate = useNavigate();

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (!token) {
        toast.error('Токен відсутній. Увійдіть в систему.');
        return;
      }
      const data = await getAdminReviews(token);
      if (data.success) {
        setReviews(data.reviews || []);
      }
    } catch (error) {
      toast.error(error.message || 'Помилка завантаження відгуків');
      const isTokenError = error.message && (
        error.message.includes('токен') || 
        error.message.includes('Токен') || 
        error.message.includes('token') || 
        error.message.includes('Token') ||
        error.message.includes('auth') ||
        error.message.includes('Auth')
      );
      if (isTokenError) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setIsUpdating(id);
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const data = await updateReviewStatus(id, newStatus, token);
      if (data.success) {
        toast.success(data.message || 'Статус відгуку оновлено');
        // Оновлюємо стан локально
        setReviews(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
      }
    } catch (error) {
      toast.error(error.message || 'Помилка оновлення статусу');
      const isTokenError = error.message && (
        error.message.includes('токен') || 
        error.message.includes('Токен') || 
        error.message.includes('token') || 
        error.message.includes('Token') ||
        error.message.includes('auth') ||
        error.message.includes('Auth')
      );
      if (isTokenError) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    } finally {
      setIsUpdating(null);
    }
  };

  const renderStars = (rating) => {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <StarIcon sx={{ color: '#FFD700', width: 16, height: 16, mr: 0.5 }} />
        <Typography variant="body2" fontWeight="bold">{rating}</Typography>
      </Box>
    );
  };

  // Розрахунок лічильників
  const counts = {
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
    all: reviews.length
  };

  // Фільтрація відгуків
  const filteredReviews = reviews.filter(review => {
    if (activeFilter === 'all') return true;
    return review.status === activeFilter;
  });

  const filterOptions = [
    { value: 'pending', label: 'На модерації' },
    { value: 'approved', label: 'Опубліковані' },
    { value: 'rejected', label: 'Відхилені' },
    { value: 'all', label: 'Усі' }
  ];

  return (
    <Box className="review-list-page">
      <Box className="admin-page-header">
        <div className="header-title-wrapper">
          <Typography variant="h2" component="h2">Модерація відгуків</Typography>
          <Typography variant="body2" className="subtitle">Управління відгуками користувачів</Typography>
        </div>
      </Box>

      {/* Фільтри за статусом із лічильниками та статистика модерації справа */}
      <div className="admin-solid-card filter-card">
        <div className="filter-tabs">
          {filterOptions.map((option) => {
            const isActive = activeFilter === option.value;
            const count = counts[option.value];
            return (
              <div
                key={option.value}
                onClick={() => setActiveFilter(option.value)}
                className={`filter-tab-button ${isActive ? 'active' : ''}`}
              >
                <span>{option.label}</span>
                <Chip label={count} size="small" />
              </div>
            );
          })}
        </div>

        {/* Компактна статистика модерації */}
        <Box className="moderation-stats-overview">
          <div className="stat-item all">
            <span className="stat-label">Всього</span>
            <span className="stat-value">{counts.all}</span>
          </div>
          <div className="stat-item pending">
            <span className="stat-label">На модерації</span>
            <span className="stat-value">{counts.pending}</span>
          </div>
          <div className="stat-item approved">
            <span className="stat-label">Опубліковано</span>
            <span className="stat-value">{counts.approved}</span>
          </div>
          <div className="stat-item rejected">
            <span className="stat-label">Відхилено</span>
            <span className="stat-value">{counts.rejected}</span>
          </div>
        </Box>
      </div>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} className="admin-table-container">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Користувач</TableCell>
                <TableCell>Товар</TableCell>
                <TableCell>Оцінка</TableCell>
                <TableCell>Відгук</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="right">Дії</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>Немає відгуків</TableCell>
                </TableRow>
              ) : (
                filteredReviews.map((review) => (
                  <TableRow key={review._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                        <Typography variant="body2" fontWeight="medium" className="user-name">{review.name}</Typography>
                        {review.user?.email && (
                          <Typography variant="body2" className="user-email">{review.user.email}</Typography>
                        )}
                        {review.createdAt && (
                          <Typography variant="caption" sx={{ color: 'var(--text-secondary, #94a3b8)' }}>
                            {new Date(review.createdAt).toLocaleDateString('uk-UA', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={review.product?.image} alt={review.product?.name} variant="rounded" sx={{ width: 40, height: 40 }} />
                        <Typography variant="body2" sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {review.product?.name || 'Видалений товар'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {renderStars(review.rating)}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography variant="body2" sx={{ 
                        maxWidth: 300, 
                        display: '-webkit-box', 
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical', 
                        overflow: 'hidden',
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word'
                      }}>
                        {review.text}
                      </Typography>
                      {review.pros && (
                        <Typography variant="caption" color="success.main" sx={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          overflowWrap: 'anywhere',
                          wordBreak: 'break-word',
                          mt: 0.5
                        }}>
                          <b>+</b> {review.pros}
                        </Typography>
                      )}
                      {review.cons && (
                        <Typography variant="caption" color="error.main" sx={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          overflowWrap: 'anywhere',
                          wordBreak: 'break-word',
                          mt: 0.5
                        }}>
                          <b>-</b> {review.cons}
                        </Typography>
                      )}
                      <Typography 
                        variant="caption" 
                        onClick={() => setSelectedReviewForModal(review)}
                        sx={{ 
                          display: 'inline-block',
                          color: '#3b82f6', 
                          cursor: 'pointer', 
                          fontWeight: 600, 
                          mt: 0.75,
                          '&:hover': { textDecoration: 'underline' } 
                        }}
                      >
                        Детальніше
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={statusLabelMap[review.status]} 
                        color={statusColorMap[review.status]} 
                        size="small" 
                        variant={review.status === 'pending' ? 'outlined' : 'filled'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        {/* Дії для статусу pending (На модерації): Схвалити та Відхилити */}
                        {review.status === 'pending' && (
                          <>
                            <Tooltip title="Схвалити">
                              <span>
                                <IconButton 
                                  color="success" 
                                  onClick={() => handleStatusChange(review._id, 'approved')}
                                  disabled={isUpdating === review._id}
                                  size="small"
                                >
                                  <CheckIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Відхилити">
                              <span>
                                <IconButton 
                                  color="error" 
                                  onClick={() => handleStatusChange(review._id, 'rejected')}
                                  disabled={isUpdating === review._id}
                                  size="small"
                                >
                                  <CloseIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </>
                        )}

                        {/* Дії для статусу approved (Опубліковані): Зняти з публікації */}
                        {review.status === 'approved' && (
                          <Tooltip title="Зняти з публікації">
                            <span>
                              <IconButton 
                                color="error" 
                                onClick={() => handleStatusChange(review._id, 'rejected')}
                                disabled={isUpdating === review._id}
                                size="small"
                              >
                                <HighlightOffIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}

                        {/* Дії для статусу rejected (Відхилені): Повернути на модерацію */}
                        {review.status === 'rejected' && (
                          <Tooltip title="Повернути на модерацію">
                            <span>
                              <IconButton 
                                color="warning" 
                                onClick={() => handleStatusChange(review._id, 'pending')}
                                disabled={isUpdating === review._id}
                                size="small"
                              >
                                <UndoIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Модальне вікно перегляду повних деталей відгуку */}
      <Dialog
        open={Boolean(selectedReviewForModal)}
        onClose={() => setSelectedReviewForModal(null)}
        className="review-detail-dialog"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Деталі відгуку</DialogTitle>
        <DialogContent dividers sx={{ pb: 3 }}>
          {selectedReviewForModal && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              
              {/* Рядок 1: Користувач та Дата */}
              <Box className="modal-grid-two-col">
                <div className="modal-section">
                  <span className="section-label">Користувач</span>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, mt: 0.5 }}>
                    <Typography variant="body2" fontWeight="medium" className="user-name">
                      {selectedReviewForModal.name}
                    </Typography>
                    {selectedReviewForModal.user?.email && (
                      <Typography variant="body2" className="user-email">
                        {selectedReviewForModal.user.email}
                      </Typography>
                    )}
                  </Box>
                </div>
                <div className="modal-section">
                  <span className="section-label">Дата створення</span>
                  <Typography variant="body2" className="section-content">
                    {selectedReviewForModal.createdAt ? new Date(selectedReviewForModal.createdAt).toLocaleString('uk-UA', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Невідомо'}
                  </Typography>
                </div>
              </Box>

              {/* Рядок 2: Рейтинг та Статус */}
              <Box className="modal-grid-two-col">
                <div className="modal-section">
                  <span className="section-label">Оцінка</span>
                  <Box sx={{ mt: 0.5 }}>
                    {renderStars(selectedReviewForModal.rating)}
                  </Box>
                </div>
                <div className="modal-section">
                  <span className="section-label">Статус</span>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip 
                      label={statusLabelMap[selectedReviewForModal.status]} 
                      color={statusColorMap[selectedReviewForModal.status]} 
                      size="small" 
                      variant={selectedReviewForModal.status === 'pending' ? 'outlined' : 'filled'}
                    />
                  </Box>
                </div>
              </Box>

              {/* Рядок 3: Товар */}
              <div className="modal-section">
                <span className="section-label">Товар</span>
                <div className="product-info-wrapper" style={{ marginTop: '4px' }}>
                  <Avatar src={selectedReviewForModal.product?.image} alt={selectedReviewForModal.product?.name} variant="rounded" sx={{ width: 44, height: 44 }} />
                  <Typography variant="body2" fontWeight="medium" sx={{ wordBreak: 'break-word' }}>
                    {selectedReviewForModal.product?.name || 'Видалений товар'}
                  </Typography>
                </div>
              </div>

              {/* Рядок 4: Повний текст відгуку */}
              <div className="modal-section">
                <span className="section-label">Текст відгуку</span>
                <Typography variant="body2" className="section-content" sx={{ whiteSpace: 'pre-wrap', bgcolor: 'rgba(255,255,255,0.015)', p: 2, borderRadius: 1.5, border: '1px solid rgba(255,255,255,0.03)' }}>
                  {selectedReviewForModal.text}
                </Typography>
              </div>

              {/* Рядок 5: Переваги та Недоліки */}
              {selectedReviewForModal.pros && (
                <div className="modal-section">
                  <span className="section-label">Переваги</span>
                  <Typography variant="body2" className="section-content" sx={{ bgcolor: 'rgba(16, 185, 129, 0.04)', p: 1.5, borderRadius: 1, border: '1px solid rgba(16, 185, 129, 0.25)', color: 'var(--text-primary, #f8fafc)' }}>
                    <b>+</b> {selectedReviewForModal.pros}
                  </Typography>
                </div>
              )}
              {selectedReviewForModal.cons && (
                <div className="modal-section">
                  <span className="section-label">Недоліки</span>
                  <Typography variant="body2" className="section-content" sx={{ bgcolor: 'rgba(239, 68, 68, 0.04)', p: 1.5, borderRadius: 1, border: '1px solid rgba(239, 68, 68, 0.25)', color: 'var(--text-primary, #f8fafc)' }}>
                    <b>-</b> {selectedReviewForModal.cons}
                  </Typography>
                </div>
              )}

            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedReviewForModal(null)} variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.15)', color: 'var(--text-primary)' }}>
            Закрити
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewListPage;
