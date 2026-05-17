import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.jsx";

const AccountPlaceholderTab = ({ title, description }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="account-empty-state">
        <h2>Потрібен вхід</h2>
        <p>Увійдіть або зареєструйтесь, щоб користуватись цим розділом кабінету.</p>
        <Link to="/catalog" className="btn-primary">
          Перейти до каталогу
        </Link>
      </div>
    );
  }

  return (
    <div className="account-empty-state">
      <h2>{title}</h2>
      <p>{description}</p>
      <Link to="/catalog" className="btn-secondary">
        Продовжити покупки
      </Link>
    </div>
  );
};

export default AccountPlaceholderTab;
