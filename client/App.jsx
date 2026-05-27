// Main application component setting up context providers and routing

import { RouterProvider } from "react-router-dom";
import { router } from "./router.jsx";
import { CartProvider } from "./hooks/CartState.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CompareProvider } from "./context/CompareContext.jsx";

import ScrollToTopButton from './components/common/ScrollToTop/ScrollToTopButton.jsx';

function App() {
  return (
    <AuthProvider>
      <CompareProvider>
        <CartProvider>
          {/* Floating ScrollToTop button available site-wide */}
          <ScrollToTopButton />

          <RouterProvider router={router} />
        </CartProvider>
      </CompareProvider>
    </AuthProvider>
  );
}

export default App;

