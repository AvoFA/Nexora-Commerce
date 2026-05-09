// Хук для доступу до кошика з будь-якого компонента
import { useContext } from "react";
import { CartContext } from "./CartState.jsx";

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
