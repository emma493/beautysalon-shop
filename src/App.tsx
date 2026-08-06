import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { SubscriptionBanner } from './components/common/SubscriptionBanner';
import { ToastContainer } from './components/common/ToastContainer';
import { LoginModal } from './components/auth/LoginModal';
import { SupabaseModal } from './components/common/SupabaseModal';

// User Portal Components
import { UserDashboard } from './components/user/UserDashboard';
import { UserProducts } from './components/user/UserProducts';
import { UserOrder } from './components/user/UserOrder';
import { UserTransactions } from './components/user/UserTransactions';

// Admin Portal Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminProducts } from './components/admin/AdminProducts';
import { AdminAddProduct } from './components/admin/AdminAddProduct';
import { AdminTransactions } from './components/admin/AdminTransactions';
import { AdminAddUser } from './components/admin/AdminAddUser';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminBilling } from './components/admin/AdminBilling';
import { AdminSnapshot } from './components/admin/AdminSnapshot';

const MainAppContent: React.FC = () => {
  const {
    isAuthenticated,
    currentUser,
    currentTab,
    setCurrentTab,
    currentRoleView,
  } = useStore();

  const [showSupabaseModal, setShowSupabaseModal] = useState(false);

  // Normalize currentTab string to view keys
  const getActiveTabKey = (tab: string) => {
    const clean = (tab || 'dashboard').toLowerCase().trim();
    if (clean === 'dashboard') return 'dashboard';
    if (clean === 'products' || clean === 'product') return 'products';
    if (clean === 'orders' || clean === 'order') return 'order';
    if (clean === 'transactions' || clean === 'transaction') return 'transactions';
    if (clean === 'add-product' || clean === 'add product') return 'add-product';
    if (clean === 'add-user' || clean === 'add user') return 'add-user';
    if (clean === 'billing' || clean === 'billings') return 'billing';
    if (clean === 'snapshot' || clean === 'snapshots') return 'snapshot';
    if (clean === 'settings' || clean === 'setting') return 'settings';
    if (clean === 'feedback' || clean === 'feedbacks' || clean === 'send feedback') return 'feedback';
    return clean;
  };

  const activeTabKey = getActiveTabKey(currentTab);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-brand-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans antialiased">
        <LoginModal />
        <ToastContainer />
      </div>
    );
  }

  const role = currentRoleView || currentUser?.role || 'worker';

  return (
    <div className="h-screen w-full bg-brand-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased flex flex-col overflow-hidden">
      {/* Full Screen Main Container */}
      <div className="w-full h-screen flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Right Workspace Column */}
        <div className="flex-1 flex flex-col min-w-0 bg-brand-50 dark:bg-slate-900/50 h-screen overflow-hidden">
          {/* Top Free Trial / Subscription Error Banner */}
          <SubscriptionBanner />

          {/* Header Navbar */}
          <Header />

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 overflow-y-auto">
            {role === 'worker' || role === 'user' ? (
              <>
                {activeTabKey === 'dashboard' && <UserDashboard />}
                {activeTabKey === 'products' && <UserProducts />}
                {activeTabKey === 'order' && <UserOrder onOrderComplete={() => setCurrentTab('transactions')} />}
                {activeTabKey === 'transactions' && <UserTransactions />}
              </>
            ) : (
              <>
                {activeTabKey === 'dashboard' && <AdminDashboard />}
                {activeTabKey === 'products' && <AdminProducts />}
                {activeTabKey === 'add-product' && <AdminAddProduct />}
                {activeTabKey === 'transactions' && <AdminTransactions />}
                {activeTabKey === 'add-user' && <AdminAddUser />}
                {activeTabKey === 'billing' && <AdminBilling />}
                {activeTabKey === 'snapshot' && <AdminSnapshot />}
                {activeTabKey === 'settings' && (
                  <AdminSettings onOpenSupabaseModal={() => setShowSupabaseModal(true)} />
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Supabase SQL Schema Modal */}
      {showSupabaseModal && <SupabaseModal onClose={() => setShowSupabaseModal(false)} />}

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainAppContent />
    </StoreProvider>
  );
}
