// client/components/common/ScrollToTop/ScrollToTopButton.jsx
// Кнопка "наверх" - floating button з плавним скроллом
import { useState, useEffect } from "react";
import { Fab, Zoom } from "@mui/material";
import { KeyboardArrowUp } from "@mui/icons-material";
import "./ScrollToTopButton.scss";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Відстежуємо позицію скроллу
  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300); // показуємо при скроллі > 300px
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Функція скроллу наверх
  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // плавний скролл
    });
  };

  return (
    <div>
      <Zoom in={isVisible}>
        <Fab
          size="medium"
          aria-label="Прокрутити наверх"
          onClick={handleClick}
          className="scroll-to-top-btn"
          sx={{
            position: "fixed",
            zIndex: 900,
            // Десктоп: внизу справа
            bottom: { xs: "auto", md: 24 },
            right: { xs: 16, md: 24 },
            // Мобілка: зверху над нижнім меню
            top: { xs: "auto", md: "auto" }, // залишаємо дефолт
            // Перевизначаємо для мобілки (xs)
            "@media (max-width: 900px)": {
              bottom: 140,
            }
          }}
        >
          <KeyboardArrowUp fontSize="medium" />
        </Fab>
      </Zoom>
    </div>
  );
};

export default ScrollToTopButton;
