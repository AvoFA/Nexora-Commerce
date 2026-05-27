import { useRef, useState, useEffect, useCallback } from "react";
import { VisibilityOutlined, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useRecentlyViewed } from "../../../hooks/useRecentlyViewed.js";
import ProductCard from "../../catalog/ProductCard/ProductCard.jsx";
import "./RecentlyViewedSection.scss";

/**
 * Reusable section for recently viewed products with a smooth-scroll carousel.
 */
const RecentlyViewedSection = ({ 
  title = "Переглянуті товари", 
  showEmpty = false 
}) => {
  const { products } = useRecentlyViewed();
  const scrollRef = useRef(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft: currentScroll, scrollWidth, clientWidth } = scrollRef.current;
    setScrollLeft(currentScroll);
    setMaxScroll(scrollWidth - clientWidth);
  }, []);

  useEffect(() => {
    checkScroll();
    const timer = setTimeout(checkScroll, 300);
    window.addEventListener('resize', checkScroll);
    return () => {
      window.removeEventListener('resize', checkScroll);
      clearTimeout(timer);
    };
  }, [products, checkScroll]);

  // Smooth scroll animation with easing
  const animateScroll = (element, distance) => {
    const start = element.scrollLeft;
    const startTime = performance.now();
    const duration = 280; 

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // EaseInOutQuad
      const ease = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      element.scrollLeft = start + (distance * ease);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // Update navigation controls after animation finishes
        checkScroll();
      }
    };

    requestAnimationFrame(step);
  };

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    
    // Scroll distance calculation based on card width and gap
    const scrollDistance = 170;
    
    animateScroll(scrollRef.current, direction * scrollDistance);
  };

  if (!showEmpty && products.length === 0) {
    return null;
  }

  return (
    <section className="recently-viewed-section">
      <div className="section-header">
        <h2 className="section-title">
          <VisibilityOutlined className="title-icon" />
          <span>{title}</span>
        </h2>
      </div>

      <div className="recently-viewed-carousel-wrapper">
        <button
          className={`carousel-control carousel-control--left ${scrollLeft > 10 ? 'is-visible' : ''}`}
          onClick={() => handleScroll(-1)}
          aria-label="Прокрутити ліворуч"
        >
          <ChevronLeft className="scroll-arrow" />
        </button>

        <div 
          className="recently-viewed-scroll-container" 
          ref={scrollRef}
          onScroll={checkScroll}
        >
          <div className="recently-viewed-inner">
            {products.map((product) => (
              <div key={product._id || product.id} className="carousel-item">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        <button
          className={`carousel-control carousel-control--right ${scrollLeft < maxScroll - 10 ? 'is-visible' : ''}`}
          onClick={() => handleScroll(1)}
          aria-label="Прокрутити праворуч"
        >
          <ChevronRight className="scroll-arrow" />
        </button>
      </div>
    </section>
  );
};

export default RecentlyViewedSection;
