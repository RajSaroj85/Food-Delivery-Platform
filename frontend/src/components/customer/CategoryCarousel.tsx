import React from 'react';
import { FoodCategory } from '../../types.js';
import { Pizza, UtensilsCrossed, Soup, Utensils, Flame, Coffee, Cake, GlassWater } from 'lucide-react';

interface CategoryCarouselProps {
  categories: FoodCategory[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
}

export const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  categories,
  selectedCategory, 
  onSelectCategory,
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Explore Cuisines & Categories</h2>
          <p className="text-xs text-slate-500">What are you craving today?</p>
        </div>
        {selectedCategory && (
          <button
            onClick={() => onSelectCategory(null)}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 px-2.5 py-1 rounded-lg transition-colors"
          >
            Clear filter
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin">
        <button
          onClick={() => onSelectCategory(null)}
          className={`flex flex-col items-center p-3 rounded-2xl border transition-all shrink-0 w-24 sm:w-28 text-center group ${
            selectedCategory === null
              ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20 ring-2 ring-orange-200'
              : 'bg-white text-slate-700 border-slate-200/80 hover:border-orange-300 hover:bg-orange-50/30'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-105 ${
              selectedCategory === null ? 'bg-white/20 text-white' : 'bg-slate-100 text-orange-500'
            }`}
          >
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold truncate w-full">All Foods</span>
          <span className={`text-[10px] mt-0.5 ${selectedCategory === null ? 'text-orange-100' : 'text-slate-400'}`}>
            Top rated
          </span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? null : cat.id)}
              className={`flex flex-col items-center p-3 rounded-2xl border transition-all shrink-0 w-24 sm:w-28 text-center group ${
                isSelected
                  ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20 ring-2 ring-orange-200'
                  : 'bg-white text-slate-700 border-slate-200/80 hover:border-orange-300 hover:bg-orange-50/30'
              }`}
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden mb-2 relative shadow-xs">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-xs font-bold truncate w-full">{cat.name}</span>
              <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-orange-100' : 'text-slate-400'}`}>
                {cat.itemCount ? `${cat.itemCount} items` : 'Explore'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
