import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Search,
  LogOut,
  Sun,
  Moon,
  User as UserIcon,
  Menu,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    logout,
    isDarkMode,
    toggleDarkMode,
    settings,
    toggleMobileMenu,
  } = useStore();

  const isAdmin = currentUser?.role === 'admin';
  const displayName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim()
    : 'Guest';

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800 px-3 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-3 shrink-0">
      {/* Left / Search Bar & Mobile Toggle */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 max-w-md">
        {/* Three lines menu button for mobile */}
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-xl bg-brand-50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all active:scale-95 md:hidden shrink-0 cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full hidden xs:block sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-brand-50 dark:bg-slate-800 border-none rounded-full text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600"
          />
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-full bg-brand-50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all active:scale-95 cursor-pointer"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-0.5 hidden sm:block"></div>

        {/* User Profile Info Card */}
        <div className="flex items-center gap-2 sm:gap-3 pl-0 sm:pl-1">
          <div className="hidden sm:flex flex-col text-right leading-tight max-w-[160px]">
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {displayName}
            </span>
            <span className="text-[10px] text-slate-400 font-medium truncate">
              {isAdmin ? `Manager, ${settings.shopName || 'Beauty Salon'}` : `Staff, ${settings.shopName || 'Beauty Salon'}`}
            </span>
          </div>

          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-xs">
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : currentUser?.firstName ? (
                <span>{currentUser.firstName[0]}</span>
              ) : (
                <UserIcon className="w-4 h-4" />
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full transition cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
