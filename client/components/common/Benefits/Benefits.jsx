// client/components/common/Benefits/Benefits.jsx
import "./Benefits.scss";
import SecurityIcon from "@mui/icons-material/Security";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

const features = [
  {
    icon: <VerifiedUserIcon />,
    title: "Чиста автентичність",
    description:
      "Тільки оригінальні Tech-пристрої з повною заводською гарантією. Жодних компромісів із якістю.",
  },
  {
    icon: <LocalShippingIcon />,
    title: "Стрімка логістика",
    description:
      "Швидке та надійне відправлення замовлень по всій території України.",
  },
  {
    icon: <SecurityIcon />,
    title: "Неоновий захист",
    description:
      "Фінансові транзакції захищені сучасними криптографічними протоколами.",
  },
  {
    icon: <HeadsetMicIcon />,
    title: "Персональний супровід",
    description: "Команда експертів готова відповісти на ваші запитання 24/7.",
  },
];

const Benefits = () => {
  return (
    <section className="benefits-section">
      {/* Ми не використовуємо .container, бо він вже є у HomePage */}
      <h2 className="section-title">
        <span>Чому обирають нас</span>
      </h2>

      <div className="benefits-grid">
        {features.map((feature) => (
          <div key={feature.title} className="benefit-card">
            <div className="benefit-icon">{feature.icon}</div>
            <h3 className="benefit-title">{feature.title}</h3>
            <p className="benefit-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Benefits;
