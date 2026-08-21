import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Order, OrderStatus } from '../types.js';
import { apiFetch } from '../lib/api.js';

interface OrderContextType {
  orders: Order[];
  activeOrder: Order | null;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  fetchOrders: () => Promise<void>;
  getOrderById: (id: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<boolean>;
  cancelOrder: (orderId: string, reason?: string) => Promise<{ success: boolean; message: string }>;
  stepSimulationForward: (orderId: string) => Promise<void>;
  isLoading: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const ORDER_LIFECYCLE_STEPS: OrderStatus[] = [ 
  'PENDING',
  'CONFIRMED',
  'RESTAURANT_ACCEPTED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'PICKED_UP',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>('ord-1001');
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiFetch('/orders');
      const data = await res.json();
      if (data.success && data.data) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000); // Polling for live updates
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const activeOrder = orders.find((o) => o.id === selectedOrderId) || orders.find((o) => !['DELIVERED', 'CANCELLED', 'REJECTED'].includes(o.orderStatus)) || orders[0] || null;

  const getOrderById = (id: string) => orders.find((o) => o.id === id);

  const updateOrderStatus = async (orderId: string, status: OrderStatus, note?: string): Promise<boolean> => {
    try {
      const res = await apiFetch(`/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrders();
        return true;
      }
    } catch (err) {
      console.error('Update status error:', err);
    }
    return false;
  };

  const cancelOrder = async (orderId: string, reason = 'Cancelled by customer'): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await apiFetch(`/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrders();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Cannot cancel order at this stage' };
    } catch (err) {
      return { success: false, message: 'Failed to cancel order' };
    }
  };

  const stepSimulationForward = async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const currentIdx = ORDER_LIFECYCLE_STEPS.indexOf(order.orderStatus);
    if (currentIdx > -1 && currentIdx < ORDER_LIFECYCLE_STEPS.length - 1) {
      const nextStatus = ORDER_LIFECYCLE_STEPS[currentIdx + 1];
      await updateOrderStatus(orderId, nextStatus, `Simulated progression to ${nextStatus}`);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        activeOrder,
        selectedOrderId,
        setSelectedOrderId,
        fetchOrders,
        getOrderById,
        updateOrderStatus,
        cancelOrder,
        stepSimulationForward,
        isLoading,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrder must be used within an OrderProvider');
  return context;
};
