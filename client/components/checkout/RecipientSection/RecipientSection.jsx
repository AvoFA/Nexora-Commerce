import {
  ChevronRight,
  EmailOutlined,
  PersonOutlined,
  PhoneOutlined,
} from "@mui/icons-material";

const RecipientSection = ({
  city,
  cityArea,
  name,
  surname,
  patronymic,
  phone,
  email,
  errors,
  isEditingRecipient,
  isIdentityRequired,
  onOpenCityModal,
  onEditRecipient,
  onPhoneChange,
  onNameChange,
  onSurnameChange,
  onPatronymicChange,
  onEmailChange,
  onSaveRecipient,
  getInputClassName,
  recipientType = "self",
  onRecipientTypeChange,
}) => {
  const hasIdentityErrors = isIdentityRequired && (errors.surname || errors.patronymic);
  const showIdentityWarning = isIdentityRequired && (!surname?.trim() || !patronymic?.trim()) && !isEditingRecipient;

  return (
    <div className="checkout-card">
      <h2>Отримувач та місто</h2>
      <div className="card-content" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div className={`info-preview-card city-preview-card ${errors.city ? "has-error" : ""}`} onClick={onOpenCityModal} style={{ cursor: "pointer" }}>
          <div className="preview-content">
            <span className="preview-title" style={{ color: city ? "inherit" : "rgba(255, 255, 255, 0.4)" }}>
              {city || "Оберіть місто доставки"}
            </span>
            <span className="preview-subtext">
              {city ? (cityArea || "Доставка у вказане місто") : "Для розрахунку доставки та вибору відділень"}
            </span>
          </div>
          <button
            type="button"
            className="btn-change-info"
            onClick={(e) => {
              e.stopPropagation();
              onOpenCityModal();
            }}
          >
            Змінити <ChevronRight className="arrow-icon" />
          </button>
        </div>
        {errors.city && <div className="error-message city-error-message">{errors.city}</div>}

        {!isEditingRecipient ? (
          <div className={`info-preview-card ${hasIdentityErrors ? "has-error" : ""}`} onClick={onEditRecipient} style={{ cursor: "pointer" }}>
            <div className="preview-content">
              <span className="preview-title" style={{ fontWeight: 800 }}>Одержувач замовлення</span>
              <span className="preview-subtext" style={{ fontSize: "1.05rem", color: "var(--text-color)", marginTop: "4px", display: "block" }}>
                {surname ? `${surname} ` : ""}{name}{patronymic ? ` ${patronymic}` : ""}
              </span>
              <span className="preview-subtext" style={{ color: "var(--text-secondary)", marginTop: "2px", display: "block" }}>
                <div>{phone || "Немає телефону"}</div>
                {email && <div>{email}</div>}
              </span>
            </div>
            <button
              type="button"
              className="btn-change-info"
              onClick={(e) => {
                e.stopPropagation();
                onEditRecipient();
              }}
            >
              Змінити <ChevronRight className="arrow-icon" />
            </button>
          </div>
        ) : (
          <div className="recipient-edit-form-wrap">
            <div className="recipient-toggle-container">
              <button
                type="button"
                className={`recipient-toggle-btn ${recipientType === 'self' ? 'active' : ''}`}
                onClick={() => onRecipientTypeChange('self')}
              >
                Я одержувач
              </button>
              <button
                type="button"
                className={`recipient-toggle-btn ${recipientType === 'other' ? 'active' : ''}`}
                onClick={() => onRecipientTypeChange('other')}
              >
                Одержувач інша людина
              </button>
            </div>

            <div className="form-grid" style={{ marginTop: "14px" }}>
              <div className="form-group">
                <label htmlFor="phone">Номер телефону *</label>
                <PhoneOutlined className="form-icon" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => onPhoneChange(e.target.value)}
                  placeholder="+380 (__) ___-__-__"
                  className={getInputClassName(phone, "phone")}
                  required
                />
                {errors.phone && <div className="error-message">{errors.phone}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="name">Ім'я *</label>
                <PersonOutlined className="form-icon" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder="Введіть ім'я"
                  className={getInputClassName(name, "name")}
                  required
                />
                {errors.name && <div className="error-message">{errors.name}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="surname">Прізвище {isIdentityRequired ? "*" : ""}</label>
                <PersonOutlined className="form-icon" />
                <input
                  id="surname"
                  type="text"
                  value={surname}
                  onChange={(e) => onSurnameChange(e.target.value)}
                  placeholder="Введіть прізвище"
                  className={getInputClassName(surname, "surname")}
                  required={isIdentityRequired}
                />
                {errors.surname && <div className="error-message">{errors.surname}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="patronymic">По батькові {isIdentityRequired ? "*" : ""}</label>
                <PersonOutlined className="form-icon" />
                <input
                  id="patronymic"
                  type="text"
                  value={patronymic}
                  onChange={(e) => onPatronymicChange(e.target.value)}
                  placeholder="Введіть по батькові"
                  className={getInputClassName(patronymic, "patronymic")}
                  required={isIdentityRequired}
                />
                {errors.patronymic && <div className="error-message">{errors.patronymic}</div>}
              </div>

              <div className="form-group full-width">
                <label htmlFor="email">Електронна пошта *</label>
                <EmailOutlined className="form-icon" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  placeholder="Введіть email"
                  className={getInputClassName(email, "email")}
                  required
                  disabled={recipientType === "self"}
                />
                {errors.email && <div className="error-message">{errors.email}</div>}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", width: "100%", marginTop: "16px" }}>
              <button
                type="button"
                className="btn-save-section"
                onClick={onSaveRecipient}
                style={{ margin: 0 }}
              >
                Зберегти
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipientSection;
