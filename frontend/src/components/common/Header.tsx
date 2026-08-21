import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useCart } from '../../context/CartContext.js';
import {
  UtensilsCrossed,
  MapPin,
  Search,
  ShoppingCart,
  Bell,
  User as UserIcon,
  ChevronDown,
  Store,
  Bike,
  Shield,
  Code2,
  LogOut,
  Sparkles,
} from 'lucide-react'; 
import { NotificationPopover } from './NotificationPopover.js';
import { UserRole } from '../../types.js';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: any) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectOrder?: (orderId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  searchQuery,
  setSearchQuery,
  onSelectOrder,
}) => {
  const { user, switchRole, logout, setIsAuthModalOpen, setAuthModalMode } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const getRoleBadge = () => {
    if (!user) return null;
    switch (user.role) {
      case 'ROLE_CUSTOMER':
        return { label: 'Customer', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: UserIcon };
      case 'ROLE_RESTAURANT':
        return { label: 'Restaurant Owner', color: 'bg-orange-50 text-orange-700 border-orange-200', icon: Store };
      case 'ROLE_DELIVERY_PARTNER':
        return { label: 'Delivery Partner', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Bike };
      case 'ROLE_ADMIN':
        return { label: 'Admin', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Shield };
    }
  };

  const roleBadge = getRoleBadge();

  const handleRoleChange = async (role: UserRole) => {
    await switchRole(role);
    setIsRoleDropdownOpen(false);
    if (role === 'ROLE_CUSTOMER') setCurrentView('restaurants');
    else if (role === 'ROLE_RESTAURANT') setCurrentView('restaurant-dashboard');
    else if (role === 'ROLE_DELIVERY_PARTNER') setCurrentView('delivery-dashboard');
    else if (role === 'ROLE_ADMIN') setCurrentView('admin-dashboard');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      {/* Top Demo Bar / Quick Persona Switcher */}
      <div className="bg-slate-900 text-white text-[11px] py-1.5 px-4 hidden md:flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-300">FoodGo Full-Stack Platform</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">Spring Boot REST API + React Micro-Architecture</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-medium">Quick Role Switch:</span>
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => handleRoleChange('ROLE_CUSTOMER')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                user?.role === 'ROLE_CUSTOMER'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Customer (Alex)
            </button>
            <button
              onClick={() => handleRoleChange('ROLE_RESTAURANT')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                user?.role === 'ROLE_RESTAURANT'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Restaurant (Mario)
            </button>
            <button
              onClick={() => handleRoleChange('ROLE_DELIVERY_PARTNER')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                user?.role === 'ROLE_DELIVERY_PARTNER'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Driver (Liam)
            </button>
            <button
              onClick={() => handleRoleChange('ROLE_ADMIN')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                user?.role === 'ROLE_ADMIN'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Admin (Sarah)
            </button>
          </div>

          <button
            onClick={() => setCurrentView('api-docs')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors ${
              currentView === 'api-docs'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-semibold'
                : 'border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
            }`}
          >
            <Code2 className="w-3 h-3 text-emerald-400" />
            <span>Swagger / REST Docs</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => {
              if (user?.role === 'ROLE_CUSTOMER') setCurrentView('restaurants');
              else if (user?.role === 'ROLE_RESTAURANT') setCurrentView('restaurant-dashboard');
              else if (user?.role === 'ROLE_DELIVERY_PARTNER') setCurrentView('delivery-dashboard');
              else if (user?.role === 'ROLE_ADMIN') setCurrentView('admin-dashboard');
            }}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900">
                  Food<span className="text-orange-500">Go</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">
                  Fast & Fresh
                </span>
              </div>
            </div>
          </button>

          {/* Location selector */}
          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-200 text-xs text-slate-600">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-orange-500 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Deliver to</div>
              <span className="font-semibold text-slate-800 flex items-center gap-1 cursor-pointer hover:text-orange-600">
                Mission District, San Francisco
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </span>
            </div>
          </div>
        </div>

        {/* Global Search (For Customer mode) */}
        {user?.role === 'ROLE_CUSTOMER' && (
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food, dishes, cuisines (Pizza, Burger, Biryani...)"
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-orange-500 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
        )}

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Navigation Links based on role */}
          {user?.role === 'ROLE_CUSTOMER' && (
            <div className="hidden sm:flex items-center gap-1 mr-2">
              <button
                onClick={() => setCurrentView('restaurants')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  currentView === 'restaurants'
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Restaurants
              </button>
              <button
                onClick={() => setCurrentView('my-orders')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  currentView === 'my-orders'
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                My Orders
              </button>
              <button
                onClick={() => setCurrentView('live-tracking')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  currentView === 'live-tracking'
                    ? 'bg-orange-50 text-orange-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Live Tracker</span>
              </button>
            </div>
          )}

          {/* Cart Trigger (Customer Mode) */}
          {user?.role === 'ROLE_CUSTOMER' && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/30 flex items-center gap-2 transition-transform active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline-block text-xs font-bold">Cart</span>
              {itemCount > 0 && (
                <span className="bg-white text-orange-600 text-xs font-black px-1.5 py-0.2 rounded-full shadow-xs">
                  {itemCount}
                </span>
              )}
            </button>
          )}

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 relative transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white" />
            </button>
            <NotificationPopover
              isOpen={isNotifOpen}
              onClose={() => setIsNotifOpen(false)}
              onSelectOrder={onSelectOrder}
            />
          </div>

          {/* User Account / Role dropdown */}
          <div className="relative">
            {user ? (
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={user.name}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200"
                />
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">
                    {user.name.split(' ')[0]}
                  </div>
                  {roleBadge && (
                    <span className="text-[10px] text-slate-500 font-medium">
                      {roleBadge.label}
                    </span>
                  )}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setAuthModalMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Sign In
              </button>
            )}

            {/* Dropdown Menu */}
            {isRoleDropdownOpen && user && (
              <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3 bg-slate-50 rounded-xl mb-2">
                  <p className="text-xs font-bold text-slate-900">{user.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  <div className="mt-1.5 inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-700">
                    {roleBadge?.label}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Switch Workspace Role:
                  </div>
                  <button
                    onClick={() => handleRoleChange('ROLE_CUSTOMER')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      user.role === 'ROLE_CUSTOMER'
                        ? 'bg-orange-50 text-orange-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <UserIcon className="w-4 h-4 text-orange-500" />
                    <span>Customer Experience</span>
                  </button>

                  <button
                    onClick={() => handleRoleChange('ROLE_RESTAURANT')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      user.role === 'ROLE_RESTAURANT'
                        ? 'bg-orange-50 text-orange-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Store className="w-4 h-4 text-orange-500" />
                    <span>Restaurant Owner Portal</span>
                  </button>

                  <button
                    onClick={() => handleRoleChange('ROLE_DELIVERY_PARTNER')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      user.role === 'ROLE_DELIVERY_PARTNER'
                        ? 'bg-orange-50 text-orange-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Bike className="w-4 h-4 text-orange-500" />
                    <span>Delivery Partner Driver</span>
                  </button>

                  <button
                    onClick={() => handleRoleChange('ROLE_ADMIN')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      user.role === 'ROLE_ADMIN'
                        ? 'bg-orange-50 text-orange-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-orange-500" />
                    <span>Platform Admin Console</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 my-1 pt-1">
                  <button
                    onClick={() => {
                      setCurrentView('api-docs');
                      setIsRoleDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 hover:bg-slate-100 font-medium"
                  >
                    <Code2 className="w-4 h-4 text-emerald-600" />
                    <span>REST API & Architecture Docs</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setIsRoleDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-600 hover:bg-red-50 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
