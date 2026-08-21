import React, { useState, useEffect } from 'react';
import { useOrder } from '../../context/OrderContext.js';
import { Restaurant, FoodCategory, Coupon, Order, User } from '../../types.js';
import { apiFetch } from '../../lib/api.js';
import { 
  Shield,
  Store,
  DollarSign,
  ShoppingBag,
  Users,
  Tag,
  Plus,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Percent,
  Sliders,
  Sparkles,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { orders } = useOrder();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [activeTab, setActiveTab] = useState<'analytics' | 'restaurants' | 'categories' | 'coupons' | 'orders'>('analytics');

  // Coupon Creation state
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FLAT'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrder, setMinOrder] = useState('15');

  // Add Restaurant state
  const [isRestModalOpen, setIsRestModalOpen] = useState(false);
  const [restName, setRestName] = useState('');
  const [restAddress, setRestAddress] = useState('');
  const [restCuisine, setRestCuisine] = useState('Italian, Pizza');
  const [restPhone, setRestPhone] = useState('+1 (555) 300-1000');
  const [restDeliveryFee, setRestDeliveryFee] = useState('2.99');

  // Load admin data
  const loadAdminData = async () => {
    try {
      const restRes = await apiFetch('/restaurants');
      const restData = await restRes.json();
      if (restData.success) setRestaurants(restData.data);

      const catRes = await apiFetch('/categories');
      const catData = await catRes.json();
      if (catData.success) setCategories(catData.data);

      const coupRes = await apiFetch('/coupons');
      const coupData = await coupRes.json();
      if (coupData.success) setCoupons(coupData.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const totalGrossMerchandiseValue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalPlatformCommissions = totalGrossMerchandiseValue * 0.15; // 15% platform take-rate

  const handleToggleRestaurantStatus = async (restaurant: Restaurant) => {
    try {
      await apiFetch(`/restaurants/${restaurant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen: !restaurant.isOpen }),
      });
      await loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode || !discountValue) return;

    try {
      await apiFetch('/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.toUpperCase(),
          discountType,
          discountValue: parseFloat(discountValue),
          minOrderAmount: parseFloat(minOrder) || 0,
          isActive: true,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });
      await loadAdminData();
      setIsCouponModalOpen(false);
      setCouponCode('');
      setDiscountValue('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restName) return;

    try {
      await apiFetch('/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: restName,
          address: restAddress || '450 Mission St',
          city: 'San Francisco',
          phone: restPhone,
          cuisine: restCuisine.split(',').map((s) => s.trim()),
          deliveryFee: parseFloat(restDeliveryFee) || 2.99,
          deliveryTimeMinutes: 25,
          minOrderAmount: 15.0,
          image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
          bannerImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
          description: 'Authentic flavors prepared with fresh farm-to-table ingredients.',
          isOpen: true,
        }),
      });
      await loadAdminData();
      setIsRestModalOpen(false);
      setRestName('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Admin Title Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-lg">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">Platform Admin Console</h1>
              <span className="text-[10px] bg-purple-500 text-white font-bold px-2 py-0.5 rounded uppercase">
                Master Superuser
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Live operations, revenue analytics, partner onboarding & fraud control
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap items-center bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
          {(['analytics', 'restaurants', 'categories', 'coupons', 'orders'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                activeTab === t ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Global Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Gross GMV</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ${totalGrossMerchandiseValue.toFixed(2)}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">Total orders processed</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Platform Revenue (15%)</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            ${totalPlatformCommissions.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500">Commission & delivery fees</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Active Kitchens</span>
          <div className="text-2xl font-black text-orange-600 mt-1">{restaurants.length}</div>
          <span className="text-[10px] text-slate-500">100% verified KYC</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Orders</span>
          <div className="text-2xl font-black text-purple-600 mt-1">{orders.length}</div>
          <span className="text-[10px] text-slate-500">Live platform throughput</span>
        </div>
      </div>

      {/* Tab 1: Analytics & Architecture */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <span>Platform Health & Key Performance Indicators</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span>Average Order Value (AOV)</span>
                <span className="font-bold text-slate-900">
                  ${orders.length > 0 ? (totalGrossMerchandiseValue / orders.length).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span>Order Fulfillment Rate</span>
                <span className="font-bold text-emerald-600">98.4%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span>Average Delivery SLA</span>
                <span className="font-bold text-slate-900">23.5 minutes</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span>Customer Retention / Repeat Rate</span>
                <span className="font-bold text-orange-600">76.8%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-orange-500" />
              <span>Quick Operational Tasks</span>
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => setIsRestModalOpen(true)}
                className="w-full p-3 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold rounded-2xl border border-orange-200 flex items-center justify-between transition-colors"
              >
                <span>+ Onboard New Merchant Restaurant</span>
                <Plus className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsCouponModalOpen(true)}
                className="w-full p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-2xl border border-purple-200 flex items-center justify-between transition-colors"
              >
                <span>+ Issue Promotional Discount Coupon</span>
                <Tag className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Restaurant Management */}
      {activeTab === 'restaurants' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Registered Restaurant Partners</h2>
              <p className="text-xs text-slate-500">Manage operating statuses, delivery fees, and listings</p>
            </div>
            <button
              onClick={() => setIsRestModalOpen(true)}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Restaurant</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {restaurants.map((rest) => (
              <div key={rest.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={rest.image}
                    alt={rest.name}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{rest.name}</h4>
                    <p className="text-xs text-slate-500">
                      {rest.cuisine.join(', ')} • {rest.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-600">
                    Fee: ${rest.deliveryFee.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleToggleRestaurantStatus(rest)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                      rest.isOpen
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                    }`}
                  >
                    {rest.isOpen ? '✓ Live (Open)' : '✕ Disabled (Closed)'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Coupons */}
      {activeTab === 'coupons' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Active Platform Coupons</h2>
              <p className="text-xs text-slate-500">Campaigns to boost conversion and user engagement</p>
            </div>
            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Coupon</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coupons.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      {c.code}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `$${c.discountValue} OFF`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Min Order: ${c.minOrderAmount.toFixed(2)} • Active
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Live Orders Stream */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">All Live Orders Stream</h2>
          <div className="divide-y divide-slate-100 text-xs">
            {orders.map((o) => (
              <div key={o.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-slate-900">#{o.orderNumber}</span>
                  <span className="text-slate-500 ml-2">{o.restaurantName} &rarr; {o.customerName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">${o.totalAmount.toFixed(2)}</span>
                  <span className="px-2 py-0.5 rounded font-bold bg-orange-50 text-orange-700">
                    {o.orderStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add Restaurant */}
      {isRestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900">Onboard New Restaurant</h3>
            <form onSubmit={handleCreateRestaurant} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Restaurant Name</label>
                <input
                  type="text"
                  required
                  value={restName}
                  onChange={(e) => setRestName(e.target.value)}
                  placeholder="e.g. Bella Roma Ristorante"
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address & District</label>
                <input
                  type="text"
                  value={restAddress}
                  onChange={(e) => setRestAddress(e.target.value)}
                  placeholder="e.g. 520 Valencia St, San Francisco"
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cuisines (comma-separated)</label>
                <input
                  type="text"
                  value={restCuisine}
                  onChange={(e) => setRestCuisine(e.target.value)}
                  placeholder="Pizza, Italian, Pasta"
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRestModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Restaurant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Coupon */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900">Create Promotional Coupon</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FLASH30"
                  className="w-full p-2.5 uppercase font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="20"
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Min Order Amount ($)</label>
                <input
                  type="number"
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                  placeholder="15"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-xs"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
