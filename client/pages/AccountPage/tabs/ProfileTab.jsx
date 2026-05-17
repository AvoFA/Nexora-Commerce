import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  EditOutlined,
  PersonOutline,
  PhoneOutlined,
  SaveOutlined,
} from "@mui/icons-material";
import { useAuth } from "../../../context/AuthContext.jsx";

const ProfileTab = () => {
  const { isAuthenticated, user, updateUserData } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [editingSection, setEditingSection] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setName(user?.name || "");
    setPhone(user?.phone || "");
  }, [user]);

  const isDirty = useMemo(() => {
    return name.trim() !== (user?.name || "") || phone.trim() !== (user?.phone || "");
  }, [name, phone, user]);

  const isPersonalEditing = editingSection === "personal";
  const isContactsEditing = editingSection === "contacts";

  const validate = () => {
    const nextErrors = {};

    if (name.trim().length < 2) {
      nextErrors.name = "Ім'я має містити мінімум 2 символи";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    try {
      setIsSaving(true);
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
        }),
      });

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        await response.text();
        throw new Error("Backend не повернув JSON. Перезапустіть сервер і перевірте /api/auth/profile.");
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Не вдалося оновити профіль");
      }

      updateUserData?.({
        name: data.user.name,
        phone: data.user.phone || "",
      });
      setEditingSection(null);
      toast.success("Персональні дані оновлено");
    } catch (error) {
      toast.error(error.message || "Не вдалося оновити профіль");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setPhone(user?.phone || "");
    setErrors({});
    setEditingSection(null);
  };

  const startEditing = (section) => {
    setErrors({});
    setEditingSection(section);
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
            <Link to="/catalog" className="btn-primary">
              Перейти до каталогу
            </Link>
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
            <p>Керуйте основною інформацією, яка використовується у кабінеті та під час оформлення замовлення.</p>
          </div>
        </div>

        <form className="profile-board" onSubmit={handleSubmit}>
          <div className="profile-section">
            <div className="profile-section-head">
              <h3>Особисті дані</h3>
              {!editingSection && (
                <button type="button" className="profile-edit-button" onClick={() => startEditing("personal")} aria-label="Редагувати особисті дані">
                  <EditOutlined />
                </button>
              )}
            </div>

            {isPersonalEditing ? (
              <label className={`profile-field ${errors.name ? "has-error" : ""}`}>
                <span>Ім'я</span>
                <div className="profile-input-wrap">
                  <PersonOutline />
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      if (errors.name && event.target.value.trim().length >= 2) {
                        setErrors((current) => ({ ...current, name: null }));
                      }
                    }}
                    autoComplete="name"
                  />
                </div>
                {errors.name && <small>{errors.name}</small>}
              </label>
            ) : (
              <div className="profile-data-row">
                <span>Ім'я</span>
                <strong>{user?.name || "Не вказано"}</strong>
              </div>
            )}
          </div>

          <div className="profile-section">
            <div className="profile-section-head">
              <h3>Контакти</h3>
              {!editingSection && (
                <button type="button" className="profile-edit-button" onClick={() => startEditing("contacts")} aria-label="Редагувати контакти">
                  <EditOutlined />
                </button>
              )}
            </div>

            <div className="profile-contact-grid">
              {isContactsEditing ? (
                <label className="profile-field">
                  <span>Телефон</span>
                  <div className="profile-input-wrap">
                    <PhoneOutlined />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+380 99 123 4567"
                      autoComplete="tel"
                    />
                  </div>
                </label>
              ) : (
                <div className="profile-data-row">
                  <span>Телефон</span>
                  <strong>{user?.phone || "Не вказано"}</strong>
                </div>
              )}

              <div className="profile-data-row profile-data-row-readonly">
                <span>Email</span>
                <strong>{user?.email || "Не вказано"}</strong>
              </div>
            </div>
          </div>

          {editingSection && (
            <div className="profile-actions">
              <button type="button" className="btn-secondary" onClick={handleCancel} disabled={isSaving}>
                Скасувати
              </button>
              <button type="submit" className="btn-primary btn-with-icon" disabled={isSaving || !isDirty}>
                <SaveOutlined />
                {isSaving ? "Зберігаємо..." : "Зберегти"}
              </button>
            </div>
          )}
        </form>
      </section>
    </div>
  );
};

export default ProfileTab;
