import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowRight,
  Receipt,
  RotateCw,
  RefreshCw,
  Phone,
  Search,
  Copy,
  Check,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface BillingTx {
  id: string | number;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  paid_at?: string;
  created_at?: string;
  channel?: string;
  customer?: {
    email?: string;
    phone?: string;
  };
  metadata?: any;
}

export const AdminBilling: React.FC = () => {
  const { showToast, addLog, updateSettings, subscriptionStatus } = useStore();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeReference, setActiveReference] = useState<string | null>(null);

  // Search & Filter state for transaction history
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  // Live billing transactions
  const [paystackHistory, setPaystackHistory] = useState<BillingTx[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [paystackPublicKey, setPaystackPublicKey] = useState<string>('');

  // Fetch Paystack configuration
  useEffect(() => {
    fetch('/api/paystack/config')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.publicKey) {
          setPaystackPublicKey(data.publicKey);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch live payment history from API
  const fetchPaystackHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch('/api/paystack/transactions');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.data)) {
          setPaystackHistory(data.data);
        }
      }
    } catch {
      // Ignore network errors during background polling
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Initial fetch of payment history
  useEffect(() => {
    fetchPaystackHistory();
  }, [fetchPaystackHistory]);

  // Active polling mechanism after a payment is initiated to check status periodically
  useEffect(() => {
    if (!activeReference) return;

    let pollCount = 0;
    const maxPolls = 60; // Poll every 3 seconds for up to 3 minutes

    const pollInterval = setInterval(async () => {
      pollCount++;
      try {
        const res = await fetch(`/api/paystack/verify/${encodeURIComponent(activeReference)}`);
        const data = await res.json();

        if (data.status && data.data) {
          const status = (data.data.status || '').toLowerCase();
          if (status === 'success') {
            const now = new Date();
            const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            updateSettings({
              lastPaidMonth: currentMonthKey,
              lastPaidDate: now.toISOString(),
            });
            showToast('Payment verified! Full system access restored.', 'success');
            addLog('system', `Subscription GH₵ 200 payment verified (Ref: ${activeReference})`);
            fetchPaystackHistory();
            setActiveReference(null);
          } else if (status === 'failed' || status === 'abandoned') {
            showToast(`Payment status: ${status}`, 'error');
            fetchPaystackHistory();
            setActiveReference(null);
          }
        }
      } catch (err) {
        console.error('Active polling error:', err);
      }

      if (pollCount >= maxPolls) {
        clearInterval(pollInterval);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [activeReference, fetchPaystackHistory, showToast, addLog]);

  // Trigger Payment via Paystack
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanNum = phoneNumber.replace(/\s+/g, '');
    if (!cleanNum || cleanNum.length < 10) {
      showToast('Please enter a valid 10-digit phone number.', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanNum,
          email: customerEmail || `momo_${cleanNum}@paystack.local`,
          amount: 200, // GH₵ 200
        }),
      });

      const data = await res.json();

      if (data.status && data.data) {
        const ref = data.data.reference;
        setActiveReference(ref);

        if ((window as any).PaystackPop && data.data.access_code) {
          const handler = (window as any).PaystackPop.setup({
            key:
              paystackPublicKey ||
              (import.meta as any).env?.VITE_PAYSTACK_PUBLIC_KEY ||
              '',
            email: customerEmail || `momo_${cleanNum}@paystack.local`,
            amount: 20000,
            currency: 'GHS',
            ref: ref,
            channels: ['mobile_money', 'card'],
            callback: (response: any) => {
              handleVerifyPayment(response.reference || ref);
              setIsProcessing(false);
            },
            onClose: () => {
              showToast('Payment popup closed.', 'info');
              setIsProcessing(false);
            },
          });
          handler.openIframe();
        } else if (data.data.authorization_url) {
          window.open(data.data.authorization_url, '_blank');
          setIsProcessing(false);
        } else {
          handleVerifyPayment(ref);
          setIsProcessing(false);
        }
      } else {
        showToast(data.message || 'Payment initialization failed. Please verify Paystack credentials.', 'error');
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error('Error initiating payment:', err);
      showToast(err.message || 'Error initiating payment. Check connection or API settings.', 'error');
      setIsProcessing(false);
    }
  };

  // Verify status live
  const handleVerifyPayment = async (refToVerify?: string) => {
    const ref = refToVerify || activeReference;
    if (!ref) return;

    try {
      const res = await fetch(`/api/paystack/verify/${encodeURIComponent(ref)}`);
      const data = await res.json();

      if (data.status && data.data && (data.data.status === 'success' || data.data.status === 'paid')) {
        const now = new Date();
        const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        updateSettings({
          lastPaidMonth: currentMonthKey,
          lastPaidDate: now.toISOString(),
        });

        showToast('Payment verified! Full system access restored.', 'success');
        addLog('system', `Subscription GH₵ 200 payment verified (Ref: ${ref})`);
        fetchPaystackHistory();
      } else {
        showToast(data.message || 'Payment verification failed or pending.', 'error');
        fetchPaystackHistory();
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      showToast('Error verifying transaction with Paystack.', 'error');
      fetchPaystackHistory();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(text);
    showToast('Reference copied to clipboard', 'info');
    setTimeout(() => setCopiedRef(null), 2000);
  };

  // Filter transaction history
  const filteredHistory = paystackHistory.filter((tx) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const refMatch = tx.reference?.toLowerCase().includes(q);
    const phoneMatch =
      tx.customer?.phone?.toLowerCase().includes(q) ||
      tx.metadata?.mobile_number?.toLowerCase().includes(q);
    const emailMatch = tx.customer?.email?.toLowerCase().includes(q);
    return refMatch || phoneMatch || emailMatch;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Billing & Payments
          </h1>
        </div>

        <button
          onClick={fetchPaystackHistory}
          disabled={isLoadingHistory}
          className="self-start sm:self-auto px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHistory ? 'animate-spin text-amber-500' : ''}`} />
          <span>Refresh History</span>
        </button>
      </div>

      {/* SUBSCRIPTION OVERDUE CARD (Only shown when billing is overdue) */}
      {subscriptionStatus.isBillingError && (
        <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 text-white rounded-3xl border border-rose-800/80 p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black shadow-lg shadow-rose-600/30 shrink-0">
                <AlertCircle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-extrabold text-[10px] uppercase tracking-wider border border-rose-500/30">
                    Billing Overdue
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-1">
                  Monthly Subscription Payment Required
                </h2>
                <p className="text-xs text-rose-200 font-medium mt-0.5">
                  System operations are restricted. Pay GH₵ 200.00 below to restore immediate full store access.
                </p>
              </div>
            </div>
            <div className="bg-rose-900/60 border border-rose-700/60 rounded-2xl px-4 py-3 shrink-0 text-center">
              <span className="block text-[10px] font-black uppercase text-rose-300 tracking-wider">Status</span>
              <span className="text-sm font-black text-white uppercase tracking-wide">Access Restricted</span>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT FORM */}
      <form onSubmit={handlePaymentSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Phone Number Input */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide">
              Phone Number <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Phone className="w-4 h-4 text-slate-400 mr-2" />
                <span className="text-xs font-bold text-slate-500 pr-2 border-r border-slate-200 dark:border-slate-700">
                  +233
                </span>
              </div>

              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 024XXXXXXX"
                className="w-full pl-24 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-400/20 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Optional Customer Email */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide">
              Email Address <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="e.g. account@salon.com"
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-400/20 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Submit Button & Security Badge */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <button
            type="submit"
            disabled={isProcessing}
            className="px-6 py-3.5 bg-amber-400 hover:bg-amber-500 active:scale-[0.99] text-slate-950 font-black text-sm rounded-2xl shadow-md shadow-amber-400/20 border border-amber-300 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 uppercase tracking-wider"
          >
            {isProcessing ? (
              <>
                <RotateCw className="w-5 h-5 animate-spin text-slate-950" />
                <span>Opening Paystack Checkout...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Pay GH₵ 200.00</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>

          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Secured by Paystack Payment Gateway</span>
          </div>
        </div>
      </form>

      {/* TRANSACTION HISTORY TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Header & Search */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-500 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Subscription Payment History
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {paystackHistory.length} total transaction{paystackHistory.length === 1 ? '' : 's'} recorded
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference or phone..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-black text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Transaction Reference</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Customer / Phone</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300 font-medium">
              {isLoadingHistory ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2 font-bold">
                      <RotateCw className="w-4 h-4 animate-spin text-amber-500" />
                      <span>Loading transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-700 dark:text-slate-300">
                        {searchQuery ? 'No matching transactions found' : 'No payment records yet'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {searchQuery
                          ? 'Try adjusting your search query'
                          : 'Completed subscription payments will automatically appear here'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((tx) => {
                  const amountInGhs = tx.amount ? (tx.amount / 100).toFixed(2) : '200.00';
                  const dateStr = tx.paid_at || tx.created_at
                    ? new Date(tx.paid_at || tx.created_at!).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Recent';

                  const statusLower = (tx.status || '').toLowerCase();
                  const isSuccess = statusLower === 'success' || statusLower === 'paid';
                  const isFailed = statusLower === 'failed';

                  const customerInfo =
                    tx.customer?.phone ||
                    tx.metadata?.mobile_number ||
                    tx.customer?.email ||
                    tx.channel ||
                    'Mobile Money';

                  return (
                    <tr
                      key={tx.id || tx.reference}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-700">
                          <span>{tx.reference}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(tx.reference)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                            title="Copy reference"
                          >
                            {copiedRef === tx.reference ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white font-mono text-sm">
                        GH₵ {amountInGhs}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-semibold">
                        {customerInfo}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-xs">{dateStr}</td>
                      <td className="py-3.5 px-4 text-right">
                        {isSuccess ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Paid</span>
                          </span>
                        ) : isFailed ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-black text-[10px] uppercase border border-rose-500/20">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Failed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-[10px] uppercase border border-amber-500/20">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{tx.status}</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
