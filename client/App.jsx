// головний компонент додатку
// налаштовує провайдери контекстів та маршрутизацію

import { RouterProvider } from "react-router-dom";
import { router } from "./router.jsx";
import { CartProvider } from "./hooks/CartState.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

import ScrollToTopButton from './components/common/ScrollToTop/ScrollToTopButton.jsx';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        {/* Floating кнопка "Наверх" для всього сайту */}
        <ScrollToTopButton />

        <RouterProvider router={router} />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

