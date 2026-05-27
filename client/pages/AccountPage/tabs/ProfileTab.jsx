import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  EditOutlined,
  PersonOutline,
  CheckOutlined,
  CloseOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { API_BASE_URL } from "../../../config/api.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import { getMyOrders } from "../../../services/orderService.js";
import {
  formatPhone,
  isCompletePhone,
  NAME_HINT,
  validateNamePart,
} from "../../../utils/userValidation.js";

const normalizeNameError = (error) => {
  if (!error) return null;
  if (error === "Поле обов'язкове." || error === "Мінімум 2 символи.") {
    return "Мінімум 2 символи";
  }
  if (error === NAME_HINT) return NAME_HINT;
  return error;
};

const validatePhone = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return isCompletePhone(trimmed) ? null : "Вкажіть номер у форматі +380 (XX) XXX-XX-XX";
};

const ProfileTab = () => {
  const { isAuthenticated, user, updateUserData } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [surname, setSurname] = useState(user?.surname || "");
  const [patronymic, setPatronymic] = useState(user?.patronymic || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    setName(user?.name || "");
    setSurname(user?.surname || "");
    setPatronymic(user?.patronymic || "");
    setPhone(user?.phone || "");
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchLastOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        const data = await getMyOrders(token);
        if (data.success && data.orders?.length > 0) {
          setLastOrder(data.orders[0]);
        }
      } catch (error) {
        console.error("Failed to fetch last order:", error);
      }
    };

    fetchLastOrder();
  }, [isAuthenticated]);

  const isPersonalDirty = useMemo(() => {
    return (
      name.trim() !== (user?.name || "") ||
      surname.trim() !== (user?.surname || "") ||
      patronymic.trim() !== (user?.patronymic || "")
    );
  }, [name, surname, patronymic, user]);

  const isContactsDirty = useMemo(() => {
    return phone.trim() !== (user?.phone || "");
  }, [phone, user]);

  const isPasswordDirty = useMemo(() => {
    return currentPassword.length > 0 || newPassword.length > 0 || confirmPassword.length > 0;
  }, [currentPassword, newPassword, confirmPassword]);

  const isPersonalEditing = editingSection === "personal";
  const isContactsEditing = editingSection === "contacts";
  const isPasswordEditing = editingSection === "password";

  const validateField = (value, required = true) => {
    return normalizeNameError(validateNamePart(value, { required }));
  };

  const validatePersonal = () => {
    const nextErrors = {};
    const nameErr = validateField(name, true);
    const surnameErr = validateField(surname, false);
    const patronymicErr = validateField(patronymic, false);

    if (nameErr) nextErrors.name = nameErr;
    if (surnameErr) nextErrors.surname = surnameErr;
    if (patronymicErr) nextErrors.patronymic = patronymicErr;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async (section) => {
    if (section === "personal" && !validatePersonal()) return;

    if (section === "contacts") {
      const phoneErr = validatePhone(phone);
      if (phoneErr) {
        setErrors((prev) => ({ ...prev, phone: phoneErr }));
        return;
      }
    }

    if (section === "password") {
      const nextErrors = {};
      if (!currentPassword) {
        nextErrors.currentPassword = "Введіть поточний пароль";
      }
      if (!newPassword) {
        nextErrors.newPassword = "Введіть новий пароль";
      } else if (newPassword.length < 6) {
        nextErrors.newPassword = "Пароль має містити не менше 6 символів";
      }
      if (newPassword !== confirmPassword) {
        nextErrors.confirmPassword = "Паролі не співпадають";
      }
      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        return;
      }
    }

    try {
      setIsSaving(true);
      const token = localStorage.getItem("token");

      if (section === "password") {
        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Не вдалося змінити пароль");
        }

        toast.success("Пароль успішно змінено");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setErrors({});
        setEditingSection(null);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          surname: surname.trim(),
          patronymic: patronymic.trim(),
          phone: phone.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Не вдалося оновити профіль");
      }

      updateUserData?.({
        name: data.user.name,
        surname: data.user.surname || "",
        patronymic: data.user.patronymic || "",
        phone: data.user.phone || "",
      });
      setErrors({});
      setEditingSection(null);
      toast.success("Дані оновлено");
    } catch (error) {
      toast.error(error.message || "Помилка оновлення");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setSurname(user?.surname || "");
    setPatronymic(user?.patronymic || "");
    setPhone(user?.phone || "");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
    setEditingSection(null);
  };

  const formatShortDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="profile-tab">
        <section className="profile-module">
          <div className="profile-toolbar">
            <div className="profile-heading">
              <h2>Персональні дані</h2>
              <p>Увійдіть, щоб переглядати та редагувати дані профілю.</p>
            </div>
          </div>
          <div className="profile-board profile-board-empty">
            <PersonOutline />
            <h3>Потрібен вхід</h3>
            <p>Увійдіть або зареєструйтесь, щоб користуватися цим розділом кабінету.</p>
            <Link to="/catalog" className="btn-primary">Перейти до каталогу</Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="profile-tab">
      <section className="profile-module">
        <div className="profile-toolbar">
          <div className="profile-heading">
            <h2>Персональні дані</h2>
          </div>
        </div>

        <div className="profile-board">
          <div className={`profile-section-compact ${isPersonalEditing ? "is-editing" : ""}`}>
            <div className="profile-section-head">
              <div className="head-title-group">
                <h3>Особисті дані</h3>
                {!isPersonalEditing && (
                  <button
                    type="button"
                    className="profile-edit-icon-btn"
                    onClick={() => setEditingSection("personal")}
                    title="Редагувати"
                  >
                    <EditOutlined />
                  </button>
                )}
              </div>
            </div>

            <div className="profile-section-body">
              {isPersonalEditing ? (
                <div className="edit-mode-container">
                  <div className="edit-grid-compact">
                    <div className="field-group">
                      <label>Прізвище</label>
                      <input
                        type="text"
                        value={surname}
                        onChange={(event) => {
                          const value = event.target.value;
                          setSurname(value);
                          setErrors((prev) => ({ ...prev, surname: validateField(value, false) }));
                        }}
                        placeholder="Прізвище"
                        className={errors.surname ? "has-error" : ""}
                      />
                      {errors.surname && (
                        <span className="field-hint field-hint--error">{errors.surname}</span>
                      )}
                    </div>
                    <div className="field-group">
                      <label>Ім'я *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(event) => {
                          const value = event.target.value;
                          setName(value);
                          setErrors((prev) => ({ ...prev, name: validateField(value, true) }));
                        }}
                        placeholder="Ім'я"
                        className={errors.name ? "has-error" : ""}
                      />
                      {errors.name && (
                        <span className="field-hint field-hint--error">{errors.name}</span>
                      )}
                    </div>
                    <div className="field-group">
                      <label>По батькові</label>
                      <input
                        type="text"
                        value={patronymic}
                        onChange={(event) => {
                          const value = event.target.value;
                          setPatronymic(value);
                          setErrors((prev) => ({ ...prev, patronymic: validateField(value, false) }));
                        }}
                        placeholder="По батькові"
                        className={errors.patronymic ? "has-error" : ""}
                      />
                      {errors.patronymic && (
                        <span className="field-hint field-hint--error">{errors.patronymic}</span>
                      )}
                    </div>
                  </div>
                  <div className="profile-actions-row">
                    <button type="button" className="btn-secondary" onClick={handleCancel} disabled={isSaving}>
                      <CloseOutlined />
                      <span>Скасувати</span>
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => handleSave("personal")}
                      disabled={isSaving || !isPersonalDirty}
                    >
                      <CheckOutlined />
                      <span>Зберегти</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="view-line">
                  <span className="label">ПІБ</span>
                  <span className="value">
                    {user?.surname || user?.name || user?.patronymic
                      ? `${user.surname || ""} ${user.name || ""} ${user.patronymic || ""}`.trim()
                      : "Не вказано"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className={`profile-section-compact ${isContactsEditing ? "is-editing" : ""}`}>
            <div className="profile-section-head">
              <div className="head-title-group">
                <h3>Контакти</h3>
                {!isContactsEditing && (
                  <button
                    type="button"
                    className="profile-edit-icon-btn"
                    onClick={() => setEditingSection("contacts")}
                    title="Редагувати"
                  >
                    <EditOutlined />
                  </button>
                )}
              </div>
            </div>

            <div className="profile-section-body">
              {isContactsEditing ? (
                <div className="edit-mode-container">
                  <div className="edit-grid-compact">
                    <div className="field-group">
                      <label>Телефон</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(event) => {
                          const formatted = formatPhone(event.target.value);
                          setPhone(formatted);
                          setErrors((prev) => ({ ...prev, phone: validatePhone(formatted) }));
                        }}
                        placeholder="+380 (__) ___-__-__"
                        inputMode="tel"
                        className={errors.phone ? "has-error" : ""}
                      />
                      {errors.phone && (
                        <span className="field-hint field-hint--error">{errors.phone}</span>
                      )}
                    </div>
                    <div className="field-group readonly">
                      <label>Email</label>
                      <input type="text" value={user?.email || ""} disabled />
                    </div>
                  </div>
                  <div className="profile-actions-row">
                    <button type="button" className="btn-secondary" onClick={handleCancel} disabled={isSaving}>
                      <CloseOutlined />
                      <span>Скасувати</span>
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => handleSave("contacts")}
                      disabled={isSaving || !isContactsDirty}
                    >
                      <CheckOutlined />
                      <span>Зберегти</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="contacts-view-grid">
                  <div className="view-line">
                    <span className="label">Телефон</span>
                    <span className="value">{user?.phone || "Не вказано"}</span>
                  </div>
                  <div className="view-line readonly" style={{ marginTop: "12px" }}>
                    <span className="label">Email</span>
                    <span className="value">{user?.email}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={`profile-section-compact ${isPasswordEditing ? "is-editing" : ""}`}>
            <div className="profile-section-head">
              <div className="head-title-group">
                <h3>Безпека</h3>
                {!isPasswordEditing && (
                  <button
                    type="button"
                    className="profile-edit-icon-btn"
                    onClick={() => setEditingSection("password")}
                    title="Змінити пароль"
                  >
                    <EditOutlined />
                  </button>
                )}
              </div>
            </div>

            <div className="profile-section-body">
              {isPasswordEditing ? (
                <div className="edit-mode-container">
                  <div className="edit-grid-compact">
                    <div className="field-group">
                      <label>Поточний пароль</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(event) => {
                            setCurrentPassword(event.target.value);
                            setErrors((prev) => ({ ...prev, currentPassword: "" }));
                          }}
                          placeholder="••••••••"
                          className={errors.currentPassword ? "has-error" : ""}
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowCurrentPassword((prev) => !prev)}
                          aria-label={showCurrentPassword ? "Приховати пароль" : "Показати пароль"}
                        >
                          {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <span className="field-hint field-hint--error">{errors.currentPassword}</span>
                      )}
                    </div>
                    <div className="field-group">
                      <label>Новий пароль</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(event) => {
                            setNewPassword(event.target.value);
                            setErrors((prev) => ({ ...prev, newPassword: "" }));
                          }}
                          placeholder="••••••••"
                          className={errors.newPassword ? "has-error" : ""}
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowNewPassword((prev) => !prev)}
                          aria-label={showNewPassword ? "Приховати пароль" : "Показати пароль"}
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </button>
                      </div>
                      {errors.newPassword && (
                        <span className="field-hint field-hint--error">{errors.newPassword}</span>
                      )}
                    </div>
                    <div className="field-group">
                      <label>Підтвердіть новий пароль</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(event) => {
                            setConfirmPassword(event.target.value);
                            setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                          }}
                          placeholder="••••••••"
                          className={errors.confirmPassword ? "has-error" : ""}
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          aria-label={showConfirmPassword ? "Приховати пароль" : "Показати пароль"}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <span className="field-hint field-hint--error">{errors.confirmPassword}</span>
                      )}
                    </div>
                  </div>
                  <div className="profile-actions-row">
                    <button type="button" className="btn-secondary" onClick={handleCancel} disabled={isSaving}>
                      <CloseOutlined />
                      <span>Скасувати</span>
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => handleSave("password")}
                      disabled={isSaving || !isPasswordDirty}
                    >
                      <CheckOutlined />
                      <span>Зберегти</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="view-line">
                  <span className="label">Пароль</span>
                  <span className="value">••••••••</span>
                </div>
              )}
            </div>
          </div>

          {lastOrder && (
            <div className="profile-section-compact last-delivery-section">
              <div className="profile-section-head">
                <div className="head-title-group">
                  <h3>Остання доставка</h3>
                </div>
              </div>
              <div className="profile-section-body vertical-stack">
                <div className="view-line">
                  <span className="label">Дата доставки</span>
                  <span className="value">{formatShortDate(lastOrder.createdAt)}</span>
                </div>
                <div className="view-line">
                  <span className="label">ПІБ отримувача</span>
                  <span className="value">{lastOrder.customer?.name || "—"}</span>
                </div>
                <div className="view-line">
                  <span className="label">Тел. отримувача</span>
                  <span className="value">{lastOrder.customer?.phone || "—"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProfileTab;
