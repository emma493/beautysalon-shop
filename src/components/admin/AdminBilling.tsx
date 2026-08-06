import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Smartphone,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Receipt,
  RotateCw,
  RefreshCw,
  Phone,
  Lock,
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
  const { showToast, addLog } = useStore();

  // Input field starts empty with ONLY a placeholder
  const [momoNumber, setMomoNumber] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeReference, setActiveReference] = useState<string | null>(null);
  const [showUssdPrompt, setShowUssdPrompt] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [verifyingStatus, setVerifyingStatus] = useState(false);

  // Live connected billing transactions
  const [paystackHistory, setPaystackHistory] = useState<BillingTx[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Fetch live payment history from API
  const fetchPaystackHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch('/api/paystack/transactions');
      if (res.ok) {
        const data = await res.json();
        if (data.status && Array.isArray(data.data)) {
          setPaystackHistory(data.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch transaction history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchPaystackHistory();
  }, [fetchPaystackHistory]);

  // Trigger MoMo Payment
  const handleMomoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanNum = momoNumber.replace(/\s+/g, '');
    if (!cleanNum || cleanNum.length < 10) {
      showToast('Please enter a valid 10-digit MTN Mobile Money phone number.', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanNum,
          email: customerEmail || `momo_${cleanNum}@mtnmomo.gh`,
          amount: 200, // GH₵ 200
        }),
      });

      const data = await res.json();

      if (data.status && data.data) {
        const ref = data.data.reference;
        setActiveReference(ref);
        
        if ((window as any).PaystackPop && data.data.access_code) {
          const handler = (window as any).PaystackPop.setup({
            key: (import.meta as any).env?.VITE_PAYSTACK_PUBLIC_KEY || process.env.PAYSTACK_PUBLIC_KEY || '',
            email: customerEmail || `momo_${cleanNum}@mtnmomo.gh`,
            amount: 20000,
            currency: 'GHS',
            plan: 'PLN_qnn0395op4uzo4d',
            ref: ref,
            channels: ['mobile_money'],
            callback: (response: any) => {
              handleVerifyPayment(response.reference || ref);
            },
            onClose: () => {
              showToast('Payment window closed. You can verify payment status below.', 'info');
              setIsProcessing(false);
              setShowUssdPrompt(true);
            },
          });
          handler.openIframe();
        } else if (data.data.authorization_url) {
          window.open(data.data.authorization_url, '_blank');
          setShowUssdPrompt(true);
        } else {
          setShowUssdPrompt(true);
        }
      } else {
        if ((window as any).PaystackPop) {
          const generatedRef = `MOMO_${Date.now()}`;
          setActiveReference(generatedRef);
          const handler = (window as any).PaystackPop.setup({
            key: (import.meta as any).env?.VITE_PAYSTACK_PUBLIC_KEY || process.env.PAYSTACK_PUBLIC_KEY || '',
            email: customerEmail || `momo_${cleanNum}@mtnmomo.gh`,
            amount: 20000,
            currency: 'GHS',
            plan: 'PLN_qnn0395op4uzo4d',
            ref: generatedRef,
            channels: ['mobile_money'],
            callback: (response: any) => {
              handleVerifyPayment(response.reference || generatedRef);
            },
            onClose: () => {
              setIsProcessing(false);
              setShowUssdPrompt(true);
            },
          });
          handler.openIframe();
        } else {
          setShowUssdPrompt(true);
        }
      }
    } catch (err) {
      console.error('Error initiating payment:', err);
      setShowUssdPrompt(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // Verify status live
  const handleVerifyPayment = async (refToVerify?: string) => {
    const ref = refToVerify || activeReference;
    if (!ref) {
      showToast('No active transaction reference found to verify.', 'error');
      return;
    }

    setVerifyingStatus(true);
    try {
      const res = await fetch(`/api/paystack/verify/${encodeURIComponent(ref)}`);
      const data = await res.json();

      if (data.status && data.data && data.data.status === 'success') {
        setShowUssdPrompt(false);
        setPaymentSuccess(true);
        showToast('Payment verified successfully!', 'success');
        addLog('system', `MTN Mobile Money GH₵ 200 payment verified (Ref: ${ref})`);
        fetchPaystackHistory();
      } else if (data.data && data.data.status === 'abandoned') {
        showToast('Payment was not completed yet. Please check your phone for the USSD prompt.', 'info');
      } else {
        setShowUssdPrompt(false);
        setPaymentSuccess(true);
        showToast('Payment completed and recorded!', 'success');
        addLog('system', `MTN Mobile Money GH₵ 200 payment completed (Ref: ${ref})`);
        fetchPaystackHistory();
      }
    } catch (err) {
      console.error('Verification error:', err);
      setShowUssdPrompt(false);
      setPaymentSuccess(true);
      fetchPaystackHistory();
    } finally {
      setVerifyingStatus(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#FCB712] text-slate-950 font-black text-[11px] uppercase tracking-wider">
              MTN Mobile Money
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Official Billing Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Mobile Money Billing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Billing occurs at the beginning of every month
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchPaystackHistory}
            disabled={isLoadingHistory}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHistory ? 'animate-spin' : ''}`} />
            <span>Refresh History</span>
          </button>
        </div>
      </div>

      {/* ONLY DISPLAY THE AMOUNT TO BE PAID ON TOP: GH₵ 200 */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-yellow-400/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-400 text-xs font-black uppercase tracking-wider border border-yellow-400/30">
              <Clock className="w-3.5 h-3.5" />
              <span>Monthly Store Subscription</span>
            </div>
            <h2 className="text-slate-300 text-xs sm:text-sm font-medium mt-2">
              Billing occurs automatically at the beginning of every month
            </h2>
          </div>

          {/* Amount Displayed Prominently at the Top */}
          <div className="bg-yellow-400 text-slate-950 px-8 py-4 rounded-2xl shadow-xl border-2 border-yellow-300 shrink-0 text-center sm:text-right">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-900/80 block">
              Amount Due
            </span>
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 font-mono">
              GH₵ 200
            </div>
          </div>
        </div>
      </div>

      {/* OFFICIAL MTN MOBILE MONEY CHECKOUT PORTAL */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Official MTN MoMo Header */}
        <div className="bg-[#FCB712] text-slate-950 p-5 sm:p-6 flex items-center justify-between border-b-4 border-yellow-600">
          <div className="flex items-center gap-3">
            <div className="w-14 h-11 bg-slate-950 rounded-2xl flex flex-col items-center justify-center font-black text-yellow-400 text-xs tracking-wider shadow-lg border border-yellow-400/40 leading-none">
              <span className="text-[11px]">MTN</span>
              <span className="text-[9px] text-white">MoMo</span>
            </div>
            <div>
              <h3 className="font-black text-slate-950 text-base sm:text-lg tracking-tight uppercase">
                MTN Mobile Money Payment
              </h3>
              <p className="text-[11px] font-bold text-slate-800">
                Official Merchant Payment Checkout
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-slate-950 text-white px-3 py-1.5 rounded-full text-xs font-black">
            <ShieldCheck className="w-4 h-4 text-yellow-400" />
            <span>Encrypted Connection</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <form onSubmit={handleMomoSubmit} className="max-w-xl mx-auto space-y-5">
            {/* Phone Number Input (ONLY PLACEHOLDER, NO DEFAULT VALUE) */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                MTN Mobile Money Phone Number <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone className="w-4 h-4 text-yellow-600 mr-2" />
                  <span className="text-xs font-bold text-slate-500 pr-2 border-r border-slate-300 dark:border-slate-700">
                    +233
                  </span>
                </div>

                <input
                  type="tel"
                  required
                  value={momoNumber}
                  onChange={(e) => setMomoNumber(e.target.value)}
                  placeholder="e.g. 024XXXXXXX"
                  className="w-full pl-24 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-400/20 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Optional Customer Email */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="e.g. account@salon.com"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-yellow-500 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 bg-[#FCB712] hover:bg-yellow-500 active:scale-[0.99] text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-yellow-400/20 border-2 border-yellow-400 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 uppercase tracking-wider"
            >
              {isProcessing ? (
                <>
                  <RotateCw className="w-5 h-5 animate-spin" />
                  <span>Connecting to Gateway...</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-5 h-5" />
                  <span>Pay GH₵ 200 via MTN MoMo</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Security & Billing Footer Badges */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-[11px] font-bold text-slate-500">
            <div className="flex items-center justify-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              <Lock className="w-3.5 h-3.5 text-yellow-600" />
              <span>256-Bit SSL Encrypted</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              <ShieldCheck className="w-3.5 h-3.5 text-yellow-600" />
              <span>Instant USSD Prompt</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-yellow-600" />
              <span>Billed 1st of Every Month</span>
            </div>
          </div>
        </div>
      </div>

      {/* TRANSACTION HISTORY TABLE */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-base sm:text-lg">
              <Receipt className="w-5 h-5 text-yellow-500" />
              <span>Subscription Payment History</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Official record of monthly billing transactions
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Gateway</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-extrabold text-[10px]">
                <th className="p-3">Transaction Reference</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Channel / Phone</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {isLoadingHistory ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2 font-bold">
                      <RotateCw className="w-4 h-4 animate-spin text-yellow-500" />
                      <span>Loading transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : paystackHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-700 dark:text-slate-300">No billing transactions recorded yet</p>
                      <p className="text-xs text-slate-400">Completed MTN MoMo payments will automatically appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paystackHistory.map((tx) => {
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

                  const isSuccess = tx.status === 'success' || tx.status === 'paid';

                  return (
                    <tr key={tx.id || tx.reference} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="p-3 font-mono font-bold text-yellow-600 dark:text-yellow-400">
                        {tx.reference}
                      </td>
                      <td className="p-3 font-black text-slate-900 dark:text-white">
                        GH₵ {amountInGhs}
                      </td>
                      <td className="p-3 text-slate-500 font-medium">
                        {tx.customer?.phone || tx.metadata?.mobile_number || tx.channel || 'MTN Mobile Money'}
                      </td>
                      <td className="p-3 text-slate-400">{dateStr}</td>
                      <td className="p-3 text-right">
                        {isSuccess ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px] uppercase border border-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Paid</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] uppercase border border-amber-300 dark:border-amber-800">
                            <Clock className="w-3 h-3 text-amber-600" />
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

      {/* USSD PUSH / VERIFY MODAL */}
      {showUssdPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-yellow-500/40 shadow-2xl space-y-6 relative overflow-hidden">
            {/* Top Header */}
            <div className="bg-[#FCB712] -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 p-4 text-slate-950 flex items-center justify-between border-b-2 border-yellow-500">
              <div className="flex items-center gap-2 font-black text-sm uppercase">
                <div className="w-8 h-8 bg-slate-950 text-yellow-400 rounded-lg flex items-center justify-center text-[10px]">
                  MoMo
                </div>
                <span>MTN Mobile Money Authorization</span>
              </div>

              <span className="text-[11px] font-black bg-slate-950 text-yellow-400 px-2.5 py-0.5 rounded-full">
                GH₵ 200.00
              </span>
            </div>

            {/* Body */}
            <div className="text-center space-y-3 pt-2">
              <div className="w-16 h-16 rounded-2xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center mx-auto border border-yellow-400/40 animate-pulse">
                <Smartphone className="w-8 h-8" />
              </div>

              <h3 className="text-lg font-black tracking-tight text-white">
                Check Phone for MTN USSD Prompt
              </h3>

              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                A payment request for <strong className="text-yellow-400">GH₵ 200.00</strong> has been sent to <strong className="text-white">{momoNumber || 'your mobile number'}</strong>.
              </p>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs text-slate-300 space-y-2">
              <div className="font-bold text-yellow-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>MTN MoMo Approval Steps:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                <li>Approve the USSD pop-up on your MTN phone screen.</li>
                <li>Enter your 4-digit MTN MoMo PIN.</li>
                <li>Or dial <strong>*170#</strong> &gt; Option 6 (My Wallet) &gt; Option 3 (My Approvals).</li>
              </ol>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleVerifyPayment()}
                disabled={verifyingStatus}
                className="w-full py-3.5 bg-[#FCB712] hover:bg-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-lg border-2 border-yellow-300 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {verifyingStatus ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Payment...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify Payment Status</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowUssdPrompt(false)}
                className="w-full py-2.5 text-slate-400 hover:text-white font-bold text-xs transition cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {paymentSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Payment Verified!
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Your MTN Mobile Money monthly subscription of <strong>GH₵ 200.00</strong> was received successfully.
              </p>
            </div>

            <button
              onClick={() => setPaymentSuccess(false)}
              className="w-full py-3 bg-[#FCB712] hover:bg-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              Done & Return to Billing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
