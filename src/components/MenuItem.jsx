// src/components/MenuItem.jsx
import { useState, useContext } from "react";
import { CartContext } from "../contexts/CartContext";
import PropTypes from "prop-types";

function MenuItem({ item }) {
  const { addToCart } = useContext(CartContext);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [isMessageVisible, setIsMessageVisible] = useState(false);

  const handleAddToCart = () => {
    const availableSizes = Object.keys(item.price || {}).filter(
      (key) => item.price?.[key]
    );

    const itemBase = {
      ...item,
      image: `http://localhost:5000/images/${item.imagePath}`, // Adicione a propriedade 'image'
      imagePath: `http://localhost:5000/images/${item.imagePath}`, // Mantenha imagePath também
    };

    if (availableSizes.length > 0) {
      const defaultSize = availableSizes[0];
      const priceForDefaultSize =
        parseFloat(
          item.price?.[defaultSize]?.replace("R$ ", "").replace(",", ".")
        ) || 0;

      const itemParaCarrinho = {
        ...itemBase,
        size: defaultSize,
        price: priceForDefaultSize,
        availableSizes: availableSizes,
        prices: item.price,
      };
      addToCart(itemParaCarrinho);
      setConfirmationMessage(
        `${item.name} (Tamanho: ${defaultSize}) adicionada ao carrinho!`
      );
    } else {
      addToCart(itemBase);
      setConfirmationMessage(`${item.name} adicionada ao carrinho!`);
    }

    setIsMessageVisible(true);
    setTimeout(() => {
      setIsMessageVisible(false);
      setConfirmationMessage("");
    }, 5000);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 relative">
      {item.imagePath && (
        <img
          src={`http://localhost:5000/images/${item.imagePath}`}
          alt={item.name}
          className="w-full h-48 object-cover rounded-md mb-4"
        />
      )}
      <h3 className="text-xl font-semibold text-text-primary mb-2">
        {item.name}
      </h3>
      <p className="text-text-secondary text-sm mb-4">{item.description}</p>
      <div className="text-sm font-medium text-gray-700 mb-4">
        {item.price?.pequena && <p>Pequena: {item.price.pequena}</p>}
        {item.price?.media && <p>Média: {item.price.media}</p>}
        {item.price?.grande && <p>Grande: {item.price.grande}</p>}
        {item.price?.familia && <p>Família: {item.price.familia}</p>}
      </div>
      <button
        className="bg-primary text-white font-semibold rounded-md py-2 px-4 hover:bg-primary-light transition-colors duration-300 w-full"
        onClick={handleAddToCart}
      >
        Comprar
      </button>
      {isMessageVisible && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-md shadow-lg z-50">
          {confirmationMessage}
        </div>
      )}
    </div>
  );
}

MenuItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    price: PropTypes.object,
    imagePath: PropTypes.string,
  }).isRequired,
};

export default MenuItem;
