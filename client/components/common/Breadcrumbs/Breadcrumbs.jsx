import React from 'react';
import { Link } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import './Breadcrumbs.scss';

const Breadcrumbs = ({ items }) => {
  return (
    <nav className="breadcrumbs-nav" aria-label="breadcrumb">
      <ol className="breadcrumbs-list">
        {/* Home page */}
        <li className="breadcrumbs-item">
          <Link to="/" className="breadcrumbs-link">
            <HomeIcon fontSize="small" className="home-icon" />
            <span className="sr-only">Головна</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={index}>
              <li className="breadcrumbs-separator" aria-hidden="true">
                <NavigateNextIcon fontSize="small" />
              </li>
              <li className={`breadcrumbs-item ${isLast ? 'active' : ''}`} aria-current={isLast ? 'page' : undefined}>
                {isLast || !item.path ? (
                  <span className="breadcrumbs-text">{item.label}</span>
                ) : (
                  <Link to={item.path} className="breadcrumbs-link">
                    {item.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
