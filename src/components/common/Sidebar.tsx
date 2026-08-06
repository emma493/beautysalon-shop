import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Receipt,
  Users,
  Settings as SettingsIcon,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  User as UserIcon,
  CreditCard,
  DownloadCloud,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    currentRoleView,
    settings,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    currentUser,
  } = useStore();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const isUserView = currentRoleView === 'user';

  const userMenuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Products', icon: Package },
    { name: 'Orders', icon: ShoppingCart },
    { name: 'Transaction', icon: Receipt },
  ];

  const adminMenuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Products', icon: Package },
    { name: 'Transaction', icon: Receipt },
    { name: 'Add User', icon: Users },
    { name: 'Billing', icon: CreditCard },
    { name: 'Snapshot', icon: DownloadCloud },
    { name: 'Settings', icon: SettingsIcon },
  ];

  const menuItems = isUserView ? userMenuItems : adminMenuItems;
  const displayName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim()
    : 'Guest';

  const renderNavContent = (collapsed: boolean, isMobile: boolean) => (
    <>
      {/* Brand Header */}
      <div
        className={`flex ${
          collapsed && !isMobile
            ? 'flex-col items-center justify-center gap-2.5'
            : 'items-center justify-between'
        } px-1 pt-1 pb-3`}
      >
        <div className={`flex items-center gap-3 min-w-0 ${collapsed && !isMobile ? 'flex-col' : ''}`}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center font-black text-lg shadow-sm shadow-brand-600/30 shrink-0 overflow-hidden ring-1 ring-gold-400/40">
            {settings.companyLogoUrl ? (
              <img
                src={settings.companyLogoUrl}
                alt="Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <Sparkles className="w-5 h-5 text-white" />
            )}
          </div>

          {(!collapsed || isMobile) && (
            <div className="min-w-0">
              <h1 className="text-sm font-display font-semibold text-slate-900 dark:text-white tracking-tight leading-none truncate">
                {settings.shopName || 'Beauty Salon'}
              </h1>
              <p className="text-[10px] text-slate-400 font-medium mt-1 truncate">
                Management System
              </p>
            </div>
          )}
        </div>

        {isMobile ? (
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 cursor-pointer shrink-0"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 cursor-pointer shrink-0"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Role badge */}
      {(!isCollapsed || isMobile) && (
        <div
          className={`inline-flex self-start items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
            isUserView
              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
              : 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
          }`}
        >
          {isUserView ? <UserIcon className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
          {isUserView ? 'Worker Portal' : 'Admin Portal'}
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 space-y-1.5 pt-3 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isTabActive = (tabName: string, itemName: string) => {
            const normTab = (tabName || '').toLowerCase().replace(/s$/, '');
            const normItem = (itemName || '').toLowerCase().replace(/s$/, '');
            return normTab === normItem;
          };
          const isActive = isTabActive(currentTab, item.name);

          return (
            <button
              key={item.name}
              onClick={() => {
                setCurrentTab(item.name);
                if (isMobile) setIsMobileMenuOpen(false);
              }}
              title={collapsed && !isMobile ? item.name : undefined}
              className={`group relative w-full flex items-center ${
                collapsed && !isMobile
                  ? 'justify-center px-2 py-3'
                  : 'justify-between px-4 py-3'
              } rounded-2xl transition-all duration-200 text-xs font-semibold cursor-pointer ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20 dark:shadow-none'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/90 dark:hover:bg-slate-800/80'
              }`}
            >
              {isActive && !collapsed && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full bg-gold-300" />
              )}
              <div className="flex items-center gap-3.5 relative min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                {(!collapsed || isMobile) && (
                  <span className="truncate">{item.name}</span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Signed-in-as footer */}
      {(!isCollapsed || isMobile) && (
        <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold text-[11px] flex items-center justify-center overflow-hidden shrink-0">
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span>{currentUser?.firstName?.[0] || 'G'}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{displayName}</p>
            <p className="text-[10px] text-slate-400 truncate">{currentUser?.email || '—'}</p>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile Drawer Overlay & Sliding Sidebar */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[85vw] max-w-72 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 p-4 flex flex-col space-y-1 shadow-2xl transition-transform duration-300 md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderNavContent(false, true)}
      </aside>

      {/* Desktop Permanent Sidebar */}
      <aside
        className={`hidden md:flex md:flex-col ${
          isCollapsed ? 'w-20 p-3' : 'w-64 p-4'
        } bg-white dark:bg-slate-900 border-r border-slate-200/70 dark:border-slate-800 shrink-0 transition-all duration-300 space-y-1 h-screen sticky top-0 z-30 overflow-y-auto`}
      >
        {renderNavContent(isCollapsed, false)}
      </aside>
    </>
  );
};
