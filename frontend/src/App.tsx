import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { CartProvider, useCart } from './context/CartContext.js';
import { OrderProvider, useOrder } from './context/OrderContext.js';
import { Header } from './components/common/Header.js';
import { AuthModal } from './components/common/AuthModal.js';
import { HeroBanner } from './components/customer/HeroBanner.js';
import { CategoryCarousel } from './components/customer/CategoryCarousel.js';
import { RestaurantList } from './components/customer/RestaurantList.js';
import { RestaurantDetail } from './components/customer/RestaurantDetail.js';
import { CartDrawer } from './components/customer/CartDrawer.js';
import { CheckoutModal } from './components/customer/CheckoutModal.js';
import { OrderTrackingView } from './components/customer/OrderTrackingView.js';
import { OrderHistoryView } from './components/customer/OrderHistoryView.js';
import { RestaurantDashboard } from './components/restaurant/RestaurantDashboard.js';
import { DeliveryDashboard } from './components/delivery/DeliveryDashboard.js';
import { AdminDashboard } from './components/admin/AdminDashboard.js';
import { ApiDocsView } from './components/docs/ApiDocsView.js';
import { Restaurant, FoodCategory } from './types.js';
import { apiFetch } from './lib/api.js';

const MainAppContent: React.FC = () => {
  const { user } = useAuth();
  const { applyCoupon, setIsCartOpen } = useCart();
  const { orders } = useOrder();

  const [currentView, setCurrentView] = useState<
    'restaurants' | 'restaurant-detail' | 'my-orders' | 'live-tracking' | 'restaurant-dashboard' | 'delivery-dashboard' | 'admin-dashboard' | 'api-docs'
  >('restaurants');

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Initial load
  useEffect(() => {
    apiFetch('/restaurants')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) setRestaurants(data.data);
      })
      .catch(console.error);

    apiFetch('/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) setCategories(data.data);
      })
      .catch(console.error);
  }, []);

  // Update view when user role changes
  useEffect(() => {
    if (user?.role === 'ROLE_RESTAURANT') {
      setCurrentView('restaurant-dashboard');
    } else if (user?.role === 'ROLE_DELIVERY_PARTNER') {
      setCurrentView('delivery-dashboard');
    } else if (user?.role === 'ROLE_ADMIN') {
      setCurrentView('admin-dashboard');
    } else if (user?.role === 'ROLE_CUSTOMER') {
      if (['restaurant-dashboard', 'delivery-dashboard', 'admin-dashboard'].includes(currentView)) {
        setCurrentView('restaurants');
      }
    }
  }, [user?.role]);

  const handleSelectRestaurant = (rest: Restaurant) => {
    setSelectedRestaurant(rest);
    setCurrentView('restaurant-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyHeroCoupon = async (code: string) => {
    await applyCoupon(code);
    setIsCartOpen(true);
  };

  const handleOrderSuccess = (orderId: string) => {
    setActiveTrackingOrderId(orderId);
    setCurrentView('live-tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOrderFromNotif = (orderId: string) => {
    setActiveTrackingOrderId(orderId);
    setCurrentView('live-tracking');
  };

  // Filter restaurants by category or search query
  const filteredRestaurants = restaurants.filter((r) => {
    if (selectedCategory) {
      const catObj = categories.find((c) => c.id === selectedCategory);
      if (catObj && !r.cuisine.some((c) => c.toLowerCase().includes(catObj.name.toLowerCase()))) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.name.toLowerCase().includes(q);
      const matchCuisine = r.cuisine.some((c) => c.toLowerCase().includes(q));
      if (!matchName && !matchCuisine) return false;
    }
    return true;
  });

  const selectedCategoryObj = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900 selection:bg-orange-500 selection:text-white">
      {/* Universal Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectOrder={handleSelectOrderFromNotif}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Customer Experience Views */}
        {currentView === 'restaurants' && (
          <div>
            <HeroBanner
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              onApplyCouponCode={handleApplyHeroCoupon}
            />

            <CategoryCarousel
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(catId) => setSelectedCategory(catId)}
            />

            <RestaurantList
              restaurants={filteredRestaurants}
              onSelectRestaurant={handleSelectRestaurant}
              selectedCategoryName={selectedCategoryObj?.name}
              searchQuery={searchQuery}
            />
          </div>
        )}

        {currentView === 'restaurant-detail' && selectedRestaurant && (
          <RestaurantDetail
            restaurant={selectedRestaurant}
            onBack={() => {
              setCurrentView('restaurants');
            }}
          />
        )}

        {currentView === 'my-orders' && (
          <OrderHistoryView
            onTrackOrder={(orderId) => {
              setActiveTrackingOrderId(orderId);
              setCurrentView('live-tracking');
            }}
            onBrowseRestaurants={() => setCurrentView('restaurants')}
          />
        )}

        {currentView === 'live-tracking' && (
          <OrderTrackingView
            orderId={activeTrackingOrderId}
            onBrowseMore={() => setCurrentView('restaurants')}
          />
        )}

        {/* Role Portal Views */}
        {currentView === 'restaurant-dashboard' && <RestaurantDashboard />}

        {currentView === 'delivery-dashboard' && <DeliveryDashboard />}

        {currentView === 'admin-dashboard' && <AdminDashboard />}

        {currentView === 'api-docs' && <ApiDocsView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">FoodGo Platform</span>
            <span>•</span>
            <span>Spring Boot Full-Stack REST API & React Architecture</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentView('api-docs')}
              className="text-orange-600 font-semibold hover:underline"
            >
              REST API Docs
            </button>
            <span>•</span>
            <span>Secure Role-Based Access Control (RBAC)</span>
          </div>
        </div>
      </footer>

      {/* Global Modals & Drawers */}
      <CartDrawer onProceedToCheckout={() => setIsCheckoutModalOpen(true)} />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <MainAppContent />
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  );
}
