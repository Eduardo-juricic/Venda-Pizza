import { Routes, Route } from "react-router-dom";
import HeroSection from "./components/HeroSection";
import DestaquesSection from "./components/DestaquesSection";
import MenuSection from "./components/MenuSection";
import Cart from "./components/Cart";
import AdminPanel from "./components/AdminPanel"; // Importe o AdminPanel
import EditPizza from "./pages/EditPizza"; // Importe o EditPizza
import AdminLogin from "./components/AdminLogin"; // Importe o AdminLogin
import { CartProvider } from "./contexts/CartProvider";
import Layout from "./components/Layout"; // Importe o Layout
import Checkout from "./components/Checkout"; // NÃO ESQUEÇA DE IMPORTAR
import PedidoConfirmado from "./components/PedidoConfirmado"; // NÃO ESQUEÇA DE IMPORTAR
import Cardapio from "./components/Cardapio"; // Importe o componente Cardapio

function App() {
  return (
    <CartProvider>
      <Layout>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <HeroSection />
                <DestaquesSection />
                <MenuSection />
              </>
            }
          />
          <Route path="/cart" element={<Cart />} />
          {/* ROTAS PARA CHECKOUT */}
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/pedido-confirmado" element={<PedidoConfirmado />} />
          {/* Rota para o painel de administração */}
          <Route path="/admin" element={<AdminPanel />} />
          {/* Rota para a página de edição de pizza */}
          <Route path="/admin/edit/:id" element={<EditPizza />} />
          {/* Rota para a página de login administrativo */}
          <Route path="/admin/login" element={<AdminLogin />} />
          {/* Rota para a página de cardápio */}
          <Route path="/cardapio" element={<Cardapio />} />{" "}
          {/* Adicione esta rota */}
          {/* Outras rotas */}
        </Routes>
      </Layout>
    </CartProvider>
  );
}

export default App;
