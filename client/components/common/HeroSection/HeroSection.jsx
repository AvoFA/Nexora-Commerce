import { Link } from 'react-router-dom';
import { ArrowForward } from '@mui/icons-material';
import './HeroSection.scss';

const HeroSection = ({ variant = 'polish' }) => {
  const handleCatalogClick = (e) => {
    if (window.innerWidth <= 900) {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('openMobileCatalog'));
    }
  };

  return (
    <section
      className={`hero-section hero-section--${variant}`}
      style={{ backgroundImage: 'url(/assets/images/ui/hero-banner.jpg)' }}
    >
      <div className="hero-overlay"></div>
      <div className="hero-content container">
        <div className="hero-text">
          <h1 className="hero-title">
            Техніка для роботи, навчання та щоденного життя
          </h1>
          <p className="hero-subtitle">
            Смартфони, ноутбуки та гаджети в одному каталозі для зручного вибору.
          </p>
          <div className="hero-actions">
            <Link to="/catalog" className="hero-button" onClick={handleCatalogClick}>
              <span>До каталогу</span>
              <ArrowForward sx={{ fontSize: '20px' }} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
