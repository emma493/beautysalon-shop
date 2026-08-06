import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserProfile,
  Product,
  Category,
  StoreLocation,
  Order,
  CartItem,
  Note,
  FeedbackMessage,
  LogEntry,
  SystemSettings,
  UserRole,
} from '../types';
import { sounds } from '../utils/audio';
import { hashPassword, verifyPassword, isHashed } from '../utils/security';
import { db, handleFirestoreError, OperationType, ensureFirebaseSession } from '../lib/firebase';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';

function removeUndefinedFields<T extends Record<string, any>>(obj: T): T {
  const cleaned: any = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
        cleaned[key] = removeUndefinedFields(obj[key]);
      } else {
        cleaned[key] = obj[key];
      }
    }
  });
  return cleaned as T;
}

interface ToastState {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface StoreContextType {
  // Auth
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  activeRole: UserRole;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateAdminPassword: (oldPass: string, newPass: string) => Promise<boolean>;
  resetWorkerPassword: (workerId: string, newPass: string) => void;

  // Navigation & Theme
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  currentRoleView: UserRole; // whether viewed on / or /admin
  setCurrentRoleView: (role: UserRole) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;

  // Settings
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;

  // Products & Inventory
  products: Product[];
  categories: Category[];
  storeLocations: StoreLocation[];
  addProduct: (product: Omit<Product, 'id' | 'initialQuantity'>) => void;
  updateProduct: (productId: string, updatedData: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  updateStock: (productId: string, deltaQuantity: number) => void;
  addCategory: (name: string) => void;
  removeCategory: (id: string) => void;
  addStoreLocation: (name: string) => void;
  removeStoreLocation: (id: string) => void;

  // Cart & Orders
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  completeOrder: (customerName: string, customerPhone: string) => Order | null;
  orders: Order[];
  resetTransactions: () => Promise<void>;

  // Workers / Users
  workers: UserProfile[];
  addWorker: (workerData: Omit<UserProfile, 'role'>) => void;
  updateWorker: (workerId: string, updatedData: Partial<UserProfile>) => void;
  removeWorker: (workerId: string) => void;
  generateWorkerId: (firstName: string) => string;



  // Notes
  notes: Note[];
  saveNote: (noteId: string | null, title: string, body: string) => Note;
  deleteNote: (noteId: string) => void;

  // Feedback Messages
  feedbackMessages: FeedbackMessage[];
  sendFeedback: (
    message: string,
    attachmentUrl?: string,
    attachmentType?: 'image' | 'document',
    targetWorkerId?: string
  ) => void;
  unreadFeedbackCount: number;

  // Logs
  logs: LogEntry[];
  addLog: (action: LogEntry['action'], details: string) => void;

  // Toasts
  toasts: ToastState[];
  showToast: (message: string, type?: ToastState['type']) => void;
  removeToast: (id: string) => void;

  // Supabase SQL Viewer Modal
  isSqlModalOpen: boolean;
  setIsSqlModalOpen: (open: boolean) => void;
}

const DEFAULT_SETTINGS: SystemSettings = {
  shopName: 'Beauty Salon',
  companyLogoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPMa5VhqKVOgQMYbb5sZBdxxb4PGZc0kSiLC3iTRgQWA&s=10',
  phone: '054 285 9612',
  email: 'info@beautysalon.com',
  address: 'Accra, Ghana',
  companyPhone: '054 285 9612',
  companyEmail: 'info@beautysalon.com',
  companyAddress: 'Accra, Ghana',
  currency: 'GHS',
  currencyCode: 'GHS',
  adminEmail: 'admin@beautysalon.com',
  shiftSchedule: '7 AM - 7 PM Shifts',
  shiftStartTime: '07:00',
  shiftEndTime: '19:00',
  shiftEnabled: true,
};

const DEFAULT_ADMIN: UserProfile = {
  id: 'ADMIN001',
  firstName: 'System',
  lastName: 'Admin',
  otherNames: 'Manager',
  email: 'admin@grocery.com',
  password: 'AdminPassword123',
  phoneNumber: '0542859612',
  ghanaCardId: 'GHA-000000000-1',
  location: 'Headquarters',
  dateOfEmployment: '2026-01-01',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  role: 'admin',
  status: 'online',
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Active state persisted across page reloads
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('salon_active_user');
        if (savedUser) {
          return JSON.parse(savedUser);
        }
      } catch (e) {
        console.error('Failed to parse saved user session', e);
      }
    }
    return null;
  });

  const [adminUser, setAdminUser] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedAdmin = localStorage.getItem('salon_admin_user');
        if (savedAdmin) {
          return JSON.parse(savedAdmin);
        }
      } catch (e) {
        console.error('Failed to parse saved admin user', e);
      }
    }
    return DEFAULT_ADMIN;
  });

  const [currentRoleView, setCurrentRoleView] = useState<UserRole>(() => {
    if (typeof window !== 'undefined' && window.location.pathname.toLowerCase().startsWith('/admin')) {
      return 'admin';
    }
    if (currentUser?.role === 'admin') return 'admin';
    return 'user';
  });
  const [currentTab, setCurrentTabState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedTab = localStorage.getItem('salon_active_tab');
        if (savedTab) return savedTab;
      } catch (e) {
        console.error('Failed to parse saved active tab', e);
      }
    }
    return 'Dashboard';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Sync active user session to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (currentUser) {
        localStorage.setItem('salon_active_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('salon_active_user');
      }
    }
  }, [currentUser]);

  // Sync active tab to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (currentTab) {
        localStorage.setItem('salon_active_tab', currentTab);
      }
    }
  }, [currentTab]);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  const setCurrentTab = (tab: string) => {
    setCurrentTabState(tab);
    setIsMobileMenuOpen(false);
  };

  // URL Path Sync for / vs /admin
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const pathIsAdmin = window.location.pathname.toLowerCase().startsWith('/admin');
    if (currentRoleView === 'admin' && !pathIsAdmin) {
      window.history.replaceState({}, '', '/admin');
    } else if (currentRoleView === 'user' && pathIsAdmin) {
      window.history.replaceState({}, '', '/');
    }
  }, [currentRoleView]);

  // Listen to popstate for browser navigation
  useEffect(() => {
    const handlePopState = () => {
      const pathIsAdmin = window.location.pathname.toLowerCase().startsWith('/admin');
      if (currentUser && currentUser.role !== 'admin' && pathIsAdmin) {
        setCurrentRoleView('user');
        window.history.replaceState({}, '', '/');
      } else {
        setCurrentRoleView(pathIsAdmin ? 'admin' : 'user');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser]);

  // Enforce role security: non-admin users cannot stay in admin view
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin' && currentRoleView === 'admin') {
      setCurrentRoleView('user');
    }
  }, [currentUser, currentRoleView]);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { id: 'cat-1', name: 'Beverages & Soft Drinks' },
    { id: 'cat-2', name: 'Grains & Rice' },
    { id: 'cat-3', name: 'Cosmetics & Toiletries' },
    { id: 'cat-4', name: 'Oils & Spices' },
    { id: 'cat-5', name: 'Canned Foods' },
  ]);
  const [storeLocations, setStoreLocations] = useState<StoreLocation[]>([
    { id: 'loc-1', name: 'Aisle 1 - Main Floor' },
    { id: 'loc-2', name: 'Aisle 2 - Cosmetics Bay' },
    { id: 'loc-3', name: 'Shelf B4 - Backstore' },
    { id: 'loc-4', name: 'Front Display Rack' },
  ]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [workers, setWorkers] = useState<UserProfile[]>([]);

  const [notes, setNotes] = useState<Note[]>([]);
  const [feedbackMessages, setFeedbackMessages] = useState<FeedbackMessage[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);

  // Real-time Firestore Listeners
  useEffect(() => {
    // The security rules now require an authenticated session (see
    // firestore.rules) instead of the old fully-open "allow read, write:
    // if true". ensureFirebaseSession() signs the client in anonymously so
    // these listeners have a request.auth to satisfy those rules. This
    // resolves almost immediately, but we still guard against the effect
    // being torn down (fast unmount) before it does.
    let cancelled = false;
    let unsubAdmin = () => {};
    let unsubSettings = () => {};
    let unsubProducts = () => {};
    let unsubCategories = () => {};
    let unsubLocations = () => {};
    let unsubOrders = () => {};
    let unsubWorkers = () => {};
    let unsubNotes = () => {};
    let unsubFeedback = () => {};
    let unsubLogs = () => {};

    ensureFirebaseSession().then(() => {
      if (cancelled) return;

    // 0. Admin User Profile Listener
    unsubAdmin = onSnapshot(
      doc(db, 'app_config', 'admin_user'),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as UserProfile;
          setAdminUser(data);
          if (typeof window !== 'undefined') {
            localStorage.setItem('salon_admin_user', JSON.stringify(data));
          }
        } else {
          setDoc(doc(db, 'app_config', 'admin_user'), DEFAULT_ADMIN).catch(console.error);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'app_config/admin_user')
    );

    // 1. Settings Listener with error handling
    unsubSettings = onSnapshot(
      doc(db, 'app_config', 'settings'),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as SystemSettings;
          if (!data.shopName || data.shopName.includes('Modern Life') || data.shopName.includes('Remix') || data.shopName.includes('Grocery') || data.companyLogoUrl?.includes('unsplash')) {
            data.shopName = 'Beauty Salon';
            data.companyLogoUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPMa5VhqKVOgQMYbb5sZBdxxb4PGZc0kSiLC3iTRgQWA&s=10';
            setDoc(doc(db, 'app_config', 'settings'), data, { merge: true }).catch(console.error);
          }
          setSettings(data);
        } else {
          setDoc(doc(db, 'app_config', 'settings'), DEFAULT_SETTINGS).catch(console.error);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'app_config/settings')
    );

    // 2. Products
    unsubProducts = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        const items: Product[] = [];
        snapshot.forEach((d) => items.push(d.data() as Product));
        setProducts(items);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'products')
    );

    // 3. Categories
    unsubCategories = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        const items: Category[] = [];
        snapshot.forEach((d) => items.push(d.data() as Category));
        if (items.length > 0) {
          setCategories(items);
        } else {
          const defaults = [
            { id: 'cat-1', name: 'Beverages & Soft Drinks' },
            { id: 'cat-2', name: 'Grains & Rice' },
            { id: 'cat-3', name: 'Cosmetics & Toiletries' },
            { id: 'cat-4', name: 'Oils & Spices' },
            { id: 'cat-5', name: 'Canned Foods' },
          ];
          defaults.forEach((cat) => setDoc(doc(db, 'categories', cat.id), cat).catch((e) => handleFirestoreError(e, OperationType.WRITE, `categories/${cat.id}`)));
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'categories')
    );



    // 4. Locations
    unsubLocations = onSnapshot(
      collection(db, 'store_locations'),
      (snapshot) => {
        const items: StoreLocation[] = [];
        snapshot.forEach((d) => items.push(d.data() as StoreLocation));
        if (items.length > 0) {
          setStoreLocations(items);
        } else {
          const defaults = [
            { id: 'loc-1', name: 'Aisle 1 - Main Floor' },
            { id: 'loc-2', name: 'Aisle 2 - Cosmetics Bay' },
            { id: 'loc-3', name: 'Shelf B4 - Backstore' },
            { id: 'loc-4', name: 'Front Display Rack' },
          ];
          defaults.forEach((loc) => setDoc(doc(db, 'store_locations', loc.id), loc).catch((e) => handleFirestoreError(e, OperationType.WRITE, `store_locations/${loc.id}`)));
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'store_locations')
    );

    // 5. Orders
    unsubOrders = onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        const items: Order[] = [];
        snapshot.forEach((d) => items.push(d.data() as Order));
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(items);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'orders')
    );

    // 6. Workers
    unsubWorkers = onSnapshot(
      collection(db, 'workers'),
      (snapshot) => {
        const items: UserProfile[] = [];
        snapshot.forEach((d) => items.push(d.data() as UserProfile));
        setWorkers(items);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'workers')
    );



    // 8. Notes
    unsubNotes = onSnapshot(
      collection(db, 'notes'),
      (snapshot) => {
        const items: Note[] = [];
        snapshot.forEach((d) => items.push(d.data() as Note));
        items.sort((a, b) => new Date(b.lastEditedAt).getTime() - new Date(a.lastEditedAt).getTime());
        setNotes(items);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'notes')
    );

    // 9. Feedback Messages
    unsubFeedback = onSnapshot(
      collection(db, 'feedback_messages'),
      (snapshot) => {
        const items: FeedbackMessage[] = [];
        snapshot.forEach((d) => items.push(d.data() as FeedbackMessage));
        items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setFeedbackMessages(items);
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'feedback_messages')
    );

    // 10. Logs
    unsubLogs = onSnapshot(
      collection(db, 'logs'),
      (snapshot) => {
        const items: LogEntry[] = [];
        snapshot.forEach((d) => items.push(d.data() as LogEntry));
        items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setLogs(items);
      },
      (err) => console.warn('Firestore logs listener offline:', err.message)
    );
    }); // end ensureFirebaseSession().then

    return () => {
      cancelled = true;
      unsubAdmin();
      unsubSettings();
      unsubProducts();
      unsubCategories();
      unsubLocations();
      unsubOrders();
      unsubWorkers();
      unsubNotes();
      unsubFeedback();
      unsubLogs();
    };
  }, []);

  // Apply dark mode class to root HTML
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Toast Helper
  const showToast = (message: string, type: ToastState['type'] = 'info') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Add Log Entry to Firestore
  const addLog = (action: LogEntry['action'], details: string) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const id = `LOG_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newLog: LogEntry = {
      id,
      userId: currentUser?.id || 'SYSTEM',
      userName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'System',
      role: currentUser?.role || 'user',
      action,
      details,
      timestamp: now.toISOString(),
      date: dateStr,
    };
    setDoc(doc(db, 'logs', id), newLog).catch(console.error);
  };

  // Auth Operations
  const login = async (email: string, pass: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();
    const currentAdmin = adminUser || DEFAULT_ADMIN;

    const validAdminEmails = [
      currentAdmin.email.toLowerCase(),
      settings.adminEmail?.toLowerCase(),
      settings.companyEmail?.toLowerCase(),
      'admin@grocery.com',
      'admin@beautysalon.com',
      'info@beautysalon.com',
    ].filter(Boolean);

    // Check Admin
    if (validAdminEmails.includes(cleanEmail) && (await verifyPassword(cleanPass, currentAdmin.password) || await verifyPassword(pass, currentAdmin.password))) {
      const updatedAdminSession: UserProfile = {
        ...currentAdmin,
        // Migrate a legacy plaintext password to a hash transparently the
        // first time this record is used to sign in.
        password: await hashPassword(cleanPass || pass),
        status: 'online',
        lastActive: new Date().toISOString(),
      };
      setCurrentUser(updatedAdminSession);
      setAdminUser(updatedAdminSession);
      setCurrentRoleView('admin');
      setDoc(doc(db, 'app_config', 'admin_user'), updatedAdminSession).catch(console.error);
      addLog('login', `Admin logged in successfully (${currentAdmin.email})`);
      showToast('Signed in as System Admin', 'success');
      return true;
    }

    // Check Workers by Email or Worker ID
    let workerMatch: UserProfile | undefined;
    for (const w of workers) {
      const idMatches = w.email.toLowerCase() === cleanEmail || w.id.toLowerCase() === cleanEmail;
      if (!idMatches) continue;
      if ((await verifyPassword(cleanPass, w.password)) || (await verifyPassword(pass, w.password))) {
        workerMatch = w;
        break;
      }
    }
    if (workerMatch) {
      const updatedWorker: UserProfile = {
        ...workerMatch,
        password: await hashPassword(cleanPass || pass),
        status: 'online',
        lastActive: new Date().toISOString(),
      };
      setCurrentUser(updatedWorker);
      setCurrentRoleView('user');
      setDoc(doc(db, 'workers', workerMatch.id), updatedWorker).catch(console.error);
      addLog('login', `Worker ${workerMatch.firstName} ${workerMatch.lastName} logged in (${workerMatch.id})`);
      showToast(`Welcome back, ${workerMatch.firstName}!`, 'success');
      return true;
    }

    showToast('Invalid email or password', 'error');
    return false;
  };

  const logout = () => {
    if (currentUser) {
      addLog('logout', `User ${currentUser.firstName} (${currentUser.id}) logged out`);
      if (currentUser.role === 'worker') {
        const offlineWorker: UserProfile = { ...currentUser, status: 'offline', lastActive: new Date().toISOString() };
        setDoc(doc(db, 'workers', currentUser.id), offlineWorker).catch(console.error);
      }
    }
    setCurrentUser(null);
    setCurrentTabState('Dashboard');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('salon_active_user');
      localStorage.removeItem('salon_active_tab');
    }
    showToast('You have been signed out', 'info');
  };

  const updateAdminPassword = async (oldPass: string, newPass: string): Promise<boolean> => {
    const currentAdmin = adminUser || DEFAULT_ADMIN;
    const activePassword = currentUser?.password || currentAdmin.password;

    const oldPassMatches =
      (await verifyPassword(oldPass, activePassword)) || (await verifyPassword(oldPass, currentAdmin.password));
    if (!oldPassMatches) {
      showToast('Previous password is incorrect', 'error');
      return false;
    }

    const updatedAdmin: UserProfile = {
      ...currentAdmin,
      ...(currentUser?.role === 'admin' ? currentUser : {}),
      password: await hashPassword(newPass),
    };

    setAdminUser(updatedAdmin);
    if (currentUser?.role === 'admin') {
      setCurrentUser(updatedAdmin);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('salon_admin_user', JSON.stringify(updatedAdmin));
      if (currentUser?.role === 'admin') {
        localStorage.setItem('salon_active_user', JSON.stringify(updatedAdmin));
      }
    }

    setDoc(doc(db, 'app_config', 'admin_user'), updatedAdmin).catch((err) => {
      console.error('Failed to update admin user in Firestore:', err);
    });

    addLog('system', 'Admin changed password');
    showToast('Admin password updated successfully', 'success');
    return true;
  };

  const resetWorkerPassword = async (workerId: string, newPass: string) => {
    const target = workers.find((w) => w.id === workerId);
    if (target) {
      const updated: UserProfile = { ...target, password: await hashPassword(newPass) };
      setWorkers((prev) => prev.map((w) => (w.id === workerId ? updated : w)));
      if (currentUser?.id === workerId) {
        setCurrentUser(updated);
      }
      setDoc(doc(db, 'workers', workerId), updated).catch((err) => {
        console.error('Failed to reset worker password in Firestore:', err);
      });
      addLog('system', `Admin reset password for worker ID ${workerId}`);
      showToast(`Password for worker ${target.firstName} reset successfully`, 'success');
    } else {
      showToast('Worker account not found', 'error');
    }
  };

  // Settings
  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    const updated = { ...settings, ...newSettings };
    setDoc(doc(db, 'app_config', 'settings'), updated).catch(console.error);
    showToast('Store settings updated', 'success');
  };

  // Product Operations
  const addProduct = (productData: Omit<Product, 'id' | 'initialQuantity'>) => {
    const id = `PROD_${Date.now().toString(36).toUpperCase()}`;
    const newProduct: Product = {
      ...productData,
      id,
      initialQuantity: productData.quantityInStock,
    };
    setDoc(doc(db, 'products', id), newProduct).catch(console.error);
    sounds.playPositiveDing();
    addLog('inventory', `Added product "${newProduct.name}" (${newProduct.id})`);
    showToast(`Product "${newProduct.name}" added successfully`, 'success');
  };

  const updateProduct = (productId: string, updatedData: Partial<Product>) => {
    const target = products.find((p) => p.id === productId);
    if (target) {
      const updated: Product = {
        ...target,
        ...updatedData,
        id: target.id,
      };
      setDoc(doc(db, 'products', productId), updated).catch(console.error);
      addLog('inventory', `Updated product "${updated.name}" (${updated.id})`);
      showToast(`Product "${updated.name}" updated successfully`, 'success');
    }
  };

  const deleteProduct = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    if (target) {
      deleteDoc(doc(db, 'products', productId)).catch(console.error);
      addLog('inventory', `Deleted product "${target.name}" (${target.id})`);
      showToast(`Product "${target.name}" deleted`, 'info');
    }
  };

  const updateStock = (productId: string, deltaQuantity: number) => {
    const target = products.find((p) => p.id === productId);
    if (target) {
      const newQty = Math.max(0, target.quantityInStock + deltaQuantity);
      const updated: Product = {
        ...target,
        quantityInStock: newQty,
        initialQuantity: Math.max(target.initialQuantity, newQty),
      };
      setDoc(doc(db, 'products', productId), updated).catch(console.error);
      addLog('inventory', `Adjusted stock for item ${productId} by ${deltaQuantity > 0 ? '+' : ''}${deltaQuantity}`);
      showToast('Stock quantity updated', 'info');
    }
  };

  const addCategory = (name: string) => {
    if (!name.trim()) return;
    const newCat = { id: `cat-${Date.now()}`, name: name.trim() };
    setCategories((prev) => [...prev, newCat]);
    setDoc(doc(db, 'categories', newCat.id), newCat).catch(console.error);
    showToast(`Category "${name}" added`, 'success');
  };

  const removeCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    deleteDoc(doc(db, 'categories', id)).catch(console.error);
    showToast('Category removed', 'info');
  };

  const addStoreLocation = (name: string) => {
    if (!name.trim()) return;
    const newLoc = { id: `loc-${Date.now()}`, name: name.trim() };
    setStoreLocations((prev) => [...prev, newLoc]);
    setDoc(doc(db, 'store_locations', newLoc.id), newLoc).catch(console.error);
    showToast(`Location "${name}" added`, 'success');
  };

  const removeStoreLocation = (id: string) => {
    setStoreLocations((prev) => prev.filter((l) => l.id !== id));
    deleteDoc(doc(db, 'store_locations', id)).catch(console.error);
    showToast('Location removed', 'info');
  };

  // Cart & Order Operations
  const addToCart = (product: Product, quantity: number) => {
    if (quantity <= 0) return;
    if (quantity > product.quantityInStock) {
      showToast(`Only ${product.quantityInStock} items available in stock!`, 'error');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.quantityInStock) {
          showToast(`Cannot exceed available stock of ${product.quantityInStock}`, 'error');
          return prev;
        }
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: newQty, totalPrice: newQty * product.sellingPrice }
            : i
        );
      }
      return [
        ...prev,
        {
          product,
          quantity,
          totalPrice: quantity * product.sellingPrice,
        },
      ];
    });
    showToast(`Added ${quantity}x ${product.name} to order cart`, 'success');
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const product = products.find((p) => p.id === productId);
    if (product && quantity > product.quantityInStock) {
      showToast(`Max available stock is ${product.quantityInStock}`, 'error');
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity, totalPrice: quantity * item.product.sellingPrice }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const completeOrder = (customerName: string, customerPhone: string): Order | null => {
    if (cart.length === 0) {
      showToast('Cart is empty', 'error');
      return null;
    }

    // Generate Order ID e.g. AB785420
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const prefix = chars[Math.floor(Math.random() * chars.length)] + chars[Math.floor(Math.random() * chars.length)];
    const nums = Math.floor(100000 + Math.random() * 900000);
    const orderId = `${prefix}${nums}`;

    const now = new Date();
    // Format Date: DD-MM-YYYY
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dateStr = `${day}-${month}-${year}`;

    // Format Time: e.g. 1:49AM
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const timeStr = `${hours}:${minutes}${ampm}`;

    const cleanPhone = customerPhone.replace(/\s+/g, '');
    const pdfFileName = `${orderId}_${cleanPhone}_${dateStr}_${timeStr}.pdf`;

    const totalAmount = cart.reduce((sum, item) => sum + item.totalPrice, 0);

    const orderItems = cart.map((c) => ({
      productId: c.product.id,
      productName: c.product.name,
      variant: c.product.variant,
      unitPrice: c.product.sellingPrice,
      costPrice: c.product.costPrice,
      quantity: c.quantity,
      totalPrice: c.totalPrice,
    }));

    const workerName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Staff';

    const newOrder: Order = {
      id: orderId,
      customerName: customerName.trim(),
      customerPhone: cleanPhone,
      items: orderItems,
      totalAmount,
      date: dateStr,
      time: timeStr,
      createdAt: now.toISOString(),
      workerId: currentUser?.id || 'STAFF',
      workerName,
      pdfFileName,
    };

    // Save order in Firestore
    setDoc(doc(db, 'orders', orderId), newOrder).catch(console.error);

    // Deduct stock for each item in Firestore
    cart.forEach((c) => {
      const prod = products.find((p) => p.id === c.product.id);
      if (prod) {
        const newStock = Math.max(0, prod.quantityInStock - c.quantity);
        updateDoc(doc(db, 'products', prod.id), { quantityInStock: newStock }).catch(console.error);
      }
    });

    clearCart();

    // Play Success Chime sound
    sounds.playSuccessChime();

    // Record Log
    addLog('order', `Completed Order ${pdfFileName}`);

    showToast(`Order ${orderId} completed successfully!`, 'success');
    return newOrder;
  };

  const resetTransactions = async (): Promise<void> => {
    try {
      const orderDocs = await getDocs(collection(db, 'orders'));
      const deletePromises = orderDocs.docs.map((d) => deleteDoc(doc(db, 'orders', d.id)));
      await Promise.all(deletePromises);
      setOrders([]);
      addLog('system', 'Reset transactions database following annual snapshot download.');
      showToast('Transactions history has been reset successfully.', 'success');
    } catch (e) {
      console.error('Failed to clear orders in Firestore:', e);
      setOrders([]);
      showToast('Transactions history reset locally.', 'info');
    }
  };

  // Worker Management Operations
  const generateWorkerId = (firstName: string): string => {
    const cleanFirst = firstName.trim().toUpperCase().replace(/[^A-Z]/g, '') || 'EMP';
    const now = new Date();
    const timeCode = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
    const year = now.getFullYear();
    const randChars = Math.random().toString(36).substring(2, 4);
    return `${cleanFirst}${timeCode}${year}${randChars}`;
  };

  const addWorker = async (workerData: Omit<UserProfile, 'role'>) => {
    const newWorker: UserProfile = {
      ...workerData,
      password: await hashPassword(workerData.password || ''),
      role: 'worker',
      status: 'offline',
      lastActive: new Date().toISOString(),
    };
    setWorkers((prev) => [...prev.filter((w) => w.id !== newWorker.id), newWorker]);
    setDoc(doc(db, 'workers', newWorker.id), newWorker).catch(console.error);
    addLog('system', `Created worker account for ${newWorker.firstName} ${newWorker.lastName} (${newWorker.id})`);
    showToast(`Worker ${newWorker.firstName} added`, 'success');
  };

  const updateWorker = async (workerId: string, updatedData: Partial<UserProfile>) => {
    const target = workers.find((w) => w.id === workerId);
    if (target) {
      const merged = { ...target, ...updatedData };
      // If the edit included a fresh plaintext password (not already a
      // hash carried over from the existing record), hash it before saving.
      const updated: UserProfile = {
        ...merged,
        password: isHashed(merged.password) ? merged.password : await hashPassword(merged.password || ''),
      };
      setWorkers((prev) => prev.map((w) => (w.id === workerId ? updated : w)));
      if (currentUser?.id === workerId) {
        setCurrentUser(updated);
      }
      setDoc(doc(db, 'workers', workerId), updated).catch(console.error);
      showToast('Worker profile updated', 'success');
    }
  };

  const removeWorker = (workerId: string) => {
    if (workerId === DEFAULT_ADMIN.id) {
      showToast('Cannot remove system admin account', 'error');
      return;
    }
    const target = workers.find((w) => w.id === workerId);
    if (target) {
      deleteDoc(doc(db, 'workers', workerId)).catch(console.error);
      addLog('system', `Removed worker account for ${target.firstName} ${target.lastName} (${target.id})`);
      showToast(`Worker ${target.firstName} ${target.lastName} removed`, 'success');
    }
  };



  // Notes
  const saveNote = (noteId: string | null, title: string, body: string): Note => {
    const userId = currentUser?.id || 'GUEST';
    const now = new Date().toISOString();

    if (noteId) {
      const target = notes.find((n) => n.id === noteId);
      const updatedNote: Note = target
        ? { ...target, title, body, lastEditedAt: now }
        : { id: noteId, userId, title, body, lastEditedAt: now };
      setDoc(doc(db, 'notes', noteId), updatedNote).catch(console.error);
      return updatedNote;
    } else {
      const id = `NOTE_${Date.now()}`;
      const newNote: Note = { id, userId, title, body, lastEditedAt: now };
      setDoc(doc(db, 'notes', id), newNote).catch(console.error);
      return newNote;
    }
  };

  const deleteNote = (noteId: string) => {
    deleteDoc(doc(db, 'notes', noteId)).catch(console.error);
    showToast('Note deleted', 'info');
  };

  // Feedback Messages
  const sendFeedback = (
    message: string,
    attachmentUrl?: string,
    attachmentType?: 'image' | 'document',
    targetWorkerId?: string
  ) => {
    if (!currentUser) return;
    const id = `FB_${Date.now()}`;
    const assignedWorkerId =
      currentUser.role === 'worker'
        ? currentUser.id
        : targetWorkerId || workers[0]?.id || 'KWAME08002026xy';

    const newMsg: FeedbackMessage = {
      id,
      workerId: assignedWorkerId,
      workerName: `${currentUser.firstName} ${currentUser.lastName}`,
      senderRole: currentUser.role,
      message,
      createdAt: new Date().toISOString(),
      attachmentUrl,
      attachmentType,
      readByAdmin: currentUser.role === 'admin',
      readByWorker: currentUser.role === 'worker',
    };

    setDoc(doc(db, 'feedback_messages', id), newMsg).catch(console.error);

    if (currentUser.role === 'worker') {
      sounds.playNotificationPing();
    }

    showToast('Message sent', 'success');
  };

  const unreadFeedbackCount = feedbackMessages.filter((m) => {
    if (currentUser?.role === 'admin') return !m.readByAdmin;
    if (currentUser?.role === 'worker') return m.workerId === currentUser.id && !m.readByWorker;
    return false;
  }).length;

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        activeRole: currentUser?.role || 'user',
        login,
        logout,
        updateAdminPassword,
        resetWorkerPassword,

        currentTab,
        setCurrentTab,
        isDarkMode,
        toggleDarkMode,
        currentRoleView,
        setCurrentRoleView,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        toggleMobileMenu,

        settings,
        updateSettings,

        products,
        categories,
        storeLocations,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        addCategory,
        removeCategory,
        addStoreLocation,
        removeStoreLocation,

        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        completeOrder,
        orders,
        resetTransactions,

        workers,
        addWorker,
        updateWorker,
        removeWorker,
        generateWorkerId,

        notes: notes.filter((n) => n.userId === (currentUser?.id || 'GUEST')),
        saveNote,
        deleteNote,

        feedbackMessages,
        sendFeedback,
        unreadFeedbackCount,

        logs,
        addLog,

        toasts,
        showToast,
        removeToast,

        isSqlModalOpen,
        setIsSqlModalOpen,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
