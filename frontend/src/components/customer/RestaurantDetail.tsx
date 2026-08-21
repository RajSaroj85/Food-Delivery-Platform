import React, { useState, useEffect } from 'react';
import { Restaurant, FoodItem, Review } from '../../types.js';
import { useCart } from '../../context/CartContext.js';
import { apiFetch } from '../../lib/api.js';
import {
  ArrowLeft,
  Star,
  Clock,
  Bike,
  DollarSign,
  Search,
  Plus,
  Minus,
  Check,
  Flame,
  MessageSquare,
  Sparkles,
  Utensils,
  Leaf,
  Info,
} from 'lucide-react';

interface RestaurantDetailProps {
  restaurant: Restaurant;
  onBack: () => void;
}

export const RestaurantDetail: React.FC<RestaurantDetailProps> = ({ restaurant, onBack }) => {
  const { items, addItem, updateQuantity } = useCart();
  const [menuItems, setMenuItems] = useState<FoodItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews'>('menu');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [menuSearch, setMenuSearch] = useState('');
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch menu
    setLoading(true);
    apiFetch(`/foods?restaurantId=${restaurant.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setMenuItems(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Fetch reviews
    apiFetch(`/reviews/restaurant/${restaurant.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setReviews(data.data);
        }
      })
      .catch(console.error);
  }, [restaurant.id]);

  // Extract distinct categories in this restaurant's menu
  const menuCategories = ['all', ...Array.from(new Set(menuItems.map((f) => f.categoryName || 'Other')))];

  // Filter menu
  const filteredMenu = menuItems.filter((item) => {
    if (selectedCategory !== 'all' && (item.categoryName || 'Other') !== selectedCategory) return false;
    if (isVegOnly && !item.isVegetarian) return false;
    if (menuSearch) {
      const q = menuSearch.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    }
    return true;
  });

  const getItemQuantityInCart = (foodId: string) => {
    const found = items.find((i) => i.foodItem.id === foodId);
    return found ? found.quantity : 0;
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to all restaurants</span>
      </button>

      {/* Restaurant Banner & Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="relative h-60 sm:h-72 w-full bg-slate-900 overflow-hidden">
          <img
            src={restaurant.bannerImage || restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Banner Overlays */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-orange-500 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                  {restaurant.cuisine.join(' • ')}
                </span>
                {restaurant.isOpen ? (
                  <span className="bg-emerald-500/90 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-lg">
                    Open Now
                  </span>
                ) : (
                  <span className="bg-red-500 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-lg">
                    Closed
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{restaurant.name}</h1>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl line-clamp-2">
                {restaurant.description}
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3 shrink-0 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
              <div className="text-center px-2">
                <div className="flex items-center justify-center gap-1 text-amber-400 font-black text-base">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{restaurant.rating.toFixed(1)}</span>
                </div>
                <div className="text-[10px] text-slate-300">{restaurant.reviewCount} ratings</div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center px-2">
                <div className="text-white font-black text-base flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span>{restaurant.deliveryTimeMinutes}m</span>
                </div>
                <div className="text-[10px] text-slate-300">Delivery Time</div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center px-2">
                <div className="text-white font-black text-base">${restaurant.deliveryFee.toFixed(2)}</div>
                <div className="text-[10px] text-slate-300">Delivery Fee</div>
              </div>
            </div>
          </div>
        </div>

        {/* Address and info row */}
        <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">Location:</span>
            <span>{restaurant.address}, {restaurant.city}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Min order: <strong>${restaurant.minOrderAmount.toFixed(2)}</strong></span>
            <span>Phone: <strong>{restaurant.phone}</strong></span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Menu vs Reviews */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('menu')}
            className={`py-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'menu'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Menu Items ({menuItems.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Customer Reviews ({reviews.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'menu' ? (
        <div className="space-y-6">
          {/* Menu Search and Category Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-thin">
              {menuCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat === 'all' ? 'All Dishes' : cat}
                </button>
              ))}
            </div>

            {/* Veg toggle & Search */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsVegOnly(!isVegOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  isVegOnly
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="w-3.5 h-3.5 border-2 border-emerald-600 rounded-sm flex items-center justify-center p-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                </div>
                <span>Veg Only</span>
              </button>

              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  placeholder="Search in menu..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Menu Items Grid */}
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Loading delicious menu...</div>
          ) : filteredMenu.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <Utensils className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No dishes found</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing your search or veg filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {filteredMenu.map((item) => {
                const qty = getItemQuantityInCart(item.id);
                const displayPrice = item.discountPrice || item.price;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all flex justify-between gap-4"
                  >
                    {/* Left: Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {/* Veg / Non-Veg Indicator */}
                          <div
                            title={item.isVegetarian ? 'Vegetarian' : 'Non-Vegetarian'}
                            className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center p-0.5 ${
                              item.isVegetarian ? 'border-emerald-600' : 'border-amber-700'
                            }`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.isVegetarian ? 'bg-emerald-600' : 'bg-amber-700'
                              }`}
                            />
                          </div>

                          {item.isBestSeller && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                              <Flame className="w-3 h-3 fill-current" />
                              Best Seller
                            </span>
                          )}

                          {item.categoryName && (
                            <span className="text-[10px] font-semibold text-slate-400">
                              {item.categoryName}
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                          {item.name}
                        </h3>

                        {/* Price */}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm sm:text-base font-extrabold text-slate-900">
                            ${displayPrice.toFixed(2)}
                          </span>
                          {item.discountPrice && (
                            <span className="text-xs text-slate-400 line-through">
                              ${item.price.toFixed(2)}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Prep time & Calories tags */}
                      <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-400">
                        <span>⏱ {item.preparationTime} mins</span>
                        {item.calories && <span>🔥 {item.calories} kcal</span>}
                      </div>
                    </div>

                    {/* Right: Photo & Add to Cart button */}
                    <div className="flex flex-col items-center shrink-0 w-28 sm:w-32">
                      <div className="w-28 h-24 sm:w-32 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 relative shadow-2xs">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        {!item.isAvailable && (
                          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center text-white text-[10px] font-bold">
                            Sold Out
                          </div>
                        )}
                      </div>

                      {/* Add Button / Counter */}
                      <div className="mt-2 w-full">
                        {item.isAvailable ? (
                          qty > 0 ? (
                            <div className="flex items-center justify-between bg-orange-500 text-white rounded-xl p-1 shadow-sm">
                              <button
                                onClick={() => updateQuantity(item.id, qty - 1)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-orange-600 rounded-lg transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-black px-1">{qty}</span>
                              <button
                                onClick={() => updateQuantity(item.id, qty + 1)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-orange-600 rounded-lg transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addItem(item, 1)}
                              className="w-full py-2 bg-white hover:bg-orange-500 text-orange-600 hover:text-white border-2 border-orange-500 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1 active:scale-95"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>ADD</span>
                            </button>
                          )
                        ) : (
                          <button
                            disabled
                            className="w-full py-1.5 bg-slate-100 text-slate-400 rounded-xl text-[11px] font-semibold cursor-not-allowed"
                          >
                            Unavailable
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Reviews Tab */
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center text-amber-600 font-black">
                <span className="text-2xl leading-none">{restaurant.rating.toFixed(1)}</span>
                <span className="text-[10px] text-amber-700">out of 5</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Verified Foodie Reviews</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Based on {reviews.length} authentic customer delivery orders
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={rev.customerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={rev.customerName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{rev.customerName}</h4>
                      <span className="text-[10px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  "{rev.comment}"
                </p>

                <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                  <span>Taste: <strong>{rev.foodQualityRating}/5</strong></span>
                  <span>Delivery: <strong>{rev.deliveryRating}/5</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
