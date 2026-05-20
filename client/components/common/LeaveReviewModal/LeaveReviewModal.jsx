import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CloseOutlined } from '@mui/icons-material';
import ReviewForm from '../../../pages/ProductPage/ReviewForm.jsx';
import './LeaveReviewModal.scss';

const LeaveReviewModal = ({ 
  isOpen, 
  onClose, 
  product, 
  onSubmit,
  user
}) => {
  const [newReview, setNewReview] = useState({
    stars: 0,
    name: user?.name || '',
    text: '',
    pros: '',
    cons: '',
    productId: product?._id
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setNewReview(prev => ({ 
        ...prev, 
        productId: product._id,
        name: user?.name || prev.name 
      }));
    }
  }, [product, user]);

  // Lock scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = () => {
    const errors = {};
    if (!newReview.stars) errors.stars = "Оберіть кількість зірок";
    if (!newReview.name?.trim()) errors.name = "Введіть ваше ім'я";
    if (newReview.text?.trim().length < 10) errors.text = "Введіть не менш ніж 10 символів";
    return errors;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(newReview);
      onClose();
    } catch (error) {
      console.error("Failed to submit review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="custom-modal-overlay review-modal-overlay" onClick={onClose}>
      <div className="custom-modal-container review-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Залишити відгук</h3>
          <button className="close-btn" onClick={onClose}>
            <CloseOutlined />
          </button>
        </div>
        
        <div className="modal-content">
          <div className="product-info-brief">
            <span className="product-name">{product?.name}</span>
          </div>

          <form onSubmit={handleSubmit}>
            <ReviewForm
              showForm={true}
              setShowForm={() => {}}
              newReview={newReview}
              setNewReview={setNewReview}
              formErrors={formErrors}
              setFormErrors={setFormErrors}
              handleSubmitReview={handleSubmit}
            />
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LeaveReviewModal;
