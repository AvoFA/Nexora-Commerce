import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.scss';
import YouTubeIcon from '@mui/icons-material/YouTube';
import FacebookIcon from '@mui/icons-material/Facebook';
import XIcon from '@mui/icons-material/X';
import InstagramIcon from '@mui/icons-material/Instagram';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Footer = () => {
  const [activeSections, setActiveSections] = useState({
    service: false,
    company: false,
  });

  const toggleSection = (section) => {
    setActiveSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo-section">
            <img src="/assets/logo/nexora-full.svg" alt="Nexora" className="footer-logo" />
            <p>Ваше надійне джерело преміум електроніки. Якісні товари, винятковий сервіс.</p>
          </div>

          <div className={`footer-links-col ${activeSections.service ? 'is-active' : ''}`}>
            <h4 onClick={() => toggleSection('service')} className="footer-header-toggle">
              <span>Сервіс</span>
              <ExpandMoreIcon className="chevron-icon" />
            </h4>
            <ul className="footer-links-list">
              <li><Link to="/delivery">Доставка</Link></li>
              <li><Link to="/returns">Повернення</Link></li>
              <li><Link to="/faq">Допомога</Link></li>
            </ul>
          </div>

          <div className={`footer-links-col ${activeSections.company ? 'is-active' : ''}`}>
            <h4 onClick={() => toggleSection('company')} className="footer-header-toggle">
              <span>Компанія</span>
              <ExpandMoreIcon className="chevron-icon" />
            </h4>
            <ul className="footer-links-list">
              <li><Link to="/about">Про нас</Link></li>
              <li><a href="mailto:support@nexora.com">Контакти</a></li>
              <li><a href="tel:+380991234567">+380 (99) 123-45-67</a></li>
            </ul>
          </div>

          <div className="footer-social">
            <h4>Слідкуйте за нами</h4>
            <div className="social-icons">
              <a href="https://www.facebook.com" className="social-icon" aria-label="Facebook">
                <FacebookIcon/>
              </a>
              <a href="https://x.com/" className="social-icon" aria-label="X (Twitter)">
                <XIcon/>
              </a>
              <a href="https://www.instagram.com" className="social-icon" aria-label="Instagram">
                <InstagramIcon/>
              </a>
              <a href="https://www.youtube.com" className="social-icon" aria-label="YouTube">
                <YouTubeIcon/>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Nexora. Всі права захищені.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

