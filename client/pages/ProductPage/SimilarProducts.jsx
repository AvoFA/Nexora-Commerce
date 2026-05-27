import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import ProductCard from "../../components/catalog/ProductCard/ProductCard.jsx";

/**
 * Section for similar products with a smooth-scroll carousel,
 * matching the style of the Home Page's recently viewed items.
 */
const SimilarProducts = ({ similarProducts }) => {
  const scrollRef = useRef(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);

  // Enable carousel if there are more than 6 products
  const isCarousel = similarProducts?.length > 6;

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft: currentScroll, scrollWidth, clientWidth } = scrollRef.current;
    setScrollLeft(currentScroll);
    setMaxScroll(scrollWidth - clientWidth);
  }, []);

  useEffect(() => {
    if (isCarousel) {
      checkScroll();
      const timer = setTimeout(checkScroll, 300);
      window.addEventListener('resize', checkScroll);
      return () => {
        window.removeEventListener('resize', checkScroll);
        clearTimeout(timer);
      };
    }
  }, [similarProducts, checkScroll, isCarousel]);

  const animateScroll = (element, distance) => {
    // Prevent overlapping animations during rapid clicks
    if (element.dataset.animating === "true") return;
    element.dataset.animating = "true";

    const start = element.scrollLeft;
    const startTime = performance.now();
    const duration = 500; // Animation duration

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutQuart: fast start, smooth deceleration
      const ease = 1 - Math.pow(1 - progress, 4);

      element.scrollLeft = start + (distance * ease);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.dataset.animating = "false";
        checkScroll();
      }
    };

    requestAnimationFrame(step);
  };

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;

    // Carousel step: 240px card width + 24px gap
    const scrollDistance = 264 * 2;

    animateScroll(scrollRef.current, direction * scrollDistance);
  };

  if (!similarProducts || similarProducts.length === 0) return null;

  return (
    <div className="similar-products-section">
      <h2 className="section-title">Схожі товари</h2>
      <p className="section-subtitle">Вам також можуть сподобатися</p>

      {isCarousel ? (
        <div className="similar-products-carousel-wrapper">
          <button
            className={`carousel-control carousel-control--left ${scrollLeft > 20 ? 'is-visible' : ''}`}
            onClick={() => handleScroll(-1)}
            aria-label="Прокрутити ліворуч"
          >
            <ChevronLeft className="scroll-arrow" />
          </button>

          <div
            className="similar-products-scroll-container"
            ref={scrollRef}
            onScroll={checkScroll}
          >
            <div className="similar-products-inner">
              {similarProducts.map((product) => (
                <div key={product._id || product.id} className="carousel-item">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          <button
            className={`carousel-control carousel-control--right ${maxScroll > 100 && scrollLeft < maxScroll - 20 ? 'is-visible' : ''}`}
            onClick={() => handleScroll(1)}
            aria-label="Прокрутити праворуч"
          >
            <ChevronRight className="scroll-arrow" />
          </button>
        </div>
      ) : (
        <div className="similar-products-static-grid">
          {similarProducts.map((product) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SimilarProducts;
