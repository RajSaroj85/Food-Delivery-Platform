import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { apiFetch } from '../../lib/api.js';
import { useOrder } from '../../context/OrderContext.js';
import { Order, DeliveryPartner } from '../../types.js';
import {
  Bike,
  Navigation,
  CheckCircle2,
  DollarSign,
  Phone,
  Store, 
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  Compass,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const DeliveryDashboard: React.FC = () => {
  const { user } = useAuth();
  const { orders, updateOrderStatus, fetchOrders } = useOrder();

  const [partner, setPartner] = useState<DeliveryPartner | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadPartnerData = async () => {
    try {
      const partnerId = user?.deliveryPartnerId || 'deliv-1';
      const res = await apiFetch(`/delivery/partners/${partnerId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setPartner(data.data);
        setIsOnline(data.data.isAvailable);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartnerData();
  }, [user]);

  const toggleAvailability = async () => {
    try {
      const newStatus = !isOnline;
      setIsOnline(newStatus);
      const partnerId = user?.deliveryPartnerId || 'deliv-1';
      await apiFetch(`/delivery/partners/${partnerId}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: newStatus }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Find active orders assigned to this partner or ready for pickup
  const partnerId = user?.deliveryPartnerId || 'deliv-1';

  // Active delivery assigned to this driver
  const activeDelivery = orders.find(
    (o) =>
      o.deliveryPartnerId === partnerId &&
      ['READY_FOR_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)
  );

  // Available ready orders for assignment
  const unassignedOrders = orders.filter(
    (o) => o.orderStatus === 'READY_FOR_PICKUP' && !o.deliveryPartnerId
  );

  // Completed deliveries by this driver
  const completedDeliveries = orders.filter(
    (o) => o.deliveryPartnerId === partnerId && o.orderStatus === 'DELIVERED'
  );

  const totalEarnings = completedDeliveries.length * 6.5 + (partner?.earnings || 84.5);

  const handleAcceptDelivery = async (orderId: string) => {
    try {
      await apiFetch(`/delivery/orders/${orderId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryPartnerId: partnerId,
          deliveryPartnerName: user?.name || 'Liam Vance',
          deliveryPartnerPhone: user?.phone || '+1 (555) 456-7890',
        }),
      });
      await fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header & Status Toggle */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
            <Bike className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">{user?.name || 'Delivery Partner'}</h1>
              <span className="text-xs bg-orange-500 text-white font-bold px-2 py-0.5 rounded-md uppercase">
                {partner?.vehicleType || 'Electric Scooter'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Vehicle Reg: <strong>{partner?.vehicleNumber || 'SF-EV-442'}</strong> • Zone: Mission District
            </p>
          </div>
        </div>

        {/* Live Availability Toggle Button */}
        <div className="flex items-center gap-4 bg-slate-800/90 p-3 rounded-2xl border border-slate-700">
          <div>
            <div className="text-xs font-bold text-white">Duty Status</div>
            <div className={`text-[11px] font-bold ${isOnline ? 'text-emerald-400' : 'text-slate-400'}`}>
              {isOnline ? '🟢 ONLINE & READY' : '⚪ OFFLINE (PAUSED)'}
            </div>
          </div>

          <button
            onClick={toggleAvailability}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all shadow-xs ${
              isOnline
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            }`}
          >
            {isOnline ? 'Go Offline' : 'Go Online'}
          </button>
        </div>
      </div>

      {/* Driver Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Today's Earnings</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">${totalEarnings.toFixed(2)}</div>
          <span className="text-[10px] text-slate-500">+$6.50 per delivery base + tips</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Completed Trips</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {completedDeliveries.length + (partner?.totalDeliveries || 18)}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">100% on-time delivery</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Customer Rating</span>
          <div className="text-2xl font-black text-amber-500 mt-1 flex items-center gap-1">
            <Star className="w-5 h-5 fill-current" />
            <span>{(partner?.rating || 4.9).toFixed(1)}</span>
          </div>
          <span className="text-[10px] text-slate-500">5-star gold badge driver</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Active Distance</span>
          <div className="text-2xl font-black text-blue-600 mt-1">14.2 km</div>
          <span className="text-[10px] text-slate-500">Zero emission electric</span>
        </div>
      </div>

      {/* Active Trip Section */}
      {activeDelivery ? (
        <div className="bg-white rounded-3xl border-2 border-orange-500 p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 animate-ping" />
              <h2 className="text-base font-black text-slate-900">
                Active Order Delivery In Progress
              </h2>
              <span className="text-xs font-mono font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md">
                #{activeDelivery.orderNumber}
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 font-semibold">Trip Payout</span>
              <div className="text-base font-black text-emerald-600">+$7.50</div>
            </div>
          </div>

          {/* Restaurant Pickup & Dropoff Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-200/60 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-orange-600 tracking-wider">
                Step 1: Restaurant Pickup
              </span>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Store className="w-4 h-4 text-orange-500" />
                <span>{activeDelivery.restaurantName}</span>
              </h4>
              <p className="text-xs text-slate-600">{activeDelivery.restaurantAddress}</p>
              <div className="pt-2">
                <a
                  href={`tel:${activeDelivery.restaurantPhone}`}
                  className="text-xs font-bold text-orange-600 hover:underline inline-flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call Kitchen ({activeDelivery.restaurantPhone})</span>
                </a>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/60 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-emerald-600 tracking-wider">
                Step 2: Customer Delivery Drop-off
              </span>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>{activeDelivery.customerName}</span>
              </h4>
              <p className="text-xs text-slate-600">{activeDelivery.deliveryAddress.fullAddress}</p>
              <div className="pt-2 flex items-center gap-3">
                <a
                  href={`tel:${activeDelivery.customerPhone}`}
                  className="text-xs font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call Customer ({activeDelivery.customerPhone})</span>
                </a>
              </div>
            </div>
          </div>

          {/* Delivery Transition Controls (PRD Sec 14) */}
          <div className="p-4 bg-slate-900 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-orange-400">Current Trip Stage:</div>
              <div className="text-sm font-extrabold">{activeDelivery.orderStatus.replace(/_/g, ' ')}</div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {activeDelivery.orderStatus === 'READY_FOR_PICKUP' && (
                <button
                  onClick={() => updateOrderStatus(activeDelivery.id, 'PICKED_UP', 'Driver collected food parcel')}
                  className="w-full sm:w-auto px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95"
                >
                  ✓ Confirm Food Picked Up
                </button>
              )}

              {activeDelivery.orderStatus === 'PICKED_UP' && (
                <button
                  onClick={() => updateOrderStatus(activeDelivery.id, 'OUT_FOR_DELIVERY', 'Driver on the way to customer')}
                  className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95"
                >
                  🚀 Start Riding (Out for Delivery)
                </button>
              )}

              {activeDelivery.orderStatus === 'OUT_FOR_DELIVERY' && (
                <button
                  onClick={() => updateOrderStatus(activeDelivery.id, 'DELIVERED', 'Delivered safely to customer hands')}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark as Successfully Delivered!</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Available Orders Waiting for Pickup */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Available Delivery Requests ({unassignedOrders.length})
            </h2>
            <span className="text-xs text-slate-500">Auto-refreshing live GPS opportunities</span>
          </div>

          {unassignedOrders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No pending pickups right now</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Stay online! You will be notified the instant a restaurant kitchen finishes packaging an order.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unassignedOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Order #{order.orderNumber}</span>
                      <span className="text-xs font-black text-emerald-600">+$6.50 + tip</span>
                    </div>

                    <div className="text-xs text-slate-700 space-y-1">
                      <p>
                        🏪 <strong>Pickup:</strong> {order.restaurantName} ({order.restaurantAddress})
                      </p>
                      <p>
                        📍 <strong>Drop:</strong> {order.deliveryAddress.fullAddress}
                      </p>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      {order.items.length} items • Est. distance 2.4 km
                    </div>
                  </div>

                  <button
                    onClick={() => handleAcceptDelivery(order.id)}
                    className="w-full py-2.5 bg-slate-900 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Accept Delivery Request</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
