// client/pages/CheckoutPage/CheckoutPage.jsx
import { useState, useEffect, useRef } from "react";
import { useCart } from "../../hooks/useCart.js";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { createOrder } from "../../services/orderService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  PersonOutlined,
  EmailOutlined,
  PhoneOutlined,
  HomeOutlined,
  LocationCityOutlined,
  MarkunreadMailboxOutlined,
  CreditCardOutlined,
  LocalShippingOutlined,
  StorefrontOutlined,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  ArrowBack,
  ArrowForward,
} from "@mui/icons-material";
import { formatPrice } from "../../utils/formatPrice.js";
import "./CheckoutPage.scss";

// Магазини для самовивозу
const STORES = [
  { id: "store-1", name: "Шоурум AvoShop №1", address: "м. Київ, вул. Хрещатик, 1", hours: "09:00 - 21:00" },
  { id: "store-2", name: "Шоурум AvoShop №2", address: "м. Київ, проспект Перемоги, 45", hours: "10:00 - 22:00" }
];

const POPULAR_CITIES = [
  { name: "Київ", ref: "dbdb8b48-9c6d-11e3-b904-005056801329" },
  { name: "Львів", ref: "dbdb8b4b-9c6d-11e3-b904-005056801329" },
  { name: "Одеса", ref: "dbdb8b4c-9c6d-11e3-b904-005056801329" },
  { name: "Дніпро", ref: "dbdb8b49-9c6d-11e3-b904-005056801329" },
  { name: "Харків", ref: "dbdb8b4a-9c6d-11e3-b904-005056801329" }
];


const CheckoutPage = () => {
  const { state, dispatch } = useCart();
  const { items } = state;
  const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const navigate = useNavigate();
  const { isAuthenticated, user, updateUserData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderCompleted, setIsOrderCompleted] = useState(false);

  /* === 👣 КРОК ОФОРМЛЕННЯ (1: Доставка, 2: Оплата) === */
  const [activeStep, setActiveStep] = useState(1);

  /* === СПОСІБ ДОСТАВКИ === */
  const [deliveryGroup, setDeliveryGroup] = useState("pickup"); // pickup | courier
  const [deliveryMethod, setDeliveryMethod] = useState("pickup"); // pickup | post | meest | courier | courier_np

  /* === СТАН ФОРМИ === */
  const parts = (user?.name || "").trim().split(/\s+/);
  const hasCompleteProfile = parts.length === 3 && parts[0] && parts[1] && parts[2] && user?.phone;

  const [name, setName] = useState(parts[0] || "");
  const [surname, setSurname] = useState(parts[1] || "");
  const [patronymic, setPatronymic] = useState(parts[2] || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [city, setCity] = useState("Київ");
  const [zip, setZip] = useState("01001");
  
  // Поля для адресної доставки
  const [address, setAddress] = useState("");
  
  // Вибраний магазин для самовивозу
  const [chosenStore, setChosenStore] = useState(STORES[0].name + ", " + STORES[0].address);
  
  // Відділення Нової Пошти
  const [npBranch, setNpBranch] = useState("Відділення №1, вул. Пирогова, 2");

  /* === СПОСІБ ОПЛАТИ === */
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // Коментар до замовлення
  const [comment, setComment] = useState("");

  // Стан помилок валідації
  const [errors, setErrors] = useState({});

  // Стан для преміальних плашок редагування (Колапс як у Comfy)
  const [isEditingCity, setIsEditingCity] = useState(false);
  const [isEditingRecipient, setIsEditingRecipient] = useState(!hasCompleteProfile);
  
  const [citySearch, setCitySearch] = useState("");
  const [filteredCities, setFilteredCities] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [cityRef, setCityRef] = useState("dbdb8b48-9c6d-11e3-b904-005056801329"); // Дефолтний Ref для Києва
  const [isSearchingCities, setIsSearchingCities] = useState(false);

  const [warehouses, setWarehouses] = useState([]);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false);

  const handleCitySearchChange = async (val) => {
    setCitySearch(val);
    if (!val.trim() || val.trim().length < 2) {
      setFilteredCities([]);
      setShowCitySuggestions(false);
      return;
    }

    setIsSearchingCities(true);
    try {
      const response = await fetch(`http://localhost:5000/api/delivery/cities?search=${encodeURIComponent(val)}`);
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setFilteredCities(data.data);
        setShowCitySuggestions(true);
      } else {
        setFilteredCities([]);
      }
    } catch (error) {
      console.error("Error searching cities:", error);
      setFilteredCities([]);
    } finally {
      setIsSearchingCities(false);
    }
  };

  // Завантаження відділень Нової Пошти при зміні міста
  useEffect(() => {
    if (deliveryMethod === "post" && cityRef) {
      setIsLoadingWarehouses(true);
      fetch(`http://localhost:5000/api/delivery/warehouses?cityRef=${cityRef}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setWarehouses(data.data);
            if (data.data.length > 0) {
              setNpBranch(data.data[0].Description);
            } else {
              setNpBranch("");
            }
          } else {
            setWarehouses([]);
            setNpBranch("");
          }
        })
        .catch((err) => {
          console.error("Error loading warehouses:", err);
          setWarehouses([]);
          setNpBranch("");
        })
        .finally(() => setIsLoadingWarehouses(false));
    }
  }, [cityRef, deliveryMethod]);

  /* === РЕФ ТА СТЕЙТ ДЛЯ ГОРИЗОНТАЛЬНОГО СЛАЙДЕРА ТОВАРІВ === */
  const itemsContainerRef = useRef(null);
  const stepTransitionRef = useRef(false);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);

  const handleItemsScroll = () => {
    const el = itemsContainerRef.current;
    if (el) {
      setScrollLeft(el.scrollLeft);
      setMaxScroll(el.scrollWidth - el.clientWidth);
    }
  };

  useEffect(() => {
    const el = itemsContainerRef.current;
    if (el) {
      el.addEventListener("scroll", handleItemsScroll);
      // Робимо затримку, щоб переконатися, що товари відрендерились
      const timer = setTimeout(handleItemsScroll, 300);
      return () => {
        el.removeEventListener("scroll", handleItemsScroll);
        clearTimeout(timer);
      };
    }
  }, [items]);

  const getInputClassName = (value, fieldName) => {
    const isFilled = String(value || "").trim() ? "is-filled" : "is-empty";
    const hasErrorClass = errors[fieldName] ? "has-error" : "";
    return `form-input ${isFilled} ${hasErrorClass}`;
  };

  /* === СИНХРОНІЗАЦІЯ ДАНИХ З ПРОФІЛЮ КОРИСТУВАЧА === */
  useEffect(() => {
    if (user) {
      const p = (user.name || "").trim().split(/\s+/);
      if (!name && p[0]) setName(p[0]);
      if (!surname && p[1]) setSurname(p[1]);
      if (!patronymic && p[2]) setPatronymic(p[2]);
      if (!email && user.email) setEmail(user.email);
      if (!phone && user.phone) setPhone(user.phone);
      if (p[0] && p[1] && p[2] && user.phone) {
        setIsEditingRecipient(false);
      }
    }
  }, [user]);

  /* === ПЕРЕВІРКА, ЧИ КОШИК ПУСТИЙ === */
  useEffect(() => {
    if (items.length === 0 && !isOrderCompleted) {
      navigate("/cart");
    }
  }, [items, navigate, isOrderCompleted]);

  /* === РОЗРАХУНОК ДАТ ДОСТАВКИ === */
  const getFormattedDate = (daysToAdd) => {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    const day = date.getDate();
    const months = [
      "січня", "лютого", "березня", "квітня", "травня", "червня",
      "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"
    ];
    const month = months[date.getMonth()];
    
    const weekdays = [
      "неділя", "понеділок", "вівторок", "середа", "четвер", "п'ятниця", "субота"
    ];
    const weekday = weekdays[date.getDay()];
    
    return `${day} ${month} (${weekday})`;
  };

  const getPlannedDate = () => {
    if (deliveryMethod === "pickup") return `завтра, ${getFormattedDate(1)}`;
    if (deliveryMethod === "post" || deliveryMethod === "meest") return `післязавтра, ${getFormattedDate(2)}`;
    return `кур'єром, ${getFormattedDate(2)}`;
  };

  const getDeliveryTypeLabel = () => {
    if (deliveryMethod === "pickup") return "Самовивіз з шоуруму";
    if (deliveryMethod === "post") return "До відділення Нова Пошта";
    if (deliveryMethod === "meest") return "До відділення Meest ПОШТА";
    if (deliveryMethod === "courier") return "Адресна доставка кур'єром COMFY";
    return "Адресна доставка кур'єром Нова Пошта";
  };

  /* === ВАЛІДАЦІЯ ТА ПЕРЕХІД НА НАСТУПНИЙ КРОК === */
  const validateRecipientAndCity = (currentErrors = {}) => {
    const newErrors = { ...currentErrors };

    if (!name.trim()) {
      newErrors.name = "Поле обов'язкове для заповнення";
    } else if (!/^[А-Яа-яЄєІіЇїҐґ'-]+$/.test(name.trim())) {
      newErrors.name = "Вкажіть ім'я кирилицею";
    }

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

  const validateDeliveryStep = () => {
    if (!isAuthenticated) {
      toast.error("Увійдіть або зареєструйтесь, щоб оформити замовлення");
      return false;
    }

    let nextErrors = validateRecipientAndCity({});

    // Перевірка полів доставки
    if (deliveryMethod === "post" || deliveryMethod === "meest") {
      if (!npBranch.trim()) {
        nextErrors.npBranch = "Поле обов'язкове для заповнення";
      }
    } else if (deliveryMethod === "courier" || deliveryMethod === "courier_np") {
      if (!address.trim()) {
        nextErrors.address = "Поле обов'язкове для заповнення";
      }
      if (!zip.trim()) {
        nextErrors.zip = "Поле обов'язкове для заповнення";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleContinueToPayment = () => {
    if (validateDeliveryStep()) {
      stepTransitionRef.current = true;
      setActiveStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        stepTransitionRef.current = false;
      }, 400); // 400ms захисний інтервал від дабл-кліку
    }
  };

  const handleContinueToConfirmation = () => {
    if (validateDeliveryStep()) {
      stepTransitionRef.current = true;
      setActiveStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        stepTransitionRef.current = false;
      }, 400);
    }
  };

  /* === КЛІКАБЕЛЬНІСТЬ СТЕППЕРА === */
  const handleStepClick = (step) => {
    if (step === 1) {
      setActiveStep(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (step === 2) {
      if (validateDeliveryStep()) {
        setActiveStep(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else if (step === 3) {
      handleContinueToConfirmation();
    }
  };

  /* === ГОРИЗОНТАЛЬНА ПРОКРУТКА ТОВАРІВ === */
  const animateScroll = (element, distance) => {
    const start = element.scrollLeft;
    const startTime = performance.now();
    const duration = 280; // 280ms - оптимальна тривалість плавності

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Формула плавного уповільнення EaseInOutQuad
      const ease = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      element.scrollLeft = start + (distance * ease);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  const scrollItemsLeft = () => {
    if (itemsContainerRef.current) {
      animateScroll(itemsContainerRef.current, -117);
    }
  };

  const scrollItemsRight = () => {
    if (itemsContainerRef.current) {
      animateScroll(itemsContainerRef.current, 117);
    }
  };

  /* === ВІДПРАВКА ЗАМОВЛЕННЯ === */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (stepTransitionRef.current) {
      return; // Захист від подвійного кліку під час переходу між кроками
    }

    if (activeStep === 1) {
      handleContinueToPayment();
      return;
    }

    if (activeStep === 2) {
      handleContinueToConfirmation();
      return;
    }

    if (!validateDeliveryStep()) return;

    let finalAddress = "";
    let finalCity = city || "Київ";
    let finalZip = zip || "01001";

    if (deliveryMethod === "pickup") {
      finalAddress = chosenStore;
    } else if (deliveryMethod === "post" || deliveryMethod === "meest") {
      finalAddress = npBranch;
    } else if (deliveryMethod === "courier" || deliveryMethod === "courier_np") {
      finalAddress = address;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");

      await createOrder({
        items: items.map((item) => ({
          product: item._id || item.id,
          id: item._id || item.id,
          name: item.name,
          price: item.price,
          image: item.image || item.imageUrl || "",
          quantity: item.quantity,
        })),
        customer: {
          name,
          email,
          phone,
        },
        delivery: {
          type: getDeliveryTypeLabel(),
          address: finalAddress,
          city: finalCity,
          zip: finalZip,
          plannedDate: getPlannedDate(),
        },
        totalPrice,
        paymentMethod,
        comment,
      }, token);

      setIsOrderCompleted(true);
      updateUserData?.({ phone });
      dispatch({ type: "CLEAR_CART" });

      toast.success("Дякуємо за замовлення!", {
        description: "Замовлення збережено у вашому кабінеті.",
        duration: 3000,
      });

      navigate("/account/orders");
    } catch (error) {
      toast.error(error.message || "Не вдалося оформити замовлення");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* === ДИНАМІЧНИЙ ЗАГОЛОВОК СТОРІНКИ === */
  const getPageTitle = () => {
    if (activeStep === 1) return "Заповніть інформацію по доставці";
    if (activeStep === 2) return "Заповніть інформацію по оплаті";
    return "Підтвердження замовлення";
  };

  /* === ЯКЩО КОШИК ПУСТИЙ === */
  if (items.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Ваш кошик порожній.</h2>
        <p>Перенаправляємо вас...</p>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {/* 🏁 Преміальна шапка оформлення: Заголовок та Степпер на одному рівні вище бордера */}
      <div className="checkout-stepper-container">
        <div className="title-with-back">
          {activeStep > 1 && (
            <button 
              type="button" 
              className="btn-step-back-round" 
              onClick={() => setActiveStep(activeStep - 1)}
              aria-label="Назад до попереднього кроку"
            >
              <ArrowBack />
            </button>
          )}
          <h1 className="page-title">{getPageTitle()}</h1>
        </div>
        
        <div className="checkout-stepper">
          {/* Крок 1: Доставка */}
          <div 
            className={`step ${activeStep === 1 ? "active" : ""} ${activeStep > 1 ? "completed" : ""} clickable`}
            onClick={() => handleStepClick(1)}
          >
            <div className="step-node">
              {activeStep > 1 ? (
                <span className="step-check">✓</span>
              ) : (
                <div className="step-dot"></div>
              )}
            </div>
            <span className="step-label">Доставка</span>
          </div>

          <div className={`step-line ${activeStep >= 2 ? "active" : ""}`}></div>

          {/* Крок 2: Оплата */}
          <div 
            className={`step ${activeStep === 2 ? "active" : ""} ${activeStep > 2 ? "completed" : ""} clickable`}
            onClick={() => handleStepClick(2)}
          >
            <div className="step-node">
              {activeStep > 2 ? (
                <span className="step-check">✓</span>
              ) : (
                <div className="step-dot"></div>
              )}
            </div>
            <span className="step-label">Оплата</span>
          </div>

          <div className={`step-line ${activeStep >= 3 ? "active" : ""}`}></div>

          {/* Крок 3: Підтвердження */}
          <div className={`step ${activeStep === 3 ? "active" : ""} ${activeStep < 3 ? "pending" : ""}`}>
            <div className="step-node">
              {activeStep > 3 ? (
                <span className="step-check">✓</span>
              ) : (
                <div className="step-dot"></div>
              )}
            </div>
            <span className="step-label">Підтвердження</span>
          </div>
        </div>
      </div>

      <form className="checkout-container" onSubmit={handleSubmit}>
        {/* === ЛІВА КОЛОНКА (ДЕТАЛІ ЗАМОВЛЕННЯ) === */}
        <div className="checkout-form">
          
          {/* ================= КРОК 1: ДОСТАВКА ================= */}
          {activeStep === 1 && (
            <div className="step-section-wrapper">
              {/* --- 1. Одержувач та місто доставки --- */}
              <div className="checkout-card">
                <h2>Заповніть інформацію по доставці</h2>
                <div className="card-content" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  
                  {/* --- 1.1 Місто доставки --- */}
                  {!isEditingCity ? (
                    <div className="info-preview-card" onClick={() => setIsEditingCity(true)} style={{ cursor: "pointer" }}>
                      <div className="preview-content">
                        <span className="preview-title">{city}</span>
                        <span className="preview-subtext">Доставка у вказане місто</span>
                      </div>
                      <button
                        type="button"
                        className="btn-change-info"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditingCity(true);
                        }}
                      >
                        Змінити <ChevronRight className="arrow-icon" />
                      </button>
                    </div>
                  ) : (
                    <div className="city-selector-block" style={{ width: "100%", padding: "16px 20px", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px" }}>
                      <div className="city-search-wrapper" style={{ marginBottom: "16px" }}>
                        <LocationCityOutlined className="search-icon" />
                        <input
                          type="text"
                          placeholder="Введіть ваше місто..."
                          value={citySearch}
                          onChange={(e) => handleCitySearchChange(e.target.value)}
                          className="form-input is-filled"
                        />
                        {citySearch.trim() && showCitySuggestions && (
                          <div className="city-suggestions">
                            {isSearchingCities ? (
                              <div className="suggestion-item disabled" style={{ opacity: 0.6, padding: "10px 16px" }}>Шукаємо міста...</div>
                            ) : filteredCities.map((item, idx) => (
                              <div
                                key={idx}
                                className="suggestion-item"
                                onClick={() => {
                                  setCity(item.Description);
                                  setCityRef(item.Ref);
                                  setCitySearch("");
                                  setShowCitySuggestions(false);
                                  setIsEditingCity(false);
                                }}
                              >
                                {item.SettlementTypeDescription || "м."} {item.Description} 
                                {item.AreaDescription && ` (${item.AreaDescription} обл.)`}
                              </div>
                            ))}
                            {!isSearchingCities && filteredCities.length === 0 && (
                              <div 
                                className="suggestion-item" 
                                onClick={() => {
                                  setCity(citySearch);
                                  setCityRef("");
                                  setCitySearch("");
                                  setShowCitySuggestions(false);
                                  setIsEditingCity(false);
                                }}
                              >
                                Додати "{citySearch}"
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="popular-cities" style={{ marginBottom: "20px" }}>
                        {POPULAR_CITIES.map((popular) => (
                          <button
                            key={popular.ref}
                            type="button"
                            className={`city-pill ${city === popular.name ? "active" : ""}`}
                            onClick={() => {
                              setCity(popular.name);
                              setCityRef(popular.ref);
                              setIsEditingCity(false);
                            }}
                          >
                            {popular.name}
                          </button>
                        ))}
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", width: "100%", marginTop: "16px" }}>
                        <button
                          type="button"
                          className="btn-save-section"
                          onClick={() => {
                            if (!city.trim()) {
                              setErrors(prev => ({ ...prev, city: "Поле обов'язкове для заповнення" }));
                              return;
                            }
                            setIsEditingCity(false);
                          }}
                          style={{ margin: 0 }}
                        >
                          Зберегти
                        </button>
                      </div>
                    </div>
                  )}

                  {/* --- 1.2 Одержувач замовлення --- */}
                  {!isEditingRecipient ? (
                    <div className="info-preview-card" onClick={() => setIsEditingRecipient(true)} style={{ cursor: "pointer" }}>
                      <div className="preview-content">
                        <span className="preview-title" style={{ fontWeight: 800 }}>Одержувач замовлення</span>
                        <span className="preview-subtext" style={{ fontSize: "1.05rem", color: "var(--text-color)", marginTop: "4px", display: "block" }}>
                          {surname ? `${surname} ` : ""}{name}{patronymic ? ` ${patronymic}` : ""}
                        </span>
                        <span className="preview-subtext" style={{ color: "var(--text-secondary)", marginTop: "2px", display: "block" }}>
                          {phone || "Немає телефону"} {email ? `· ${email}` : ""}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn-change-info"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditingRecipient(true);
                        }}
                      >
                        Змінити <ChevronRight className="arrow-icon" />
                      </button>
                    </div>
                  ) : (
                    <div style={{ padding: "16px 20px", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px" }}>
                      <div className="form-grid">
                        <div className="form-group">
                          <label htmlFor="phone">Номер телефону</label>
                          <PhoneOutlined className="form-icon" />
                          <input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              if (errors.phone) setErrors(prev => ({ ...prev, phone: null }));
                            }}
                            placeholder="+380 99 123 4567"
                            className={getInputClassName(phone, "phone")}
                            required
                          />
                          {errors.phone && <div className="error-message">{errors.phone}</div>}
                        </div>

                        <div className="form-group">
                          <label htmlFor="name">Ім'я</label>
                          <PersonOutlined className="form-icon" />
                          <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value);
                              if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                            }}
                            placeholder="Іван"
                            className={getInputClassName(name, "name")}
                            required
                          />
                          {errors.name && <div className="error-message">{errors.name}</div>}
                        </div>

                        <div className="form-group">
                          <label htmlFor="surname">Прізвище</label>
                          <PersonOutlined className="form-icon" />
                          <input
                            id="surname"
                            type="text"
                            value={surname}
                            onChange={(e) => {
                              setSurname(e.target.value);
                              if (errors.surname) setErrors(prev => ({ ...prev, surname: null }));
                            }}
                            placeholder="Петренко"
                            className={getInputClassName(surname, "surname")}
                            required
                          />
                          {errors.surname && <div className="error-message">{errors.surname}</div>}
                        </div>

                        <div className="form-group">
                          <label htmlFor="patronymic">По батькові</label>
                          <PersonOutlined className="form-icon" />
                          <input
                            id="patronymic"
                            type="text"
                            value={patronymic}
                            onChange={(e) => {
                              setPatronymic(e.target.value);
                              if (errors.patronymic) setErrors(prev => ({ ...prev, patronymic: null }));
                            }}
                            placeholder="Петрович"
                            className={getInputClassName(patronymic, "patronymic")}
                            required
                          />
                          {errors.patronymic && <div className="error-message">{errors.patronymic}</div>}
                        </div>

                        <div className="form-group full-width">
                          <label htmlFor="email">Електронна пошта</label>
                          <EmailOutlined className="form-icon" />
                          <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (errors.email) setErrors(prev => ({ ...prev, email: null }));
                            }}
                            placeholder="example@gmail.com"
                            className={getInputClassName(email, "email")}
                            required
                          />
                          {errors.email && <div className="error-message">{errors.email}</div>}
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", width: "100%", marginTop: "16px" }}>
                        <button
                          type="button"
                          className="btn-save-section"
                          onClick={() => {
                            const nextErrors = validateRecipientAndCity({});
                            delete nextErrors.city;
                            if (Object.keys(nextErrors).length > 0) {
                              setErrors(nextErrors);
                              return;
                            }
                            setIsEditingRecipient(false);
                          }}
                          style={{ margin: 0 }}
                        >
                          Зберегти
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* --- Спосіб та Адреса доставки --- */}
              <div className="checkout-card">
                <h2>Спосіб доставки</h2>
                <div className="card-content">
                  
                  {/* 🏷️ Двохрівневі глобальні вкладки доставки (Самовивіз / Кур'єр) */}
                  <div className="delivery-groups-toggle">
                    <button
                      type="button"
                      className={`group-toggle-btn ${deliveryGroup === "pickup" ? "active" : ""}`}
                      onClick={() => {
                        setDeliveryGroup("pickup");
                        setDeliveryMethod("pickup"); // Дефолт всередині групи Самовивозу
                      }}
                    >
                      Самовивіз / До відділення
                    </button>
                    <button
                      type="button"
                      className={`group-toggle-btn ${deliveryGroup === "courier" ? "active" : ""}`}
                      onClick={() => {
                        setDeliveryGroup("courier");
                        setDeliveryMethod("courier"); // Дефолт всередині групи Кур'єра
                      }}
                    >
                      Доставка кур'єром від 199 ₴
                    </button>
                  </div>

                  {/* 📦 Динамічний вміст доставки в залежності від вкладки */}
                  <div className="delivery-options-list">
                    
                    {deliveryGroup === "pickup" ? (
                      <>
                        {/* 1. Самовивіз з шоуруму */}
                        <div 
                          className={`delivery-option-card ${deliveryMethod === "pickup" ? "active" : ""}`}
                          onClick={() => setDeliveryMethod("pickup")}
                        >
                          <div className="option-card-header">
                            <StorefrontOutlined className="option-icon" />
                            <div className="option-info">
                              <span className="option-title">Самовивіз з шоуруму</span>
                              <span className="option-date">Буде готово: {getFormattedDate(1)}</span>
                            </div>
                            <span className="option-cost free">Безкоштовно</span>
                          </div>

                          {deliveryMethod === "pickup" && (
                            <div className="option-settings-block" onClick={(e) => e.stopPropagation()}>
                              <div className="store-selector-compact">
                                <span className="compact-label">Виберіть магазин для самовивозу:</span>
                                <div className="stores-compact-grid">
                                  {STORES.map((store) => (
                                    <button
                                      key={store.id}
                                      type="button"
                                      className={`store-compact-btn ${chosenStore === store.name + ", " + store.address ? "active" : ""}`}
                                      onClick={() => setChosenStore(store.name + ", " + store.address)}
                                    >
                                      <strong>{store.name}</strong>
                                      <span className="store-btn-addr">{store.address}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="delivery-dates-badges">
                                <div className="date-badge active">
                                  <span className="date-day">{getFormattedDate(1)}</span>
                                  <span className="date-time">Протягом дня</span>
                                </div>
                                <div className="date-badge">
                                  <span className="date-day">{getFormattedDate(2)}</span>
                                  <span className="date-time">Протягом дня</span>
                                </div>
                                <div className="date-badge">
                                  <span className="date-day">{getFormattedDate(3)}</span>
                                  <span className="date-time">Протягом дня</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 2. До відділення Нова Пошта */}
                        <div 
                          className={`delivery-option-card ${deliveryMethod === "post" ? "active" : ""}`}
                          onClick={() => setDeliveryMethod("post")}
                        >
                          <div className="option-card-header">
                            <MarkunreadMailboxOutlined className="option-icon" />
                            <div className="option-info">
                              <span className="option-title">До відділення Нова Пошта</span>
                              <span className="option-date">Відправка: {getFormattedDate(2)}</span>
                            </div>
                            <span className="option-cost">1 ₴</span>
                          </div>

                          {deliveryMethod === "post" && (
                            <div className="option-settings-block" onClick={(e) => e.stopPropagation()}>
                              <div className="form-group full-width">
                                <label htmlFor="zip">Поштовий індекс</label>
                                <MarkunreadMailboxOutlined className="form-icon" />
                                <input
                                  id="zip"
                                  type="text"
                                  value={zip}
                                  onChange={(e) => {
                                    setZip(e.target.value);
                                    if (errors.zip) setErrors(prev => ({ ...prev, zip: null }));
                                  }}
                                  placeholder="01001"
                                  className={getInputClassName(zip, "zip")}
                                  required
                                />
                                {errors.zip && <div className="error-message">{errors.zip}</div>}
                              </div>

                              <div className="form-group full-width">
                                <label htmlFor="npBranch">Виберіть відділення Нової Пошти</label>
                                <HomeOutlined className="form-icon" />
                                {isLoadingWarehouses ? (
                                  <div className="form-input is-filled" style={{ display: "flex", alignItems: "center", height: "44px", color: "var(--text-secondary)", opacity: 0.7 }}>
                                    Завантаження списку відділень...
                                  </div>
                                ) : warehouses.length === 0 ? (
                                  <div className="form-input is-filled" style={{ display: "flex", alignItems: "center", height: "44px", color: "rgba(255, 77, 79, 0.8)", borderColor: "rgba(255, 77, 79, 0.2)" }}>
                                    У цьому місті немає відділень Нової Пошти
                                  </div>
                                ) : (
                                  <select
                                    id="npBranch"
                                    value={npBranch}
                                    onChange={(e) => {
                                      setNpBranch(e.target.value);
                                      if (errors.npBranch) setErrors(prev => ({ ...prev, npBranch: null }));
                                    }}
                                    className="form-input is-filled"
                                    style={{
                                      width: "100%",
                                      background: "rgba(255, 255, 255, 0.03)",
                                      color: "var(--text-color)",
                                      border: "1px solid var(--border-color)",
                                      paddingRight: "40px",
                                      appearance: "none",
                                      cursor: "pointer",
                                      height: "44px",
                                      borderRadius: "8px",
                                      paddingLeft: "42px"
                                    }}
                                    required
                                  >
                                    {warehouses.map((w, idx) => (
                                      <option key={idx} value={w.Description} style={{ background: "#131722", color: "#fff" }}>
                                        {w.Description}
                                      </option>
                                    ))}
                                  </select>
                                )}
                                {errors.npBranch && <div className="error-message">{errors.npBranch}</div>}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 3. До відділення Meest ПОШТА */}
                        <div 
                          className={`delivery-option-card ${deliveryMethod === "meest" ? "active" : ""}`}
                          onClick={() => setDeliveryMethod("meest")}
                        >
                          <div className="option-card-header">
                            <MarkunreadMailboxOutlined className="option-icon" />
                            <div className="option-info">
                              <span className="option-title">До відділення Meest ПОШТА</span>
                              <span className="option-date">Відправка: {getFormattedDate(2)}</span>
                            </div>
                            <span className="option-cost">1 ₴</span>
                          </div>

                          {deliveryMethod === "meest" && (
                            <div className="option-settings-block" onClick={(e) => e.stopPropagation()}>
                              <div className="form-group full-width">
                                <label htmlFor="zip">Поштовий індекс</label>
                                <MarkunreadMailboxOutlined className="form-icon" />
                                <input
                                  id="zip"
                                  type="text"
                                  value={zip}
                                  onChange={(e) => {
                                    setZip(e.target.value);
                                    if (errors.zip) setErrors(prev => ({ ...prev, zip: null }));
                                  }}
                                  placeholder="01001"
                                  className={getInputClassName(zip, "zip")}
                                  required
                                />
                                {errors.zip && <div className="error-message">{errors.zip}</div>}
                              </div>

                              <div className="form-group full-width">
                                <label htmlFor="meestBranch">Номер або адреса відділення Meest ПОШТА</label>
                                <HomeOutlined className="form-icon" />
                                <input
                                  id="meestBranch"
                                  type="text"
                                  value={npBranch}
                                  onChange={(e) => {
                                    setNpBranch(e.target.value);
                                    if (errors.npBranch) setErrors(prev => ({ ...prev, npBranch: null }));
                                  }}
                                  placeholder="Відділення №1, вул. Шевченка, 10"
                                  className={getInputClassName(npBranch, "npBranch")}
                                  required
                                />
                                {errors.npBranch && <div className="error-message">{errors.npBranch}</div>}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        {/* 1. Кур'єр нашої компанії */}
                        <div 
                          className={`delivery-option-card ${deliveryMethod === "courier" ? "active" : ""}`}
                          onClick={() => setDeliveryMethod("courier")}
                        >
                          <div className="option-card-header">
                            <LocalShippingOutlined className="option-icon" />
                            <div className="option-info">
                              <span className="option-title">Кур'єр нашої компанії</span>
                              <span className="option-date">Доставка: {getFormattedDate(2)}</span>
                            </div>
                            <span className="option-cost font-semibold text-primary">199 ₴</span>
                          </div>

                          {deliveryMethod === "courier" && (
                            <div className="option-settings-block" onClick={(e) => e.stopPropagation()}>
                              <div className="form-group full-width">
                                <label htmlFor="zip">Поштовий індекс</label>
                                <MarkunreadMailboxOutlined className="form-icon" />
                                <input
                                  id="zip"
                                  type="text"
                                  value={zip}
                                  onChange={(e) => {
                                    setZip(e.target.value);
                                    if (errors.zip) setErrors(prev => ({ ...prev, zip: null }));
                                  }}
                                  placeholder="01001"
                                  className={getInputClassName(zip, "zip")}
                                  required
                                />
                                {errors.zip && <div className="error-message">{errors.zip}</div>}
                              </div>

                              <div className="form-group full-width">
                                <label htmlFor="address">Повна адреса доставки (Вулиця, будинок, квартира)</label>
                                <HomeOutlined className="form-icon" />
                                <input
                                  id="address"
                                  type="text"
                                  value={address}
                                  onChange={(e) => {
                                    setAddress(e.target.value);
                                    if (errors.address) setErrors(prev => ({ ...prev, address: null }));
                                  }}
                                  placeholder="вул. Хрещатик, буд. 12, кв. 4"
                                  className={getInputClassName(address, "address")}
                                  required
                                />
                                {errors.address && <div className="error-message">{errors.address}</div>}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 2. Кур'єр Нова Пошта */}
                        <div 
                          className={`delivery-option-card ${deliveryMethod === "courier_np" ? "active" : ""}`}
                          onClick={() => setDeliveryMethod("courier_np")}
                        >
                          <div className="option-card-header">
                            <LocalShippingOutlined className="option-icon" />
                            <div className="option-info">
                              <span className="option-title">Кур'єр Нова Пошта</span>
                              <span className="option-date">Доставка: {getFormattedDate(2)}</span>
                            </div>
                            <span className="option-cost text-primary font-semibold">329 ₴</span>
                          </div>

                          {deliveryMethod === "courier_np" && (
                            <div className="option-settings-block" onClick={(e) => e.stopPropagation()}>
                              <div className="form-group full-width">
                                <label htmlFor="zip">Поштовий індекс</label>
                                <MarkunreadMailboxOutlined className="form-icon" />
                                <input
                                  id="zip"
                                  type="text"
                                  value={zip}
                                  onChange={(e) => {
                                    setZip(e.target.value);
                                    if (errors.zip) setErrors(prev => ({ ...prev, zip: null }));
                                  }}
                                  placeholder="01001"
                                  className={getInputClassName(zip, "zip")}
                                  required
                                />
                                {errors.zip && <div className="error-message">{errors.zip}</div>}
                              </div>

                              <div className="form-group full-width">
                                <label htmlFor="address">Повна адреса для доставки кур'єром НП</label>
                                <HomeOutlined className="form-icon" />
                                <input
                                  id="address"
                                  type="text"
                                  value={address}
                                  onChange={(e) => {
                                    setAddress(e.target.value);
                                    if (errors.address) setErrors(prev => ({ ...prev, address: null }));
                                  }}
                                  placeholder="вул. Хрещатик, буд. 12, кв. 4"
                                  className={getInputClassName(address, "address")}
                                  required
                                />
                                {errors.address && <div className="error-message">{errors.address}</div>}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                  </div>

                  {/* Кнопка Продовжити під формами зліва всередині картки */}
                  <div className="step-actions left-aligned" style={{ marginTop: "24px" }}>
                    <button
                      type="button"
                      className="btn-continue-step"
                      onClick={handleContinueToPayment}
                    >
                      Продовжити <ChevronRight className="arrow-continue" />
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* ================= КРОК 2: ОПЛАТА ================= */}
          {activeStep === 2 && (
            <div className="step-section-wrapper">
              <div className="checkout-card">
                <h2>Вибір способу оплати</h2>
                <div className="card-content">
                  <div className="payment-options-group">
                    <label className={`payment-option-card ${paymentMethod === "cash" ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={paymentMethod === "cash"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="payment-option-content">
                        <LocalShippingOutlined />
                        <div className="payment-option-text">
                          <span>Оплата при отриманні</span>
                          <small>Готівкою або карткою у точці видачі / кур'єру</small>
                        </div>
                      </div>
                      {paymentMethod === "cash" && <CheckCircle className="payment-select-check" />}
                    </label>

                    <label className={`payment-option-card ${paymentMethod === "card" ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="payment-option-content">
                        <CreditCardOutlined />
                        <div className="payment-option-text">
                          <span>Картою онлайн</span>
                          <small>Миттєва безпечна оплата Visa / Mastercard / Apple Pay</small>
                        </div>
                      </div>
                      {paymentMethod === "card" && <CheckCircle className="payment-select-check" />}
                    </label>
                  </div>

                  {/* Кнопка Продовжити під вибором оплати всередині картки */}
                  <div className="step-actions left-aligned" style={{ marginTop: "24px" }}>
                    <button 
                      type="button" 
                      className="btn-continue-step" 
                      onClick={handleContinueToConfirmation}
                    >
                      Продовжити <ChevronRight className="arrow-continue" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= КРОК 3: ПІДТВЕРДЖЕННЯ ================= */}
          {activeStep === 3 && (
            <div className="step-section-wrapper">
              <div className="checkout-card confirmation-card">
                <h2>Підтвердження замовлення</h2>
                <div className="card-content confirmation-vertical-list">
                  {/* Рядок 1: Доставка */}
                  <div className="confirmation-row">
                    <div className="row-left">
                      <CheckCircle className="check-icon" />
                    </div>
                    <div className="row-middle">
                      <h3>Доставка</h3>
                      <p className="row-text">{getDeliveryTypeLabel()}</p>
                      <p className="row-subtext">
                        {deliveryMethod === "pickup" ? chosenStore : npBranch}
                        {deliveryMethod !== "pickup" && deliveryMethod !== "post" && deliveryMethod !== "meest" && (
                          `м. ${city}, ${address}`
                        )}
                      </p>
                      <p className="row-delivery-date">
                        Очікувана дата доставки <strong>{getPlannedDate()}</strong>
                      </p>
                    </div>
                    <div className="row-right">
                      <button 
                        type="button" 
                        className="btn-change-row" 
                        onClick={() => setActiveStep(1)}
                      >
                        <span>Змінити</span>
                        <ChevronRight className="arrow-icon" />
                      </button>
                    </div>
                  </div>

                  {/* Рядок 2: Оплата */}
                  <div className="confirmation-row">
                    <div className="row-left">
                      <CheckCircle className="check-icon" />
                    </div>
                    <div className="row-middle">
                      <h3>Оплата</h3>
                      <p className="row-text">
                        {paymentMethod === "cash" ? "Оплата при отриманні" : "Картою онлайн"}
                      </p>
                    </div>
                    <div className="row-right">
                      <button 
                        type="button" 
                        className="btn-change-row" 
                        onClick={() => setActiveStep(2)}
                      >
                        <span>Змінити</span>
                        <ChevronRight className="arrow-icon" />
                      </button>
                    </div>
                  </div>

                  {/* Рядок 3: Одержувач */}
                  <div className="confirmation-row">
                    <div className="row-left">
                      <CheckCircle className="check-icon" />
                    </div>
                    <div className="row-middle">
                      <h3>Одержувач замовлення</h3>
                      <p className="row-text">{name}</p>
                      <p className="row-subtext">{phone}</p>
                    </div>
                    <div className="row-right">
                      <button 
                        type="button" 
                        className="btn-change-row" 
                        onClick={() => setActiveStep(1)}
                      >
                        <span>Змінити</span>
                        <ChevronRight className="arrow-icon" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Картка 4: Коментар до замовлення */}
              <div className="checkout-card comment-card">
                <h2>Коментар до замовлення</h2>
                <div className="card-content">
                  <div className="form-group full-width no-icon">
                    <textarea
                      id="order-comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Ваші побажання щодо доставки, часу отримання або додаткові деталі..."
                      className="form-textarea"
                      rows={4}
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* === ПРАВА КОЛОНКА (ПІДСУМОК З ГОРИЗОНТАЛЬНИМ СЛАЙДЕРОМ) === */}
        <div className="checkout-summary">
          <div className="summary-header">
            <h2>Товари {items.reduce((acc, item) => acc + item.quantity, 0)}</h2>
            <button 
              type="button" 
              className="btn-edit-items" 
              onClick={() => navigate("/cart")}
            >
              Редагувати товари <ChevronRight className="edit-arrow" />
            </button>
          </div>
          
          <div className="card-content">
            {/* 🎯 Горизонтальний слайдер товарів із двосторонніми круглими стрілками (як у Comfy) */}
            <div className="summary-items-wrapper">
            {scrollLeft > 5 && (
              <button 
                type="button" 
                className="btn-scroll-left" 
                onClick={scrollItemsLeft}
                title="Гортати назад"
              >
                <ArrowBack className="scroll-arrow" />
              </button>
            )}

              <div className="summary-items" ref={itemsContainerRef}>
                {items.map((item) => (
                  <Link 
                    key={item._id || item.id} 
                    to={`/product/${item._id || item.id}`}
                    className="summary-product-item"
                  >
                    <div className="summary-product-image-wrapper">
                      {item.image || item.imageUrl ? (
                        <img src={item.image || item.imageUrl} alt={item.name} />
                      ) : (
                        <StorefrontOutlined />
                      )}
                    </div>
                    <div className="summary-product-info">
                      <span className="summary-product-price">{formatPrice(item.price)}</span>
                      <span className="summary-product-quantity">x {item.quantity} од.</span>
                    </div>
                  </Link>
                ))}
              </div>

            {scrollLeft < maxScroll - 5 && items.length > 2 && (
              <button 
                type="button" 
                className="btn-scroll-right" 
                onClick={scrollItemsRight}
                title="Гортати вперед"
              >
                <ArrowForward className="scroll-arrow" />
              </button>
            )}
            </div>

            <div className="summary-breakdown">
              <div className="summary-row">
                <span>{items.reduce((acc, item) => acc + item.quantity, 0)} товарів на суму:</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="summary-row">
                <span>Доставка:</span>
                <span className="free">Безкоштовно</span>
              </div>
            </div>

            <div className="summary-total">
              <strong>Загальна сума:</strong>
              <strong>{formatPrice(totalPrice)}</strong>
            </div>

            {/* --- ДИНАМІЧНА КНОПКА САЙДБАРУ --- */}
            {activeStep === 1 ? (
              <button
                type="button"
                className="btn-checkout-submit"
                onClick={handleContinueToPayment}
              >
                Продовжити <ChevronRight className="arrow-continue" />
              </button>
            ) : activeStep === 2 ? (
              <button
                type="button"
                className="btn-checkout-submit"
                onClick={handleContinueToConfirmation}
              >
                Продовжити <ChevronRight className="arrow-continue" />
              </button>
            ) : (
              <button 
                type="submit" 
                className="btn-checkout-submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Створюємо замовлення..." : "Оформити замовлення"}
              </button>
            )}

            {/* Назад до кошика */}
            <button
              type="button"
              className="btn-back-to-cart"
              onClick={() => navigate("/cart")}
            >
              <ChevronLeft className="back-arrow" />
              Назад до кошика
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
