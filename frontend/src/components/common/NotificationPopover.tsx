import React, { useState, useEffect } from 'react';
import { NotificationItem } from '../../types.js';
import { apiFetch } from '../../lib/api.js';
import { Bell, CheckCheck, ShoppingBag, Bike, Shield, DollarSign, X } from 'lucide-react';

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder?: (orderId: string) => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  isOpen,
  onClose,
  onSelectOrder,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/notifications');
      const data = await res.json();
      if (data.success && data.data) {
        setNotifications(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen]);

  const markAllAsRead = async () => {
    try {
      await apiFetch('/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-orange-400" />
          <span className="font-semibold text-sm">Notifications</span>
          {notifications.filter((n) => !n.read).length > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-bold bg-orange-500 text-white rounded-full">
              {notifications.filter((n) => !n.read).length} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            title="Mark all as read"
            className="text-xs text-slate-300 hover:text-white flex items-center gap-1 p-1 hover:bg-slate-800 rounded-md transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark read</span>
          </button>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
        {loading ? (
          <div className="p-6 text-center text-xs text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">No notifications yet</div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                if (notif.orderId && onSelectOrder) {
                  onSelectOrder(notif.orderId);
                  onClose();
                }
              }}
              className={`p-3 text-left transition-colors flex items-start gap-3 hover:bg-slate-50 cursor-pointer ${
                !notif.read ? 'bg-orange-50/40' : 'bg-white'
              }`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                  notif.type === 'ORDER'
                    ? 'bg-orange-100 text-orange-600'
                    : notif.type === 'DELIVERY'
                    ? 'bg-emerald-100 text-emerald-600'
                    : notif.type === 'PAYMENT'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-purple-100 text-purple-600'
                }`}
              >
                {notif.type === 'ORDER' ? (
                  <ShoppingBag className="w-4 h-4" />
                ) : notif.type === 'DELIVERY' ? (
                  <Bike className="w-4 h-4" />
                ) : notif.type === 'PAYMENT' ? (
                  <DollarSign className="w-4 h-4" />
                ) : (
                  <Shield className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-900 truncate">{notif.title}</h4>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                  {notif.message}
                </p>
                {notif.orderId && (
                  <span className="inline-block mt-1 text-[10px] font-medium text-orange-600 hover:underline">
                    View order status →
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
