import React, { useState } from 'react';
import { Restaurant } from '../../types.js';
import { Star, Clock, Bike, DollarSign, Filter, Flame, ChevronRight } from 'lucide-react';

interface RestaurantListProps {
  restaurants: Restaurant[];
  onSelectRestaurant: (restaurant: Restaurant) => void;
  selectedCategoryName?: string | null;
  searchQuery: string;
}

export const RestaurantList: React.FC<RestaurantListProps> = ({
  restaurants,
  onSelectRestaurant,
  selectedCategoryName, 
  searchQuery,
}) => {
  const [filterVegOnly, setFilterVegOnly] = useState(false);
  const [minRatingFilter, setMinRatingFilter] = useState<number | null>(null);
  const [maxDeliveryTime, setMaxDeliveryTime] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'rating' | 'deliveryTime' | 'minOrder' | 'default'>('default');

  // Filter restaurants
  let filtered = restaurants.filter((r) => {
    if (minRatingFilter && r.rating < minRatingFilter) return false;
    if (maxDeliveryTime && r.deliveryTimeMinutes > maxDeliveryTime) return false;
    return true;
  });

  // Sort
  if (sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'deliveryTime') {
    filtered.sort((a, b) => a.deliveryTimeMinutes - b.deliveryTimeMinutes);
  } else if (sortBy === 'minOrder') {
    filtered.sort((a, b) => a.minOrderAmount - b.minOrderAmount);
  }

  return (
    <div className="space-y-6">
      {/* Section Title and Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {selectedCategoryName ? `${selectedCategoryName} Restaurants` : 'Featured Restaurants'}
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {filtered.length} found
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Handpicked premium kitchens with high safety ratings & quick delivery
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setMinRatingFilter(minRatingFilter === 4.7 ? null : 4.7)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border transition-all ${
              minRatingFilter === 4.7
                ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Rating 4.7+</span>
          </button>

          <button
            onClick={() => setMaxDeliveryTime(maxDeliveryTime === 20 ? null : 20)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border transition-all ${
              maxDeliveryTime === 20
                ? 'bg-orange-500 text-white border-orange-500 font-bold shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Fast (&le; 20m)</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <span className="text-slate-400 text-xs">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 px-2.5 rounded-xl border-none focus:outline-hidden focus:ring-2 focus:ring-orange-500 cursor-pointer"
            >
              <option value="default">Recommended</option>
              <option value="rating">Highest Rated</option>
              <option value="deliveryTime">Fastest Delivery</option>
              <option value="minOrder">Lowest Min Order</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Restaurants */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mx-auto mb-4">
            <Filter className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No restaurants match your filters</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or resetting filters to discover delicious food options.
          </p>
          <button
            onClick={() => {
              setMinRatingFilter(null);
              setMaxDeliveryTime(null);
              setSortBy('default');
            }}
            className="mt-4 px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-orange-600 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((restaurant) => (
            <div
              key={restaurant.id}
              onClick={() => onSelectRestaurant(restaurant)}
              className="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-orange-200 transition-all duration-300 cursor-pointer flex flex-col"
            >
              {/* Image Banner */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                {/* Rating Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl shadow-sm text-slate-900 text-xs font-black">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{restaurant.rating.toFixed(1)}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({restaurant.reviewCount})</span>
                </div>

                {/* Featured Badge */}
                {restaurant.isFeatured && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 bg-orange-500 text-white px-2.5 py-1 rounded-xl shadow-sm text-[10px] font-bold uppercase tracking-wider">
                    <Flame className="w-3 h-3 fill-current" />
                    <span>Featured</span>
                  </div>
                )}

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-1.5 font-semibold drop-shadow-xs">
                    <Clock className="w-3.5 h-3.5 text-orange-400" />
                    <span>{restaurant.deliveryTimeMinutes} mins</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-lg">
                    <Bike className="w-3 h-3 text-emerald-400" />
                    <span>${restaurant.deliveryFee.toFixed(2)} delivery</span>
                  </div>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-extrabold text-slate-900 text-base group-hover:text-orange-600 transition-colors">
                      {restaurant.name}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {restaurant.description}
                  </p>

                  {/* Cuisine Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {restaurant.cuisine.slice(0, 3).map((c) => (
                      <span
                        key={c}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                      >
                        {c}
                      </span>
                    ))}
                    {restaurant.cuisine.length > 3 && (
                      <span className="text-[10px] font-medium text-slate-400 px-1 py-0.5">
                        +{restaurant.cuisine.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Info */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Min order: ${restaurant.minOrderAmount.toFixed(2)}</span>
                  <span className="font-bold text-orange-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Menu <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
