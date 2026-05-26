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
} from "./checkout.constants.js";
import { getPluralGoods, getWarehouseSummary, validateRecipientAndCity } from "./utils/checkoutValidation.js";
import {
  getDateByOffset,
  getDateParts,
  getPlannedDate,
  getDefaultDateOffset,
  getDeliveryDateOffsets,
  getDeliveryCalendarDays,
  getMethodHeaderDate,
} from "./utils/checkoutDateUtils.js";
import "./CheckoutPage.scss";

const CheckoutPage = () => {
  const { state, dispatch } = useCart();
  const summaryRef = useRef(null);
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const allItems = state.items;
  // Фільтруємо тільки обрані товари
  const items = allItems.filter(item => item.selected !== false);

  const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const navigate = useNavigate();
  const { isAuthenticated, user, updateUserData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderCompleted, setIsOrderCompleted] = useState(false);

  /* === 👣 КРОК ОФОРМЛЕННЯ (1: Доставка, 2: Оплата) === */
  const [activeStep, setActiveStep] = useState(1);

  const [scrollLeft, setScrollLeft] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);

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
  const [name, setName] = useState(user?.name || "");
  const [surname, setSurname] = useState(user?.surname || "");
  const [patronymic, setPatronymic] = useState(user?.patronymic || "");
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

  const isIdentityVerificationRequired =
    deliveryMethod === DELIVERY_METHODS.NOVA_POSHTA ||
    deliveryMethod === DELIVERY_METHODS.MEEST ||
    deliveryMethod === DELIVERY_METHODS.COURIER ||
    deliveryMethod === DELIVERY_METHODS.COURIER_NOVA_POSHTA;

  // Стан для преміальних плашок редагування (Колапс як у Comfy)
  const [isEditingRecipient, setIsEditingRecipient] = useState(!isAuthenticated);
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

  const selectedWarehouse = getWarehouseSummary(npBranch, city, cityArea);

  /* === РЕФ ТА СТЕЙТ ДЛЯ ГОРИЗОНТАЛЬНОГО СЛАЙДЕРА ТОВАРІВ === */
  const itemsContainerRef = useRef(null);
  const stepTransitionRef = useRef(false);
  const deliveryCalendarRef = useRef(null);
  const recipientSectionRef = useRef(null); // Ref for auto-scroll

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

  const selectDeliveryMethod = (method) => {
    setDeliveryMethod(method);
    setSelectedDeliveryDateOffset(getDefaultDateOffset(method));
    setIsDeliveryCalendarOpen(false);
  };

  /* === СИНХРОНІЗАЦІЯ ДАНИХ З ПРОФІЛЮ КОРИСТУВАЧА === */
  useEffect(() => {
    if (user) {
      if (!name && user.name) setName(user.name);
      if (!surname && user.surname) setSurname(user.surname);
      if (!patronymic && user.patronymic) setPatronymic(user.patronymic);
      if (!email && user.email) setEmail(user.email);
      if (!phone && user.phone) setPhone(user.phone);
    }
  }, [user]);

  useEffect(() => {
    if (items.length === 0 && !isOrderCompleted) {
      navigate("/cart");
    }
  }, [items, navigate, isOrderCompleted]);

  // IntersectionObserver для мобільної липкої кнопки оформлення
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSummaryVisible(entry.isIntersecting);
      },
      {
        threshold: 0.05,
      }
    );

    const currentRef = summaryRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [items, activeStep]);

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
  const changeDeliveryCalendarMonth = (step) => {
    setDeliveryCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + step, 1));
  };

  const selectDeliveryCalendarDate = (day) => {
    if (day.isDisabled) return;
    setSelectedDeliveryDateOffset(day.offset);
    setIsDeliveryCalendarOpen(false);
  };

  const renderDeliveryDateStrip = () => {
    const offsets = getDeliveryDateOffsets(deliveryMethod);
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
                {getDeliveryCalendarDays(deliveryCalendarMonth, deliveryMethod, selectedDeliveryDateOffset).map((day) => (
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

  const getNumericDeliveryPrice = () => {
    if (deliveryMethod === DELIVERY_METHODS.PICKUP) return 0;
    if (deliveryMethod === DELIVERY_METHODS.NOVA_POSHTA || deliveryMethod === DELIVERY_METHODS.MEEST) return 75;
    if (deliveryMethod === DELIVERY_METHODS.COURIER) return 199;
    if (deliveryMethod === DELIVERY_METHODS.COURIER_NOVA_POSHTA) return 249;
    return 0;
  };

  /* === ВАЛІДАЦІЯ ТА ПЕРЕХІД НА НАСТУПНИЙ КРОК === */
  const validateDeliveryStep = () => {
    if (!isAuthenticated) {
      toast.error("Увійдіть або зареєструйтесь, щоб оформити замовлення");
      return false;
    }

    let nextErrors = validateRecipientAndCity({
      name,
      surname,
      patronymic,
      phone,
      email,
      city,
      isIdentityVerificationRequired,
    }, {});

    // Check if recipient info is incomplete for auto-expansion
    const missingIdentityData = isIdentityVerificationRequired && (!surname.trim() || !patronymic.trim());
    const missingBasicData = !name.trim() || !phone.trim() || !email.trim();
    const hasCyrillicErrors = (nextErrors.surname || nextErrors.patronymic || nextErrors.name) &&
                              (nextErrors.surname?.includes("кирилицею") ||
                               nextErrors.patronymic?.includes("кирилицею") ||
                               nextErrors.name?.includes("кирилицею"));

    if (missingIdentityData || missingBasicData || hasCyrillicErrors) {
      setIsEditingRecipient(true);
      setTimeout(() => {
        recipientSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }

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

    const currentDeliveryPrice = getNumericDeliveryPrice();
    const finalTotalPrice = totalPrice + currentDeliveryPrice;

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
          name: `${surname} ${name} ${patronymic}`.trim(),
          email,
          phone,
        },
        delivery: {
          type: getDeliveryTypeLabel(),
          address: finalAddress,
          city: finalCity,
          zip: finalZip,
          plannedDate: getPlannedDate(deliveryMethod, selectedDeliveryDateOffset),
          deliveryPrice: currentDeliveryPrice,
        },
        totalPrice: finalTotalPrice,
        paymentMethod,
        comment,
      }, token);

      setIsOrderCompleted(true);
      updateUserData?.({
        phone,
        ...(name && { name }),
        ...(surname && { surname }),
        ...(patronymic && { patronymic }),
      });
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

  const isCourierDelivery =
    deliveryMethod === DELIVERY_METHODS.COURIER ||
    deliveryMethod === DELIVERY_METHODS.COURIER_NOVA_POSHTA;
  const confirmationDeliveryAddress = isCourierDelivery
    ? address
    : deliveryMethod === DELIVERY_METHODS.PICKUP
      ? chosenStore
      : npBranch;
  const confirmationCourierContext = isCourierDelivery ? `, м. ${city}` : "";

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
              <div ref={recipientSectionRef}>
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
                  isIdentityRequired={isIdentityVerificationRequired}
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
                    const nextErrors = validateRecipientAndCity({
                      name,
                      surname,
                      patronymic,
                      phone,
                      email,
                      city,
                      isIdentityVerificationRequired,
                    }, {});
                    delete nextErrors.city;
                    if (Object.keys(nextErrors).length > 0) {
                      setErrors(nextErrors);
                      return;
                    }
                    setIsEditingRecipient(false);
                  }}
                  getInputClassName={getInputClassName}
                />
              </div>
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
                getMethodHeaderDate={(method) => getMethodHeaderDate(method, deliveryMethod, selectedDeliveryDateOffset)}
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
              deliveryAddress={confirmationDeliveryAddress}
              courierAddress={confirmationCourierContext}
              plannedDate={getPlannedDate(deliveryMethod, selectedDeliveryDateOffset)}
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

        <div ref={summaryRef} className="checkout-summary-wrapper">
          <CheckoutSummary
            items={items}
            totalPrice={totalPrice}
            deliveryPrice={getNumericDeliveryPrice()}
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
        </div>

        {/* Мобільна липка кнопка оформлення для checkout */}
        {items.length > 0 && (
          <div className={`checkout-mobile-sticky-bar ${isSummaryVisible ? "is-hidden" : ""}`}>
            <div className="sticky-bar-content">
              <span className="sticky-items-count">
                {getPluralGoods(totalItemCount)}
              </span>

              {activeStep === 1 ? (
                <button
                  type="button"
                  className="btn-checkout-sticky-action"
                  onClick={handleContinueToPayment}
                >
                  Продовжити
                </button>
              ) : activeStep === 2 ? (
                <button
                  type="button"
                  className="btn-checkout-sticky-action"
                  onClick={handleContinueToConfirmation}
                >
                  Продовжити
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-checkout-sticky-action btn-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Створюємо..." : `Оформити | ${formatPrice(totalPrice + getNumericDeliveryPrice())}`}
                </button>
              )}
            </div>
          </div>
        )}
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
