import { Product } from './product';

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export interface CartContextType {
  cart: CartState;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

export interface Advisor {
  name: string;
  phone: string;
  photoUrl?: string;
}

export const ADVISORS: Advisor[] = [
  {
    name: 'Milka',
    phone: '+51938256218',
    photoUrl: undefined // Can add photo path later if needed
  },
  {
    name: 'Ana',
    phone: '+51931257162',
    photoUrl: undefined
  }
];
