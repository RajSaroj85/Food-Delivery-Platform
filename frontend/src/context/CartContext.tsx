import React, { createContext, useContext, useState, useEffect } from 'react';
import { FoodItem, CartItem, Coupon, Restaurant } from '../types.js';
import { apiFetch } from '../lib/api.js';

interface CartContextType {
  restaurantId: string | null;
  restaurantName: string | null;
  restaurant: Restaurant | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  totalAmount: number;
  appliedCoupon: Coupon | null;
  isCartOpen: boolean; 
  setIsCartOpen: (open: boolean) => void;
  addItem: (foodItem: FoodItem, quantity?: number, instructions?: string) => { success: boolean; requiresConfirm?: boolean; oldRestName?: string };
  forceAddItem: (foodItem: FoodItem, quantity?: number, instructions?: string) => void;
  removeItem: (foodId: string) => void;
  updateQuantity: (foodId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  isConflictModalOpen: boolean;
  setIsConflictModalOpen: (open: boolean) => void;
  pendingFoodItem: { item: FoodItem; quantity: number } | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [restaurantId, setRestaurantId] = useState<string | null>('rest-1');
  const [restaurantName, setRestaurantName] = useState<string | null>('Bella Italia Trattoria');
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [items, setItems] = useState<CartItem[]>([
    {
      foodItem: {
        id: 'food-101',
        restaurantId: 'rest-1',
        restaurantName: 'Bella Italia Trattoria',
        categoryId: 'cat-pizza',
        categoryName: 'Pizza',
        name: 'Margherita Burrata Speciale',
        description: 'San Marzano tomatoes, fresh creamy burrata, sweet basil, olive oil.',
        price: 18.99,
        discountPrice: 15.99,
        imageUrl: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500&auto=format&fit=crop&q=80',
        isAvailable: true,
        isVegetarian: true,
        preparationTime: 15,
        createdAt: '',
        updatedAt: '',
      },
      quantity: 1,
    },
  ]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>({
    id: 'coup-1',
    code: 'WELCOME100',
    description: '20% OFF on your order',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    minimumOrderAmount: 20.0,
    maximumDiscount: 15.0,
    startDate: '2025-01-01',
    expiryDate: '2027-12-31',
    usageLimit: 1000,
    usedCount: 142,
    isActive: true,
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [pendingFoodItem, setPendingFoodItem] = useState<{ item: FoodItem; quantity: number } | null>(null);

  // Fetch restaurant details when restaurantId changes
  useEffect(() => {
    if (restaurantId) {
      apiFetch(`/restaurants/${restaurantId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setRestaurant(data.data);
            setRestaurantName(data.data.name);
          }
        })
        .catch(console.error);
    } else {
      setRestaurant(null);
      setRestaurantName(null);
    }
  }, [restaurantId]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = Number(
    items
      .reduce((sum, item) => {
        const itemPrice = item.foodItem.discountPrice || item.foodItem.price;
        return sum + itemPrice * item.quantity;
      }, 0)
      .toFixed(2)
  );

  const deliveryFee = items.length > 0 ? (restaurant?.deliveryFee || 2.99) : 0;
  const tax = Number((subtotal * 0.0825).toFixed(2));

  let discount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minimumOrderAmount) {
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      discount = Math.min((subtotal * appliedCoupon.discountValue) / 100, appliedCoupon.maximumDiscount);
    } else {
      discount = appliedCoupon.discountValue;
    }
  }
  discount = Number(discount.toFixed(2));

  const totalAmount = Number(Math.max(0, subtotal + deliveryFee + tax - discount).toFixed(2));

  const addItem = (foodItem: FoodItem, quantity = 1, instructions?: string) => {
    // Check if cart has items from another restaurant (Rule 8)
    if (items.length > 0 && restaurantId && restaurantId !== foodItem.restaurantId) {
      setPendingFoodItem({ item: foodItem, quantity });
      setIsConflictModalOpen(true);
      return { success: false, requiresConfirm: true, oldRestName: restaurantName || 'another restaurant' };
    }

    setRestaurantId(foodItem.restaurantId);
    setRestaurantName(foodItem.restaurantName || null);

    setItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.foodItem.id === foodItem.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        if (instructions) updated[existingIdx].instructions = instructions;
        return updated;
      } else { 
        return [...prev, { foodItem, quantity, instructions }];
      }
    });

    return { success: true };
  };

  const forceAddItem = (foodItem: FoodItem, quantity = 1, instructions?: string) => {
    setRestaurantId(foodItem.restaurantId);
    setRestaurantName(foodItem.restaurantName || null);
    setItems([{ foodItem, quantity, instructions }]);
    setIsConflictModalOpen(false);
    setPendingFoodItem(null);
  };

  const removeItem = (foodId: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.foodItem.id !== foodId);
      if (updated.length === 0) {
        setRestaurantId(null);
        setRestaurantName(null);
      }
      return updated;
    });
  };

  const updateQuantity = (foodId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(foodId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.foodItem.id === foodId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
    setRestaurantName(null);
    setAppliedCoupon(null);
  };

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await apiFetch('/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartAmount: subtotal, restaurantId }),
      });
      const data = await res.json();
      if (data.success && data.data?.coupon) {
        setAppliedCoupon(data.data.coupon);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Invalid coupon code' };
      }
    } catch (err: any) {
      return { success: false, message: 'Failed to validate coupon' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        restaurantId,
        restaurantName,
        restaurant,
        items,
        itemCount,
        subtotal,
        deliveryFee,
        tax,
        discount,
        totalAmount,
        appliedCoupon,
        isCartOpen,
        setIsCartOpen,
        addItem,
        forceAddItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        isConflictModalOpen,
        setIsConflictModalOpen,
        pendingFoodItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
