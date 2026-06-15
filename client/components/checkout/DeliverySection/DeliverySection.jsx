import {
  CheckCircle,
  ChevronRight,
  HomeOutlined,
  LocalShippingOutlined,
  MarkunreadMailboxOutlined,
  StorefrontOutlined,
} from "@mui/icons-material";
import CourierCityContext from "../CourierCityContext/CourierCityContext.jsx";
import SelectedWarehouseSummary from "../SelectedWarehouseSummary/SelectedWarehouseSummary.jsx";
import {
  DELIVERY_GROUPS,
  DELIVERY_METHODS,
  DELIVERY_PRICES,
  STORES,
} from "../../../pages/CheckoutPage/checkout.constants.js";

const DeliverySection = ({
  deliveryGroup,
  deliveryMethod,
  city,
  cityArea,
  chosenStore,
  npBranch,
  selectedWarehouse,
  address,
  errors,
  onDeliveryGroupChange,
  onDeliveryMethodSelect,
  onStoreSelect,
  onWarehouseModalOpen,
  onMeestBranchChange,
  onAddressChange,
  onContinue,
  renderDeliveryDateStrip,
  getMethodHeaderDate,
  getInputClassName,
}) => (
  <div className="checkout-card">
    <h2>Спосіб доставки</h2>
    <div className="card-content">
      <div className="delivery-groups-toggle">
        <button
          type="button"
          className={`group-toggle-btn ${deliveryGroup === DELIVERY_GROUPS.PICKUP ? "active" : ""}`}
          onClick={() => onDeliveryGroupChange(DELIVERY_GROUPS.PICKUP, DELIVERY_METHODS.PICKUP)}
        >
          Самовивіз / До відділення
        </button>
        <button
          type="button"
          className={`group-toggle-btn ${deliveryGroup === DELIVERY_GROUPS.COURIER ? "active" : ""}`}
          onClick={() => onDeliveryGroupChange(DELIVERY_GROUPS.COURIER, DELIVERY_METHODS.COURIER)}
        >
          Доставка кур'єром від {DELIVERY_PRICES.COURIER}
        </button>
      </div>

      <div className="delivery-options-list">
        {deliveryGroup === DELIVERY_GROUPS.PICKUP ? (
          <>
            <div
              className={`delivery-option-card ${deliveryMethod === DELIVERY_METHODS.PICKUP ? "active" : ""}`}
              onClick={() => onDeliveryMethodSelect(DELIVERY_METHODS.PICKUP)}
            >
              <div className="option-card-header">
                <span className="option-icon-shell">
                  <StorefrontOutlined className="option-icon" />
                </span>
                <div className="option-info">
                  <span className="option-title">Самовивіз з шоуруму</span>
                  <span className="option-date">Буде готово: {getMethodHeaderDate(DELIVERY_METHODS.PICKUP)}</span>
                </div>
                <span className="option-cost free">{DELIVERY_PRICES.PICKUP}</span>
                {deliveryMethod === DELIVERY_METHODS.PICKUP && <CheckCircle className="option-selected-check" />}
              </div>

              {deliveryMethod === DELIVERY_METHODS.PICKUP && (
                <div className="option-settings-block" onClick={(e) => e.stopPropagation()}>
                  <div className="store-selector-compact">
                    <span className="compact-label">Виберіть магазин для самовивозу:</span>
                    <div className="stores-compact-grid">
                      {STORES.map((store) => (
                        <button
                          key={store.id}
                          type="button"
                          className={`store-compact-btn ${chosenStore === store.name + ", " + store.address ? "active" : ""}`}
                          onClick={() => onStoreSelect(store.name + ", " + store.address)}
                        >
                          <strong>{store.name}</strong>
                          <span className="store-btn-addr">{store.address}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {renderDeliveryDateStrip()}
                </div>
              )}
            </div>

            <div
              className={`delivery-option-card ${deliveryMethod === DELIVERY_METHODS.NOVA_POSHTA ? "active" : ""}`}
              onClick={() => onDeliveryMethodSelect(DELIVERY_METHODS.NOVA_POSHTA)}
            >
              <div className="option-card-header">
                <span className="option-icon-shell">
                  <MarkunreadMailboxOutlined className="option-icon" />
                </span>
                <div className="option-info">
                  <span className="option-title">До відділення Нова Пошта</span>
                  <span className="option-date">Відправка: {getMethodHeaderDate(DELIVERY_METHODS.NOVA_POSHTA)}</span>
                </div>
                <span className="option-cost">{DELIVERY_PRICES.BRANCH}</span>
                {deliveryMethod === DELIVERY_METHODS.NOVA_POSHTA && <CheckCircle className="option-selected-check" />}
              </div>

              {deliveryMethod === DELIVERY_METHODS.NOVA_POSHTA && (
                <div className="option-settings-block" onClick={(e) => e.stopPropagation()}>
                  <div className="form-group full-width warehouse-choice-group">
                    <label htmlFor="npBranch">Відділення Нової Пошти</label>
                    <SelectedWarehouseSummary
                      branch={npBranch}
                      city={city}
                      hasError={Boolean(errors.npBranch)}
                      warehouseSummary={selectedWarehouse}
                      onOpen={onWarehouseModalOpen}
                    />
                    {errors.npBranch && <div className="error-message">{errors.npBranch}</div>}
                  </div>
                  {renderDeliveryDateStrip()}
                </div>
              )}
            </div>

            <div
              className={`delivery-option-card ${deliveryMethod === DELIVERY_METHODS.MEEST ? "active" : ""}`}
              onClick={() => onDeliveryMethodSelect(DELIVERY_METHODS.MEEST)}
            >
              <div className="option-card-header">
                <span className="option-icon-shell">
                  <MarkunreadMailboxOutlined className="option-icon" />
                </span>
                <div className="option-info">
                  <span className="option-title">До відділення Meest ПОШТА</span>
                  <span className="option-date">Відправка: {getMethodHeaderDate(DELIVERY_METHODS.MEEST)}</span>
                </div>
                <span className="option-cost">{DELIVERY_PRICES.BRANCH}</span>
                {deliveryMethod === DELIVERY_METHODS.MEEST && <CheckCircle className="option-selected-check" />}
              </div>

              {deliveryMethod === DELIVERY_METHODS.MEEST && (
                <div className="option-settings-block" onClick={(e) => e.stopPropagation()}>
                  <div className="form-group full-width">
                    <label htmlFor="meestBranch">Номер або адреса відділення Meest ПОШТА</label>
                    <HomeOutlined className="form-icon" />
                    <input
                      id="meestBranch"
                      type="text"
                      value={npBranch}
                      onChange={(e) => onMeestBranchChange(e.target.value)}
                      placeholder="Вкажіть номер або адресу відділення"
                      className={getInputClassName(npBranch, "npBranch")}
                      required
                    />
                    {errors.npBranch && <div className="error-message">{errors.npBranch}</div>}
                  </div>
                  {renderDeliveryDateStrip()}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div
              className={`delivery-option-card ${deliveryMethod === DELIVERY_METHODS.COURIER ? "active" : ""}`}
              onClick={() => onDeliveryMethodSelect(DELIVERY_METHODS.COURIER)}
            >
              <div className="option-card-header">
                <span className="option-icon-shell">
                  <LocalShippingOutlined className="option-icon" />
                </span>
                <div className="option-info">
                  <span className="option-title">Кур'єр нашої компанії</span>
                  <span className="option-date">Доставка: {getMethodHeaderDate(DELIVERY_METHODS.COURIER)}</span>
                </div>
                <span className="option-cost font-semibold text-primary">{DELIVERY_PRICES.COURIER}</span>
                {deliveryMethod === DELIVERY_METHODS.COURIER && <CheckCircle className="option-selected-check" />}
              </div>

              {deliveryMethod === DELIVERY_METHODS.COURIER && (
                <div className="option-settings-block" onClick={(e) => e.stopPropagation()}>
                  <CourierCityContext city={city} cityArea={cityArea} />
                  <div className="form-group full-width">
                    <label htmlFor="address">Повна адреса доставки (Вулиця, будинок, квартира)</label>
                    <HomeOutlined className="form-icon" />
                    <input
                      id="address"
                      type="text"
                      value={address}
                      onChange={(e) => onAddressChange(e.target.value)}
                      placeholder="Введіть вулицю, будинок, квартиру"
                      className={getInputClassName(address, "address")}
                      required
                    />
                    {errors.address && <div className="error-message">{errors.address}</div>}
                  </div>
                  {renderDeliveryDateStrip()}
                </div>
              )}
            </div>

            <div
              className={`delivery-option-card ${deliveryMethod === DELIVERY_METHODS.COURIER_NOVA_POSHTA ? "active" : ""}`}
              onClick={() => onDeliveryMethodSelect(DELIVERY_METHODS.COURIER_NOVA_POSHTA)}
            >
              <div className="option-card-header">
                <span className="option-icon-shell">
                  <LocalShippingOutlined className="option-icon" />
                </span>
                <div className="option-info">
                  <span className="option-title">Кур'єр Нова Пошта</span>
                  <span className="option-date">Доставка: {getMethodHeaderDate(DELIVERY_METHODS.COURIER_NOVA_POSHTA)}</span>
                </div>
                <span className="option-cost text-primary font-semibold">{DELIVERY_PRICES.COURIER_NOVA_POSHTA}</span>
                {deliveryMethod === DELIVERY_METHODS.COURIER_NOVA_POSHTA && <CheckCircle className="option-selected-check" />}
              </div>

              {deliveryMethod === DELIVERY_METHODS.COURIER_NOVA_POSHTA && (
                <div className="option-settings-block" onClick={(e) => e.stopPropagation()}>
                  <CourierCityContext city={city} cityArea={cityArea} />
                  <div className="form-group full-width">
                    <label htmlFor="address">Повна адреса для доставки кур'єром НП</label>
                    <HomeOutlined className="form-icon" />
                    <input
                      id="address"
                      type="text"
                      value={address}
                      onChange={(e) => onAddressChange(e.target.value)}
                      placeholder="Введіть вулицю, будинок, квартиру"
                      className={getInputClassName(address, "address")}
                      required
                    />
                    {errors.address && <div className="error-message">{errors.address}</div>}
                  </div>
                  {renderDeliveryDateStrip()}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="step-actions left-aligned" style={{ marginTop: "8px" }}>
        <button
          type="button"
          className="btn-continue-step"
          onClick={onContinue}
        >
          Продовжити <ChevronRight className="arrow-continue" />
        </button>
      </div>
    </div>
  </div>
);

export default DeliverySection;
