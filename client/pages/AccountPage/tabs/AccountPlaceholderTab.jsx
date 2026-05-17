import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.jsx";
import EmptyState from "../../../components/common/EmptyState/EmptyState.jsx";

const AccountPlaceholderTab = ({ title, description }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Потрібен вхід"
        description="Увійдіть або зареєструйтесь, щоб користуватись цим розділом кабінету."
        action={{ label: "Перейти до каталогу", to: "/catalog" }}
        actionVariant="primary"
        className="account-empty-state"
      />
    );
  }

  return (
    <EmptyState
      title={title}
      description={description}
      action={{ label: "Продовжити покупки", to: "/catalog" }}
      actionVariant="secondary"
      className="account-empty-state"
    />
  );
};

export default AccountPlaceholderTab;
