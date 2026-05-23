export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
export const CYRILLIC_NAME_RE = /^[А-ЯЄІЇҐ][а-яєіїґА-ЯЄІЇҐʼ'\-]*$/;

export const NAME_HINT =
  "Тільки літери кирилиці, тире або апостроф. Перша літера має бути великою.";

export const validateNamePart = (value, { required = true } = {}) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return required ? "Поле обов'язкове." : null;
  }

  if (trimmed.length < 2) {
    return "Мінімум 2 символи.";
  }

  if (!CYRILLIC_NAME_RE.test(trimmed)) {
    return NAME_HINT;
  }

  return null;
};

export const validateEmail = (value) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return 'Вкажіть email.';
  }

  if (!EMAIL_RE.test(trimmed)) {
    return 'Вкажіть коректний email.';
  }

  return null;
};

export const formatPhone = (value = '') => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';

  let normalized = digits;

  if (normalized.startsWith('380')) {
    normalized = normalized.slice(3);
  } else if (normalized.startsWith('80')) {
    normalized = normalized.slice(2);
  } else if (normalized.startsWith('0')) {
    normalized = normalized.slice(1);
  }

  normalized = normalized.slice(0, 9);

  const operator = normalized.slice(0, 2);
  const first = normalized.slice(2, 5);
  const second = normalized.slice(5, 7);
  const third = normalized.slice(7, 9);

  let formatted = '+380';
  if (operator) formatted += ` (${operator}`;
  if (operator.length === 2) formatted += ')';
  if (first) formatted += ` ${first}`;
  if (second) formatted += `-${second}`;
  if (third) formatted += `-${third}`;

  return formatted;
};

export const isCompletePhone = (value = '') => {
  const digits = value.replace(/\D/g, '');
  return digits.length === 12 && digits.startsWith('380');
};
