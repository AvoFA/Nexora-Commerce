import { Link } from "react-router-dom";
import "./EmptyState.scss";

/**
 * EmptyState — generic empty/auth/error state block.
 *
 * Props:
 *  @param {React.ElementType} [icon]        - MUI icon component to render at the top.
 *  @param {string}            title         - Primary heading text.
 *  @param {string}            [description] - Supporting paragraph text.
 *  @param {object}            [action]      - CTA config:
 *                                              { label, to }     — renders a <Link>
 *                                              { label, onClick } — renders a <button>
 *  @param {string}            [actionVariant="primary"] - "primary" | "secondary" btn class.
 *  @param {string}            [className]   - Extra class applied to the root div
 *                                            (e.g. "account-empty-state", "cart-empty-state").
 *
 * Usage:
 *   <EmptyState
 *     icon={ShoppingBagOutlinedIcon}
 *     title="Ваш кошик порожній"
 *     description="Додайте товари, щоб розпочати покупки"
 *     action={{ label: "Перейти до каталогу", to: "/catalog" }}
 *     className="cart-empty-state"
 *   />
 */
const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  actionVariant = "primary",
  className = "",
}) => {
  const rootClass = ["empty-state", className].filter(Boolean).join(" ");

  const renderAction = () => {
    if (!action) return null;
    const btnClass = `btn-${actionVariant}`;

    if (action.to) {
      return (
        <Link to={action.to} className={btnClass}>
          {action.label}
        </Link>
      );
    }

    return (
      <button type="button" className={btnClass} onClick={action.onClick}>
        {action.label}
      </button>
    );
  };

  return (
    <div className={rootClass}>
      {Icon && <Icon className="empty-icon" />}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {renderAction()}
    </div>
  );
};

export default EmptyState;
