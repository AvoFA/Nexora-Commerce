import "./AboutPage.scss";
import FlashOnOutlined from "@mui/icons-material/FlashOnOutlined";
import DiamondOutlined from "@mui/icons-material/DiamondOutlined";
import DesignServicesOutlined from "@mui/icons-material/DesignServicesOutlined";
import ScienceOutlined from "@mui/icons-material/ScienceOutlined";
import PublicIcon from "@mui/icons-material/Public";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SpeedIcon from "@mui/icons-material/Speed";

const aboutUsImage = "/assets/images/ui/about_us3.jpg";

const features = [
  {
    icon: <DiamondOutlined />,
    title: "Безумовна Якість",
    description:
      "Nexora відбирає лише ті пристрої, що відповідають найвищим стандартам надійності та продуктивності.",
  },
  {
    icon: <FlashOnOutlined />,
    title: "Енергія Майбутнього",
    description:
      "Ми не просто магазин, ми — портал у світ найсучасніших технологічних досягнень людства.",
  },
  {
    icon: <ScienceOutlined />,
    title: "Науковий Підхід",
    description:
      "Кожен товар у нашому каталозі проходить експертну перевірку на актуальність та функціональність.",
  },
  {
    icon: <DesignServicesOutlined />,
    title: "Техно-Естетика",
    description:
      "Для нас важливо, щоб техніка була не тільки потужною, а й естетично довершеною.",
  },
];

const stats = [
  { label: "Років інновацій", value: "5+" },
  { label: "Задоволених клієнтів", value: "50k+" },
  { label: "Світових брендів", value: "100+" },
  { label: "Техно-експертів", value: "24/7" },
];

const AboutPage = () => {
  return (
    <div className="about-page-v2">
      <section className="about-hero-glass">
        <div className="hero-content">
          <h1>Майбутнє з Nexora</h1>
          <p className="subtitle">
            Nexora — це екосистема, де інновації зустрічаються з доступністю. Ми створюємо простір, де кожен може отримати доступ до технологій завтрашнього дня вже сьогодні.
          </p>
        </div>
        <div className="hero-glow"></div>
      </section>

      <section className="about-stats">
        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-item">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="about-features">
        <h2 className="section-title centered-title">Наша Філософія</h2>
        <div className="features-grid">
          {features.map((feature) => (
            <div key={feature.title} className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">{feature.icon}</div>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="about-details-grid">
        <div className="details-image-wrapper">
          <img src={aboutUsImage} alt="Nexora Tech" />
          <div className="image-overlay-glow"></div>
        </div>

        <div className="details-content-card">
          <div className="content-badge">Наша історія</div>
          <h3>Nexora: Шлях до зірок</h3>
          <p>
            Nexora народилася з мрії про світ, де технології не є привілеєм обраних, а стають інструментом для кожного. Ми починали як невелика група ентузіастів, об'єднаних пристрастю до прогресу.
          </p>
          <p>
            Сьогодні ми — провідний хаб преміальної електроніки, де кожна лінія дизайну та кожен піксель інтерфейсу відображає нашу відданість якості. Наш неоновий стиль — це символ енергії та нескінченних можливостей, які відкривають перед вами сучасні гаджети.
          </p>

          <div className="divider"></div>

          <div className="contact-info-grid">
            <div className="contact-item">
              <PublicIcon className="contact-icon" />
              <div>
                <strong>Глобальний Email</strong>
                <p><a href="mailto:future@nexora.com">future@nexora.com</a></p>
              </div>
            </div>
            <div className="contact-item">
              <VerifiedUserIcon className="contact-icon" />
              <div>
                <strong>Підтримка 24/7</strong>
                <p><a href="tel:+380800300100">0 800 300 100</a></p>
              </div>
            </div>
            <div className="contact-item">
              <SpeedIcon className="contact-icon" />
              <div>
                <strong>Швидкий Зв'язок</strong>
                <p>Пн - Нд, без вихідних</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
