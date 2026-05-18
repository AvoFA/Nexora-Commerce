// ─── Orders Tab: Static Constants ───────────────────────────────────────────
// Feature flag — will be replaced by real API when backend is ready.
export const SHOW_DEMO_ORDER_LAYOUT = false;

// Ordered pipeline steps (canonical order matters for timeline rendering).
export const ORDER_STEPS = [
  "new",
  "confirmed",
  "packing",
  "ready_for_pickup",
  "received",
];

// Short badge labels shown in the order status chip.
export const STATUS_LABELS = {
  new: "Нове",
  confirmed: "Підтверджено",
  packing: "Комплектація",
  ready_for_pickup: "Очікує в магазині",
  received: "Отримано",
  cancelled: "Скасовано",
};

// Fallback description shown in the timeline when no timestamp is available.
export const STATUS_DESCRIPTIONS = {
  new: "Менеджер зв'яжеться з вами для підтвердження.",
  confirmed: "Замовлення підтверджено, скоро почнемо комплектацію.",
  packing: "Склад готує ваші товари до видачі.",
  ready_for_pickup: "Замовлення очікує видачі в магазині.",
  received: "Дякуємо за покупку. Сподіваємось, вам усе сподобалось.",
  cancelled: "Замовлення скасовано. Зверніться до нас для деталей.",
};

// Human-readable timeline step titles.
export const TIMELINE_LABELS = {
  new: "Отримали ваше замовлення",
  confirmed: "Замовлення підтверджено",
  packing: "Комплектація замовлення",
  ready_for_pickup: "Очікує в магазині",
  received: "Замовлення отримано",
  cancelled: "Замовлення скасовано",
};

// Payment method display names.
export const PAYMENT_LABELS = {
  cash: "Оплата при отриманні",
  card: "Карткою онлайн",
};

// Filter tabs config — predicate is used client-side to filter displayOrders.
export const ORDER_FILTERS = [
  {
    key: "all",
    label: "Всі",
    predicate: () => true,
  },
  {
    key: "cancelled",
    label: "Скасовані",
    predicate: (order) => order.status === "cancelled",
  },
  {
    key: "received",
    label: "Отримані",
    predicate: (order) => order.status === "received",
  },
];

// Demo order stub — used while SHOW_DEMO_ORDER_LAYOUT === true.
// Replace with real API data once order history endpoint is live.
export const DEMO_ORDER = {
  _id: "demo-order-10245",
  createdAt: "2026-05-14T12:24:00.000Z",
  status: "ready_for_pickup",
  paymentMethod: "card",
  totalPrice: 46798,
  discount: 0,
  deliveryPrice: 0,
  comment: "Передзвонити за 1 годину до доставки",
  items: [
    {
      product: "demo-macbook-air-m2",
      name: "Apple MacBook Air 13 M2 256GB Space Gray",
      price: 42499,
      quantity: 1,
      image: "",
    },
    {
      product: "demo-logitech-g-pro-x",
      name: "Logitech G Pro X Superlight Black",
      price: 4299,
      quantity: 1,
      image: "",
    },
  ],
  customer: {
    name: "Акбар Фаяд",
    phone: "+38 (050) 130-91-65",
    email: "xfayadx@gmail.com",
  },
  delivery: {
    city: "Кривий Ріг",
    address: "просп. 200-річчя, 12А",
    zip: "50000",
    type: "Самовивіз із магазину",
    plannedDate: "15.05.2026",
    workHours: "Магазин працює з 09:00 до 20:00",
  },
  history: [
    { status: "new", timestamp: "2026-05-14T12:24:00.000Z" },
    { status: "confirmed", timestamp: "2026-05-14T12:31:00.000Z" },
    { status: "packing", timestamp: "2026-05-14T13:05:00.000Z" },
    { status: "ready_for_pickup", timestamp: "2026-05-15T09:20:00.000Z" },
  ],
};
