
export type Role = 'super_admin' | 'owner' | 'employee';
export type SubscriptionStatus = 'FREE' | 'PREMIUM';

export interface Product {
  id: string;
  storeId: string;
  code: string;         // "Codigo"
  name: string;         // "Descripcion"
  costPrice: number;    // "Precio Costo"
  price: number;        // "Precio Venta"
  wholesalePrice: number; // "Precio Mayoreo"
  stock: number;        // "Inventario"
  minStock: number;     // "Inv. Minimo"
  category: string;     // "Departamento"
  image?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Sale {
  id: string;
  storeId: string;
  date: string;
  total: number;
  items: CartItem[];
  paymentMethod: 'cash' | 'card' | 'paypal' | 'transfer';
  soldBy: string; // username
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  email?: string;
  businessType?: 'restaurant' | 'retail';
}

export interface Store {
  id: string;
  name: string;
  ownerId: string;
  staffUsernames: string[];
  subscription: SubscriptionStatus;
  planId?: string; // 'free', 'basic_mxn', 'pro_mxn'
  subscriptionExpiry?: string;
  createdAt?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  maxEmployees: number; // -1 for unlimited
  maxProducts: number;  // -1 for unlimited
  features: string[];
  isPopular?: boolean;
}

export interface SystemConfig {
  freeTierLimit: number; // Legacy support, mapped to plan 'free' maxProducts
  plans: SubscriptionPlan[];
}

export enum ViewState {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  STORE_SELECT = 'STORE_SELECT',
  DASHBOARD = 'DASHBOARD',
  POS = 'POS',
  INVENTORY = 'INVENTORY',
  STORE_SETTINGS = 'STORE_SETTINGS',
  SUPER_ADMIN = 'SUPER_ADMIN'
}