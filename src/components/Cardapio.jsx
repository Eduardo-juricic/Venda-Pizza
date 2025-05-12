import { useState, useEffect, useContext } from "react";
import { CartContext } from "../contexts/CartContext";

const Cardapio = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [filter, setFilter] = useState("todos");
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    fetch("http://localhost:5000/api/menu")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setMenuItems(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (filter === "todos") {
      setFilteredItems(menuItems);
    } else {
      const filtered = menuItems.filter(
        (item) => item.category === filter.toLowerCase()
      );
      setFilteredItems(filtered);
    }
  }, [menuItems, filter]);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleComprar = (item) => {
    const availableSizes = Object.keys(item.price).filter(
      (key) => item.price[key]
    );
    if (availableSizes.length > 0) {
      const defaultSize = availableSizes[0];
      const priceForDefaultSize =
        parseFloat(
          item.price[defaultSize]?.replace("R$ ", "").replace(",", ".")
        ) || 0;
      const itemComImagemETamanho = {
        ...item,
        image: `http://localhost:5000/images/${item.imagePath}`,
        size: defaultSize,
        price: priceForDefaultSize,
        availableSizes: Object.keys(item.price).filter(
          (key) => item.price[key]
        ),
        prices: item.price,
      };
      addToCart(itemComImagemETamanho);
      alert(`${item.name} (Tamanho: ${defaultSize}) adicionada ao carrinho!`);
    } else {
      alert(`A pizza ${item.name} não possui tamanhos disponíveis.`);
    }
  };

  const renderPrices = (prices) => {
    const priceLabels = {
      pequena: "Pequena",
      media: "Média",
      grande: "Grande",
      familia: "Família",
    };
    return Object.entries(prices) // eslint-disable-next-line no-unused-vars
      .filter(([size, price]) => price)
      .map(([size, price]) => (
        <p key={size} className="text-sm text-gray-500">
          {priceLabels[size]}: R$ {price}
        </p>
      ));
  };

  if (loading) {
    return <div className="p-6 font-sans">Carregando o cardápio...</div>;
  }

  if (error) {
    return (
      <div className="p-6 font-sans">Erro ao carregar o cardápio: {error}</div>
    );
  }

  return (
    <div className="p-6 font-sans">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Nosso Cardápio</h2>

      <div className="mb-4">
        <label
          htmlFor="filter"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Filtrar por:
        </label>
        <select
          id="filter"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={filter}
          onChange={handleFilterChange}
        >
          <option value="todos">Todos</option>
          <option value="salgada">Salgadas</option>
          <option value="doce">Doces</option>
          <option value="vegetariana">Vegetarianas</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white shadow rounded p-4 flex flex-col justify-between"
          >
            <div>
              <img
                src={`http://localhost:5000/images/${item.imagePath}`}
                alt={item.name}
                className="w-full h-32 object-cover rounded-md mb-2"
              />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">
                {item.name}
              </h3>
              <p className="text-gray-600 text-sm mb-2">{item.description}</p>
              <div className="mb-2">
                <p className="text-sm text-gray-500">Preços:</p>
                {renderPrices(item.price)}
              </div>
            </div>
            <button
              onClick={() => handleComprar(item)}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-2"
            >
              Comprar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cardapio;
