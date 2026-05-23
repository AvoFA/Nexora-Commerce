const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const CYRILLIC_NAME_RE = /^[А-ЯЄІЇҐ][а-яєіїґА-ЯЄІЇҐʼ'\-]*$/;
const PHONE_RE = /^\+380 \(\d{2}\) \d{3}-\d{2}-\d{2}$/;

const NAME_HINT = 'Тільки літери кирилиці, тире або апостроф. Перша літера має бути великою.';

const validateNamePart = (value, { required = true, label = 'Поле' } = {}) => {
  const trimmed = (value || '').trim();

  if (!trimmed) {
    return required ? `${label} обов'язкове.` : null;
  }

  if (trimmed.length < 2) {
    return `${label} має містити мінімум 2 символи.`;
  }

  if (!CYRILLIC_NAME_RE.test(trimmed)) {
    return NAME_HINT;
  }

  return null;
};

const validateEmail = (value) => {
  const trimmed = (value || '').trim();

  if (!trimmed) return "Email обов'язковий.";
  if (!EMAIL_RE.test(trimmed)) return 'Вкажіть коректний email.';

  return null;
};

const validatePhone = (value) => {
  const trimmed = (value || '').trim();
  if (!trimmed) return null;
  return PHONE_RE.test(trimmed) ? null : 'Вкажіть номер у форматі +380 (XX) XXX-XX-XX.';
};

module.exports = {
  validateEmail,
  validateNamePart,
  validatePhone
};
