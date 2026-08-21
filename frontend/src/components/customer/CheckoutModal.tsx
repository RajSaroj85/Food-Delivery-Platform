import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { useOrder } from '../../context/OrderContext.js';
import { Address, PaymentMethod } from '../../types.js';
import {
  X,
  MapPin,
  Plus,
  CreditCard,
  Banknote,
  Smartphone, 
  ShieldCheck,
  CheckCircle2,
  Receipt,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiFetch } from '../../lib/api.js';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { user } = useAuth();
  const { items, restaurantId, restaurantName, subtotal, deliveryFee, tax, discount, totalAmount, appliedCoupon, clearCart } = useCart();
  const { fetchOrders } = useOrder();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddressType, setNewAddressType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [newFullAddress, setNewFullAddress] = useState('');
  const [newHouseNo, setNewHouseNo] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newCity, setNewCity] = useState('San Francisco');
  const [newPincode, setNewPincode] = useState('94110');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState('');

  // Fetch addresses
  const loadAddresses = async () => {
    try {
      const res = await apiFetch(`/addresses?userId=${user?.id || 'user-cust-1'}`);
      const data = await res.json();
      if (data.success && data.data) {
        setAddresses(data.data);
        const def = data.data.find((a: Address) => a.isDefault) || data.data[0];
        if (def) setSelectedAddressId(def.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAddresses();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullAddress && !newStreet) return;

    try {
      const res = await apiFetch('/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'user-cust-1',
          addressType: newAddressType,
          fullAddress: newFullAddress || `${newHouseNo}, ${newStreet}, ${newArea}, ${newCity}, CA ${newPincode}`,
          houseNumber: newHouseNo,
          street: newStreet,
          area: newArea,
          city: newCity,
          state: 'CA',
          pincode: newPincode,
          isDefault: addresses.length === 0,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        await loadAddresses();
        setSelectedAddressId(data.data.id);
        setIsAddingAddress(false);
        setNewFullAddress('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError('Please select a delivery address');
      return;
    }
    if (!restaurantId || items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    const selectedAddr = addresses.find((a) => a.id === selectedAddressId);
    if (!selectedAddr) {
      setError('Address not found');
      return;
    }

    setIsPlacing(true);
    setError('');

    try {
      const orderPayload = {
        customerId: user?.id || 'user-cust-1',
        restaurantId,
        items: items.map((i) => ({
          foodId: i.foodItem.id,
          foodName: i.foodItem.name,
          price: i.foodItem.discountPrice || i.foodItem.price,
          quantity: i.quantity,
          imageUrl: i.foodItem.imageUrl,
          isVegetarian: i.foodItem.isVegetarian,
          instructions: i.instructions,
        })),
        deliveryAddress: selectedAddr,
        paymentMethod,
        couponCode: appliedCoupon?.code,
        specialInstructions,
      };

      const res = await apiFetch('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (data.success && data.data) {
        // Confetti celebration
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {
          // ignore
        }

        clearCart();
        await fetchOrders();
        onClose();
        onOrderSuccess(data.data.id);
      } else {
        setError(data.message || 'Failed to place order');
      }
    } catch (err) {
      setError('An error occurred while placing order.');
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 my-8">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Checkout & Place Order</h2>
              <p className="text-xs text-slate-300">Ordering from <strong>{restaurantName}</strong></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="m-6 mb-0 p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Delivery Address */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>1. Delivery Address</span>
              </h3>
              {!isAddingAddress && (
                <button
                  onClick={() => setIsAddingAddress(true)}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New</span>
                </button>
              )}
            </div>

            {isAddingAddress ? (
              <form onSubmit={handleCreateAddress} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex gap-2">
                  {(['Home', 'Work', 'Other'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewAddressType(type)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                        newAddressType === type
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Full Street Address</label>
                  <input
                    type="text"
                    required
                    value={newFullAddress}
                    onChange={(e) => setNewFullAddress(e.target.value)}
                    placeholder="e.g. Apt 4B, 742 Evergreen Terrace, Mission District, San Francisco, CA 94110"
                    className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="flex-1 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-1.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-lg shadow-xs"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all text-left relative ${
                      selectedAddressId === addr.id
                        ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-200'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        {addr.addressType}
                      </span>
                      {selectedAddressId === addr.id && (
                        <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                      {addr.fullAddress}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Delivery Instructions */}
          <div>
            <h3 className="text-sm font-black text-slate-900 mb-2">2. Delivery Instructions (Optional)</h3>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Please ring the doorbell twice, leave at front door, gate code #4912"
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
            />
          </div>

          {/* Section 3: Payment Method */}
          <div>
            <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-orange-500" />
              <span>3. Select Payment Method</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-orange-500 bg-orange-50 text-orange-950 ring-2 ring-orange-200'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-600 mb-2" />
                <span className="font-bold">Cash on Delivery</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Pay with cash upon arrival</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  paymentMethod === 'UPI'
                    ? 'border-orange-500 bg-orange-50 text-orange-950 ring-2 ring-orange-200'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Smartphone className="w-5 h-5 text-blue-600 mb-2" />
                <span className="font-bold">Instant UPI / QR</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Google Pay, PhonePe, Paytm</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CREDIT_CARD')}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  paymentMethod === 'CREDIT_CARD'
                    ? 'border-orange-500 bg-orange-50 text-orange-950 ring-2 ring-orange-200'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <CreditCard className="w-5 h-5 text-purple-600 mb-2" />
                <span className="font-bold">Credit / Debit Card</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Visa, Mastercard, Amex</span>
              </button>
            </div>
          </div>

          {/* Section 4: Order Summary Review */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-900 pb-2 border-b border-slate-200">
              <span>Items ({items.reduce((s, i) => s + i.quantity, 0)})</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Delivery Fee</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Tax (8.25%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex items-center justify-between text-emerald-600 font-bold">
                <span>Coupon ({appliedCoupon?.code})</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-black text-slate-900">
              <span>Grand Total</span>
              <span className="text-base text-orange-600">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Secure 256-bit encrypted checkout</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isPlacing || items.length === 0}
            className="py-3.5 px-8 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black text-sm shadow-md shadow-orange-500/25 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            {isPlacing ? (
              <span>Placing Order...</span>
            ) : (
              <>
                <span>Place Order (${totalAmount.toFixed(2)})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
