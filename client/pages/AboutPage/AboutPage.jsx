// client/pages/AboutPage.jsx
import "./AboutPage.scss";
// НОВІ ІМПОРТИ ДЛЯ ФІЛОСОФІЇ
import FlashOnOutlined from "@mui/icons-material/FlashOnOutlined";
import DiamondOutlined from "@mui/icons-material/DiamondOutlined";
import DesignServicesOutlined from "@mui/icons-material/DesignServicesOutlined";
import ScienceOutlined from "@mui/icons-material/ScienceOutlined";
const aboutUsImage = "/assets/images/ui/about_us3.jpg";

// ОНОВЛЕНИЙ МАСИВ features (ФІЛОСОФІЯ)
const features = [
  {
    icon: <DiamondOutlined />,
    title: "Безкомпромісна Якість",
    description:
      "Кожен пристрій — це преміум-вибір. Ми відбираємо лише інновації, які задають світові стандарти.",
  },
  {
    icon: <FlashOnOutlined />,
    title: "Енергія Інновацій",
    description:
      "Ми не просто продаємо; ми надаємо доступ до найновіших цифрових рішень та технологічних проривів.",
  },
  {
    icon: <ScienceOutlined />,
    title: "Культура Експертності",
    description:
      "Наша команда — це фахівці. Ми надаємо професійний супровід, знаючись на кожній деталі пристрою.",
  },
  {
    icon: <DesignServicesOutlined />,
    title: "Естетика та Форма",
    description:
      "ElectroLux — це поєднання технологічної міці та витонченого дизайну. Краса в кожній лінії.",
  },
];

const AboutPage = () => {
  return (
    // Новий клас-обгортка
    <div className="about-page-v2">
      {/* --- Секція 1: Герой (НОВА) --- */}
      <section className="about-hero-glass">
        <h1>Про ElectroLux</h1>
        <p className="subtitle">
          Наша місія — не просто продаж електроніки. Це створення майбутнього,
          де інновації доступні кожному. ElectroLux — ваш провідник у світ
          передових цифрових рішень та преміального сервісу.
        </p>
      </section>

      {/* --- Секція 2: Філософія ElectroLux (Збережений макет, новий зміст) --- */}
      <section className="about-features">
        <h2 className="section-title centered-title">Філософія ElectroLux</h2>
        <div className="features-grid">
          {features.map((feature) => (
            <div key={feature.title} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- Секція 3: Історія та Контакти (НОВА) --- */}
      <section className="about-details-grid">
        {/* Колонка 1: Зображення */}
        <div className="details-image-wrapper">
          <img src={aboutUsImage} alt="Наша команда" />
        </div>

        {/* Колонка 2: Скляна картка з текстом */}
        <div className="admin-solid-card details-content-card">
          <h3>Наша історія</h3>
          <p>
            ElectroLux був заснований з єдиною метою: надати українському ринку
            виключно люксову та передову електроніку. Ми віримо, що майбутнє
            цифрових пристроїв має бути яскравим, потужним та надійним.
          </p>
          <p>
            Ми ретельно відбираємо лише передові технологічні пристрої, які
            задають світові стандарти якості. Наш темний, неоновий дизайн
            відображає філософію ElectroLux: чиста енергія технологій у
            витонченій формі.
          </p>

          {/* Розділювач */}
          <div className="divider"></div>

          <h3>Контакти</h3>
          <div className="contact-details">
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:support@electrolux.com">support@electrolux.com</a>
            </p>
            <p>
              <strong>Телефон:</strong>{" "}
              <a href="tel:+380991234567">+380 (99) 123-45-67</a>
            </p>
            <p>
              <strong>Графік:</strong> Пн - Пт, 9:00 - 18:00
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
