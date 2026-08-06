import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Smartphone,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Receipt,
  RotateCw,
  Lock,
  Sparkles,
  Phone,
  DollarSign,
} from 'lucide-react';

export const AdminBilling: React.FC = () => {
  const { settings, showToast, addLog } = useStore();

  const [momoNumber, setMomoNumber] = useState('0244123456');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUssdPrompt, setShowUssdPrompt] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([
    {
      id: 'MOMO-GH-984210',
      month: 'August 2026',
      amount: 'GH₵ 200.00',
      date: 'Aug 1, 2026',
      status: 'Paid',
      phone: '0244123456',
    },
  ]);

  const handleMomoSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanNum = momoNumber.replace(/\s+/g, '');
    if (cleanNum.length < 10) {
      showToast('Please enter a valid 10-digit MTN Mobile Money number.', 'error');
      return;
    }

    setIsProcessing(true);

    // Simulate sending MoMo USSD prompt
    setTimeout(() => {
      setIsProcessing(false);
      setShowUssdPrompt(true);
    }, 1200);
  };

  const handleConfirmPrompt = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowUssdPrompt(false);
      setPaymentSuccess(true);

      const newTx = {
        id: `MOMO-GH-${Math.floor(100000 + Math.random() * 900000)}`,
        month: 'September 2026',
        amount: 'GH₵ 200.00',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'Paid',
        phone: momoNumber,
      };

      setPaymentHistory([newTx, ...paymentHistory]);
      addLog('system', `MTN Mobile Money subscription payment of GH₵ 200 completed for ${momoNumber}`);
      showToast('Payment successful! Subscription renewed for the month.', 'success');
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            MTN Mobile Money Billing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Store subscription renewals are billed at the beginning of every month
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300/60 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Store Account Active</span>
          </span>
        </div>
      </div>

      {/* TOP PRICE BANNER - ONLY DISPLAY AMOUNT ON TOP GH₵ 200 */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Subtle decorative background graphics */}
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-yellow-400/10 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-yellow-400 text-xs font-black uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Monthly Subscription Fee</span>
            </div>
            <h2 className="text-slate-300 text-xs sm:text-sm font-medium">
              Billed at the beginning of every month
            </h2>
          </div>

          {/* Amount Displayed Prominently at Top */}
          <div className="bg-yellow-400 text-slate-950 px-6 py-4 rounded-2xl shadow-lg border-2 border-yellow-300 shrink-0 text-center md:text-right">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-900/70 block">
              Amount Due
            </span>
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 font-mono">
              GH₵ 200
            </div>
          </div>
        </div>
      </div>

      {/* BETWAY / SPORTYBET STYLE MTN MOBILE MONEY CHECKOUT PORTAL */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* MTN MoMo Official Styled Yellow & Black Header */}
        <div className="bg-yellow-400 text-slate-950 p-5 flex items-center justify-between border-b-4 border-yellow-500">
          <div className="flex items-center gap-3">
            {/* MoMo Badge Icon */}
            <div className="w-12 h-10 bg-slate-950 rounded-xl flex items-center justify-center font-black text-yellow-400 text-xs tracking-wider shadow-md">
              MoMo
            </div>
            <div>
              <h3 className="font-black text-slate-950 text-base tracking-tight uppercase">
                MTN Mobile Money
              </h3>
              <p className="text-[11px] font-bold text-slate-800">
                Instant USSD Push Payment Portal
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 bg-slate-950/10 px-3 py-1 rounded-full text-xs font-extrabold text-slate-900 border border-slate-950/20">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-900" />
            <span>Encrypted MoMo API</span>
          </span>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <form onSubmit={handleMomoSubmit} className="max-w-xl mx-auto space-y-5">
            {/* Phone Number Input */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                MTN Mobile Money Phone Number <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                  <Phone className="w-4 h-4 text-yellow-600 mr-1.5" />
                  <span className="text-slate-500 border-r border-slate-300 dark:border-slate-700 pr-2">
                    +233
                  </span>
                </div>

                <input
                  type="tel"
                  required
                  value={momoNumber}
                  onChange={(e) => setMomoNumber(e.target.value)}
                  placeholder="e.g. 0244123456"
                  className="w-full pl-24 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-400/20 transition"
                />
              </div>

              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Supported prefixes: 024, 054, 055, 059, 025. You will receive an instant prompt on your phone.
              </p>
            </div>

            {/* Quick MoMo Network Selector Indicator */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
                <span>Selected Provider: MTN Ghana (Mobile Money)</span>
              </div>
              <span className="text-yellow-600 dark:text-yellow-400 font-black">GH₵ 200.00</span>
            </div>

            {/* Betway / Sportybet Style Bold Yellow Action Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 active:scale-[0.99] text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-yellow-400/20 border-2 border-yellow-300 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 uppercase tracking-wider"
            >
              {isProcessing ? (
                <>
                  <RotateCw className="w-5 h-5 animate-spin" />
                  <span>Sending USSD Prompt...</span>
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

          {/* Billing Rules Footer Note */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 rounded-2xl text-xs font-medium text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Billing Cycle Information:</strong>
              Subscription billing automatically recurs at the beginning of every month (1st day of the month) for GH₵ 200.
            </div>
          </div>
        </div>
      </div>

      {/* RECENT BILLING HISTORY TABLE */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-base">
            <Receipt className="w-5 h-5 text-yellow-500" />
            <span>Monthly Payment History</span>
          </div>
          <span className="text-xs text-slate-400 font-bold">GH₵ 200 / Month</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-extrabold text-[10px]">
                <th className="p-3">Reference ID</th>
                <th className="p-3">Billing Month</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {paymentHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-3 font-mono font-bold text-yellow-600 dark:text-yellow-400">{item.id}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{item.month}</td>
                  <td className="p-3 text-slate-500">{item.phone}</td>
                  <td className="p-3 font-black text-slate-900 dark:text-white">{item.amount}</td>
                  <td className="p-3 text-slate-400">{item.date}</td>
                  <td className="p-3 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px] uppercase border border-emerald-300 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{item.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SIMULATED USSD PROMPT MODAL (Betway / Sportybet Style Overlay) */}
      {showUssdPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-yellow-500/40 shadow-2xl space-y-6 relative overflow-hidden">
            {/* Top MoMo Bar */}
            <div className="bg-yellow-400 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 p-4 text-slate-950 flex items-center justify-between border-b-2 border-yellow-500">
              <div className="flex items-center gap-2 font-black text-sm uppercase">
                <div className="w-8 h-8 bg-slate-950 text-yellow-400 rounded-lg flex items-center justify-center text-[10px]">
                  MoMo
                </div>
                <span>MTN Mobile Money Push</span>
              </div>

              <span className="text-[11px] font-black bg-slate-950 text-yellow-400 px-2.5 py-0.5 rounded-full">
                GH₵ 200.00
              </span>
            </div>

            {/* USSD Phone Prompt Graphic */}
            <div className="text-center space-y-3 pt-2">
              <div className="w-16 h-16 rounded-2xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center mx-auto border border-yellow-400/40 animate-pulse">
                <Smartphone className="w-8 h-8" />
              </div>

              <h3 className="text-lg font-black tracking-tight text-white">
                Authorize Payment on Your Phone
              </h3>

              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                A payment request for <strong className="text-yellow-400">GH₵ 200.00</strong> has been sent to <strong className="text-white">{momoNumber}</strong>.
              </p>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs text-slate-300 space-y-2">
              <div className="font-bold text-yellow-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>USSD Instructions:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                <li>Check your phone screen for the MTN MoMo pop-up.</li>
                <li>Enter your 4-digit MTN MoMo PIN to confirm.</li>
                <li>Or dial <strong>*170#</strong> &gt; Option 6 (My Wallet) &gt; Option 3 (My Approvals).</li>
              </ol>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleConfirmPrompt}
                disabled={isProcessing}
                className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-lg border-2 border-yellow-300 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Authorization...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simulate User Approved PIN Entry</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowUssdPrompt(false)}
                className="w-full py-2.5 text-slate-400 hover:text-white font-bold text-xs transition cursor-pointer"
              >
                Cancel Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS CONFIRMATION MODAL */}
      {paymentSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Payment Successful!
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Your MTN Mobile Money payment of <strong>GH₵ 200.00</strong> was processed successfully.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs font-mono text-slate-700 dark:text-slate-300 font-bold">
              Transaction Ref: MOMO-GH-{Math.floor(100000 + Math.random() * 900000)}
            </div>

            <button
              onClick={() => setPaymentSuccess(false)}
              className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              Done & Return to Billing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
