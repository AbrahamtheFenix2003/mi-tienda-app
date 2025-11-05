'use client';

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Product } from '@mi-tienda/types';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: number) => number;
  totalItems: number;
  totalPrice: number;
  isEmpty: boolean;
}

const STORAGE_KEY = 'mi-tienda-cart-v1';

export const CartContext = createContext<CartContextValue | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const hasLoadedFromStorage = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as unknown;
        if (Array.isArray(parsed)) {
          const sanitized: CartItem[] = parsed
            .filter((entry): entry is CartItem => {
              if (!entry || typeof entry !== 'object') return false;
              const product = (entry as CartItem).product;
              const quantity = (entry as CartItem).quantity;
              return !!product && typeof product === 'object' && typeof quantity === 'number' && quantity > 0;
            })
            .map((entry) => ({
              product: entry.product,
              quantity: Math.max(1, Math.floor(entry.quantity)),
            }));
          if (sanitized.length > 0) {
            setItems(sanitized);
          }
        }
      }
    } catch (error) {
      console.error('No se pudo cargar la cesta desde almacenamiento local:', error);
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      hasLoadedFromStorage.current = true;
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!hasLoadedFromStorage.current) return;

    try {
      const payload = JSON.stringify(items);
      window.localStorage.setItem(STORAGE_KEY, payload);
    } catch (error) {
      console.error('No se pudo guardar la cesta en almacenamiento local:', error);
    }
  }, [items]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    if (!product || product.stock <= 0) return;
    const normalizedQuantity = Math.max(1, Math.floor(quantity));

    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const maxAllowed = Math.max(existing.product.stock, 0);
        if (maxAllowed <= 0) {
          return prev;
        }
        const newQuantity = Math.min(existing.quantity + normalizedQuantity, maxAllowed);
        if (newQuantity === existing.quantity) {
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQuantity } : item
        );
      }

      const cappedQuantity = Math.min(normalizedQuantity, Math.max(product.stock, 0));
      return [...prev, { product, quantity: cappedQuantity }];
    });
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id !== productId) return item;
          const maxAllowed = Math.max(item.product.stock, 0);
          const nextQuantity = Math.min(Math.max(0, Math.floor(quantity)), maxAllowed);
          return { ...item, quantity: nextQuantity };
        })
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getItemQuantity = useCallback(
    (productId: number) => items.find((item) => item.product.id === productId)?.quantity ?? 0,
    [items]
  );

  const { totalItems, totalPrice } = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const price = Number.parseFloat(item.product.price);
        const normalizedPrice = Number.isFinite(price) ? price : 0;
        acc.totalItems += item.quantity;
        acc.totalPrice += normalizedPrice * item.quantity;
        return acc;
      },
      { totalItems: 0, totalPrice: 0 }
    );
  }, [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      getItemQuantity,
      totalItems,
      totalPrice,
      isEmpty: items.length === 0,
    }),
    [items, addItem, updateQuantity, removeItem, clearCart, getItemQuantity, totalItems, totalPrice]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
