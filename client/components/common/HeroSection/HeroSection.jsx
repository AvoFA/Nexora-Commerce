import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowForward } from '@mui/icons-material';
import './HeroSection.scss';

// Компонент героя головної сторінки
const HeroSection = () => {
  return (
    <section className="hero-section" style={{ backgroundImage: 'url(/assets/images/ui/hero-banner.jpg)' }}>
      {/* Оверлей з градієнтом */}
      <div className="hero-overlay"></div>
      <div className="hero-content container">
        <div className="hero-text">
          <h1 className="hero-title">
            Відкрийте світ <span className="hero-gradient-text">ElectroLux</span> для сучасної електроніки
          </h1>
          <p className="hero-subtitle">
            Широкий асортимент смартфонів, ноутбуків, гаджетів від світових брендів. Гарантія якості та швидка доставка.
          </p>
          <Link to="/catalog" className="hero-button">
            <span>Перейти до каталогу</span>
            <ArrowForward sx={{ fontSize: '20px' }} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
