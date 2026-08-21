import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import {
  initialUsers,
  initialCategories,
  initialRestaurants,
  initialFoods,
  initialAddresses,
  initialCoupons,
  initialDeliveryPartners,
  initialOrders,
  initialReviews,
  initialNotifications,
} from './data/mockData.js';
import {
  User,
  Restaurant,
  FoodCategory,
  FoodItem,
  Address,
  Order,
  DeliveryPartner,
  Coupon,
  Review,
  NotificationItem,
  OrderStatus,
  UserRole,
} from './src/types.js';

// In-Memory Database storage (Stateful & reactive)
let users: User[] = [...initialUsers];
let categories: FoodCategory[] = [...initialCategories];
let restaurants: Restaurant[] = [...initialRestaurants];
let foods: FoodItem[] = [...initialFoods];
let addresses: Address[] = [...initialAddresses];
let coupons: Coupon[] = [...initialCoupons];
let deliveryPartners: DeliveryPartner[] = [...initialDeliveryPartners];
let orders: Order[] = [...initialOrders];
let reviews: Review[] = [...initialReviews];
let notifications: NotificationItem[] = [...initialNotifications];

// Helper for consistent Spring Boot-style REST Response format (PRD Section 26)
function successResponse<T>(res: Response, message: string, data?: T, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
}

function errorResponse(res: Response, message: string, errors: string[] = [], statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
  });
}

// Add in-app notification helper
function sendNotification(userId: string, role: UserRole, title: string, message: string, type: 'ORDER' | 'PAYMENT' | 'DELIVERY' | 'SYSTEM', orderId?: string) {
  const notif: NotificationItem = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    role,
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false,
    type,
    orderId,
  };
  notifications.unshift(notif);
  return notif;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);
  const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

  app.use(cors({
    origin: allowedOrigin,
    credentials: true,
  }));
  app.use(express.json());

  // API Health
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'FoodGo Spring Boot API Simulation', timestamp: new Date().toISOString() });
  });

  // ==========================================
  // MODULE 1: AUTHENTICATION & USERS
  // ==========================================
  app.post('/api/auth/register', (req, res) => {
    const { name, email, phone, password, role = 'ROLE_CUSTOMER', restaurantName, cuisine } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 'Name, email and password are required');
    }

    const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return errorResponse(res, 'User with this email already exists', ['Email already registered']);
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      phone: phone || '+1 (555) 000-0000',
      role,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    if (role === 'ROLE_RESTAURANT') {
      const newRestId = `rest-${Date.now()}`;
      newUser.restaurantId = newRestId;
      const newRest: Restaurant = {
        id: newRestId,
        ownerId: newUser.id,
        ownerName: newUser.name,
        name: restaurantName || `${name}'s Kitchen`,
        description: 'Delicious freshly prepared culinary specials made with passion.',
        cuisine: cuisine && cuisine.length ? cuisine : ['Fast Food', 'Snacks'],
        rating: 5.0,
        reviewCount: 1,
        deliveryTimeMinutes: 25,
        deliveryFee: 2.49,
        minOrderAmount: 15.0,
        address: '100 Gourmet Plaza, Downtown',
        city: 'San Francisco',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
        bannerImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
        isOpen: true,
        isFeatured: false,
        status: 'ACTIVE',
        phone: newUser.phone,
        lat: 37.775,
        lng: -122.418,
        createdAt: new Date().toISOString(),
      };
      restaurants.push(newRest);
    } else if (role === 'ROLE_DELIVERY_PARTNER') {
      const newPartner: DeliveryPartner = {
        id: `deliv-${Date.now()}`,
        userId: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        avatar: newUser.avatar!,
        vehicleType: 'Electric EV',
        vehicleNumber: 'SF-EV-' + Math.floor(100 + Math.random() * 900),
        rating: 5.0,
        isOnline: true,
        completedDeliveriesCount: 0,
        todayEarnings: 0,
        totalEarnings: 0,
        currentLocation: { lat: 37.7749, lng: -122.4194 },
      };
      deliveryPartners.push(newPartner);
    }

    users.push(newUser);
    const token = `jwt-token-${newUser.id}-${Date.now()}`;

    return successResponse(res, 'User registered successfully', {
      user: newUser,
      token,
    }, 201);
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, role } = req.body;
    let user: User | undefined;

    if (email) {
      user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    } else if (role) {
      user = users.find((u) => u.role === role);
    }

    if (!user) {
      user = users[0]; // fallback
    }

    if (user.status === 'BLOCKED') {
      return errorResponse(res, 'Account has been blocked by administrator. Please contact support.', [], 403);
    }

    const token = `jwt-token-${user.id}-${Date.now()}`;
    return successResponse(res, 'Login successful', {
      user,
      token,
    });
  });

  app.get('/api/users/me', (req, res) => {
    const userId = (req.query.userId as string) || users[0].id;
    const user = users.find((u) => u.id === userId) || users[0];
    return successResponse(res, 'User profile retrieved', user);
  });

  // ==========================================
  // MODULE 2: RESTAURANTS
  // ==========================================
  app.get('/api/restaurants', (req, res) => {
    const { search, cuisine, category, minRating, isVeg, sort } = req.query;
    let result = [...restaurants];

    if (search) {
      const q = (search as string).toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.cuisine.some((c) => c.toLowerCase().includes(q))
      );
    }

    if (cuisine) {
      const c = (cuisine as string).toLowerCase();
      result = result.filter((r) => r.cuisine.some((item) => item.toLowerCase() === c));
    }

    if (category) {
      const catId = category as string;
      const matchingRestIds = new Set(foods.filter((f) => f.categoryId === catId).map((f) => f.restaurantId));
      result = result.filter((r) => matchingRestIds.has(r.id));
    }

    if (minRating) {
      const mr = parseFloat(minRating as string);
      result = result.filter((r) => r.rating >= mr);
    }

    if (sort === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'deliveryTime') {
      result.sort((a, b) => a.deliveryTimeMinutes - b.deliveryTimeMinutes);
    } else if (sort === 'minOrder') {
      result.sort((a, b) => a.minOrderAmount - b.minOrderAmount);
    }

    return successResponse(res, 'Restaurants fetched successfully', result);
  });

  app.get('/api/restaurants/:id', (req, res) => {
    const restaurant = restaurants.find((r) => r.id === req.params.id);
    if (!restaurant) {
      return errorResponse(res, 'Restaurant not found', [], 404);
    }
    const menu = foods.filter((f) => f.restaurantId === restaurant.id);
    return successResponse(res, 'Restaurant details fetched', {
      ...restaurant,
      menu,
    });
  });

  app.put('/api/restaurants/:id', (req, res) => {
    const idx = restaurants.findIndex((r) => r.id === req.params.id);
    if (idx === -1) {
      return errorResponse(res, 'Restaurant not found', [], 404);
    }
    restaurants[idx] = { ...restaurants[idx], ...req.body };
    return successResponse(res, 'Restaurant updated successfully', restaurants[idx]);
  });

  // ==========================================
  // MODULE 3: FOOD ITEMS & CATEGORIES
  // ==========================================
  app.get('/api/categories', (req, res) => {
    const catsWithCount = categories.map((cat) => ({
      ...cat,
      itemCount: foods.filter((f) => f.categoryId === cat.id).length,
    }));
    return successResponse(res, 'Categories fetched successfully', catsWithCount);
  });

  app.post('/api/categories', (req, res) => {
    const { name, icon = 'Utensils', image, description } = req.body;
    if (!name) return errorResponse(res, 'Category name is required');

    const newCat: FoodCategory = {
      id: `cat-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
      name,
      icon,
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80',
      description: description || 'Delicious food category',
    };
    categories.push(newCat);
    return successResponse(res, 'Category created successfully', newCat, 201);
  });

  app.get('/api/foods', (req, res) => {
    const { restaurantId, categoryId, search, isVegetarian } = req.query;
    let result = [...foods];

    if (restaurantId) {
      result = result.filter((f) => f.restaurantId === restaurantId);
    }
    if (categoryId) {
      result = result.filter((f) => f.categoryId === categoryId);
    }
    if (search) {
      const q = (search as string).toLowerCase();
      result = result.filter((f) => f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q));
    }
    if (isVegetarian === 'true') {
      result = result.filter((f) => f.isVegetarian);
    }

    return successResponse(res, 'Food items fetched successfully', result);
  });

  app.post('/api/foods', (req, res) => {
    const {
      restaurantId,
      categoryId,
      name,
      description,
      price,
      discountPrice,
      imageUrl,
      isAvailable = true,
      isVegetarian = false,
      isBestSeller = false,
      preparationTime = 15,
      calories,
      tags = [],
    } = req.body;

    if (!restaurantId || !name || price === undefined) {
      return errorResponse(res, 'Restaurant ID, name and price are required');
    }

    const rest = restaurants.find((r) => r.id === restaurantId);
    const cat = categories.find((c) => c.id === categoryId);

    const newFood: FoodItem = {
      id: `food-${Date.now()}`,
      restaurantId,
      restaurantName: rest?.name || 'Restaurant',
      categoryId: categoryId || 'cat-pizza',
      categoryName: cat?.name || 'Main Course',
      name,
      description: description || '',
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
      isAvailable,
      isVegetarian,
      isBestSeller,
      preparationTime: Number(preparationTime) || 15,
      calories: calories ? Number(calories) : undefined,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    foods.push(newFood);
    return successResponse(res, 'Food item added successfully', newFood, 201);
  });

  app.put('/api/foods/:id', (req, res) => {
    const idx = foods.findIndex((f) => f.id === req.params.id);
    if (idx === -1) {
      return errorResponse(res, 'Food item not found', [], 404);
    }

    foods[idx] = {
      ...foods[idx],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    return successResponse(res, 'Food item updated successfully', foods[idx]);
  });

  app.delete('/api/foods/:id', (req, res) => {
    const idx = foods.findIndex((f) => f.id === req.params.id);
    if (idx === -1) {
      return errorResponse(res, 'Food item not found', [], 404);
    }
    const removed = foods.splice(idx, 1);
    return successResponse(res, 'Food item deleted successfully', removed[0]);
  });

  // ==========================================
  // MODULE 4: ADDRESSES
  // ==========================================
  app.get('/api/addresses', (req, res) => {
    const userId = (req.query.userId as string) || 'user-cust-1';
    const userAddresses = addresses.filter((a) => a.userId === userId);
    return successResponse(res, 'Addresses fetched successfully', userAddresses);
  });

  app.post('/api/addresses', (req, res) => {
    const { userId = 'user-cust-1', addressType = 'Home', fullAddress, houseNumber, street, area, city, state, pincode, isDefault = false } = req.body;

    if (!fullAddress && (!houseNumber || !street)) {
      return errorResponse(res, 'Address details are required');
    }

    if (isDefault) {
      addresses.forEach((a) => {
        if (a.userId === userId) a.isDefault = false;
      });
    }

    const newAddr: Address = {
      id: `addr-${Date.now()}`,
      userId,
      addressType,
      fullAddress: fullAddress || `${houseNumber}, ${street}, ${area}, ${city}, ${state} ${pincode}`,
      houseNumber: houseNumber || '',
      street: street || '',
      area: area || '',
      city: city || 'San Francisco',
      state: state || 'CA',
      pincode: pincode || '94101',
      isDefault: isDefault || addresses.filter((a) => a.userId === userId).length === 0,
      latitude: 37.7749,
      longitude: -122.4194,
    };

    addresses.push(newAddr);
    return successResponse(res, 'Address added successfully', newAddr, 201);
  });

  app.delete('/api/addresses/:id', (req, res) => {
    const idx = addresses.findIndex((a) => a.id === req.params.id);
    if (idx === -1) return errorResponse(res, 'Address not found', [], 404);
    addresses.splice(idx, 1);
    return successResponse(res, 'Address removed successfully');
  });

  // ==========================================
  // MODULE 5: COUPONS
  // ==========================================
  app.get('/api/coupons', (req, res) => {
    return successResponse(res, 'Coupons fetched', coupons.filter((c) => c.isActive));
  });

  app.post('/api/coupons/validate', (req, res) => {
    const { code, cartAmount, restaurantId } = req.body;
    if (!code) return errorResponse(res, 'Coupon code is required');

    const coupon = coupons.find((c) => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
    if (!coupon) {
      return errorResponse(res, 'Invalid coupon code or expired', ['Invalid code']);
    }

    if (cartAmount < coupon.minimumOrderAmount) {
      return errorResponse(
        res,
        `Minimum order amount of $${coupon.minimumOrderAmount.toFixed(2)} required for this coupon`,
        ['Below minimum amount']
      );
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (cartAmount * coupon.discountValue) / 100;
      if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
        discount = coupon.maximumDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    return successResponse(res, `Coupon applied: saved $${discount.toFixed(2)}!`, {
      coupon,
      discount: Number(discount.toFixed(2)),
    });
  });

  app.post('/api/coupons', (req, res) => {
    const { code, description, discountType = 'PERCENTAGE', discountValue, minimumOrderAmount = 0, maximumDiscount = 20, expiryDate } = req.body;
    if (!code || !discountValue) return errorResponse(res, 'Code and discount value required');

    const newCoupon: Coupon = {
      id: `coup-${Date.now()}`,
      code: code.toUpperCase(),
      description: description || `${discountValue}% OFF`,
      discountType,
      discountValue: Number(discountValue),
      minimumOrderAmount: Number(minimumOrderAmount) || 0,
      maximumDiscount: Number(maximumDiscount) || 20,
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: expiryDate || '2027-12-31',
      usageLimit: 500,
      usedCount: 0,
      isActive: true,
    };
    coupons.push(newCoupon);
    return successResponse(res, 'Coupon created successfully', newCoupon, 201);
  });

  // ==========================================
  // MODULE 6: ORDERS & ORDER WORKFLOW (PRD Sec 12, 13, 14, 28)
  // ==========================================
  app.get('/api/orders', (req, res) => {
    const { customerId, restaurantId, deliveryPartnerId, status } = req.query;
    let result = [...orders];

    if (customerId) {
      result = result.filter((o) => o.customerId === customerId);
    }
    if (restaurantId) {
      result = result.filter((o) => o.restaurantId === restaurantId);
    }
    if (deliveryPartnerId) {
      result = result.filter((o) => o.deliveryPartnerId === deliveryPartnerId);
    }
    if (status) {
      result = result.filter((o) => o.orderStatus === status);
    }

    // Sort newest first
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return successResponse(res, 'Orders fetched successfully', result);
  });

  app.get('/api/orders/:id', (req, res) => {
    const order = orders.find((o) => o.id === req.params.id || o.orderNumber === req.params.id);
    if (!order) {
      return errorResponse(res, 'Order not found', [], 404);
    }
    return successResponse(res, 'Order details fetched', order);
  });

  // Place Order API
  app.post('/api/orders', (req, res) => {
    const {
      customerId = 'user-cust-1',
      restaurantId,
      items,
      deliveryAddress,
      paymentMethod = 'COD',
      couponCode,
      specialInstructions,
    } = req.body;

    if (!restaurantId || !items || !items.length || !deliveryAddress) {
      return errorResponse(res, 'Restaurant, food items, and delivery address are required');
    }

    const restaurant = restaurants.find((r) => r.id === restaurantId);
    if (!restaurant) {
      return errorResponse(res, 'Restaurant not found', [], 404);
    }

    const user = users.find((u) => u.id === customerId) || users[0];

    // Calculate subtotal
    const subtotal = items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
    const deliveryFee = restaurant.deliveryFee || 2.99;
    const tax = Number((subtotal * 0.0825).toFixed(2)); // ~8.25% tax

    let discount = 0;
    if (couponCode) {
      const coupon = coupons.find((c) => c.code.toUpperCase() === couponCode.toUpperCase() && c.isActive);
      if (coupon && subtotal >= coupon.minimumOrderAmount) {
        discount = coupon.discountType === 'PERCENTAGE'
          ? Math.min((subtotal * coupon.discountValue) / 100, coupon.maximumDiscount)
          : coupon.discountValue;
        coupon.usedCount += 1;
      }
    }

    const totalAmount = Number((subtotal + deliveryFee + tax - discount).toFixed(2));
    const orderNumber = `FG-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerId: user.id,
      customerName: user.name,
      customerPhone: user.phone,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurantAddress: restaurant.address,
      restaurantPhone: restaurant.phone,
      restaurantImage: restaurant.image,
      items,
      deliveryAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'SUCCESS',
      orderStatus: 'PENDING',
      subtotal: Number(subtotal.toFixed(2)),
      deliveryFee,
      tax,
      discount: Number(discount.toFixed(2)),
      totalAmount,
      couponCode,
      specialInstructions,
      statusHistory: [
        {
          status: 'PENDING',
          timestamp: new Date().toISOString(),
          note: 'Order submitted by customer',
        },
      ],
      estimatedDeliveryTimeMinutes: restaurant.deliveryTimeMinutes + 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.unshift(newOrder);

    // Notify Restaurant
    sendNotification(
      restaurant.ownerId,
      'ROLE_RESTAURANT',
      'New Order Placed! 🔔',
      `New order #${orderNumber} received for $${totalAmount.toFixed(2)} from ${user.name}.`,
      'ORDER',
      newOrder.id
    );

    // Notify Customer
    sendNotification(
      user.id,
      'ROLE_CUSTOMER',
      'Order Confirmed! 🎉',
      `Your order #${orderNumber} from ${restaurant.name} has been placed.`,
      'ORDER',
      newOrder.id
    );

    return successResponse(res, 'Order placed successfully', newOrder, 201);
  });

  // Update Order Status (Restaurant, Delivery Partner, Admin)
  app.put('/api/orders/:id/status', (req, res) => {
    const { status, note, deliveryPartnerId } = req.body;
    const order = orders.find((o) => o.id === req.params.id);

    if (!order) {
      return errorResponse(res, 'Order not found', [], 404);
    }

    const validStatuses: OrderStatus[] = [
      'PENDING',
      'CONFIRMED',
      'RESTAURANT_ACCEPTED',
      'PREPARING',
      'READY_FOR_PICKUP',
      'PICKED_UP',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
      'REJECTED',
    ];

    if (!validStatuses.includes(status)) {
      return errorResponse(res, 'Invalid order status transition');
    }

    order.orderStatus = status;
    order.updatedAt = new Date().toISOString();
    order.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Order updated to ${status}`,
    });

    if (deliveryPartnerId) {
      const partner = deliveryPartners.find((p) => p.id === deliveryPartnerId);
      if (partner) {
        order.deliveryPartnerId = partner.id;
        order.deliveryPartnerName = partner.name;
        order.deliveryPartnerPhone = partner.phone;
      }
    }

    if (status === 'DELIVERED') {
      order.paymentStatus = 'SUCCESS';
      if (order.deliveryPartnerId) {
        const partner = deliveryPartners.find((p) => p.id === order.deliveryPartnerId);
        if (partner) {
          partner.completedDeliveriesCount += 1;
          partner.todayEarnings += order.deliveryFee + 3.0; // base fee + tip/bonus
          partner.totalEarnings += order.deliveryFee + 3.0;
          partner.currentOrderId = undefined;
        }
      }
      sendNotification(
        order.customerId,
        'ROLE_CUSTOMER',
        'Order Delivered! 🍕 Enjoy your meal!',
        `Your order #${order.orderNumber} from ${order.restaurantName} has arrived. Please rate your experience!`,
        'ORDER',
        order.id
      );
    } else if (status === 'READY_FOR_PICKUP') {
      // Broadcast / assign to delivery partners
      sendNotification(
        'user-deliv-1',
        'ROLE_DELIVERY_PARTNER',
        'New Delivery Assignment Available 📦',
        `Order #${order.orderNumber} at ${order.restaurantName} is ready for pickup.`,
        'DELIVERY',
        order.id
      );
    } else if (status === 'PREPARING') {
      sendNotification(
        order.customerId,
        'ROLE_CUSTOMER',
        'Food is being prepared 🍳',
        `${order.restaurantName} is preparing your delicious dishes!`,
        'ORDER',
        order.id
      );
    }

    return successResponse(res, `Order status updated to ${status}`, order);
  });

  // Cancel Order API (Rule 5: Allowed before PREPARING)
  app.post('/api/orders/:id/cancel', (req, res) => {
    const { reason = 'Cancelled by user' } = req.body;
    const order = orders.find((o) => o.id === req.params.id);

    if (!order) return errorResponse(res, 'Order not found', [], 404);

    const nonCancellable: OrderStatus[] = ['PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    if (nonCancellable.includes(order.orderStatus)) {
      return errorResponse(
        res,
        'Order cannot be cancelled after restaurant has started preparing the food.',
        ['Cancellation window expired']
      );
    }

    order.orderStatus = 'CANCELLED';
    order.statusHistory.push({
      status: 'CANCELLED',
      timestamp: new Date().toISOString(),
      note: reason,
    });
    order.updatedAt = new Date().toISOString();

    sendNotification(
      order.customerId,
      'ROLE_CUSTOMER',
      'Order Cancelled',
      `Order #${order.orderNumber} has been cancelled.`,
      'ORDER',
      order.id
    );

    return successResponse(res, 'Order cancelled successfully', order);
  });

  // ==========================================
  // MODULE 7: DELIVERY PARTNER WORKFLOW (PRD Sec 14)
  // ==========================================
  app.get('/api/delivery/available', (req, res) => {
    // Orders in READY_FOR_PICKUP or RESTAURANT_ACCEPTED without a delivery partner
    const available = orders.filter(
      (o) =>
        (o.orderStatus === 'READY_FOR_PICKUP' || o.orderStatus === 'PREPARING') &&
        !o.deliveryPartnerId
    );
    return successResponse(res, 'Available deliveries retrieved', available);
  });

  app.get('/api/delivery/partner-stats', (req, res) => {
    const partnerId = (req.query.partnerId as string) || 'deliv-1';
    const partner = deliveryPartners.find((p) => p.id === partnerId || p.userId === partnerId) || deliveryPartners[0];
    const activeOrder = orders.find(
      (o) =>
        o.deliveryPartnerId === partner.id &&
        ['READY_FOR_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)
    );
    const completedOrders = orders.filter(
      (o) => o.deliveryPartnerId === partner.id && o.orderStatus === 'DELIVERED'
    );

    return successResponse(res, 'Delivery partner stats fetched', {
      partner,
      activeOrder,
      completedOrders,
    });
  });

  app.post('/api/delivery/:orderId/accept', (req, res) => {
    const { partnerId = 'deliv-1' } = req.body;
    const order = orders.find((o) => o.id === req.params.orderId);
    const partner = deliveryPartners.find((p) => p.id === partnerId || p.userId === partnerId) || deliveryPartners[0];

    if (!order) return errorResponse(res, 'Order not found', [], 404);

    order.deliveryPartnerId = partner.id;
    order.deliveryPartnerName = partner.name;
    order.deliveryPartnerPhone = partner.phone;
    partner.currentOrderId = order.id;

    if (order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED') {
      order.orderStatus = 'RESTAURANT_ACCEPTED';
    }

    order.statusHistory.push({
      status: order.orderStatus,
      timestamp: new Date().toISOString(),
      note: `Delivery assigned to ${partner.name}`,
    });

    sendNotification(
      order.customerId,
      'ROLE_CUSTOMER',
      'Delivery Partner Assigned! 🛵',
      `${partner.name} (${partner.vehicleType} - ${partner.vehicleNumber}) has accepted your delivery.`,
      'DELIVERY',
      order.id
    );

    return successResponse(res, 'Delivery accepted successfully', { order, partner });
  });

  app.post('/api/delivery/toggle-status', (req, res) => {
    const { partnerId = 'deliv-1', isOnline } = req.body;
    const partner = deliveryPartners.find((p) => p.id === partnerId || p.userId === partnerId) || deliveryPartners[0];
    partner.isOnline = isOnline !== undefined ? isOnline : !partner.isOnline;
    return successResponse(res, `Delivery status changed to ${partner.isOnline ? 'ONLINE' : 'OFFLINE'}`, partner);
  });

  // ==========================================
  // MODULE 8: REVIEWS & RATINGS (PRD Sec 17)
  // ==========================================
  app.get('/api/reviews/restaurant/:restaurantId', (req, res) => {
    const restReviews = reviews.filter((r) => r.restaurantId === req.params.restaurantId && !r.moderated);
    return successResponse(res, 'Reviews fetched', restReviews);
  });

  app.get('/api/reviews', (req, res) => {
    return successResponse(res, 'All reviews fetched', reviews);
  });

  app.post('/api/reviews', (req, res) => {
    const {
      orderId,
      restaurantId,
      customerId = 'user-cust-1',
      rating,
      foodQualityRating = 5,
      deliveryRating = 5,
      comment,
    } = req.body;

    if (!restaurantId || !rating || !comment) {
      return errorResponse(res, 'Restaurant ID, rating and comment are required');
    }

    const customer = users.find((u) => u.id === customerId) || users[0];
    const restaurant = restaurants.find((r) => r.id === restaurantId);

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      orderId: orderId || 'manual',
      restaurantId,
      restaurantName: restaurant?.name || 'Restaurant',
      customerId: customer.id,
      customerName: customer.name,
      customerAvatar: customer.avatar,
      rating: Number(rating),
      foodQualityRating: Number(foodQualityRating),
      deliveryRating: Number(deliveryRating),
      comment,
      createdAt: new Date().toISOString(),
      moderated: false,
    };

    reviews.unshift(newRev);

    // Update restaurant average rating
    if (restaurant) {
      const restRevs = reviews.filter((r) => r.restaurantId === restaurant.id && !r.moderated);
      const avg = restRevs.reduce((a, b) => a + b.rating, 0) / restRevs.length;
      restaurant.rating = Number(avg.toFixed(1));
      restaurant.reviewCount = restRevs.length;
    }

    // Mark order as reviewed if linked
    if (orderId) {
      const ord = orders.find((o) => o.id === orderId);
      if (ord) ord.ratingSubmitted = true;
    }

    return successResponse(res, 'Thank you for your review!', newRev, 201);
  });

  // ==========================================
  // MODULE 9: NOTIFICATIONS
  // ==========================================
  app.get('/api/notifications', (req, res) => {
    const { userId, role } = req.query;
    let userNotifs = [...notifications];

    if (userId) {
      userNotifs = userNotifs.filter((n) => n.userId === userId || n.userId === 'user-cust-1');
    } else if (role) {
      userNotifs = userNotifs.filter((n) => n.role === role);
    }

    return successResponse(res, 'Notifications fetched', userNotifs);
  });

  app.post('/api/notifications/mark-read', (req, res) => {
    const { id, userId } = req.body;
    if (id) {
      const notif = notifications.find((n) => n.id === id);
      if (notif) notif.read = true;
    } else if (userId) {
      notifications.forEach((n) => {
        if (n.userId === userId) n.read = true;
      });
    } else {
      notifications.forEach((n) => (n.read = true));
    }
    return successResponse(res, 'Notifications marked as read');
  });

  // ==========================================
  // MODULE 10: ADMIN DASHBOARD & ANALYTICS (PRD Sec 19 & 29)
  // ==========================================
  app.get('/api/admin/stats', (req, res) => {
    const totalRevenue = orders
      .filter((o) => o.orderStatus === 'DELIVERED')
      .reduce((acc, o) => acc + o.totalAmount, 0);

    const todayRevenue = orders
      .filter((o) => o.orderStatus === 'DELIVERED')
      .reduce((acc, o) => acc + o.totalAmount * 0.45, 0); // simulated today proportion

    const completedOrders = orders.filter((o) => o.orderStatus === 'DELIVERED').length;
    const cancelledOrders = orders.filter((o) => o.orderStatus === 'CANCELLED' || o.orderStatus === 'REJECTED').length;
    const activeOrdersCount = orders.filter(
      (o) => !['DELIVERED', 'CANCELLED', 'REJECTED'].includes(o.orderStatus)
    ).length;

    const topRestaurants = restaurants.map((r) => {
      const rOrders = orders.filter((o) => o.restaurantId === r.id);
      const rev = rOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      return {
        id: r.id,
        name: r.name,
        orders: rOrders.length,
        revenue: Number(rev.toFixed(2)),
        rating: r.rating,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    const topFoods = foods.slice(0, 6).map((f) => ({
      id: f.id,
      name: f.name,
      restaurantName: f.restaurantName || 'Restaurant',
      ordersCount: Math.floor(Math.random() * 80 + 20),
      revenue: Number((f.price * (Math.random() * 50 + 20)).toFixed(2)),
    }));

    return successResponse(res, 'Admin stats retrieved', {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      todayRevenue: Number(todayRevenue.toFixed(2)),
      totalOrders: orders.length,
      completedOrders,
      cancelledOrders,
      activeOrdersCount,
      totalUsers: users.length,
      totalRestaurants: restaurants.length,
      totalDeliveryPartners: deliveryPartners.length,
      topRestaurants,
      topFoods,
      recentOrders: orders.slice(0, 8),
    });
  });

  app.get('/api/admin/users', (req, res) => {
    return successResponse(res, 'All users fetched', users);
  });

  app.put('/api/admin/users/:id/toggle-block', (req, res) => {
    const user = users.find((u) => u.id === req.params.id);
    if (!user) return errorResponse(res, 'User not found', [], 404);
    user.status = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    return successResponse(res, `User account ${user.status.toLowerCase()}`, user);
  });

  app.put('/api/admin/restaurants/:id/toggle-status', (req, res) => {
    const rest = restaurants.find((r) => r.id === req.params.id);
    if (!rest) return errorResponse(res, 'Restaurant not found', [], 404);
    rest.status = rest.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    return successResponse(res, `Restaurant status set to ${rest.status}`, rest);
  });

  app.delete('/api/admin/reviews/:id', (req, res) => {
    const rev = reviews.find((r) => r.id === req.params.id);
    if (rev) {
      rev.moderated = true;
    }
    return successResponse(res, 'Review moderated/hidden');
  });

  // OpenAPI Specification endpoint (PRD Sec 4 & 21)
  app.get('/api/openapi.json', (req, res) => {
    res.json({
      openapi: '3.0.0',
      info: {
        title: 'FoodGo — Food Delivery Platform REST API',
        version: '1.0.0',
        description: 'Comprehensive Spring Boot RESTful API endpoints for Customer, Restaurant, Delivery Partner, and Admin modules.',
      },
      servers: [{ url: '/api', description: 'Development Server' }],
      tags: [
        { name: 'Auth', description: 'Authentication & JWT endpoints' },
        { name: 'Restaurants', description: 'Restaurant discovery and management' },
        { name: 'Foods & Categories', description: 'Menu item and category CRUD' },
        { name: 'Orders', description: 'Cart checkout and full order lifecycle' },
        { name: 'Delivery', description: 'Delivery partner assignment & status tracking' },
        { name: 'Coupons', description: 'Discount codes and promotions' },
        { name: 'Reviews', description: 'Customer ratings and feedback' },
        { name: 'Admin', description: 'Platform analytics and moderation' },
      ],
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FoodGo backend running on http://localhost:${PORT}`);
  });
}

startServer();
