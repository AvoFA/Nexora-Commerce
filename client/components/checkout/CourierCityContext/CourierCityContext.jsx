import { HomeOutlined } from "@mui/icons-material";

const CourierCityContext = ({ city, cityArea }) => (
  <div className="delivery-city-context">
    <span className="context-label">Місто доставки</span>
    <div className="context-main">
      <HomeOutlined />
      <div>
        <strong>{city}</strong>
        <small>{cityArea || "Доставка у вказане місто"}</small>
      </div>
    </div>
  </div>
);

export default CourierCityContext;
