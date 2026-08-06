import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tenant } from '../types';

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
  onboardCompany: (formData: OnboardingFormData) => Promise<Tenant>;
  switchTenant: (tenantId: string | null) => void;
  openLandingPage: () => void;
  getTenantUrl: (tenant: Tenant) => string;
}

const DEFAULT_DEMO_TENANT: Tenant = {
  id: 'socialfunera-demo',
  companyName: 'Socialfunera Care Systems',
  logoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
  currency: 'GHS',
  currencyCode: 'GHS',
  phone: '+233 54 285 9612',
  address: 'Accra Memorial Avenue, Ghana',
  email: 'admin@socialfunera.com',
  adminPasswordHash: 'admin123',
  databaseId: 'sf-db-socialfunera-demo',
  createdAt: new Date().toISOString(),
  trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  customUrl: 'https://socialfunera.pages.dev/?tenant=socialfunera-demo',
  isTrialActive: true,
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const TENANTS_STORAGE_KEY = 'socialfunera_tenants_registry_v1';
const CURRENT_TENANT_KEY = 'socialfunera_current_tenant_id_v1';

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    try {
      const saved = localStorage.getItem(TENANTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse tenants registry:', e);
    }
    return [DEFAULT_DEMO_TENANT];
  });

  const [currentTenantId, setCurrentTenantId] = useState<string | null>(() => {
    // 1. Check URL parameters e.g. ?tenant=grace-memorials
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tenantParam = urlParams.get('tenant') || urlParams.get('company');
      if (tenantParam) return tenantParam;

      // 2. Check hash route e.g. #tenant-grace-memorials
      const hash = window.location.hash;
      if (hash && hash.startsWith('#tenant=')) {
        return hash.replace('#tenant=', '');
      }

      // 3. Fallback to localStorage saved session
      const savedTenantId = localStorage.getItem(CURRENT_TENANT_KEY);
      if (savedTenantId) return savedTenantId;
    }
    return null; // Null means Landing Page
  });

  // Save tenants registry when updated
  useEffect(() => {
    try {
      localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(tenants));
    } catch (e) {
      console.error('Failed to save tenants:', e);
    }
  }, [tenants]);

  // Sync active tenant state with URL and localStorage
  useEffect(() => {
    if (currentTenantId) {
      localStorage.setItem(CURRENT_TENANT_KEY, currentTenantId);
      // Update browser URL query param without full page reload
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
      currency: formData.currency || 'USD',
      currencyCode: formData.currencyCode || 'USD',
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

    // Also persist tenant specific empty database initialization marker
    localStorage.setItem(`tenant_db_initialized_${databaseId}`, 'true');

    // Switch to newly created tenant portal immediately
    setCurrentTenantId(slug);

    return newTenant;
  };

  const switchTenant = (tenantId: string | null) => {
    setCurrentTenantId(tenantId);
  };

  const openLandingPage = () => {
    setCurrentTenantId(null);
  };

  return (
    <TenantContext.Provider
      value={{
        tenants,
        currentTenant,
        isLandingPage,
        onboardCompany,
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
