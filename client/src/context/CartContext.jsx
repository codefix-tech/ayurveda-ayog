import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  // Cart items saved in localStorage
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('ayurveda_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('ayurveda_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('ayurveda_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('ayurveda_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /**
   * Fetch batch split from server when qty >= minBulkQty.
   * Returns split result or null if not applicable / server unavailable.
   */
  const fetchBulkSplit = async (productId, quantity) => {
    try {
      const res = await fetch('/api/batches/split', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity })
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.success ? data : null;
    } catch {
      return null;
    }
  };

  /**
   * addToCart — supports both simple products and batch-split products.
   * When a batchSplitData object is provided (from ProductDetailPage),
   * it is stored directly on the cart item for checkout use.
   */
  const addToCart = async (product, quantity = 1, batchSplitData = null) => {
    const basePrice = product.basePrice || product.price;

    // If no batchSplitData passed, but quantity >= 5, try to calculate
    let split = batchSplitData;
    if (!split && quantity >= 5) {
      split = await fetchBulkSplit(product.id, quantity);
    }

    const effectiveUnitPrice = split && split.isSplit
      ? split.blendedUnitPrice
      : basePrice;

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);

      if (existing) {
        const newTotalQty = existing.quantity + quantity;
        return prev.map(item =>
          item.id === product.id
            ? {
                ...item,
                quantity: newTotalQty,
                basePrice: basePrice,
                price: effectiveUnitPrice,
                isBulkSplit: split ? split.isSplit : item.isBulkSplit,
                blendedUnitPrice: split ? split.blendedUnitPrice : item.blendedUnitPrice,
                batchBreakdown: split ? split.items : item.batchBreakdown
              }
            : item
        );
      }

      return [...prev, {
        ...product,
        basePrice: basePrice,
        quantity,
        price: effectiveUnitPrice,
        isBulkSplit: split ? split.isSplit : false,
        blendedUnitPrice: split ? split.blendedUnitPrice : null,
        batchBreakdown: split ? split.items : [],
        oldBatchOutOfStock: split ? split.oldBatchOutOfStock : false
      }];
    });

    showToast(`Added "${product.title}" (${quantity} unit${quantity > 1 ? 's' : ''}) to cart!`);
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    showToast('Item removed from cart', 'info');
  };

  /**
   * updateQuantity — dynamically re-calculates 30/70 bulk split
   * if quantity reaches >= 5 or drops < 5.
   */
  const updateQuantity = async (productId, delta) => {
    const currentItem = cart.find(item => item.id === productId);
    if (!currentItem) return;

    const newQty = currentItem.quantity + delta;
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    const basePrice = currentItem.basePrice || currentItem.price;

    if (newQty >= 5) {
      // Recalculate split for new quantity
      const split = await fetchBulkSplit(productId, newQty);
      if (split && split.isSplit) {
        setCart(prev =>
          prev.map(item =>
            item.id === productId
              ? {
                  ...item,
                  quantity: newQty,
                  price: split.blendedUnitPrice,
                  isBulkSplit: true,
                  blendedUnitPrice: split.blendedUnitPrice,
                  batchBreakdown: split.items
                }
              : item
          )
        );
        return;
      }
    }

    // Standard price (qty < 5 or single batch)
    setCart(prev =>
      prev.map(item =>
        item.id === productId
          ? {
              ...item,
              quantity: newQty,
              price: basePrice,
              isBulkSplit: false,
              blendedUnitPrice: null,
              batchBreakdown: []
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        showToast(`Removed "${product.title}" from wishlist`, 'info');
        return prev.filter(p => p.id !== product.id);
      } else {
        showToast(`Saved "${product.title}" to wishlist!`);
        return [...prev, product];
      }
    });
  };

  // Total uses effective unit price (blended for split, normal for standard)
  const cartTotal = cart.reduce((sum, item) => {
    const unitPrice = (typeof item.price === 'number' && item.price > 0)
      ? item.price
      : (item.blendedUnitPrice || 0);
    return sum + (unitPrice * item.quantity);
  }, 0);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      cartCount,
      cartTotal,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      fetchBulkSplit,
      removeFromCart,
      updateQuantity,
      clearCart,
      searchQuery,
      setSearchQuery,
      wishlist,
      toggleWishlist,
      toast,
      showToast,
      quickViewProduct,
      setQuickViewProduct
    }}>
      {children}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#152420] text-white px-5 py-3.5 rounded-xl shadow-2xl border border-emerald-500/30 animate-bounce">
          <span className="text-xl">🌿</span>
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
