import { Link } from "react-router-dom";
import { ShoppingCartIcon } from "@heroicons/react/24/outline"; // Importe o ícone do Heroicons

function Navbar() {
  return (
    <nav className="bg-white shadow-md py-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-semibold text-primary">
          Delicia Pizza
        </Link>
        <div>
          <Link
            to="/cart"
            className="text-gray-700 hover:text-primary flex items-center"
          >
            <ShoppingCartIcon className="h-6 w-6 mr-2" />{" "}
            {/* Adicione o ícone aqui */}
            Carrinho
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
