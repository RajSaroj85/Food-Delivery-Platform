import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { apiFetch } from '../../lib/api.js';
import { useOrder } from '../../context/OrderContext.js';
import { Restaurant, FoodItem, Order, FoodCategory } from '../../types.js';
import {
  Store,
  DollarSign,
  ShoppingBag,
  Clock,
  Star,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  ChefHat, 
  Bike,
  Flame,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  UtensilsCrossed,
} from 'lucide-react';

export const RestaurantDashboard: React.FC = () => {
  const { user } = useAuth();
  const { orders, updateOrderStatus, fetchOrders } = useOrder();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'profile'>('orders');
  const [orderFilter, setOrderFilter] = useState<'all' | 'new' | 'kitchen' | 'completed'>('new');

  // Add/Edit Food Modal State
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [foodName, setFoodName] = useState('');
  const [foodDesc, setFoodDesc] = useState('');
  const [foodPrice, setFoodPrice] = useState('');
  const [foodDiscountPrice, setFoodDiscountPrice] = useState('');
  const [foodCategoryId, setFoodCategoryId] = useState('');
  const [foodImage, setFoodImage] = useState('');
  const [foodIsVeg, setFoodIsVeg] = useState(false);
  const [foodIsAvailable, setFoodIsAvailable] = useState(true);
  const [foodPrepTime, setFoodPrepTime] = useState('15');

  // Load restaurant details & menu
  const loadRestaurantData = async () => {
    try {
      const restId = user?.restaurantId || 'rest-1';
      const res = await apiFetch(`/restaurants/${restId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setRestaurant(data.data);
      }

      // Load foods
      const foodsRes = await apiFetch(`/foods?restaurantId=${restId}`);
      const foodsData = await foodsRes.json();
      if (foodsData.success && foodsData.data) {
        setMenuItems(foodsData.data);
      }

      // Load categories
      const catsRes = await apiFetch('/categories');
      const catsData = await catsRes.json();
      if (catsData.success && catsData.data) {
        setCategories(catsData.data);
        if (!foodCategoryId && catsData.data.length > 0) {
          setFoodCategoryId(catsData.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadRestaurantData();
  }, [user]);

  // Restaurant specific orders
  const restId = restaurant?.id || 'rest-1';
  const restaurantOrders = orders.filter((o) => o.restaurantId === restId);

  const newOrders = restaurantOrders.filter((o) => o.orderStatus === 'PENDING' || o.orderStatus === 'CONFIRMED');
  const kitchenOrders = restaurantOrders.filter(
    (o) => o.orderStatus === 'RESTAURANT_ACCEPTED' || o.orderStatus === 'PREPARING' || o.orderStatus === 'READY_FOR_PICKUP'
  );
  const completedOrders = restaurantOrders.filter((o) => o.orderStatus === 'DELIVERED');

  const todayRevenue = restaurantOrders
    .filter((o) => o.orderStatus === 'DELIVERED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Handle Food Modal Open for Edit
  const openEditModal = (food: FoodItem) => {
    setEditingFood(food);
    setFoodName(food.name);
    setFoodDesc(food.description);
    setFoodPrice(food.price.toString());
    setFoodDiscountPrice(food.discountPrice ? food.discountPrice.toString() : '');
    setFoodCategoryId(food.categoryId);
    setFoodImage(food.imageUrl);
    setFoodIsVeg(food.isVegetarian);
    setFoodIsAvailable(food.isAvailable);
    setFoodPrepTime(food.preparationTime.toString());
    setIsFoodModalOpen(true);
  };

  const openAddModal = () => {
    setEditingFood(null);
    setFoodName('');
    setFoodDesc('');
    setFoodPrice('');
    setFoodDiscountPrice('');
    setFoodCategoryId(categories[0]?.id || 'cat-pizza');
    setFoodImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80');
    setFoodIsVeg(false);
    setFoodIsAvailable(true);
    setFoodPrepTime('15');
    setIsFoodModalOpen(true);
  };

  // Save Food Item
  const handleSaveFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName || !foodPrice) return;

    try {
      const payload = {
        restaurantId: restId,
        categoryId: foodCategoryId,
        name: foodName,
        description: foodDesc,
        price: parseFloat(foodPrice),
        discountPrice: foodDiscountPrice ? parseFloat(foodDiscountPrice) : undefined,
        imageUrl: foodImage,
        isVegetarian: foodIsVeg,
        isAvailable: foodIsAvailable,
        preparationTime: parseInt(foodPrepTime) || 15,
      };

      if (editingFood) {
        await apiFetch(`/foods/${editingFood.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/foods', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      await loadRestaurantData();
      setIsFoodModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFood = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await apiFetch(`/foods/${id}`, { method: 'DELETE' });
      await loadRestaurantData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFoodAvailability = async (food: FoodItem) => {
    try {
      await apiFetch(`/foods/${food.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !food.isAvailable }),
      });
      await loadRestaurantData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Restaurant Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={restaurant?.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80'}
            alt="Restaurant"
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-orange-500"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">{restaurant?.name || 'My Restaurant Kitchen'}</h1>
              <span className="text-xs bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-md uppercase">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Owner: <strong>{user?.name || 'Chef'}</strong> • {restaurant?.address}
            </p>
          </div>
        </div>

        {/* Quick Tabs */}
        <div className="flex items-center bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            Live Kitchen ({newOrders.length + kitchenOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'menu' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            Menu Management ({menuItems.length})
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Incoming New</span>
          <div className="text-2xl font-black text-orange-600 mt-1">{newOrders.length}</div>
          <span className="text-[10px] text-slate-500">Requires acceptance</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">In Preparation</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{kitchenOrders.length}</div>
          <span className="text-[10px] text-slate-500">Cooking & packaging</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Delivered Orders</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{completedOrders.length}</div>
          <span className="text-[10px] text-slate-500">Successfully served</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Today's Sales</span>
          <div className="text-2xl font-black text-slate-900 mt-1">${todayRevenue.toFixed(2)}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">★ {restaurant?.rating.toFixed(1)} rating</span>
        </div>
      </div>

      {activeTab === 'orders' ? (
        /* Orders View */
        <div className="space-y-6">
          {/* Order Stage Filter */}
          <div className="flex gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
            <button
              onClick={() => setOrderFilter('new')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                orderFilter === 'new'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              🔔 New Incoming ({newOrders.length})
            </button>
            <button
              onClick={() => setOrderFilter('kitchen')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                orderFilter === 'kitchen'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              🍳 Kitchen Pipeline ({kitchenOrders.length})
            </button>
            <button
              onClick={() => setOrderFilter('all')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                orderFilter === 'all'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              All Orders ({restaurantOrders.length})
            </button>
          </div>

          {/* Orders List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(orderFilter === 'new'
              ? newOrders
              : orderFilter === 'kitchen'
              ? kitchenOrders
              : restaurantOrders
            ).map((order) => {
              const isPending = order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED';
              const isAccepted = order.orderStatus === 'RESTAURANT_ACCEPTED';
              const isPreparing = order.orderStatus === 'PREPARING';
              const isReady = order.orderStatus === 'READY_FOR_PICKUP';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">
                            #{order.orderNumber}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-orange-100 text-orange-700">
                            {order.orderStatus.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Customer: <strong>{order.customerName}</strong> ({order.customerPhone})
                        </p>
                      </div>
                      <span className="text-base font-black text-slate-900">
                        ${order.totalAmount.toFixed(2)}
                      </span>
                    </div>

                    {/* Food Items list */}
                    <div className="space-y-1.5 text-xs">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-slate-700">
                          <span>
                            <strong>{item.quantity}x</strong> {item.foodName}
                          </span>
                          <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Delivery address & instructions */}
                    <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 border border-slate-100">
                      <div>📍 {order.deliveryAddress.fullAddress}</div>
                      {order.specialInstructions && (
                        <div className="text-orange-700 italic mt-1 font-medium">
                          Note: {order.specialInstructions}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Pipeline Buttons (PRD Sec 13) */}
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    {isPending && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'RESTAURANT_ACCEPTED', 'Order accepted by chef')}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                        >
                          ✓ Accept Order
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'REJECTED', 'Restaurant rejected order')}
                          className="py-2.5 px-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors"
                        >
                          ✕ Reject
                        </button>
                      </>
                    )}

                    {isAccepted && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'PREPARING', 'Started food preparation in kitchen')}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <ChefHat className="w-4 h-4" />
                        <span>Start Cooking (Preparing)</span>
                      </button>
                    )}

                    {isPreparing && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'READY_FOR_PICKUP', 'Food is cooked and packaged')}
                        className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Food Ready for Pickup! 📦</span>
                      </button>
                    )}

                    {isReady && (
                      <div className="w-full p-2.5 bg-blue-50 text-blue-700 text-center text-xs font-bold rounded-xl border border-blue-200">
                        Waiting for driver pickup ({order.deliveryPartnerName || 'Driver assigned'})
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Menu Management View */
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Restaurant Menu Catalog</h2>
              <p className="text-xs text-slate-500">Add dishes, update prices, and toggle live availability</p>
            </div>
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Dish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="relative h-36 rounded-xl overflow-hidden bg-slate-100 mb-3">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold">
                        Temporarily Disabled
                      </div>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">{item.name}</h4>
                      <span className="text-[11px] text-slate-400">{item.categoryName}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900 text-sm">${item.price.toFixed(2)}</span>
                      {item.discountPrice && (
                        <div className="text-[10px] text-emerald-600 font-bold">
                          Promo: ${item.discountPrice.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleFoodAvailability(item)}
                    className={`text-xs font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                      item.isAvailable
                        ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    <span>{item.isAvailable ? '● Available' : '○ Sold Out'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFood(item.id)}
                      className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Food Modal */}
      {isFoodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-black text-slate-900">
              {editingFood ? 'Edit Menu Dish' : 'Add New Menu Item'}
            </h3>

            <form onSubmit={handleSaveFood} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="e.g. Truffle Penne Alla Vodka"
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={foodCategoryId}
                  onChange={(e) => setFoodCategoryId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Regular Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={foodPrice}
                    onChange={(e) => setFoodPrice(e.target.value)}
                    placeholder="18.99"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discount Price (Opt)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={foodDiscountPrice}
                    onChange={(e) => setFoodDiscountPrice(e.target.value)}
                    placeholder="15.99"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={foodImage}
                  onChange={(e) => setFoodImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={foodDesc}
                  onChange={(e) => setFoodDesc(e.target.value)}
                  placeholder="San Marzano tomato sauce, fresh buffalo mozzarella, aromatic basil..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={foodIsVeg}
                    onChange={(e) => setFoodIsVeg(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Vegetarian Dish</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={foodIsAvailable}
                    onChange={(e) => setFoodIsAvailable(e.target.checked)}
                    className="rounded text-orange-600 focus:ring-orange-500"
                  />
                  <span>In Stock</span>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFoodModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
