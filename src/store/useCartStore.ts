import { create } from 'zustand';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  quantity: number;
  stock: number;
}

interface CartStore {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: JSON.parse(localStorage.getItem('cart') || '[]'),

  addToCart: (product) => {
    const currentCart = get().cart;
    const existingIndex = currentCart.findIndex((item) => item.id === product.id);

    let updatedCart;
    if (existingIndex > -1) {
      updatedCart = [...currentCart];
      const newQty = updatedCart[existingIndex].quantity + 1;
      if (newQty <= product.stock) {
        updatedCart[existingIndex].quantity = newQty;
      }
    } else {
      updatedCart = [...currentCart, { ...product, quantity: 1 }];
    }

    localStorage.setItem('cart', JSON.stringify(updatedCart));
    set({ cart: updatedCart });
  },

  removeFromCart: (productId) => {
    const updatedCart = get().cart.filter((item) => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    set({ cart: updatedCart });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) return;
    const updatedCart = get().cart.map((item) =>
      item.id === productId ? { ...item, quantity: Math.min(quantity, item.stock) } : item
    );
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    set({ cart: updatedCart });
  },

  clearCart: () => {
    localStorage.removeItem('cart');
    set({ cart: [] });
  },

  getTotalPrice: () => {
    return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
  },
}));
