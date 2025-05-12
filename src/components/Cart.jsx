// src/components/Cart.jsx
import { useContext } from "react";
import { CartContext } from "../contexts/CartContext";
import { Link, useNavigate } from "react-router-dom";

function Cart() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    updateItemObservation,
    updateSize,
  } = useContext(CartContext);

  const navigate = useNavigate();

  const getPriceForSize = (item, size) => {
    if (item.prices && typeof item.prices === "object" && item.prices[size]) {
      return (
        parseFloat(item.prices[size]?.replace("R$ ", "").replace(",", ".")) || 0
      );
    }
    return typeof item.price === "number" ? item.price : 0;
  };

  const calculateTotal = () => {
    return cart
      .reduce((total, item) => {
        return total + getPriceForSize(item, item.size) * item.quantity;
      }, 0)
      .toFixed(2);
  };

  const handleCheckoutClick = () => {
    navigate("/checkout");
  };

  const handleSizeChange = (itemId, currentSize, newSize) => {
    const itemToUpdate = cart.find(
      (item) => item.id === itemId && item.size === currentSize
    );
    if (itemToUpdate) {
      const newPrice = getPriceForSize(itemToUpdate, newSize);
      updateSize(itemId, currentSize, newSize, newPrice);
    }
  };

  return (
    <div className="cart-page-container">
      <div className="py-10 container mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Seu Carrinho</h2>
        {!cart || cart.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-600">Adicione algumas pizzas deliciosas!</p>
            <Link
              to="/"
              className="inline-block mt-4 bg-primary text-white font-semibold rounded-md py-2 px-4 hover:bg-primary-light transition-colors duration-300"
            >
              Voltar ao Menu
            </Link>
          </div>
        ) : (
          <ul>
            {cart.map((item) => (
              <li
                key={`${item.id}-${item.size}`}
                className="flex flex-col py-4 border-b"
              >
                <div className="flex items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded mr-4"
                  />
                  <div className="flex-grow">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      {item.description?.substring(0, 60)}...
                    </p>
                    <div className="flex items-center mt-2">
                      <label
                        htmlFor={`size-${item.id}`}
                        className="mr-2 text-sm"
                      >
                        Tamanho:
                      </label>
                      <select
                        id={`size-${item.id}`}
                        className="w-24 border rounded text-sm"
                        value={item.size}
                        onChange={(e) =>
                          handleSizeChange(item.id, item.size, e.target.value)
                        }
                      >
                        {item.availableSizes &&
                          item.availableSizes.map((size) => (
                            <option key={size} value={size}>
                              {size.charAt(0).toUpperCase() + size.slice(1)}
                            </option>
                          ))}
                      </select>
                      <label
                        htmlFor={`quantity-${item.id}`}
                        className="ml-4 mr-2 text-sm"
                      >
                        Qtd:
                      </label>
                      <input
                        type="number"
                        id={`quantity-${item.id}`}
                        className="w-16 border rounded text-center text-sm"
                        value={item.quantity}
                        onChange={(e) => {
                          const newQuantity = parseInt(e.target.value);
                          if (!isNaN(newQuantity) && newQuantity > 0) {
                            updateQuantity(item.id, item.size, newQuantity);
                          }
                        }}
                        min="1"
                      />
                      <span className="ml-4 text-sm font-semibold">
                        R${" "}
                        {(
                          getPriceForSize(item, item.size) * item.quantity
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id, item.size)}
                    className="ml-4 text-red-500 hover:text-red-700"
                  >
                    Remover
                  </button>
                </div>
                <div className="mt-2">
                  <label
                    htmlFor={`observation-${item.id}`}
                    className="block text-gray-700 text-sm font-bold mb-1"
                  >
                    Observações:
                  </label>
                  <textarea
                    id={`observation-${item.id}`}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                    rows="2"
                    placeholder="Alguma observação sobre este item?"
                    value={item.observation || ""}
                    onChange={(e) =>
                      updateItemObservation(item.id, item.size, e.target.value)
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
        {cart && cart.length > 0 && (
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={clearCart}
              className="bg-red-500 text-white font-semibold rounded-md py-2 px-4 hover:bg-red-700 transition-colors duration-300"
            >
              Limpar Carrinho
            </button>
            <div className="text-xl font-semibold">
              Total: R$ {calculateTotal()}
            </div>
          </div>
        )}
        {cart && cart.length > 0 && (
          <div className="mt-6 text-right">
            <button
              onClick={handleCheckoutClick}
              className="inline-block bg-primary text-white font-semibold rounded-md py-3 px-6 hover:bg-primary-light transition-colors duration-300"
            >
              Finalizar Pedido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
