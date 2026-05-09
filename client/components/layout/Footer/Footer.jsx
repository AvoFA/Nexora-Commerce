import { Link } from 'react-router-dom';
import './Footer.scss';
import YouTubeIcon from '@mui/icons-material/YouTube';
import FacebookIcon from '@mui/icons-material/Facebook';
import XIcon from '@mui/icons-material/X';
import InstagramIcon from '@mui/icons-material/Instagram';

// Головний футер сайту: навігація, контакти, соцмережі

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Логотип та слоган */}
          <div className="footer-logo-section">
            <h3>ElectroLux</h3>
            <p>Ваше надійне джерело преміум електроніки. Якісні товари, винятковий сервіс.</p>
          </div>

          {/* 2. Сервіс */}
          <div className="footer-links">
            <h4>Сервіс</h4>
            <ul>
              <li><Link to="/delivery">Доставка</Link></li>
              <li><Link to="/returns">Повернення</Link></li>
              <li><Link to="/faq">Допомога</Link></li>
            </ul>
          </div>

          {/* Інформація про компанію та контакти */}
          <div className="footer-links">
            <h4>Компанія</h4>
            <ul>
              <li><Link to="/about">Про нас</Link></li>
              <li><a href="mailto:support@ElectroLux.com">Контакти</a></li>
              <li><a href="tel:+380991234567">+380 (99) 123-45-67</a></li>
            </ul>
          </div>

          {/* 4. Соц. мережі */}
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

        {/* Нижня частина */}
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} ElectroLux. Всі права захищені.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
