export const DELIVERY_GROUPS = {
  PICKUP: "pickup",
  COURIER: "courier",
};

export const DELIVERY_METHODS = {
  PICKUP: "pickup",
  NOVA_POSHTA: "post",
  MEEST: "meest",
  COURIER: "courier",
  COURIER_NOVA_POSHTA: "courier_np",
};

export const PAYMENT_METHODS = {
  CASH: "cash",
  CARD: "card",
};

export const DEFAULT_CITY = "Київ";
export const DEFAULT_CITY_AREA = "Київська обл.";
export const DEFAULT_CITY_REF = "dbdb8b48-9c6d-11e3-b904-005056801329";
export const DEFAULT_ZIP = "01001";
export const DEFAULT_NOVA_POSHTA_BRANCH = "Відділення №1, вул. Пирогова, 2";

export const STORES = [
  {
    id: "store-1",
    name: "Шоурум AvoShop №1",
    address: "м. Київ, вул. Хрещатик, 1",
    hours: "09:00 - 21:00",
  },
  {
    id: "store-2",
    name: "Шоурум AvoShop №2",
    address: "м. Київ, проспект Перемоги, 45",
    hours: "10:00 - 22:00",
  },
];

export const DELIVERY_PRICES = {
  PICKUP: "Безкоштовно",
  BRANCH: "1 ₴",
  COURIER: "199 ₴",
  COURIER_NOVA_POSHTA: "329 ₴",
};

export const UKRAINIAN_MONTH_LABELS = [
  "січня",
  "лютого",
  "березня",
  "квітня",
  "травня",
  "червня",
  "липня",
  "серпня",
  "вересня",
  "жовтня",
  "листопада",
  "грудня",
];

export const UKRAINIAN_WEEKDAY_LABELS = [
  "неділя",
  "понеділок",
  "вівторок",
  "середа",
  "четвер",
  "п'ятниця",
  "субота",
];

export const UKRAINIAN_WEEKDAY_SHORT_LABELS = [
  "Нд",
  "Пн",
  "Вт",
  "Ср",
  "Чт",
  "Пт",
  "Сб",
];

export const UKRAINIAN_CALENDAR_WEEKDAY_LABELS = [
  "Пн",
  "Вт",
  "Ср",
  "Чт",
  "Пт",
  "Сб",
  "Нд",
];

export const DELIVERY_CONFIRMATION_LABELS = {
  [DELIVERY_METHODS.PICKUP]: "Самовивіз з шоуруму",
  [DELIVERY_METHODS.NOVA_POSHTA]: "До відділення Нова Пошта",
  [DELIVERY_METHODS.MEEST]: "До відділення Meest ПОШТА",
  [DELIVERY_METHODS.COURIER]: "Адресна доставка кур'єром COMFY",
  [DELIVERY_METHODS.COURIER_NOVA_POSHTA]: "Адресна доставка кур'єром Нова Пошта",
};
