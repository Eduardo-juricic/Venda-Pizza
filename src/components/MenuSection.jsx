// src/components/MenuSection.jsx
import { useState, useEffect } from "react";
import MenuItem from "./MenuItem";

function MenuSection() {
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const fetchHomepageMenu = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/menu?homepage=true"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMenuItems(data);
      } catch (error) {
        console.error("Erro ao buscar o menu para a página principal:", error);
        // Opcional: Exibir uma mensagem de erro para o usuário
      }
    };

    fetchHomepageMenu();
  }, []);

  return (
    <section className="py-20 bg-gray-100">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-heading text-primary font-bold mb-16">
          Nosso Delicioso Menu
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems.map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default MenuSection;
