import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ShieldCheck, User, Mail, Lock, Loader2, Sparkles, BarChart3, PackageCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const LoginModal: React.FC = () => {
  const { login, settings, currentRoleView, setCurrentRoleView } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdminPortal = currentRoleView === 'admin';

  // Keep state in sync with URL on mount / path check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathIsAdmin = window.location.pathname.toLowerCase().startsWith('/admin');
      if (pathIsAdmin && currentRoleView !== 'admin') {
        setCurrentRoleView('admin');
      } else if (!pathIsAdmin && currentRoleView !== 'user') {
        setCurrentRoleView('user');
      }
    }
  }, []);

  const handleTabChange = (role: 'admin' | 'user') => {
    setCurrentRoleView(role);
    if (typeof window !== 'undefined') {
      const targetPath = role === 'admin' ? '/admin' : '/';
      window.history.pushState({}, '', targetPath);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await login(email, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  const logoUrl =
    settings.companyLogoUrl ||
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPMa5VhqKVOgQMYbb5sZBdxxb4PGZc0kSiLC3iTRgQWA&s=10';

  const highlights = isAdminPortal
    ? [
        { icon: BarChart3, text: 'Real-time sales & inventory analytics' },
        { icon: PackageCheck, text: 'Full control over products, staff & orders' },
        { icon: ShieldCheck, text: 'Secure, role-based access for your team' },
      ]
    : [
        { icon: PackageCheck, text: 'Ring up sales and manage stock on the go' },
        { icon: BarChart3, text: 'Track your shift transactions in real time' },
        { icon: Sparkles, text: 'Built for speed at the counter' },
      ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-brand-50 via-white to-brand-100/60 dark:from-slate-950 dark:via-slate-950 dark:to-brand-950/30 flex items-center justify-center p-4 py-8 sm:p-8 font-sans">
      {/* Main Split Card Container */}
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-brand-900/10 border border-slate-200/80 dark:border-slate-800 overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* Left Form Panel */}
        <div className="p-6 sm:p-10 md:p-12 flex flex-col justify-between gap-6">
          {/* Brand Header & Portal Selector Tabs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="w-9 h-9 shrink-0 rounded-full object-cover shadow-xs border border-slate-100 dark:border-slate-800"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                  {settings.shopName || 'Beauty Salon'}
                </span>
              </div>

              {/* Status Badge */}
              <span
                className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                  isAdminPortal
                    ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-700/50'
                    : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-700/50'
                }`}
              >
                {isAdminPortal ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" /> Admin
                  </>
                ) : (
                  <>
                    <User className="w-3.5 h-3.5" /> Staff
                  </>
                )}
              </span>
            </div>

            {/* Role Switcher Tabs */}
            <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => handleTabChange('user')}
                className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  !isAdminPortal
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Worker Login
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('admin')}
                className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isAdminPortal
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Login
              </button>
            </div>
          </div>

          {/* Mobile Art Header (Only visible on small screens) */}
          <div className="md:hidden flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 shadow-md flex items-center justify-center">
              <img
                src={logoUrl}
                alt="Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>

          {/* Form Content Area */}
          <div className="max-w-sm w-full mx-auto space-y-5">
            <div className="space-y-1 text-left">
              <h1 className="brand-title-rule text-2xl sm:text-3xl font-display font-semibold text-slate-900 dark:text-white tracking-tight">
                {isAdminPortal ? 'Admin Portal' : 'Worker Portal'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium pt-1">
                {isAdminPortal
                  ? 'Sign in with your administrator account to access store controls and reports.'
                  : 'Sign in with your worker account to process sales and manage inventory.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    autoComplete="username"
                    disabled={isSubmitting}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isAdminPortal ? 'admin@salon.com' : 'worker@salon.com'}
                    className="w-full pl-10 pr-3.5 py-2.75 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition shadow-2xs disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.75 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition shadow-2xs disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.75 px-4 bg-brand-600 hover:bg-brand-700 disabled:hover:bg-brand-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-brand-600/20 transition-all duration-150 active:scale-[0.99] mt-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-80 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Signing in…
                  </>
                ) : (
                  <>{isAdminPortal ? 'Sign In as Administrator' : 'Sign In as Worker'}</>
                )}
              </button>
            </form>
          </div>

          <div className="text-center text-[11px] text-slate-400">
            {isAdminPortal ? (
              <span>Not an admin? <button type="button" onClick={() => handleTabChange('user')} className="text-brand-600 dark:text-brand-400 font-bold underline underline-offset-2 cursor-pointer">Switch to Worker Login</button></span>
            ) : (
              <span>Administrator? <button type="button" onClick={() => handleTabChange('admin')} className="text-brand-600 dark:text-brand-400 font-bold underline underline-offset-2 cursor-pointer">Switch to Admin Login</button></span>
            )}
          </div>
        </div>

        {/* Right Art Panel (Desktop) */}
        <div className="hidden md:flex flex-col bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 relative overflow-hidden p-10 justify-between">
          {/* Decorative pattern */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)',
              backgroundSize: '28px 28px',
            }}
          />
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-gold-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-brand-400/30 rounded-full blur-3xl pointer-events-none" />

          {/* Logo Badge Container */}
          <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 bg-white/95 rounded-2xl shadow-lg p-2 flex items-center justify-center shrink-0">
              <img
                src={logoUrl}
                alt={settings.shopName || 'Company Logo'}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <span className="text-white font-display font-semibold text-lg tracking-tight">
              {settings.shopName || 'Beauty Salon'}
            </span>
          </div>

          {/* Feature Highlights */}
          <div className="relative space-y-5">
            <p className="text-brand-100/90 text-xs font-bold uppercase tracking-widest">
              {isAdminPortal ? 'Built for owners & managers' : 'Built for your daily shift'}
            </p>
            <ul className="space-y-4">
              {highlights.map(({ icon: Icon, text }, i) => (
                <li key={i} className="flex items-start gap-3 text-white">
                  <span className="mt-0.5 w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="text-sm font-medium leading-snug pt-1">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative text-brand-100/70 text-[11px] font-medium">
            © {new Date().getFullYear()} {settings.shopName || 'Beauty Salon'}. All rights reserved.
          </p>
        </div>

      </div>
    </div>
  );
};
