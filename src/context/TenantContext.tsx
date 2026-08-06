import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tenant, SubscriptionTransaction } from '../types';

interface OnboardingFormData {
  companyName: string;
  logoUrl: string;
  currency: string;
  currencyCode: string;
  phone: string;
  address: string;
  email: string;
  password?: string;
}

interface TenantContextType {
  tenants: Tenant[];
  currentTenant: Tenant | null;
  isLandingPage: boolean;
  isSuperAdminView: boolean;
  setIsSuperAdminView: (show: boolean) => void;
  isSuperAdminLoggedIn: boolean;
  loginSuperAdmin: (username: string, password: string) => boolean;
  logoutSuperAdmin: () => void;
  onboardCompany: (formData: OnboardingFormData) => Promise<Tenant>;
  updateTenant: (tenantId: string, updatedData: Partial<Tenant>) => void;
  deleteTenant: (tenantId: string) => void;
  subscriptionTransactions: SubscriptionTransaction[];
  addSubscriptionTransaction: (tx: Omit<SubscriptionTransaction, 'id'>) => void;
  switchTenant: (tenantId: string | null) => void;
  openLandingPage: () => void;
  getTenantUrl: (tenant: Tenant) => string;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const TENANTS_STORAGE_KEY = 'socialfunera_tenants_registry_v1';
const CURRENT_TENANT_KEY = 'socialfunera_current_tenant_id_v1';
const SUBS_STORAGE_KEY = 'socialfunera_subscription_txs_v1';
const SUPERADMIN_AUTH_KEY = 'socialfunera_superadmin_auth_v1';

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    try {
      const saved = localStorage.getItem(TENANTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse tenants registry:', e);
    }
    return [];
  });

  const [subscriptionTransactions, setSubscriptionTransactions] = useState<SubscriptionTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(SUBS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse subscription transactions:', e);
    }
    return [];
  });

  const [isSuperAdminLoggedIn, setIsSuperAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SUPERADMIN_AUTH_KEY) === 'true';
    } catch (e) {
      return false;
    }
  });

  const [isSuperAdminView, setIsSuperAdminView] = useState<boolean>(false);

  const [currentTenantId, setCurrentTenantId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tenantParam = urlParams.get('tenant') || urlParams.get('company');
      if (tenantParam) return tenantParam;

      const hash = window.location.hash;
      if (hash && hash.startsWith('#tenant=')) {
        return hash.replace('#tenant=', '');
      }

      const savedTenantId = localStorage.getItem(CURRENT_TENANT_KEY);
      if (savedTenantId) return savedTenantId;
    }
    return null;
  });

  // Save tenants registry when updated
  useEffect(() => {
    try {
      localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(tenants));
    } catch (e) {
      console.error('Failed to save tenants:', e);
    }
  }, [tenants]);

  // Save subscription transactions when updated
  useEffect(() => {
    try {
      localStorage.setItem(SUBS_STORAGE_KEY, JSON.stringify(subscriptionTransactions));
    } catch (e) {
      console.error('Failed to save subscription transactions:', e);
    }
  }, [subscriptionTransactions]);

  // Sync active tenant state with URL and localStorage
  useEffect(() => {
    if (currentTenantId) {
      localStorage.setItem(CURRENT_TENANT_KEY, currentTenantId);
      if (typeof window !== 'undefined' && window.history) {
        const newUrl = `${window.location.pathname}?tenant=${currentTenantId}`;
        window.history.replaceState({ tenant: currentTenantId }, '', newUrl);
      }
    } else {
      localStorage.removeItem(CURRENT_TENANT_KEY);
      if (typeof window !== 'undefined' && window.history) {
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [currentTenantId]);

  const currentTenant = tenants.find((t) => t.id === currentTenantId) || null;
  const isLandingPage = !currentTenant;

  const loginSuperAdmin = (username: string, pass: string): boolean => {
    if (username.trim() === 'Socialfunera' && pass === 'Socialfunera@$') {
      setIsSuperAdminLoggedIn(true);
      localStorage.setItem(SUPERADMIN_AUTH_KEY, 'true');
      return true;
    }
    return false;
  };

  const logoutSuperAdmin = () => {
    setIsSuperAdminLoggedIn(false);
    localStorage.removeItem(SUPERADMIN_AUTH_KEY);
    setIsSuperAdminView(false);
  };

  const getTenantUrl = (tenant: Tenant) => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      return `${origin}/?tenant=${tenant.id}`;
    }
    return `https://socialfunera.pages.dev/?tenant=${tenant.id}`;
  };

  const onboardCompany = async (formData: OnboardingFormData): Promise<Tenant> => {
    const slug = formData.companyName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `company-${Date.now()}`;

    const databaseId = `sf-db-${slug}`;
    const createdAt = new Date().toISOString();
    const trialEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const newTenant: Tenant = {
      id: slug,
      companyName: formData.companyName,
      logoUrl: formData.logoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
      currency: formData.currency || 'GH₵',
      currencyCode: formData.currencyCode || 'GHS',
      phone: formData.phone,
      address: formData.address,
      email: formData.email,
      adminPasswordHash: formData.password || 'admin123',
      databaseId,
      createdAt,
      trialEndDate,
      customUrl: `https://${slug}.socialfunera.pages.dev`,
      isTrialActive: true,
    };

    setTenants((prev) => {
      const filtered = prev.filter((t) => t.id !== slug);
      return [...filtered, newTenant];
    });

    // Create initial subscription trial transaction record
    const trialTx: SubscriptionTransaction = {
      id: `sub-tx-${Date.now()}`,
      tenantId: slug,
      companyName: formData.companyName,
      amount: 0,
      currency: formData.currencyCode || 'GHS',
      billingPeriod: '1 Month Free Trial',
      date: new Date().toISOString(),
      status: 'trial',
      paymentMethod: 'Trial Onboarding',
      referenceNumber: `TRL-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    setSubscriptionTransactions((prev) => [trialTx, ...prev]);

    localStorage.setItem(`tenant_db_initialized_${databaseId}`, 'true');

    return newTenant;
  };

  const updateTenant = (tenantId: string, updatedData: Partial<Tenant>) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === tenantId ? { ...t, ...updatedData } : t))
    );
  };

  const deleteTenant = (tenantId: string) => {
    setTenants((prev) => prev.filter((t) => t.id !== tenantId));
    setSubscriptionTransactions((prev) => prev.filter((tx) => tx.tenantId !== tenantId));
    if (currentTenantId === tenantId) {
      setCurrentTenantId(null);
    }
  };

  const addSubscriptionTransaction = (txData: Omit<SubscriptionTransaction, 'id'>) => {
    const newTx: SubscriptionTransaction = {
      ...txData,
      id: `sub-tx-${Date.now()}`,
    };
    setSubscriptionTransactions((prev) => [newTx, ...prev]);
  };

  const switchTenant = (tenantId: string | null) => {
    setCurrentTenantId(tenantId);
    setIsSuperAdminView(false);
  };

  const openLandingPage = () => {
    setCurrentTenantId(null);
    setIsSuperAdminView(false);
  };

  return (
    <TenantContext.Provider
      value={{
        tenants,
        currentTenant,
        isLandingPage,
        isSuperAdminView,
        setIsSuperAdminView,
        isSuperAdminLoggedIn,
        loginSuperAdmin,
        logoutSuperAdmin,
        onboardCompany,
        updateTenant,
        deleteTenant,
        subscriptionTransactions,
        addSubscriptionTransaction,
        switchTenant,
        openLandingPage,
        getTenantUrl,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
