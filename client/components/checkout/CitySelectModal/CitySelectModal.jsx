import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  CircularProgress,
} from "@mui/material";
import {
  Close,
  LocationCityOutlined,
  Search,
} from "@mui/icons-material";
import { searchDeliveryCities } from "../../../services/deliveryService.js";
import "./CitySelectModal.scss";

const POPULAR_CITIES = [
  "Київ",
  "Харків",
  "Дніпро",
  "Львів",
  "Одеса",
  "Кривий Ріг",
];

const formatCityLabel = (city) => {
  const type = city.SettlementTypeDescription || "м.";
  const area = city.AreaDescription ? ` (${city.AreaDescription} обл.)` : "";
  return `${type} ${city.Description}${area}`;
};

const formatCitySubtitle = (city) => {
  const region = city.RegionDescription ? `${city.RegionDescription}, ` : "";
  const area = city.AreaDescription ? `${city.AreaDescription} обл.` : "";

  return `${region}${area}`.trim();
};

const CitySelectModal = ({
  isOpen,
  onClose,
  onSelect,
  selectedCity,
}) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [popularLoadingCity, setPopularLoadingCity] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setDebouncedQuery("");
      setCities([]);
      setError("");
      return;
    }

    setQuery("");
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!isOpen || debouncedQuery.length < 2) {
      setCities([]);
      setIsLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();

    const loadCities = async () => {
      try {
        setIsLoading(true);
        setError("");
        const result = await searchDeliveryCities(debouncedQuery, {
          signal: controller.signal,
        });
        setCities(result);
      } catch (err) {
        if (err.name === "AbortError") return;
        setCities([]);
        setError(err.message || "Не вдалося знайти міста");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadCities();

    return () => controller.abort();
  }, [debouncedQuery, isOpen]);

  const exactSelectedCity = useMemo(
    () => selectedCity?.trim().toLowerCase(),
    [selectedCity],
  );

  const handleSelectCity = (city) => {
    onSelect({
      name: city.Description,
      ref: city.Ref,
      areaLabel: formatCitySubtitle(city),
    });
    onClose();
  };

  const handlePopularCityClick = async (cityName) => {
    try {
      setPopularLoadingCity(cityName);
      setError("");
      const result = await searchDeliveryCities(cityName);
      const city =
        result.find((item) => item.Description === cityName) || result[0];

      if (!city) {
        setError("Місто не знайдено. Спробуйте пошук.");
        return;
      }

      handleSelectCity(city);
    } catch (err) {
      setError(err.message || "Не вдалося вибрати місто");
    } finally {
      setPopularLoadingCity("");
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="checkout-city-dialog checkout-delivery-dialog"
      maxWidth="sm"
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
        <span className="dialog-kicker">Доставка</span>
        <span>Оберіть місто</span>
      </DialogTitle>

      <DialogContent>
        <div className="city-modal-search">
          <Search className="city-search-icon" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Введіть назву міста"
            autoFocus
          />
        </div>

        <section className="popular-city-section">
          <span className="modal-section-label">Популярні міста</span>
          <div className="popular-city-grid">
            {POPULAR_CITIES.map((cityName) => (
              <button
                key={cityName}
                type="button"
                className={`popular-city-btn${
                  exactSelectedCity === cityName.toLowerCase() ? " active" : ""
                }`}
                onClick={() => handlePopularCityClick(cityName)}
                disabled={Boolean(popularLoadingCity)}
              >
                <LocationCityOutlined />
                <span>{cityName}</span>
                {popularLoadingCity === cityName && <CircularProgress size={14} />}
              </button>
            ))}
          </div>
        </section>

        <section className="city-results-section">
          <span className="modal-section-label">Результати пошуку</span>

          {isLoading && (
            <div className="modal-state-row">
              <CircularProgress size={18} />
              <span>Шукаємо міста...</span>
            </div>
          )}

          {!isLoading && error && (
            <div className="modal-state-row error">{error}</div>
          )}

          {!isLoading && !error && debouncedQuery.length > 1 && cities.length === 0 && (
            <div className="modal-state-row">Міст не знайдено</div>
          )}

          {!isLoading && !error && debouncedQuery.length < 2 && (
            <div className="modal-state-row muted">
              Введіть щонайменше 2 символи для пошуку
            </div>
          )}

          {cities.length > 0 && (
            <div className="city-result-list">
              {cities.map((city) => (
                <button
                  key={city.Ref}
                  type="button"
                  className="city-result-card"
                  onClick={() => handleSelectCity(city)}
                >
                  <LocationCityOutlined />
                  <span className="city-result-copy">
                    <strong>{city.Description}</strong>
                    {formatCitySubtitle(city) && (
                      <small>{formatCitySubtitle(city)}</small>
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      </DialogContent>
    </Dialog>
  );
};

export default CitySelectModal;
