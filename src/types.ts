export interface Tenant {
  id: string; // unique slug e.g. "grace-memorials"
  companyName: string;
  logoUrl: string;
  currency: string; // e.g. "$" or "GH₵" or "€" or "£" or "₦"
  currencyCode: string; // e.g. "USD", "GHS", "EUR", "GBP"
  phone: string;
  address: string;
  email: string;
  adminPasswordHash: string;
  databaseId: string; // separate database ID e.g. "sf-db-grace-memorials"
  createdAt: string; // ISO string
  trialEndDate: string; // ISO string (30 days from creation)
  customUrl: string; // e.g. "https://socialfunera.pages.dev/?tenant=grace-memorials"
  isTrialActive: boolean;
}

export interface SubscriptionTransaction {
  id: string;
  tenantId: string;
  companyName: string;
  amount: number;
  currency: string;
  billingPeriod: string;
  date: string;
  status: 'paid' | 'pending' | 'failed' | 'trial';
  paymentMethod: string;
  referenceNumber: string;
}

export type UserRole = 'admin' | 'worker' | 'user';

export type OnlineStatus = 'online' | 'offline' | string; // e.g., '30 mins ago'

export interface UserProfile {
  id: string; // Worker ID or Admin ID
  firstName: string;
  lastName: string;
  otherNames?: string;
  email: string;
  phoneNumber: string;
  ghanaCardId: string;
  location: string;
  dateOfEmployment: string; // YYYY-MM-DD
  notes?: string;
  avatarUrl: string;
  role: UserRole;
  password?: string;
  lastActive?: string; // ISO date string
  status?: OnlineStatus;
}

export interface Category {
  id: string;
  name: string;
}

export interface StoreLocation {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  variant: string;
  description: string;
  supplierInfo: string;
  expirationDate: string; // YYYY-MM-DD
  categoryId: string;
  categoryName: string;
  locationId: string;
  locationName: string;
  costPrice: number;
  sellingPrice: number;
  quantityInStock: number;
  initialQuantity: number; // for indicator calculations
  imageUrl?: string;
  images?: string[];
  colourImages?: Record<string, string[]>;
}

export interface CartItem {
  product: Product;
  quantity: number;
  totalPrice: number;
}

export interface CustomerInfo {
  name: string;
  phoneNumber: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  variant: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  costPrice?: number;
}

export interface Order {
  id: string; // e.g. AB785420
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  date: string; // DD-MM-YYYY or ISO
  time: string; // e.g. 1:49AM
  createdAt: string; // ISO string
  workerId: string;
  workerName: string;
  pdfFileName: string; // e.g. AB785420_0542859612_26-11-2026_1-49AM.pdf
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  body: string;
  lastEditedAt: string;
}

export interface FeedbackMessage {
  id: string;
  workerId: string;
  workerName: string;
  senderRole: UserRole;
  message: string;
  createdAt: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'document';
  readByAdmin: boolean;
  readByWorker: boolean;
}

export interface LogEntry {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: 'login' | 'logout' | 'order' | 'inventory' | 'system';
  details: string; // e.g. "Completed Order AB785420_0542859612_26-11-2026_1-49AM"
  timestamp: string; // ISO string
  date: string; // YYYY-MM-DD for fast filtering
}

export interface SystemSettings {
  shopName: string;
  companyLogoUrl: string;
  phone: string;
  email: string;
  address: string;
  companyPhone?: string;
  companyEmail?: string;
  companyAddress?: string;
  currency: string; // e.g. "GH₵"
  currencyCode: string; // e.g. "GHS"
  adminEmail: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  shiftSchedule?: string; // e.g. "7 AM - 7 PM Shifts"
  shiftStartTime?: string; // e.g. "07:00"
  shiftEndTime?: string; // e.g. "19:00"
  shiftEnabled?: boolean;
}
