import React, { useState } from 'react';
import { Code2, Database, Layers, ShieldCheck, Check, Copy } from 'lucide-react';

export const ApiDocsView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'endpoints' | 'schema' | 'architecture'>('endpoints');
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const apiGroups = [
    {
      title: 'Authentication & Security APIs', 
      endpoints: [
        { method: 'POST', path: '/api/auth/login', desc: 'Authenticate user & issue JWT bearer token' },
        { method: 'POST', path: '/api/auth/register', desc: 'Register customer, restaurant or delivery partner' },
        { method: 'GET', path: '/api/auth/me', desc: 'Retrieve authenticated user session profile' },
        { method: 'POST', path: '/api/auth/switch-role', desc: 'Switch persona in demo session' },
      ],
    },
    {
      title: 'Restaurants & Menus APIs',
      endpoints: [
        { method: 'GET', path: '/api/restaurants', desc: 'List active restaurants with ratings and filters' },
        { method: 'GET', path: '/api/restaurants/:id', desc: 'Get restaurant profile by ID' },
        { method: 'POST', path: '/api/restaurants', desc: 'Onboard new restaurant (Admin only)' },
        { method: 'GET', path: '/api/foods?restaurantId=:id', desc: 'Get menu items catalog' },
        { method: 'POST', path: '/api/foods', desc: 'Create food item (Restaurant Owner)' },
        { method: 'PUT', path: '/api/foods/:id', desc: 'Update food item details/pricing' },
        { method: 'DELETE', path: '/api/foods/:id', desc: 'Delete food item' },
        { method: 'GET', path: '/api/categories', desc: 'List food categories' },
      ],
    },
    {
      title: 'Cart & Orders APIs',
      endpoints: [
        { method: 'POST', path: '/api/orders', desc: 'Create & place new food delivery order' },
        { method: 'GET', path: '/api/orders', desc: 'List orders (filtered by role)' },
        { method: 'GET', path: '/api/orders/:id', desc: 'Get full order details with status & tracker' },
        { method: 'PATCH', path: '/api/orders/:id/status', desc: 'Transition order state in state machine' },
        { method: 'POST', path: '/api/orders/:id/cancel', desc: 'Cancel order (valid before PREPARING)' },
        { method: 'POST', path: '/api/orders/:id/step-forward', desc: 'Advance simulation state forward' },
      ],
    },
    {
      title: 'Coupons, Reviews & Delivery APIs',
      endpoints: [
        { method: 'POST', path: '/api/coupons/validate', desc: 'Validate promo code & calculate discount' },
        { method: 'POST', path: '/api/reviews', desc: 'Submit rating & review for delivered order' },
        { method: 'GET', path: '/api/reviews/restaurant/:id', desc: 'Get verified reviews for restaurant' },
        { method: 'POST', path: '/api/delivery/orders/:id/assign', desc: 'Assign driver to ready order' },
        { method: 'PATCH', path: '/api/delivery/partners/:id/availability', desc: 'Toggle online/offline status' },
      ],
    },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
            <Code2 className="w-4 h-4" />
            <span>Architecture & REST API Blueprint</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">FoodGo System Documentation</h1>
          <p className="text-xs text-slate-300 mt-1">
            Enterprise full-stack food delivery platform architecture
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
          <button
            onClick={() => setActiveSection('endpoints')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSection === 'endpoints' ? 'bg-orange-500 text-white' : 'text-slate-300'
            }`}
          >
            REST Endpoints
          </button>
          <button
            onClick={() => setActiveSection('schema')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSection === 'schema' ? 'bg-orange-500 text-white' : 'text-slate-300'
            }`}
          >
            Database Schema
          </button>
          <button
            onClick={() => setActiveSection('architecture')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSection === 'architecture' ? 'bg-orange-500 text-white' : 'text-slate-300'
            }`}
          >
            Spring Architecture
          </button>
        </div>
      </div>

      {/* Endpoints View */}
      {activeSection === 'endpoints' && (
        <div className="space-y-6">
          {apiGroups.map((group, idx) => (
            <div key={idx} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">{group.title}</h2>
              <div className="space-y-2">
                {group.endpoints.map((ep, eIdx) => {
                  const id = `${ep.method}-${ep.path}`;
                  return (
                    <div
                      key={eIdx}
                      className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2 font-mono">
                        <span
                          className={`px-2 py-0.5 rounded font-black text-[10px] ${
                            ep.method === 'GET'
                              ? 'bg-blue-100 text-blue-800'
                              : ep.method === 'POST'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ep.method === 'PUT' || ep.method === 'PATCH'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {ep.method}
                        </span>
                        <span className="font-bold text-slate-800">{ep.path}</span>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 flex-1">
                        <span className="text-slate-500 text-[11px]">{ep.desc}</span>
                        <button
                          onClick={() => copyToClipboard(ep.path, id)}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-700"
                          title="Copy Path"
                        >
                          {copiedEndpoint === id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schema View */}
      {activeSection === 'schema' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm text-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-orange-500" />
              <span>Relational Database Schema (MySQL / PostgreSQL / JPA Entities)</span>
            </h2>
            <p className="text-slate-500 mt-1">
              Normalized data model with foreign key constraints, indexes, and transactional consistency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2">1. users table</h3>
              <ul className="space-y-1 text-slate-600 font-mono text-[11px]">
                <li>• id (VARCHAR PK)</li>
                <li>• name (VARCHAR)</li>
                <li>• email (VARCHAR UNIQUE)</li>
                <li>• phone (VARCHAR)</li>
                <li>• password_hash (VARCHAR)</li>
                <li>• role (ENUM: CUSTOMER, RESTAURANT, DELIVERY, ADMIN)</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2">2. orders table</h3>
              <ul className="space-y-1 text-slate-600 font-mono text-[11px]">
                <li>• id (VARCHAR PK)</li>
                <li>• order_number (VARCHAR UNIQUE)</li>
                <li>• customer_id (FK &rarr; users.id)</li>
                <li>• restaurant_id (FK &rarr; restaurants.id)</li>
                <li>• delivery_partner_id (FK &rarr; delivery_partners.id)</li>
                <li>• order_status (ENUM: PENDING..DELIVERED)</li>
                <li>• subtotal, delivery_fee, tax, discount, total_amount (DECIMAL)</li>
                <li>• payment_status, payment_method</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2">3. foods table</h3>
              <ul className="space-y-1 text-slate-600 font-mono text-[11px]">
                <li>• id (VARCHAR PK)</li>
                <li>• restaurant_id (FK &rarr; restaurants.id)</li>
                <li>• category_id (FK &rarr; food_categories.id)</li>
                <li>• name, description, price, discount_price (DECIMAL)</li>
                <li>• is_vegetarian, is_available, preparation_time</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2">4. reviews table</h3>
              <ul className="space-y-1 text-slate-600 font-mono text-[11px]">
                <li>• id (VARCHAR PK)</li>
                <li>• order_id (FK &rarr; orders.id)</li>
                <li>• restaurant_id (FK &rarr; restaurants.id)</li>
                <li>• customer_id (FK &rarr; users.id)</li>
                <li>• rating, food_quality_rating, delivery_rating (INT 1-5)</li>
                <li>• comment (TEXT)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Architecture View */}
      {activeSection === 'architecture' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm text-xs leading-relaxed text-slate-700">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-500" />
              <span>Layered Spring Boot & Micro-Frontend Architecture</span>
            </h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200">
              <h4 className="font-bold text-orange-950 text-sm mb-1">Controller Layer (REST Controllers)</h4>
              <p>
                Handles incoming HTTP requests, performs DTO validation (Jakarta Validation), enforces Spring Security role-based authorization (`@PreAuthorize("hasRole('RESTAURANT')")`), and returns standard `ApiResponse&lt;T&gt;`.
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <h4 className="font-bold text-blue-950 text-sm mb-1">Service Layer (Business Logic & Transactions)</h4>
              <p>
                Enforces critical business rules: Single restaurant cart rule (Rule 8), cancellation constraints before PREPARING (Rule 5), and automated atomic status state transitions. Uses `@Transactional` for ACID compliance.
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
              <h4 className="font-bold text-purple-950 text-sm mb-1">Data Access Layer (Spring Data JPA / Hibernate)</h4>
              <p>
                Repository interfaces (`OrderRepository`, `RestaurantRepository`, `FoodRepository`) with query methods and pagination support.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
