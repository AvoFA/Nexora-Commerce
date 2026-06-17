import React, { useState, useEffect } from "react";
import { CircularProgress, Modal, Box } from "@mui/material";
import { 
  PersonAdd as PersonAddIcon, 
  Delete as DeleteIcon, 
  Refresh as RefreshIcon, 
  SupervisorAccount as StaffIcon,
  History as HistoryIcon,
  VpnKey as KeyIcon,
  LockOpen as LockOpenIcon,
  Lock as LockIcon
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { getAdminToken } from "../../../utils/authStorage";
import { getStoredAdminUser } from "../../../config/adminAccess";
import { API_BASE_URL } from "../../../config/api";
import ConfirmModal from "../../../components/common/ConfirmModal/ConfirmModal";

import "../../../styles/_common.scss";
import "../../../styles/_mui-theme.scss";
import "../../../styles/_admin.scss";
import "./StaffPage.scss";

// Relative time formatter for last activity
const formatLastActivity = (dateString) => {
  if (!dateString) return "Немає дій";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "щойно";
  if (diffMins < 60) return `${diffMins} хв. тому`;
  
  const isToday = date.toDateString() === now.toDateString();
  const timeStr = date.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
  if (isToday) return `Сьогодні о ${timeStr}`;
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return `Вчора о ${timeStr}`;
  
  return date.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const StaffPage = () => {
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Add Staff Form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("moderator");

  // Reset Password Form states
  const [resetUserId, setResetUserId] = useState(null);
  const [resetUserName, setResetUserName] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Deletion Confirm Modal state
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    userId: null,
    userName: ""
  });

  // Block/Unblock Confirm Modal state
  const [blockConfirm, setBlockConfirm] = useState({
    isOpen: false,
    userId: null,
    userName: "",
    currentStatus: ""
  });

  const currentUser = getStoredAdminUser();
  const token = getAdminToken();

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/staff`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setStaffList(result.staff || []);
      } else {
        toast.error(result.message || "Не вдалося завантажити список співробітників");
      }
    } catch (error) {
      console.error(error);
      toast.error("Помилка при завантаженні списку співробітників");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Логін та пароль обов'язкові");
      return;
    }
    if (password.length < 6) {
      toast.error("Пароль має бути не менше 6 символів");
      return;
    }

    setIsSubmitLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/staff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
          email: email.trim() || undefined,
          role
        })
      });
      const result = await response.json();
      if (result.success) {
        toast.success(result.message || "Співробітника успішно додано");
        setIsModalOpen(false);
        // Reset form
        setUsername("");
        setPassword("");
        setEmail("");
        setRole("moderator");
        fetchStaff();
      } else {
        toast.error(result.message || "Не вдалося додати співробітника");
      }
    } catch (error) {
      console.error(error);
      toast.error("Помилка при додаванні співробітника");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  // Trigger password reset modal
  const handlePasswordResetClick = (user) => {
    setResetUserId(user._id);
    setResetUserName(user.username);
    setNewPassword("");
    setIsPasswordModalOpen(true);
  };

  // Submit password reset
  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword.trim() || newPassword.length < 6) {
      toast.error("Пароль має бути не менше 6 символів");
      return;
    }

    setIsSubmitLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/staff/${resetUserId}/change-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword: newPassword.trim() })
      });
      const result = await response.json();
      if (result.success) {
        toast.success(result.message || "Пароль змінено");
        setIsPasswordModalOpen(false);
        setResetUserId(null);
        setResetUserName("");
        setNewPassword("");
      } else {
        toast.error(result.message || "Не вдалося змінити пароль");
      }
    } catch (error) {
      console.error(error);
      toast.error("Помилка при зміні паролю");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  // Trigger toggle block modal
  const handleToggleBlockClick = (user) => {
    if (user._id === currentUser?.id) {
      toast.error("Ви не можете заблокувати власну облікову копію");
      return;
    }
    setBlockConfirm({
      isOpen: true,
      userId: user._id,
      userName: user.username,
      currentStatus: user.status
    });
  };

  // Submit toggle block status
  const handleConfirmToggleBlock = async () => {
    const { userId } = blockConfirm;
    if (!userId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/staff/${userId}/toggle-block`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        toast.success(result.message || "Статус оновлено");
        fetchStaff();
      } else {
        toast.error(result.message || "Не вдалося змінити статус блокування");
      }
    } catch (error) {
      console.error(error);
      toast.error("Помилка при оновленні статусу");
    } finally {
      setBlockConfirm({ isOpen: false, userId: null, userName: "", currentStatus: "" });
    }
  };

  const handleDeleteClick = (user) => {
    if (user._id === currentUser?.id) {
      toast.error("Ви не можете видалити власну облікову копію");
      return;
    }
    setDeleteConfirm({
      isOpen: true,
      userId: user._id,
      userName: user.username
    });
  };

  const handleConfirmDelete = async () => {
    const { userId } = deleteConfirm;
    if (!userId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/staff/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        toast.success(result.message || "Співробітника видалено");
        fetchStaff();
      } else {
        toast.error(result.message || "Не вдалося видалити співробітника");
      }
    } catch (error) {
      console.error(error);
      toast.error("Помилка при видаленні співробітника");
    } finally {
      setDeleteConfirm({ isOpen: false, userId: null, userName: "" });
    }
  };

  return (
    <div className="staff-page-wrapper">
      <div className="admin-page-header">
        <div className="header-title-wrapper">
          <h2>Співробітники</h2>
          <p className="subtitle">Керування правами доступу адміністраторів та модераторів платформи</p>
        </div>
        <div className="header-actions">
          <button className="add-staff-btn" onClick={() => setIsModalOpen(true)}>
            <PersonAddIcon sx={{ fontSize: "1.1rem" }} />
            <span>Додати співробітника</span>
          </button>
          <button className="refresh-staff-btn" onClick={fetchStaff} disabled={isLoading}>
            <RefreshIcon className={isLoading ? "spin" : ""} sx={{ fontSize: "1.1rem" }} />
          </button>
        </div>
      </div>

      <div className="admin-solid-card staff-list-card">
        {isLoading ? (
          <div className="staff-loading-container">
            <CircularProgress size={40} className="spinner" />
            <p>Завантаження списку співробітників...</p>
          </div>
        ) : staffList.length === 0 ? (
          <div className="staff-empty-state">
            <StaffIcon sx={{ fontSize: "3rem", opacity: 0.3, marginBottom: "12px" }} />
            <p>Співробітників не знайдено</p>
          </div>
        ) : (
          <div className="staff-table-responsive">
            <table className="staff-table">
              <thead>
                <tr>
                  <th>Користувач</th>
                  <th>Роль</th>
                  <th>Статус</th>
                  <th>Остання активність</th>
                  <th>Дата реєстрації</th>
                  <th align="right">Дії</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((user) => {
                  const initial = user.username ? user.username.charAt(0).toUpperCase() : "?";
                  const isSelf = user._id === currentUser?.id;
                  const isBlocked = user.status === "blocked";
                  return (
                    <tr key={user._id} className={`${isSelf ? "self-row" : ""} ${isBlocked ? "blocked-row" : ""}`}>
                      <td>
                        <div className="staff-user-info">
                          <div className={`staff-avatar role-avatar-${user.role}`}>
                            {initial}
                          </div>
                          <div className="staff-meta-wrapper">
                            <span className="staff-username">
                              {user.username} {isSelf && <small className="self-label">(Ви)</small>}
                            </span>
                            {user.email && user.email !== user.username && (
                              <span className="staff-sub-email">{user.email}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`staff-role-badge role-${user.role}`}>
                          {user.role === "admin" ? "Адміністратор" : "Модератор"}
                        </span>
                      </td>
                      <td>
                        <span className={`staff-status-badge status-${user.status}`}>
                          {user.status === "active" ? "Активний" : "Заблокований"}
                        </span>
                      </td>
                      <td>
                        <span className="staff-activity-text">
                          {formatLastActivity(user.lastActivity)}
                        </span>
                      </td>
                      <td>
                        <span className="staff-date-text">
                          {new Date(user.createdAt).toLocaleDateString("uk-UA", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })}
                        </span>
                      </td>
                      <td align="right">
                        <div className="table-actions-wrapper">
                          {/* Log Audit History Link */}
                          <Link 
                            to={`/admin/logs?q=${encodeURIComponent(user.username)}`}
                            className="action-icon-btn history-action-btn"
                            title="Історія дій"
                          >
                            <HistoryIcon sx={{ fontSize: "1.15rem" }} />
                          </Link>

                          {/* Reset Password Button */}
                          <button 
                            type="button"
                            className="action-icon-btn key-action-btn"
                            onClick={() => handlePasswordResetClick(user)}
                            title="Змінити пароль"
                          >
                            <KeyIcon sx={{ fontSize: "1.15rem" }} />
                          </button>

                          {!isSelf ? (
                            <>
                              {/* Toggle Block Button */}
                              <button 
                                type="button"
                                className={`action-icon-btn block-action-btn ${isBlocked ? "is-blocked" : ""}`}
                                onClick={() => handleToggleBlockClick(user)}
                                title={isBlocked ? "Розблокувати співробітника" : "Заблокувати співробітника"}
                              >
                                {isBlocked ? <LockIcon sx={{ fontSize: "1.15rem" }} /> : <LockOpenIcon sx={{ fontSize: "1.15rem" }} />}
                              </button>

                              {/* Delete Button */}
                              <button 
                                type="button"
                                className="action-icon-btn delete-action-btn"
                                onClick={() => handleDeleteClick(user)}
                                title="Видалити співробітника"
                              >
                                <DeleteIcon sx={{ fontSize: "1.15rem" }} />
                              </button>
                            </>
                          ) : (
                            <span className="self-action-placeholder">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => !isSubmitLoading && setIsModalOpen(false)}
        aria-labelledby="add-staff-modal-title"
        className="add-staff-modal-overlay"
      >
        <Box className="add-staff-modal-paper">
          <div className="modal-header">
            <h3>Додати співробітника</h3>
          </div>
          <form onSubmit={handleAddStaffSubmit} className="add-staff-form">
            <div className="custom-input-group">
              <label className="custom-input-label">Ім'я користувача (Логін) *</label>
              <input
                type="text"
                className="admin-custom-input"
                placeholder="Введіть логін для входу..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSubmitLoading}
                required
              />
            </div>

            <div className="custom-input-group">
              <label className="custom-input-label">Email (Опціонально)</label>
              <input
                type="email"
                className="admin-custom-input"
                placeholder="Введіть email адресу..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitLoading}
              />
            </div>

            <div className="custom-input-group">
              <label className="custom-input-label">Пароль (мінімум 6 символів) *</label>
              <input
                type="password"
                className="admin-custom-input"
                placeholder="Введіть надійний пароль..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitLoading}
                required
              />
            </div>

            <div className="custom-input-group">
              <label className="custom-input-label">Роль *</label>
              <select
                className="admin-custom-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isSubmitLoading}
              >
                <option value="moderator">Модератор (Обмежений доступ)</option>
                <option value="admin">Адміністратор (Повний доступ)</option>
              </select>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitLoading}
              >
                Скасувати
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitLoading}
              >
                {isSubmitLoading ? <CircularProgress size={20} color="inherit" /> : "Створити"}
              </button>
            </div>
          </form>
        </Box>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        open={isPasswordModalOpen}
        onClose={() => !isSubmitLoading && setIsPasswordModalOpen(false)}
        aria-labelledby="password-reset-modal-title"
        className="add-staff-modal-overlay"
      >
        <Box className="add-staff-modal-paper">
          <div className="modal-header">
            <h3>Зміна паролю: {resetUserName}</h3>
          </div>
          <form onSubmit={handlePasswordResetSubmit} className="add-staff-form">
            <div className="custom-input-group">
              <label className="custom-input-label">Новий пароль (мінімум 6 символів) *</label>
              <input
                type="password"
                className="admin-custom-input"
                placeholder="Введіть новий пароль..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isSubmitLoading}
                required
                autoFocus
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setResetUserId(null);
                  setResetUserName("");
                }}
                disabled={isSubmitLoading}
              >
                Скасувати
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitLoading}
              >
                {isSubmitLoading ? <CircularProgress size={20} color="inherit" /> : "Зберегти"}
              </button>
            </div>
          </form>
        </Box>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, userId: null, userName: "" })}
        onConfirm={handleConfirmDelete}
        title="Видалення співробітника"
        message={`Ви впевнені, що хочете видалити співробітника ${deleteConfirm.userName}?`}
        warning="Ця дія безповоротна. Користувач більше не зможе увійти в адмін-панель."
        confirmText="Видалити"
        cancelText="Скасувати"
        type="danger"
      />

      {/* Toggle Block Confirmation Modal */}
      <ConfirmModal
        isOpen={blockConfirm.isOpen}
        onClose={() => setBlockConfirm({ isOpen: false, userId: null, userName: "", currentStatus: "" })}
        onConfirm={handleConfirmToggleBlock}
        title={blockConfirm.currentStatus === "blocked" ? "Розблокування співробітника" : "Блокування співробітника"}
        message={`Ви дійсно хочете ${blockConfirm.currentStatus === "blocked" ? "розблокувати" : "заблокувати"} доступ співробітнику ${blockConfirm.userName}?`}
        warning={blockConfirm.currentStatus === "blocked" 
          ? "Користувач знову отримає повний доступ до адмін-панелі." 
          : "Користувач буде негайно відключений і втратить можливість входу."}
        confirmText={blockConfirm.currentStatus === "blocked" ? "Розблокувати" : "Заблокувати"}
        cancelText="Скасувати"
        type={blockConfirm.currentStatus === "blocked" ? "info" : "warning"}
      />
    </div>
  );
};

export default StaffPage;
