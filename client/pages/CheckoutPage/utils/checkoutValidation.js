export const getPluralGoods = (count) => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) {
    return `${count} товар`;
  } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${count} товари`;
  } else {
    return `${count} товарів`;
  }
};

export const getWarehouseSummary = (description, city, cityArea) => {
  const normalized = String(description || "").trim();

  if (!normalized) {
    return {
      title: "",
      details: "",
    };
  }

  const [title, ...detailsParts] = normalized.split(",");

  return {
    title: title.trim() || "Відділення Нової Пошти",
    details: detailsParts.join(",").trim() || `${city}${cityArea ? `, ${cityArea}` : ""}`,
  };
};

export const validateRecipientAndCity = ({
  name,
  surname,
  patronymic,
  phone,
  email,
  city,
  isIdentityVerificationRequired
}, currentErrors = {}) => {
  const newErrors = { ...currentErrors };

  // Common fields
  if (!name.trim()) {
    newErrors.name = "Поле обов'язкове для заповнення";
  } else if (!/^[А-Яа-яЄєІіЇїҐґ'-]+$/.test(name.trim())) {
    newErrors.name = "Вкажіть ім'я кирилицею";
  }

  if (isIdentityVerificationRequired) {
    if (!surname.trim()) {
      newErrors.surname = "Поле обов'язкове для заповнення";
    } else if (!/^[А-Яа-яЄєІіЇїҐґ'-]+$/.test(surname.trim())) {
      newErrors.surname = "Вкажіть прізвище кирилицею";
    }

    if (!patronymic.trim()) {
      newErrors.patronymic = "Поле обов'язкове для заповнення";
    } else if (!/^[А-Яа-яЄєІіЇїҐґ'-]+$/.test(patronymic.trim())) {
      newErrors.patronymic = "Вкажіть по батькові кирилицею";
    }
  } else {
    // Optional for pickup, but if provided, must be Cyrillic
    if (surname.trim() && !/^[А-Яа-яЄєІіЇїҐґ'-]+$/.test(surname.trim())) {
      newErrors.surname = "Вкажіть прізвище кирилицею";
    }
    if (patronymic.trim() && !/^[А-Яа-яЄєІіЇїҐґ'-]+$/.test(patronymic.trim())) {
      newErrors.patronymic = "Вкажіть по батькові кирилицею";
    }
  }

  const cleanedPhone = phone.replace(/[\s()+-]/g, "");
  if (!phone.trim()) {
    newErrors.phone = "Поле обов'язкове для заповнення";
  } else if (!/^\d{10,12}$/.test(cleanedPhone) || (cleanedPhone.length === 12 && !cleanedPhone.startsWith("38"))) {
    newErrors.phone = "Введіть коректний номер телефону (наприклад, +380991234567)";
  }

  if (!email.trim()) {
    newErrors.email = "Поле обов'язкове для заповнення";
  }

  if (!city.trim()) {
    newErrors.city = "Поле обов'язкове для заповнення";
  }

  return newErrors;
};
