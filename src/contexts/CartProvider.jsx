// src/contexts/CartProvider.jsx
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { CartContext } from "./CartContext";

const CART_STORAGE_KEY = "pizzaCart";

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    return storedCart ? JSON.parse(storedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) => cartItem.id === item.id && cartItem.size === item.size
      );
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id && cartItem.size === item.size
            ? { ...cartItem, quantity: (cartItem.quantity || 1) + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId, size) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.id !== itemId || item.size !== size)
    );
  };

  const updateQuantity = (itemId, size, quantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId && item.size === size
          ? { ...item, quantity: parseInt(quantity, 10) }
          : item
      )
    );
  };

  const updateSize = (itemId, currentSize, newSize, newPrice) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId && item.size === currentSize
          ? { ...item, size: newSize, price: newPrice }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const updateItemObservation = (itemId, size, observation) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId && item.size === size
          ? { ...item, observation }
          : item
      )
    );
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateSize,
        clearCart,
        updateItemObservation,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
