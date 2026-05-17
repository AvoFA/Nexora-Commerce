import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Shared hook for handling user logout flow with confirmation modal
 * 
 * @param {Object} options 
 * @param {Function} options.onSuccess - Callback fired after successful logout
 * @param {string} options.redirectPath - Path to redirect after logout (default: null)
 */
export const useLogoutFlow = ({ onSuccess, redirectPath = null } = {}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const openLogoutModal = () => setIsLogoutModalOpen(true);
  
  const closeLogoutModal = () => setIsLogoutModalOpen(false);

  const confirmLogout = () => {
    logout();
    closeLogoutModal();
    toast.success("Ви вийшли з акаунта");
    
    if (onSuccess) {
      onSuccess();
    }
    
    if (redirectPath) {
      navigate(redirectPath);
    }
  };

  return {
    isLogoutModalOpen,
    openLogoutModal,
    closeLogoutModal,
    confirmLogout
  };
};
