import React from "react";
import {
  Category as CategoryIcon,
  Laptop,
  Smartphone,
  Tablet,
} from "@mui/icons-material";

export const getCategoryIcon = (iconName) => {
  switch (iconName) {
    case "Smartphone":
      return <Smartphone />;
    case "Laptop":
      return <Laptop />;
    case "Tablet":
      return <Tablet />;
    default:
      return <CategoryIcon />;
  }
};
