import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { storeApi } from '../api/storeApi';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [isCartLoading, setIsCartLoading] = useState(true);

  // 1. Helper to sync calculations instantly
  const updateCartState = (items) => {
    // Failsafe: Ensure items is always an array
    const safeItems = Array.isArray(items) ? items : [];
    
    setCartItems(safeItems);
    const total = safeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const count = safeItems.reduce((sum, item) => sum + item.quantity, 0);
    
    setCartTotal(total);
    setCartCount(count);
  };

  // 2. The Fetch Engine (Waits for Auth, then fetches)
  useEffect(() => {
    let isMounted = true;

    const fetchCart = async () => {
      // Gatekeeper: Do nothing while AuthContext is still loading the session
      if (isAuthLoading) return;

      // 🟢 RELAXED CHECK: If any user is logged in, fetch their cart
      if (user) {
        setIsCartLoading(true);
        try {
          const data = await storeApi.getCart();
          
          if (isMounted) {
            // Accommodate different backend response structures safely
            const itemsToLoad = data?.items || data?.cart?.items || [];
            updateCartState(itemsToLoad);
          }
        } catch (err) {
          console.error("Cart fetch failed on reload:", err);
        } finally {
          if (isMounted) setIsCartLoading(false);
        }
      } else {
        // If explicitly logged out, wipe the UI
        if (isMounted) {
          updateCartState([]);
          setIsCartLoading(false);
        }
      }
    };

    fetchCart();

    return () => { isMounted = false; };
  }, [user, isAuthLoading]);

  // --- API Methods ---

  const addToCart = async (product) => {
    if (!user) return toast.error("Please log in to add items.");
    
    // Failsafe Image Extraction
    const image = product?.images?.[0]?.url || product?.image || product?.imageUrl || 'https://via.placeholder.com/150';

    try {
      const data = await storeApi.addToCart({
        product: product._id,
        name: product.name,
        price: product.price,
        image: image
      });
      updateCartState(data?.items || []);
      toast.success("Added to cart!");
    } catch (err) {
      console.error("Add to cart error:", err);
      toast.error("Failed to add item");
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return removeFromCart(productId);
    try {
      const data = await storeApi.updateCartQuantity(productId, quantity);
      updateCartState(data?.items || []);
    } catch (err) {
      toast.error("Failed to update quantity");
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const data = await storeApi.removeFromCart(productId);
      updateCartState(data?.items || []);
      toast.success("Item removed");
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  const clearCart = async () => {
    try {
      await storeApi.clearCartDB();
      updateCartState([]);
    } catch (err) {
      toast.error("Failed to clear cart");
    }
  };
  

  return (
    <CartContext.Provider value={{ 
      cartItems, cartTotal, cartCount, isCartLoading, 
      addToCart, removeFromCart, updateQuantity, clearCart 
    }}>
      {children}
    </CartContext.Provider>
  );
};

// 🟢 CRITICAL FIX: This was incorrectly pointing to AuthContext previously!
export const useCart = () => useContext(CartContext);