import { ArrowBack } from "@mui/icons-material";

const CheckoutStepper = ({ activeStep, pageTitle, onBack, onStepClick }) => (
  <div className="checkout-stepper-container">
    <div className="title-with-back">
      {activeStep > 1 && (
        <button
          type="button"
          className="btn-step-back-round"
          onClick={onBack}
          aria-label="Назад до попереднього кроку"
        >
          <ArrowBack />
        </button>
      )}
      <h1 className="page-title">{pageTitle}</h1>
    </div>

    <div className="checkout-stepper">
      <div
        className={`step ${activeStep === 1 ? "active" : ""} ${activeStep > 1 ? "completed" : ""} clickable`}
        onClick={() => onStepClick(1)}
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

      <div
        className={`step ${activeStep === 2 ? "active" : ""} ${activeStep > 2 ? "completed" : ""} clickable`}
        onClick={() => onStepClick(2)}
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
);

export default CheckoutStepper;
