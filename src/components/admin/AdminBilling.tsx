import React from 'react';
import { useStore } from '../../context/StoreContext';
import { useTenant } from '../../context/TenantContext';
import {
  CreditCard,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Lock,
  Layers,
  Building2,
  Sparkles,
} from 'lucide-react';

export const AdminBilling: React.FC = () => {
  const { settings } = useStore();
  const { currentTenant } = useTenant();

  const createdAtDate = currentTenant?.createdAt ? new Date(currentTenant.createdAt) : new Date();
  const trialEndDate = currentTenant?.trialEndDate
    ? new Date(currentTenant.trialEndDate)
    : new Date(createdAtDate.getTime() + 30 * 24 * 60 * 60 * 1000);

  const now = new Date();
  const totalTrialMs = 30 * 24 * 60 * 60 * 1000;
  const elapsedMs = Math.max(0, now.getTime() - createdAtDate.getTime());
  const remainingMs = Math.max(0, trialEndDate.getTime() - now.getTime());
  const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));

  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedMs / totalTrialMs) * 100)));

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Subscription & Billing Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Manage your company trial plan, dedicated database subscription, and recurring billing
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-xs font-bold border border-emerald-300/60 dark:border-emerald-800 shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>1 Month Free Trial Active</span>
        </span>
      </div>

      {/* Trial Countdown Hero Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-brand-950 p-6 sm:p-8 rounded-3xl border border-slate-800 text-white shadow-2xl relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 border border-brand-500/40 text-brand-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Free Trial Countdown</h2>
              <p className="text-xs text-slate-400">
                Your 1-month trial ends on{' '}
                <strong className="text-emerald-400">
                  {trialEndDate.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </strong>
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right bg-slate-900/80 px-4 py-2.5 rounded-2xl border border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-400">Time Remaining</div>
            <div className="text-2xl font-black text-emerald-400">
              {remainingDays} {remainingDays === 1 ? 'Day' : 'Days'}
            </div>
          </div>
        </div>

        {/* Progress Loading Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-300">
            <span>Trial Progress ({progressPercent}%)</span>
            <span>Billing Begins: {trialEndDate.toLocaleDateString()}</span>
          </div>

          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800/80 flex items-start gap-3 text-xs text-slate-300 font-medium">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Zero Charge Guarantee:</strong> No credit card is required during your 1-month trial period. You will receive an automated billing invoice prior to trial expiration.
          </div>
        </div>
      </div>

      {/* Plan Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Active Subscription Details */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Current Plan Specs</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Socialfunera Multi-Tenant Enterprise</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-lime-400 text-xs font-bold border border-brand-200 dark:border-lime-800">
              Enterprise
            </span>
          </div>

          <div className="space-y-3 text-xs font-medium text-slate-700 dark:text-slate-300">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Database ID</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {currentTenant?.databaseId || 'sf-db-main'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Staff Limit</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Unlimited Workers</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Catalog Limit</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Unlimited Products</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Daily POS Capacity</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Unlimited Transactions</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Offline Snapshot Engine</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Included (Dec 31st)</span>
            </div>
          </div>
        </div>

        {/* Card 2: Payment Method (Non-functional Placeholder as requested) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 relative">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Payment Method</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Billing details after trial completion</p>
            </div>
            <Lock className="w-5 h-5 text-slate-400" />
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-3 opacity-75">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-brand-600" />
                <span>•••• •••• •••• 4242</span>
              </div>
              <span className="text-[10px] text-slate-400">Expires 12/28</span>
            </div>
            <div className="text-[11px] text-slate-500">Primary Credit / Debit Card</div>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Payment updating is disabled during your active 1-month free trial. Billing settings will unlock on {trialEndDate.toLocaleDateString()}.
            </span>
          </div>

          <button
            disabled
            className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed border border-slate-200 dark:border-slate-700"
          >
            Update Payment Card (Disabled During Free Trial)
          </button>
        </div>
      </div>
    </div>
  );
};
