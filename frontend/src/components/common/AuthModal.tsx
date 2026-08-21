import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { X, Mail, Lock, User as UserIcon, Phone, Store, Bike, Shield, Check } from 'lucide-react';
import { UserRole } from '../../types.js';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, authModalMode, setAuthModalMode, login, register } = useAuth();
  const [role, setRole] = useState<UserRole>('ROLE_CUSTOMER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [phone, setPhone] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); 
    setError('');

    try {
      if (authModalMode === 'login') {
        const ok = await login(email, role);
        if (ok) {
          setIsAuthModalOpen(false);
        } else {
          setError('Invalid credentials or account blocked');
        }
      } else {
        const ok = await register({
          name,
          email,
          phone,
          password,
          role,
          restaurantName: role === 'ROLE_RESTAURANT' ? restaurantName : undefined,
        });
        if (ok) {
          setIsAuthModalOpen(false);
        } else {
          setError('Registration failed. Email may already be registered.');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoRole: UserRole) => {
    setLoading(true);
    setError('');
    await login(undefined, demoRole);
    setLoading(false);
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white relative">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white text-orange-600 font-bold px-2 py-0.5 rounded-md text-xs tracking-wider uppercase">
              FoodGo Platform
            </span>
          </div>
          <h2 className="text-2xl font-bold">
            {authModalMode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="text-orange-100 text-sm mt-1">
            {authModalMode === 'login'
              ? 'Log in to order delicious food or manage your operations'
              : 'Join thousands of customers, restaurants and drivers'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setAuthModalMode('login')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
              authModalMode === 'login'
                ? 'border-orange-500 text-orange-600 bg-orange-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setAuthModalMode('register')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
              authModalMode === 'register'
                ? 'border-orange-500 text-orange-600 bg-orange-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {/* Role selector for registration */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Select Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('ROLE_CUSTOMER')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  role === 'ROLE_CUSTOMER'
                    ? 'border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-200'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <UserIcon className="w-4 h-4 text-orange-500 shrink-0" />
                <span>Customer</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('ROLE_RESTAURANT')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  role === 'ROLE_RESTAURANT'
                    ? 'border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-200'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Store className="w-4 h-4 text-orange-500 shrink-0" />
                <span>Restaurant</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('ROLE_DELIVERY_PARTNER')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  role === 'ROLE_DELIVERY_PARTNER'
                    ? 'border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-200'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Bike className="w-4 h-4 text-orange-500 shrink-0" />
                <span>Delivery Partner</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('ROLE_ADMIN')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  role === 'ROLE_ADMIN'
                    ? 'border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-200'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Shield className="w-4 h-4 text-orange-500 shrink-0" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {authModalMode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          )}

          {authModalMode === 'register' && role === 'ROLE_RESTAURANT' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Restaurant Name</label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="e.g. Roma Pizzeria"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  role === 'ROLE_CUSTOMER'
                    ? 'alex@foodgo.com'
                    : role === 'ROLE_RESTAURANT'
                    ? 'mario@bellaitalia.com'
                    : role === 'ROLE_DELIVERY_PARTNER'
                    ? 'liam@foodgo.com'
                    : 'admin@foodgo.com'
                }
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-sm shadow-orange-500/30 transition-all text-sm disabled:opacity-50"
          >
            {loading ? 'Processing...' : authModalMode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          {/* Quick Demo Access Bar */}
          <div className="pt-3 border-t border-slate-100">
            <p className="text-xs text-center text-slate-500 mb-2 font-medium">⚡ Quick Demo One-Click Access:</p>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('ROLE_CUSTOMER')}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-center truncate"
              >
                Customer (Alex)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('ROLE_RESTAURANT')}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-center truncate"
              >
                Restaurant (Mario)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('ROLE_DELIVERY_PARTNER')}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-center truncate"
              >
                Driver (Liam)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('ROLE_ADMIN')}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-center truncate"
              >
                Admin (Sarah)
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
