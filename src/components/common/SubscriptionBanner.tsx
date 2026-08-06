import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Clock, AlertTriangle, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

export const SubscriptionBanner: React.FC = () => {
  const { subscriptionStatus, setCurrentTab, setCurrentRoleView, currentUser } = useStore();

  const isAdmin = currentUser?.role === 'admin';

  // Only show top banner when there is a critical billing error
  if (!subscriptionStatus.isBillingError) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white px-4 py-3 shadow-md border-b border-rose-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 animate-fadeIn">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
          <ShieldAlert className="w-5 h-5 text-amber-300 animate-pulse" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-white/20 font-black text-[10px] uppercase tracking-wider text-amber-200">
              Billing Error
            </span>
            <p className="font-black text-sm tracking-tight text-white truncate">
              Monthly Subscription Overdue
            </p>
          </div>
          <p className="text-xs text-rose-100 font-medium truncate mt-0.5">
            System operations (POS sales & inventory edits) are restricted until payment is made.
          </p>
        </div>
      </div>

      {isAdmin ? (
        <button
          onClick={() => {
            setCurrentRoleView('admin');
            setCurrentTab('billing');
          }}
          className="w-full sm:w-auto px-4 py-2 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 uppercase tracking-wider"
        >
          <span>Complete Monthly Billing</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      ) : (
        <div className="px-3 py-1.5 bg-black/20 rounded-lg text-xs font-semibold text-rose-100 shrink-0 text-center">
          Please ask Store Manager to pay on Billing Page
        </div>
      )}
    </div>
  );
};
