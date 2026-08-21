export type UserRole = 'ROLE_CUSTOMER' | 'ROLE_RESTAURANT' | 'ROLE_DELIVERY_PARTNER' | 'ROLE_ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  status: 'ACTIVE' | 'BLOCKED';
  createdAt: string;
  restaurantId?: string;
}

export interface FoodCategory {
  id: string;
  name: string;
  icon: string;
  image: string;
  description: string;
  itemCount?: number;
}

export interface FoodItem {
  id: string;
  restaurantId: string;
  restaurantName?: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  imageUrl: string;
  isAvailable: boolean;
  isVegetarian: boolean;
  isBestSeller?: boolean;
  preparationTime: number;
  calories?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Restaurant {
  id: string;
  ownerId: string;
  ownerName?: string;
  name: string;
  description: string;
  cuisine: string[];
  rating: number;
  reviewCount: number;
  deliveryTimeMinutes: number;
  deliveryFee: number;
  minOrderAmount: number;
  address: string;
  city: string;
  image: string;
  bannerImage: string;
  isOpen: boolean;
  isFeatured: boolean;
  status: 'ACTIVE' | 'PENDING' | 'BLOCKED';
  phone: string;
  lat: number;
  lng: number;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  addressType: 'Home' | 'Work' | 'Other';
  fullAddress: string;
  houseNumber: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
}

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
  instructions?: string;
}

export interface Cart {
  restaurantId: string | null;
  restaurantName: string | null;
  items: CartItem[];
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'RESTAURANT_ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED';

export type PaymentMethod = 'COD' | 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'NET_BANKING';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface OrderItem {
  foodId: string;
  foodName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  isVegetarian?: boolean;
  instructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  restaurantId: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantPhone: string;
  restaurantImage: string;
  items: OrderItem[];
  deliveryAddress: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  deliveryPartnerPhone?: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  totalAmount: number;
  couponCode?: string;
  specialInstructions?: string;
  statusHistory: { status: OrderStatus; timestamp: string; note?: string }[];
  estimatedDeliveryTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
  ratingSubmitted?: boolean;
}

export interface DeliveryPartner {
  id: string;
  userId: string;
  name: string;
  phone: string;
  avatar: string;
  vehicleType: 'Bike' | 'Scooter' | 'Electric EV';
  vehicleNumber: string;
  rating: number;
  isOnline: boolean;
  currentOrderId?: string;
  completedDeliveriesCount: number;
  todayEarnings: number;
  totalEarnings: number;
  currentLocation?: { lat: number; lng: number };
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscount: number;
  startDate: string;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export interface Review {
  id: string;
  orderId: string;
  restaurantId: string;
  restaurantName?: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  foodQualityRating: number;
  deliveryRating: number;
  comment: string;
  createdAt: string;
  moderated: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  role: UserRole;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'ORDER' | 'PAYMENT' | 'DELIVERY' | 'SYSTEM';
  orderId?: string;
}

export interface AdminAnalytics {
  totalRevenue: number;
  todayRevenue: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalUsers: number;
  totalRestaurants: number;
  totalDeliveryPartners: number;
  activeOrdersCount: number;
  topRestaurants: { id: string; name: string; orders: number; revenue: number; rating: number }[];
  topFoods: { id: string; name: string; restaurantName: string; ordersCount: number; revenue: number }[];
  recentOrders: Order[];
}

export interface RestaurantAnalytics {
  todayOrders: number;
  weeklyOrders: number;
  monthlyOrders: number;
  todayRevenue: number;
  totalRevenue: number;
  averageRating: number;
  cancelledOrders: number;
  popularItems: { id: string; name: string; count: number; revenue: number }[];
}

export interface CostumerAnalysis {
  costumerOrder: orderName;
  costumerName:  orderId;
  costumerId: OrderItem;
  costumerOrderPrice: OrderStatus;
  costumerOrder 
}
