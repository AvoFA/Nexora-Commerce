/**
 * Formats a customer's or user's name for display based on the context.
 * 
 * @param {Object|string} person - The user or customer object containing name fields (name, surname, patronymic), or a string.
 * @param {string} mode - 'compact' (Ім'я Прізвище) or 'full' (Ім'я Прізвище По батькові).
 * @returns {string} The formatted name.
 */
export const formatCustomerName = (person, mode = 'compact') => {
  if (!person) return "—";

  // If person is just a string (e.g., fallback or edge case)
  if (typeof person === 'string') {
    const nameStr = person.trim();
    if (!nameStr) return "—";

    if (mode === 'compact') {
      const words = nameStr.split(/\s+/);
      // Assuming string is "Surname Name Patronymic" or "Surname Name"
      // We want to return "Name Surname" (Ім'я Прізвище)
      if (words.length >= 2) {
        return `${words[1]} ${words[0]}`; // Ім'я Прізвище
      }
      return nameStr;
    }
    return nameStr; // Full mode
  }

  // If person is an object with explicitly separated fields (like a User document)
  if (person.surname !== undefined || person.patronymic !== undefined) {
    const s = (person.surname || "").trim();
    const n = (person.name || "").trim();
    const p = (person.patronymic || "").trim();

    if (mode === 'compact') {
      // Ім'я Прізвище
      const parts = [n, s].filter(Boolean);
      return parts.length > 0 ? parts.join(" ") : "—";
    } else {
      // Ім'я Прізвище По батькові
      const parts = [n, s, p].filter(Boolean);
      return parts.length > 0 ? parts.join(" ") : "—";
    }
  }

  // If it's an Order.customer object without surname/patronymic
  // e.g. guest checkout where it's saved as a single `name` string ("Прізвище Ім'я По-батькові")
  if (person.name) {
    const nameStr = person.name.trim();
    if (!nameStr) return "—";
    
    if (mode === 'compact') {
      const words = nameStr.split(/\s+/);
      if (words.length >= 2) {
        // Assume format is: Surname Name [Patronymic]
        // We want: Name Surname
        return `${words[1]} ${words[0]}`;
      }
      return nameStr;
    } else {
      return nameStr;
    }
  }

  return "—";
};

/**
 * Formats a date string into Ukrainian locale format.
 * 
 * @param {string|Date} dateString - The date to format.
 * @param {boolean} showTime - Whether to include hours and minutes.
 * @returns {string} The formatted date string.
 */
export const formatDate = (dateString, showTime = false) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  const options = {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(showTime && { hour: "2-digit", minute: "2-digit" })
  };
  return date.toLocaleDateString("uk-UA", options);
};

/**
 * Gets initials for avatar display from name and surname.
 * 
 * @param {string} name - User's first name.
 * @param {string} surname - User's last name.
 * @returns {string} Initials string.
 */
export const getCustomerInitials = (name, surname) => {
  const firstChar = name ? name.charAt(0) : "";
  const secondChar = surname ? surname.charAt(0) : "";
  return `${firstChar}${secondChar}`.toUpperCase() || "?";
};

