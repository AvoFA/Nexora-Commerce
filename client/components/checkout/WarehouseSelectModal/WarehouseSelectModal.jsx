import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  CircularProgress,
} from "@mui/material";
import {
  Close,
  HomeOutlined,
  MarkunreadMailboxOutlined,
  Search,
} from "@mui/icons-material";
import { getDeliveryWarehouses } from "../../../services/deliveryService.js";
import "./WarehouseSelectModal.scss";

const getWarehouseAddress = (warehouse) =>
  warehouse.ShortAddress ||
  warehouse.Description ||
  warehouse.DescriptionRu ||
  "";

const WarehouseSelectModal = ({
  isOpen,
  onClose,
  onSelect,
  city,
  cityRef,
  selectedWarehouse,
}) => {
  const [query, setQuery] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      return;
    }

    if (!cityRef) {
      setWarehouses([]);
      setError("Спочатку оберіть місто доставки");
      return;
    }

    const controller = new AbortController();

    const loadWarehouses = async () => {
      try {
        setIsLoading(true);
        setError("");
        const result = await getDeliveryWarehouses(cityRef, {
          signal: controller.signal,
        });
        setWarehouses(result);
      } catch (err) {
        if (err.name === "AbortError") return;
        setWarehouses([]);
        setError(err.message || "Не вдалося завантажити відділення");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadWarehouses();

    return () => controller.abort();
  }, [cityRef, isOpen]);

  const filteredWarehouses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return warehouses;

    return warehouses.filter((warehouse) => {
      const haystack = [
        warehouse.Description,
        warehouse.ShortAddress,
        warehouse.Number,
        warehouse.TypeOfWarehouse,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [query, warehouses]);

  const handleSelectWarehouse = (warehouse) => {
    onSelect(warehouse.Description);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="checkout-warehouse-dialog checkout-delivery-dialog"
      maxWidth="md"
      fullWidth
    >
      <button
        type="button"
        className="checkout-modal-close"
        onClick={onClose}
        aria-label="Закрити"
      >
        <Close />
      </button>

      <DialogTitle>
        <span className="dialog-kicker">Нова Пошта</span>
        <span>Оберіть відділення</span>
        <small>{city ? `м. ${city}` : "Місто не вибрано"}</small>
      </DialogTitle>

      <DialogContent>
        <div className="warehouse-modal-search">
          <Search className="warehouse-search-icon" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Пошук за номером, адресою або районом"
            disabled={!cityRef || isLoading}
            autoFocus
          />
        </div>

        {isLoading && (
          <div className="warehouse-state-row">
            <CircularProgress size={18} />
            <span>Завантажуємо відділення...</span>
          </div>
        )}

        {!isLoading && error && (
          <div className="warehouse-state-row error">{error}</div>
        )}

        {!isLoading && !error && filteredWarehouses.length === 0 && (
          <div className="warehouse-state-row">
            {query.trim() ? "Відділень за цим пошуком не знайдено" : "Відділень не знайдено"}
          </div>
        )}

        {!isLoading && !error && filteredWarehouses.length > 0 && (
          <div className="warehouse-list-scroll">
            {filteredWarehouses.map((warehouse) => {
              const isSelected = selectedWarehouse === warehouse.Description;

              return (
                <button
                  key={warehouse.Ref || warehouse.Description}
                  type="button"
                  className={`warehouse-card${isSelected ? " selected" : ""}`}
                  onClick={() => handleSelectWarehouse(warehouse)}
                >
                  <span className="warehouse-icon">
                    <MarkunreadMailboxOutlined />
                  </span>
                  <span className="warehouse-copy">
                    <strong>{warehouse.Description}</strong>
                    <small>
                      <HomeOutlined />
                      {getWarehouseAddress(warehouse)}
                    </small>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WarehouseSelectModal;
