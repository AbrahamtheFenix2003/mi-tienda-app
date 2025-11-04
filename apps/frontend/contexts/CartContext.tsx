'use client';

import React, { createContext, useEffect, useState, useCallback } from 'react';
import { Product, CartState, CartContextType, CartItem } from '@mi-tienda/types';

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'mi-tienda-cart';

const initialCartState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartState>(initialCartState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  // Calculate cart totals
  const calculateTotals = useCallback((items: CartItem[]) => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    return { totalItems, totalAmount };
  }, []);

  // Add product to cart
  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.items.findIndex(
        (item) => item.product.id === product.id
      );

      let newItems: CartItem[];

      if (existingItemIndex > -1) {
        // Update existing item
        newItems = [...prevCart.items];
        const existingItem = newItems[existingItemIndex];
        const newQuantity = Math.min(
          existingItem.quantity + quantity,
          product.stock
        );
        newItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          subtotal: newQuantity * product.price,
        };
      } else {
        // Add new item
        const validQuantity = Math.min(quantity, product.stock);
        newItems = [
          ...prevCart.items,
          {
            product,
            quantity: validQuantity,
            subtotal: validQuantity * product.price,
          },
        ];
      }

      const { totalItems, totalAmount } = calculateTotals(newItems);

      return {
        items: newItems,
        totalItems,
        totalAmount,
      };
    });
  }, [calculateTotals]);

  // Remove product from cart
  const removeFromCart = useCallback((productId: string) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter(
        (item) => item.product.id !== productId
      );
      const { totalItems, totalAmount } = calculateTotals(newItems);

      return {
        items: newItems,
        totalItems,
        totalAmount,
      };
    });
  }, [calculateTotals]);

  // Update item quantity
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prevCart) => {
      const newItems = prevCart.items
        .map((item) => {
          if (item.product.id === productId) {
            const validQuantity = Math.max(
              0,
              Math.min(quantity, item.product.stock)
            );
            if (validQuantity === 0) {
              return null; // Will be filtered out
            }
            return {
              ...item,
              quantity: validQuantity,
              subtotal: validQuantity * item.product.price,
            };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);

      const { totalItems, totalAmount } = calculateTotals(newItems);

      return {
        items: newItems,
        totalItems,
        totalAmount,
      };
    });
  }, [calculateTotals]);

  // Clear cart
  const clearCart = useCallback(() => {
    setCart(initialCartState);
  }, []);

  // Check if product is in cart
  const isInCart = useCallback(
    (productId: string) => {
      return cart.items.some((item) => item.product.id === productId);
    },
    [cart.items]
  );

  // Get item quantity
  const getItemQuantity = useCallback(
    (productId: string) => {
      const item = cart.items.find((item) => item.product.id === productId);
      return item ? item.quantity : 0;
    },
    [cart.items]
  );

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export { CartContext };
