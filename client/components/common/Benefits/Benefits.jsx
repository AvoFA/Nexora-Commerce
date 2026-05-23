import "./Benefits.scss";
import SecurityIcon from "@mui/icons-material/Security";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

const features = [
  {
    icon: <VerifiedUserIcon />,
    title: "Оригінальні товари",
    description:
      "У каталозі представлені технічні пристрої з описом, характеристиками та цінами для зручного порівняння.",
  },
  {
    icon: <LocalShippingIcon />,
    title: "Доставка по Україні",
    description:
      "Оформлення замовлення підтримує сценарії доставки, які потрібні для повного e-commerce процесу.",
  },
  {
    icon: <SecurityIcon />,
    title: "Зручне оформлення",
    description:
      "Кошик, авторизація та особистий кабінет допомагають пройти шлях від вибору товару до замовлення.",
  },
  {
    icon: <HeadsetMicIcon />,
    title: "Особистий кабінет",
    description:
      "Користувач може переглядати замовлення, обране, нещодавно переглянуті товари та власні відгуки.",
  },
];

const Benefits = () => {
  return (
    <section className="benefits-section">
      <h2 className="section-title">
        <span>Чому обирають Nexora</span>
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
