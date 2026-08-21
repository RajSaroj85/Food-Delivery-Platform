import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext.js';
import { useCart } from '../../context/CartContext.js';
import { Order } from '../../types.js';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Star,
  ExternalLink,  
  ChevronRight,
  Store,
} from 'lucide-react';
import { ReviewModal } from '../common/ReviewModal.js';

interface OrderHistoryViewProps {
  onTrackOrder: (orderId: string) => void;
  onBrowseRestaurants: () => void;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({
  onTrackOrder,
  onBrowseRestaurants,
}) => {
  const { orders } = useOrder();
  const { addItem, setIsCartOpen } = useCart();
  const [selectedReviewOrder, setSelectedReviewOrder] = useState<Order | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Delivered' };
      case 'CANCELLED':
      case 'REJECTED':
        return { bg: 'bg-red-50 text-red-700 border-red-200', icon: XCircle, label: 'Cancelled' };
      case 'OUT_FOR_DELIVERY':
        return { bg: 'bg-orange-50 text-orange-700 border-orange-200 font-bold', icon: Clock, label: 'Out for Delivery' };
      default:
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock, label: status.replace(/_/g, ' ') };
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Order History</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View status, repeat previous orders, and submit ratings
          </p>
        </div>
        <button
          onClick={onBrowseRestaurants}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start"
        >
          Order Food Now
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No past orders found</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Your tasty history starts here. Browse top restaurants and place your first order!
          </p>
          <button
            onClick={onBrowseRestaurants}
            className="mt-2 px-5 py-2.5 bg-orange-500 text-white text-xs font-bold rounded-xl"
          >
            Explore Restaurants
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const badge = getStatusBadge(order.orderStatus);
            const BadgeIcon = badge.icon;
            const isDelivered = order.orderStatus === 'DELIVERED';

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left: Restaurant & Order items */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <img
                      src={order.restaurantImage || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80'}
                      alt={order.restaurantName}
                      className="w-12 h-12 rounded-2xl object-cover ring-1 ring-slate-100"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {order.restaurantName}
                        </h3>
                        <span className="text-xs text-slate-400 font-mono">#{order.orderNumber}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString()} at{' '}
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100/80">
                    <p className="font-medium">
                      {order.items.map((i) => `${i.quantity}x ${i.foodName}`).join(', ')}
                    </p>
                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between font-bold text-slate-900">
                      <span>Total Paid ({order.paymentMethod})</span>
                      <span className="text-orange-600 text-sm">${order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Status & Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 shrink-0">
                  {/* Status Badge */}
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${badge.bg}`}
                  >
                    <BadgeIcon className="w-3.5 h-3.5" />
                    <span>{badge.label}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => onTrackOrder(order.id)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Track Status</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {isDelivered && (
                      <button
                        onClick={() => setSelectedReviewOrder(order)}
                        className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{order.ratingSubmitted ? 'Reviewed' : 'Rate'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {selectedReviewOrder && (
        <ReviewModal
          order={selectedReviewOrder}
          isOpen={!!selectedReviewOrder}
          onClose={() => setSelectedReviewOrder(null)}
          onReviewSubmitted={() => {
            setSelectedReviewOrder(null);
          }}
        />
      )}
    </div>
  );
};
