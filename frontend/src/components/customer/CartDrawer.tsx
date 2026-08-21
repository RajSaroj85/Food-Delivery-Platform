import React, { useState } from 'react';
import { useCart } from '../../context/CartContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { useOrder } from '../../context/OrderContext.js';
import {
  X,
  Trash2,
  Plus,
  Minus, 
  Tag,
  ArrowRight,
  ShoppingBag,
  Store,
  AlertTriangle,
  Receipt,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    isCartOpen,
    setIsCartOpen,
    items,
    restaurantName,
    subtotal,
    deliveryFee,
    tax,
    discount,
    totalAmount,
    appliedCoupon,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    isConflictModalOpen,
    setIsConflictModalOpen,
    pendingFoodItem,
    forceAddItem,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  if (!isCartOpen && !isConflictModalOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsApplyingCoupon(true);
    setCouponMessage(null);
    const res = await applyCoupon(couponInput.trim());
    setIsApplyingCoupon(false);
    setCouponMessage({ text: res.message, isError: !res.success });
    if (res.success) {
      setCouponInput('');
    }
  };

  return (
    <>
      {/* Slide-over Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base">Your Cart</h2>
                    {restaurantName && (
                      <p className="text-[11px] text-slate-300 flex items-center gap-1">
                        <Store className="w-3 h-3 text-orange-400" />
                        <span>{restaurantName}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {items.length > 0 && (
                    <button
                      onClick={clearCart}
                      title="Clear Cart"
                      className="p-1.5 text-xs text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="w-16 h-16 rounded-3xl bg-orange-50 text-orange-500 flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-base">Your cart is empty</h3>
                    <p className="text-xs text-slate-400 max-w-xs">
                      Good food is always just a few taps away. Explore our menu and pick something delicious!
                    </p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="mt-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                    >
                      Browse Restaurants
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="divide-y divide-slate-100">
                      {items.map(({ foodItem, quantity, instructions }) => {
                        const price = foodItem.discountPrice || foodItem.price;
                        return (
                          <div key={foodItem.id} className="py-3.5 flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <div
                                  className={`w-3.5 h-3.5 border-2 rounded-xs flex items-center justify-center p-0.5 ${
                                    foodItem.isVegetarian ? 'border-emerald-600' : 'border-amber-700'
                                  }`}
                                >
                                  <div
                                    className={`w-1 h-1 rounded-full ${
                                      foodItem.isVegetarian ? 'bg-emerald-600' : 'bg-amber-700'
                                    }`}
                                  />
                                </div>
                                <h4 className="text-xs font-bold text-slate-800 truncate">{foodItem.name}</h4>
                              </div>

                              <div className="text-xs font-semibold text-slate-900 mt-1">
                                ${(price * quantity).toFixed(2)}
                                <span className="text-[10px] text-slate-400 font-normal ml-1">
                                  (${price.toFixed(2)} each)
                                </span>
                              </div>

                              {instructions && (
                                <p className="text-[10px] text-slate-400 italic mt-0.5 truncate">
                                  Note: {instructions}
                                </p>
                              )}
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1 shrink-0">
                              <button
                                onClick={() => updateQuantity(foodItem.id, quantity - 1)}
                                className="w-6 h-6 rounded-lg bg-white shadow-2xs flex items-center justify-center text-slate-700 hover:text-orange-600 hover:bg-orange-50"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-slate-900 w-4 text-center">
                                {quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(foodItem.id, quantity + 1)}
                                className="w-6 h-6 rounded-lg bg-white shadow-2xs flex items-center justify-center text-slate-700 hover:text-orange-600 hover:bg-orange-50"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Coupons Section */}
                    <div className="pt-4 border-t border-slate-100">
                      <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-orange-500" />
                        <span>Promotional Coupon</span>
                      </label>

                      {appliedCoupon ? (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                              {appliedCoupon.code} Applied
                            </span>
                            <p className="text-[11px] text-emerald-600">Saved ${discount.toFixed(2)}</p>
                          </div>
                          <button
                            onClick={removeCoupon}
                            className="text-xs font-semibold text-red-600 hover:underline p-1"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleApplyCoupon} className="flex gap-2">
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            placeholder="Try WELCOME100 or FOODGO50"
                            className="flex-1 px-3 py-2 text-xs uppercase font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                          />
                          <button
                            type="submit"
                            disabled={isApplyingCoupon || !couponInput.trim()}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors"
                          >
                            {isApplyingCoupon ? '...' : 'Apply'}
                          </button>
                        </form>
                      )}

                      {couponMessage && (
                        <p
                          className={`text-[11px] mt-1.5 font-medium ${
                            couponMessage.isError ? 'text-red-600' : 'text-emerald-600'
                          }`}
                        >
                          {couponMessage.text}
                        </p>
                      )}
                    </div>

                    {/* Bill Breakdown */}
                    <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Item Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Delivery Fee</span>
                        <span>${deliveryFee.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Taxes & Platform Charges (8.25%)</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex items-center justify-between text-emerald-600 font-bold">
                          <span>Coupon Discount</span>
                          <span>-${discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-black text-slate-900">
                        <span>To Pay</span>
                        <span className="text-base text-orange-600">${totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Checkout Footer Button */}
              {items.length > 0 && (
                <div className="p-4 bg-slate-50 border-t border-slate-200">
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      onProceedToCheckout();
                    }}
                    className="w-full py-3.5 px-6 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/25 flex items-center justify-between transition-all active:scale-[0.99]"
                  >
                    <div className="text-left">
                      <div className="text-[11px] text-orange-100 font-medium">
                        {items.reduce((s, i) => s + i.quantity, 0)} items
                      </div>
                      <div className="text-sm font-black">${totalAmount.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs uppercase tracking-wider font-bold">
                      <span>Checkout</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cart Conflict Modal (Rule 8: One restaurant per cart) */}
      {isConflictModalOpen && pendingFoodItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Replace cart items?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your cart currently contains dishes from <strong>{restaurantName}</strong>. A cart can only hold items from one restaurant at a time.
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => forceAddItem(pendingFoodItem.item, pendingFoodItem.quantity)}
                className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                Clear Cart & Add New Item
              </button>
              <button
                onClick={() => {
                  setIsConflictModalOpen(false);
                }}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Keep Existing Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
