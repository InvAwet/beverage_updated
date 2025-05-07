import React, { createContext, useContext, useState, useEffect } from 'react';
import { Beverage } from '@shared/schema';

export type CartItem = {
  id: number;
  quantity: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (beverage: Beverage) => void;
  removeFromCart: (beverageId: number) => void;
  updateQuantity: (beverageId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
};

const CartContext = createContext<CartContextType | null>(null);

type PriceCache = Record<number, number>;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [priceCache, setPriceCache] = useState<PriceCache>({});
  
  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('beverage-cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
      
      const savedPrices = localStorage.getItem('beverage-prices');
      if (savedPrices) {
        setPriceCache(JSON.parse(savedPrices));
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('beverage-cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems]);
  
  // Save prices to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('beverage-prices', JSON.stringify(priceCache));
    } catch (error) {
      console.error('Error saving prices to localStorage:', error);
    }
  }, [priceCache]);

  const addToCart = (beverage: Beverage) => {
    // Update price cache
    setPriceCache(prev => ({
      ...prev,
      [beverage.id]: beverage.unitPrice
    }));
    
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === beverage.id);
      
      if (existingItem) {
        return prevItems.map(item => 
          item.id === beverage.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { id: beverage.id, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (beverageId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== beverageId));
  };

  const updateQuantity = (beverageId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(beverageId);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === beverageId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const subtotal = cartItems.reduce((sum, item) => {
    const price = priceCache[item.id] || 0;
    return sum + (price * item.quantity);
  }, 0);

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart,
        totalItems,
        subtotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}