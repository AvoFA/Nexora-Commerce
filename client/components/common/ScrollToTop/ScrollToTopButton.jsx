// Floating "scroll to top" button with smooth scroll behavior
import { useState, useEffect } from "react";
import { Fab, Zoom } from "@mui/material";
import { KeyboardArrowUp } from "@mui/icons-material";
import "./ScrollToTopButton.scss";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Monitor scroll position
  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Scroll to top handler
  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
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
            bottom: { xs: "auto", md: 24 },
            right: { xs: 16, md: 24 },
            top: { xs: "auto", md: "auto" },
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
