// client/pages/CheckoutPage/CheckoutPage.jsx
import { useState, useEffect, useRef } from "react";
import { useCart } from "../../hooks/useCart.js";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createOrder } from "../../services/orderService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import CheckoutStepper from "../../components/checkout/CheckoutStepper/CheckoutStepper.jsx";
import CheckoutSummary from "../../components/checkout/CheckoutSummary/CheckoutSummary.jsx";
import CitySelectModal from "../../components/checkout/CitySelectModal/CitySelectModal.jsx";
import ConfirmationSection from "../../components/checkout/ConfirmationSection/ConfirmationSection.jsx";
import DeliverySection from "../../components/checkout/DeliverySection/DeliverySection.jsx";
import WarehouseSelectModal from "../../components/checkout/WarehouseSelectModal/WarehouseSelectModal.jsx";
import PaymentSection from "../../components/checkout/PaymentSection/PaymentSection.jsx";
import RecipientSection from "../../components/checkout/RecipientSection/RecipientSection.jsx";
import {
  HomeOutlined,
  ChevronLeft,
  ChevronRight,
  CalendarMonthOutlined,
} from "@mui/icons-material";
import {
  DEFAULT_CITY,
  DEFAULT_CITY_AREA,
  DEFAULT_CITY_REF,
  DEFAULT_NOVA_POSHTA_BRANCH,
  DEFAULT_ZIP,
  DELIVERY_CONFIRMATION_LABELS,
  DELIVERY_GROUPS,
  DELIVERY_METHODS,
  PAYMENT_METHODS,
  STORES,
  UKRAINIAN_CALENDAR_WEEKDAY_LABELS,
  UKRAINIAN_MONTH_LABELS,
  UKRAINIAN_WEEKDAY_LABELS,
  UKRAINIAN_WEEKDAY_SHORT_LABELS,
} from "./checkout.constants.js";
import "./CheckoutPage.scss";

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
  const [deliveryGroup, setDeliveryGroup] = useState(DELIVERY_GROUPS.PICKUP); // pickup | courier
  const [deliveryMethod, setDeliveryMethod] = useState(DELIVERY_METHODS.PICKUP); // pickup | post | meest | courier | courier_np
  const [selectedDeliveryDateOffset, setSelectedDeliveryDateOffset] = useState(1);
  const [isDeliveryCalendarOpen, setIsDeliveryCalendarOpen] = useState(false);
  const [deliveryCalendarMonth, setDeliveryCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  /* === СТАН ФОРМИ === */
  const parts = (user?.name || "").trim().split(/\s+/);
  const hasCompleteProfile = parts.length === 3 && parts[0] && parts[1] && parts[2] && user?.phone;

  const [name, setName] = useState(parts[0] || "");
  const [surname, setSurname] = useState(parts[1] || "");
  const [patronymic, setPatronymic] = useState(parts[2] || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [city, setCity] = useState(DEFAULT_CITY);
  const [cityArea, setCityArea] = useState(DEFAULT_CITY_AREA);
  const [zip] = useState(DEFAULT_ZIP);
  
  // Поля для адресної доставки
  const [address, setAddress] = useState("");
  
  // Вибраний магазин для самовивозу
  const [chosenStore, setChosenStore] = useState(STORES[0].name + ", " + STORES[0].address);
  
  // Відділення Нової Пошти
  const [npBranch, setNpBranch] = useState(DEFAULT_NOVA_POSHTA_BRANCH);

  /* === СПОСІБ ОПЛАТИ === */
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.CASH);

  // Коментар до замовлення
  const [comment, setComment] = useState("");

  // Стан помилок валідації
  const [errors, setErrors] = useState({});

  // Стан для преміальних плашок редагування (Колапс як у Comfy)
  const [isEditingRecipient, setIsEditingRecipient] = useState(!hasCompleteProfile);
  const [cityRef, setCityRef] = useState(DEFAULT_CITY_REF); // Дефолтний Ref для Києва
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);

  const handleCitySelect = ({ name: nextCity, ref: nextCityRef, areaLabel }) => {
    setCity(nextCity);
    setCityArea(areaLabel || "");
    setCityRef(nextCityRef || "");
    setNpBranch("");
    setErrors((prev) => ({
      ...prev,
      city: null,
      npBranch: null,
    }));
  };

  const handleWarehouseSelect = (warehouseDescription) => {
    setNpBranch(warehouseDescription);
    setErrors((prev) => ({
      ...prev,
      npBranch: null,
    }));
  };

  const getWarehouseSummary = (description) => {
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

  const selectedWarehouse = getWarehouseSummary(npBranch);

  /* === РЕФ ТА СТЕЙТ ДЛЯ ГОРИЗОНТАЛЬНОГО СЛАЙДЕРА ТОВАРІВ === */
  const itemsContainerRef = useRef(null);
  const stepTransitionRef = useRef(false);
  const deliveryCalendarRef = useRef(null);
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

  const getDefaultDateOffset = (method) => (method === DELIVERY_METHODS.PICKUP ? 1 : 2);

  const selectDeliveryMethod = (method) => {
    setDeliveryMethod(method);
    setSelectedDeliveryDateOffset(getDefaultDateOffset(method));
    setIsDeliveryCalendarOpen(false);
  };

  const getStartOfToday = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const getDateByOffset = (daysToAdd) => {
    const date = getStartOfToday();
    date.setDate(date.getDate() + daysToAdd);
    return date;
  };

  const getOffsetByDate = (date) => {
    const today = getStartOfToday();
    const selected = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return Math.round((selected - today) / 86400000);
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

  useEffect(() => {
    if (!isDeliveryCalendarOpen) return undefined;

    const handleOutsideCalendarClick = (event) => {
      if (deliveryCalendarRef.current?.contains(event.target)) return;
      setIsDeliveryCalendarOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideCalendarClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideCalendarClick);
    };
  }, [isDeliveryCalendarOpen]);

  /* === РОЗРАХУНОК ДАТ ДОСТАВКИ === */
  const getDateParts = (daysToAdd) => {
    const date = getDateByOffset(daysToAdd);
    const day = date.getDate();
    const month = UKRAINIAN_MONTH_LABELS[date.getMonth()];
    const weekday = UKRAINIAN_WEEKDAY_LABELS[date.getDay()];
    const weekdayShort = UKRAINIAN_WEEKDAY_SHORT_LABELS[date.getDay()];
    
    return {
      dayMonth: `${day} ${month}`,
      weekday,
      weekdayShort,
      full: `${day} ${month} (${weekday})`,
      numeric: date.toLocaleDateString("uk-UA", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    };
  };

  const getFormattedDate = (daysToAdd) => {
    return getDateParts(daysToAdd).full;
  };

  const getPlannedDate = () => {
    if (deliveryMethod === DELIVERY_METHODS.PICKUP) return `самовивіз, ${getFormattedDate(selectedDeliveryDateOffset)}`;
    if (deliveryMethod === DELIVERY_METHODS.NOVA_POSHTA || deliveryMethod === DELIVERY_METHODS.MEEST) return `до відділення, ${getFormattedDate(selectedDeliveryDateOffset)}`;
    return `кур'єром, ${getFormattedDate(selectedDeliveryDateOffset)}`;
  };

  const getDeliveryDateOffsets = () => {
    const firstOffset = getDefaultDateOffset(deliveryMethod);
    return [firstOffset, firstOffset + 1, firstOffset + 2, firstOffset + 3];
  };

  const changeDeliveryCalendarMonth = (step) => {
    setDeliveryCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + step, 1));
  };

  const getDeliveryCalendarDays = () => {
    const year = deliveryCalendarMonth.getFullYear();
    const month = deliveryCalendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const calendarStart = new Date(firstDay);
    calendarStart.setDate(firstDay.getDate() - ((firstDay.getDay() + 6) % 7));

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(calendarStart);
      date.setDate(calendarStart.getDate() + index);
      const offset = getOffsetByDate(date);

      return {
        date,
        offset,
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isSelected: offset === selectedDeliveryDateOffset,
        isDisabled: offset < getDefaultDateOffset(deliveryMethod),
      };
    });
  };

  const selectDeliveryCalendarDate = (day) => {
    if (day.isDisabled) return;
    setSelectedDeliveryDateOffset(day.offset);
    setIsDeliveryCalendarOpen(false);
  };

  const getMethodHeaderDate = (method) => {
    const offset = deliveryMethod === method ? selectedDeliveryDateOffset : getDefaultDateOffset(method);
    return getFormattedDate(offset);
  };

  const renderDeliveryDateStrip = () => {
    const offsets = getDeliveryDateOffsets();
    const customDate = getDateParts(selectedDeliveryDateOffset);
    const calendarTitle = deliveryCalendarMonth.toLocaleDateString("uk-UA", {
      month: "long",
      year: "numeric",
    });
    const weekLabels = UKRAINIAN_CALENDAR_WEEKDAY_LABELS;

    return (
      <div className="delivery-date-strip" onClick={(e) => e.stopPropagation()}>
        <div className="delivery-date-options">
          {offsets.map((offset) => {
            const date = getDateParts(offset);
            const isActive = selectedDeliveryDateOffset === offset;

            return (
              <button
                key={offset}
                type="button"
                className={`delivery-date-option ${isActive ? "active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDeliveryDateOffset(offset);
                }}
              >
                <span className="date-title">
                  {date.dayMonth} <small>({date.weekdayShort})</small>
                </span>
                <span className="date-time-chip">Протягом дня</span>
              </button>
            );
          })}
        </div>

        <div className="delivery-custom-date-wrap" ref={deliveryCalendarRef}>
          {isDeliveryCalendarOpen && (
            <div className="delivery-calendar-popover" onClick={(e) => e.stopPropagation()}>
              <div className="calendar-popover-header">
                <strong>Вибрати іншу дату</strong>
                <button
                  type="button"
                  className="calendar-close-btn"
                  onClick={() => setIsDeliveryCalendarOpen(false)}
                  aria-label="Закрити календар"
                >
                  ×
                </button>
              </div>

              <div className="calendar-month-row">
                <button type="button" onClick={() => changeDeliveryCalendarMonth(-1)} aria-label="Попередній місяць">
                  <ChevronLeft />
                </button>
                <span>{calendarTitle}</span>
                <button type="button" onClick={() => changeDeliveryCalendarMonth(1)} aria-label="Наступний місяць">
                  <ChevronRight />
                </button>
              </div>

              <div className="calendar-week-row">
                {weekLabels.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>

              <div className="calendar-day-grid">
                {getDeliveryCalendarDays().map((day) => (
                  <button
                    key={day.date.toISOString()}
                    type="button"
                    className={`calendar-day ${day.isCurrentMonth ? "" : "outside"} ${day.isSelected ? "selected" : ""}`}
                    disabled={day.isDisabled}
                    onClick={() => selectDeliveryCalendarDate(day)}
                  >
                    {day.day}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            className={`delivery-custom-date ${isDeliveryCalendarOpen ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setDeliveryCalendarMonth(new Date(getDateByOffset(selectedDeliveryDateOffset).getFullYear(), getDateByOffset(selectedDeliveryDateOffset).getMonth(), 1));
              setIsDeliveryCalendarOpen((isOpen) => !isOpen);
            }}
          >
            <CalendarMonthOutlined />
            <span>{customDate.numeric}</span>
            <ChevronRight className="custom-date-arrow" />
          </button>
        </div>
      </div>
    );
  };

  const getDeliveryTypeLabel = () => {
    return DELIVERY_CONFIRMATION_LABELS[deliveryMethod] || DELIVERY_CONFIRMATION_LABELS[DELIVERY_METHODS.COURIER_NOVA_POSHTA];
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
    if (deliveryMethod === DELIVERY_METHODS.NOVA_POSHTA || deliveryMethod === DELIVERY_METHODS.MEEST) {
      if (!npBranch.trim()) {
        nextErrors.npBranch = "Поле обов'язкове для заповнення";
      }
    } else if (deliveryMethod === DELIVERY_METHODS.COURIER || deliveryMethod === DELIVERY_METHODS.COURIER_NOVA_POSHTA) {
      if (!address.trim()) {
        nextErrors.address = "Поле обов'язкове для заповнення";
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
    let finalCity = city || DEFAULT_CITY;
    let finalZip = zip || DEFAULT_ZIP;

    if (deliveryMethod === DELIVERY_METHODS.PICKUP) {
      finalAddress = chosenStore;
    } else if (deliveryMethod === DELIVERY_METHODS.NOVA_POSHTA || deliveryMethod === DELIVERY_METHODS.MEEST) {
      finalAddress = npBranch;
    } else if (deliveryMethod === DELIVERY_METHODS.COURIER || deliveryMethod === DELIVERY_METHODS.COURIER_NOVA_POSHTA) {
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
      <CheckoutStepper
        activeStep={activeStep}
        pageTitle={getPageTitle()}
        onBack={() => setActiveStep(activeStep - 1)}
        onStepClick={handleStepClick}
      />

      <form className="checkout-container" onSubmit={handleSubmit}>
        {/* === ЛІВА КОЛОНКА (ДЕТАЛІ ЗАМОВЛЕННЯ) === */}
        <div className="checkout-form">
          
          {/* ================= КРОК 1: ДОСТАВКА ================= */}
          {activeStep === 1 && (
            <div className="step-section-wrapper">
              <RecipientSection
                city={city}
                cityArea={cityArea}
                name={name}
                surname={surname}
                patronymic={patronymic}
                phone={phone}
                email={email}
                errors={errors}
                isEditingRecipient={isEditingRecipient}
                onOpenCityModal={() => setIsCityModalOpen(true)}
                onEditRecipient={() => setIsEditingRecipient(true)}
                onPhoneChange={(nextPhone) => {
                  setPhone(nextPhone);
                  if (errors.phone) setErrors(prev => ({ ...prev, phone: null }));
                }}
                onNameChange={(nextName) => {
                  setName(nextName);
                  if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                }}
                onSurnameChange={(nextSurname) => {
                  setSurname(nextSurname);
                  if (errors.surname) setErrors(prev => ({ ...prev, surname: null }));
                }}
                onPatronymicChange={(nextPatronymic) => {
                  setPatronymic(nextPatronymic);
                  if (errors.patronymic) setErrors(prev => ({ ...prev, patronymic: null }));
                }}
                onEmailChange={(nextEmail) => {
                  setEmail(nextEmail);
                  if (errors.email) setErrors(prev => ({ ...prev, email: null }));
                }}
                onSaveRecipient={() => {
                  const nextErrors = validateRecipientAndCity({});
                  delete nextErrors.city;
                  if (Object.keys(nextErrors).length > 0) {
                    setErrors(nextErrors);
                    return;
                  }
                  setIsEditingRecipient(false);
                }}
                getInputClassName={getInputClassName}
              />
              <DeliverySection
                deliveryGroup={deliveryGroup}
                deliveryMethod={deliveryMethod}
                city={city}
                cityArea={cityArea}
                chosenStore={chosenStore}
                npBranch={npBranch}
                selectedWarehouse={selectedWarehouse}
                address={address}
                errors={errors}
                onDeliveryGroupChange={(nextGroup, defaultMethod) => {
                  setDeliveryGroup(nextGroup);
                  selectDeliveryMethod(defaultMethod);
                }}
                onDeliveryMethodSelect={selectDeliveryMethod}
                onStoreSelect={setChosenStore}
                onWarehouseModalOpen={() => setIsWarehouseModalOpen(true)}
                onMeestBranchChange={(nextBranch) => {
                  setNpBranch(nextBranch);
                  if (errors.npBranch) setErrors(prev => ({ ...prev, npBranch: null }));
                }}
                onAddressChange={(nextAddress) => {
                  setAddress(nextAddress);
                  if (errors.address) setErrors(prev => ({ ...prev, address: null }));
                }}
                onContinue={handleContinueToPayment}
                renderDeliveryDateStrip={renderDeliveryDateStrip}
                getMethodHeaderDate={getMethodHeaderDate}
                getInputClassName={getInputClassName}
              />
            </div>
          )}

          {activeStep === 2 && (
            <PaymentSection
              paymentMethod={paymentMethod}
              onPaymentMethodChange={(e) => setPaymentMethod(e.target.value)}
              onContinue={handleContinueToConfirmation}
            />
          )}

          {activeStep === 3 && (
            <ConfirmationSection
              deliveryTypeLabel={getDeliveryTypeLabel()}
              deliveryAddress={deliveryMethod === DELIVERY_METHODS.PICKUP ? chosenStore : npBranch}
              courierAddress={
                deliveryMethod !== DELIVERY_METHODS.PICKUP &&
                deliveryMethod !== DELIVERY_METHODS.NOVA_POSHTA &&
                deliveryMethod !== DELIVERY_METHODS.MEEST
                  ? `м. ${city}, ${address}`
                  : ""
              }
              plannedDate={getPlannedDate()}
              paymentLabel={paymentMethod === PAYMENT_METHODS.CASH ? "Оплата при отриманні" : "Картою онлайн"}
              recipientName={name}
              recipientPhone={phone}
              comment={comment}
              onCommentChange={(e) => setComment(e.target.value)}
              onEditDelivery={() => setActiveStep(1)}
              onEditPayment={() => setActiveStep(2)}
            />
          )}

        </div>

        <CheckoutSummary
          items={items}
          totalPrice={totalPrice}
          activeStep={activeStep}
          isSubmitting={isSubmitting}
          itemsContainerRef={itemsContainerRef}
          scrollLeft={scrollLeft}
          maxScroll={maxScroll}
          onScrollLeft={scrollItemsLeft}
          onScrollRight={scrollItemsRight}
          onEditItems={() => navigate("/cart")}
          onContinueToPayment={handleContinueToPayment}
          onContinueToConfirmation={handleContinueToConfirmation}
          onBackToCart={() => navigate("/cart")}
        />
      </form>

      <CitySelectModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        onSelect={handleCitySelect}
        selectedCity={city}
      />

      <WarehouseSelectModal
        isOpen={isWarehouseModalOpen}
        onClose={() => setIsWarehouseModalOpen(false)}
        onSelect={handleWarehouseSelect}
        city={city}
        cityRef={cityRef}
        selectedWarehouse={npBranch}
      />
    </div>
  );
};

export default CheckoutPage;
