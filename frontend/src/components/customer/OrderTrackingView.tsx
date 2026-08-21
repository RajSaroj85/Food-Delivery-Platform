import React, { useState, useEffect } from 'react';
import { useOrder } from '../../context/OrderContext.js';
import { Order, OrderStatus } from '../../types.js';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Bike,
  Store,
  Phone,
  MessageSquare,
  AlertCircle,
  Play,
  RotateCcw,
  Star,
  ChevronRight,
  Shield,
  Utensils,
  Navigation,
} from 'lucide-react';
import { ReviewModal } from '../common/ReviewModal.js';

interface OrderTrackingViewProps {
  orderId?: string | null;
  onBrowseMore: () => void;
}

const LIFECYCLE_STEPS: { status: OrderStatus; label: string; description: string }[] = [
  { status: 'PENDING', label: 'Order Placed', description: 'Your order was sent to the kitchen' },
  { status: 'CONFIRMED', label: 'Payment Confirmed', description: 'Order confirmed and verified' },
  { status: 'RESTAURANT_ACCEPTED', label: 'Accepted by Kitchen', description: 'Chef has accepted your order' },
  { status: 'PREPARING', label: 'Food Preparing', description: 'Dishes are being cooked fresh' },
  { status: 'READY_FOR_PICKUP', label: 'Ready for Pickup', description: 'Packaged & waiting for driver' },
  { status: 'PICKED_UP', label: 'Picked Up by Driver', description: 'Driver collected the order' },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', description: 'Driver is on the way to you' },
  { status: 'DELIVERED', label: 'Delivered', description: 'Enjoy your delicious meal!' },
];

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({ orderId, onBrowseMore }) => {
  const { orders, activeOrder, getOrderById, cancelOrder, stepSimulationForward, fetchOrders } = useOrder();

  const currentOrder = (orderId ? getOrderById(orderId) : null) || activeOrder || orders[0];
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  if (!currentOrder) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
        <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-3xl flex items-center justify-center mx-auto">
          <Utensils className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">No Active Orders to Track</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          You don't have any active deliveries right now. Place an order to watch live tracking!
        </p>
        <button
          onClick={onBrowseMore}
          className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          Explore Restaurants
        </button>
      </div>
    );
  }

  const currentStepIdx = LIFECYCLE_STEPS.findIndex((s) => s.status === currentOrder.orderStatus);
  const isDelivered = currentOrder.orderStatus === 'DELIVERED';
  const isCancelled = currentOrder.orderStatus === 'CANCELLED' || currentOrder.orderStatus === 'REJECTED';

  // Can cancel only before PREPARING stage (PRD Rule 5)
  const canCancel = ['PENDING', 'CONFIRMED', 'RESTAURANT_ACCEPTED'].includes(currentOrder.orderStatus);

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setIsCancelling(true);
    const res = await cancelOrder(currentOrder.id, 'Cancelled by customer before preparation');
    setIsCancelling(false);
    setCancelMessage(res.message);
  };

  // Map driver animation progress based on status
  let driverProgressPercent = 10;
  if (currentOrder.orderStatus === 'RESTAURANT_ACCEPTED') driverProgressPercent = 20;
  if (currentOrder.orderStatus === 'PREPARING') driverProgressPercent = 35;
  if (currentOrder.orderStatus === 'READY_FOR_PICKUP') driverProgressPercent = 50;
  if (currentOrder.orderStatus === 'PICKED_UP') driverProgressPercent = 65;
  if (currentOrder.orderStatus === 'OUT_FOR_DELIVERY') driverProgressPercent = 85;
  if (currentOrder.orderStatus === 'DELIVERED') driverProgressPercent = 100;

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Top Banner with Estimated Time & Quick Sim Controller */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-orange-500 text-white font-bold text-xs px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                Order #{currentOrder.orderNumber}
              </span>
              <span className="text-xs text-slate-400">
                Placed at {new Date(currentOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {isDelivered
                ? '🎉 Order Delivered Successfully!'
                : isCancelled
                ? 'Order Cancelled'
                : 'Arriving in ~' + currentOrder.estimatedDeliveryTimeMinutes + ' mins'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-2">
              <Store className="w-4 h-4 text-orange-400" />
              <span>Ordering from <strong>{currentOrder.restaurantName}</strong></span>
            </p>
          </div>

          {/* Quick Simulation Stepper for Testing / Demo */}
          <div className="bg-slate-800/90 border border-slate-700/80 p-3 rounded-2xl flex flex-col sm:flex-row items-center gap-2.5">
            <div className="text-left">
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Play className="w-3 h-3 fill-current" />
                <span>Simulation Tool</span>
              </div>
              <div className="text-xs text-slate-300">Test full order lifecycle</div>
            </div>

            {!isDelivered && !isCancelled && (
              <button
                onClick={() => stepSimulationForward(currentOrder.id)}
                className="w-full sm:w-auto px-3.5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>Advance Next Stage ⚡</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {cancelMessage && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800">
          {cancelMessage} 
        </div>
      )}

      {/* Main Grid: Interactive Map (Left) & Step Stepper + Driver Info (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Interactive Map Visualizer */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Navigation className="w-4 h-4 text-orange-500" />
              <span>Live GPS Delivery Radar</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>GPS Active</span>
            </div>
          </div>

          {/* Interactive Styled Canvas / Map Graphic */}
          <div className="relative h-72 sm:h-80 bg-slate-100 flex items-center justify-center overflow-hidden">
            {/* Map Grid Pattern */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #cbd5e1 1px, transparent 1px), linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)',
                backgroundSize: '24px 24px, 48px 48px, 48px 48px',
              }}
            />

            {/* Road path */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 60,180 Q 180,60 300,160 T 520,120"
                fill="none"
                stroke="#fed7aa"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M 60,180 Q 180,60 300,160 T 520,120"
                fill="none"
                stroke="#f97316"
                strokeWidth="4"
                strokeDasharray="8 6"
                strokeLinecap="round"
              />
            </svg>

            {/* Restaurant Pin (Left) */}
            <div className="absolute left-8 bottom-16 sm:left-14 sm:bottom-20 z-10 flex flex-col items-center">
              <div className="w-11 h-11 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-lg ring-4 ring-orange-200">
                <Store className="w-5 h-5" />
              </div>
              <span className="mt-1.5 text-[11px] font-bold text-slate-800 bg-white/90 px-2 py-0.5 rounded-md shadow-2xs">
                {currentOrder.restaurantName.split(' ')[0]}
              </span>
            </div>

            {/* Customer Pin (Right) */}
            <div className="absolute right-8 top-16 sm:right-16 sm:top-20 z-10 flex flex-col items-center">
              <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg ring-4 ring-slate-200">
                <MapPin className="w-5 h-5 text-orange-400" />
              </div>
              <span className="mt-1.5 text-[11px] font-bold text-slate-800 bg-white/90 px-2 py-0.5 rounded-md shadow-2xs">
                Delivery Point
              </span>
            </div>

            {/* Animated Delivery Partner (Moving according to progress) */}
            {!isCancelled && (
              <div
                className="absolute z-20 transition-all duration-700 flex flex-col items-center"
                style={{
                  left: `${Math.max(18, Math.min(80, driverProgressPercent))}%`,
                  top: `${Math.max(25, Math.min(65, 75 - driverProgressPercent * 0.5))}%`,
                }}
              >
                <div className="relative">
                  <span className="absolute -inset-2 rounded-full bg-orange-400/40 animate-ping" />
                  <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-xl ring-4 ring-white">
                    <Bike className="w-5 h-5" />
                  </div>
                </div>
                <span className="mt-1 text-[10px] font-extrabold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full shadow-2xs">
                  {currentOrder.deliveryPartnerName || 'Assigned Driver'}
                </span>
              </div>
            )}
          </div>

          {/* Delivery Partner Info Card */}
          <div className="p-5 border-t border-slate-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden ring-2 ring-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                  alt="Driver"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  {currentOrder.deliveryPartnerName || 'Liam Vance'}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                  <span className="flex items-center text-amber-500 font-bold">
                    <Star className="w-3 h-3 fill-current mr-0.5" /> 4.9
                  </span>
                  <span>•</span>
                  <span>Electric EV (SF-EV-442)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${currentOrder.deliveryPartnerPhone || '+15554567890'}`}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                title="Call Driver"
              >
                <Phone className="w-4 h-4" />
              </a>
              <button
                onClick={() => alert(`Calling restaurant at ${currentOrder.restaurantPhone}`)}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Help
              </button>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Step-by-Step Status Lifecycle & Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Order Details Accordion */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Live Order Stages
            </h3>

            {/* Stepper */}
            <div className="space-y-4">
              {LIFECYCLE_STEPS.map((step, idx) => {
                const isPassed = currentStepIdx > idx;
                const isCurrent = currentStepIdx === idx;
                const isPending = currentStepIdx < idx;

                return (
                  <div key={step.status} className="flex items-start gap-3 relative">
                    {/* Connecting line */}
                    {idx < LIFECYCLE_STEPS.length - 1 && (
                      <div
                        className={`absolute left-3.5 top-7 bottom-0 w-0.5 -mb-4 ${
                          isPassed ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      />
                    )}

                    {/* Step Icon */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 z-10 transition-all ${
                        isPassed
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : isCurrent
                          ? 'bg-orange-500 text-white ring-4 ring-orange-100 shadow-md font-bold'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4
                        className={`text-xs font-bold ${
                          isCurrent
                            ? 'text-orange-600 font-extrabold'
                            : isPassed
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rate Order Button (When Delivered) */}
            {isDelivered && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Star className="w-4 h-4 fill-current" />
                  <span>Rate Food & Delivery</span>
                </button>
              </div>
            )}

            {/* Cancel Order Option (If eligible before cooking) */}
            {canCancel && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                  className="w-full py-2 px-4 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition-colors"
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Order (Free)'}
                </button>
              </div>
            )}
          </div>

          {/* Ordered Items Summary */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Ordered Items ({currentOrder.items.length})
            </h4>
            <div className="divide-y divide-slate-100 text-xs">
              {currentOrder.items.map((item, i) => (
                <div key={i} className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.quantity}x</span>
                    <span className="text-slate-700">{item.foodName}</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-900">
              <span>Total Paid ({currentOrder.paymentMethod})</span>
              <span className="text-sm text-orange-600">${currentOrder.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <ReviewModal
          order={currentOrder}
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onReviewSubmitted={() => {
            fetchOrders();
          }}
        />
      )}
    </div>
  );
};
