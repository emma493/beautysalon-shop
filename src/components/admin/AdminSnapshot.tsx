import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { DownloadCloud, Calendar, Loader2, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Sparkles, Lock } from 'lucide-react';
import { generateSnapshotZip } from '../../utils/snapshotGenerator';

export const AdminSnapshot: React.FC = () => {
  const { orders, products, workers, logs, settings, resetTransactions, showToast } = useStore();

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [downloadCompleted, setDownloadCompleted] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Annual Countdown Math
  const today = new Date();
  const currentYear = selectedYear;

  const yearStart = new Date(currentYear, 0, 1).getTime();
  const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59).getTime();
  const totalDaysInYear = 365;

  let daysElapsed = Math.floor((today.getTime() - yearStart) / (1000 * 60 * 60 * 24));
  if (daysElapsed < 0) daysElapsed = 0;
  if (daysElapsed > 365) daysElapsed = 365;

  let percentage = Math.min(100, Math.max(0, Math.round((daysElapsed / totalDaysInYear) * 100)));
  let daysRemaining = Math.max(0, totalDaysInYear - daysElapsed);

  // Unlocked if date reaches 31st December or percentage is 100%
  const isDec31stUnlocked = percentage >= 100 || (today.getMonth() === 11 && today.getDate() === 31);

  const handleDownloadAndReset = async () => {
    try {
      setIsProcessing(true);

      // 1. Generate full offline snapshot zip with embedded index.html SPA
      const blob = await generateSnapshotZip(
        String(selectedYear),
        orders,
        products,
        workers,
        logs,
        settings
      );

      // 2. Trigger browser download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Company_Snapshot_Dec31_${selectedYear}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // 3. Reset ONLY transactions page
      await resetTransactions();

      setIsProcessing(false);
      setDownloadCompleted(true);
      showToast('Offline snapshot downloaded & transactions reset successfully!', 'success');
    } catch (e) {
      console.error('Snapshot reset error:', e);
      setIsProcessing(false);
      showToast('Error generating snapshot archive.', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            System Snapshot & Year-End Reset
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            1-Year countdown bar to 31st December offline data archive and system reset
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 text-xs font-bold border border-brand-200 dark:border-brand-800">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            <span>Admin Control Active</span>
          </span>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        {/* Title Info */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
              <DownloadCloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Annual System Snapshot ({selectedYear})</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Automatically tracks countdown to 31st December for complete offline application snapshot download.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              <option value={2026}>Year 2026</option>
              <option value={2027}>Year 2027</option>
              <option value={2028}>Year 2028</option>
            </select>
          </div>
        </div>

        {/* 1-YEAR COUNTDOWN LOADING BAR CARD */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/60 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                1-Year Progress Bar (Jan 1, {selectedYear} – Dec 31, {selectedYear})
              </span>
            </div>

            <span className="text-xs font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/80 px-2.5 py-1 rounded-full border border-brand-200 dark:border-brand-800">
              {percentage}% Completed ({daysRemaining} days remaining)
            </span>
          </div>

          {/* Visual Progress Bar */}
          <div className="relative w-full h-5 bg-slate-200 dark:bg-slate-700/80 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isDec31stUnlocked
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 animate-pulse'
                  : 'bg-gradient-to-r from-brand-600 to-amber-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span>January 1, {selectedYear}</span>
            <span>December 31, {selectedYear}</span>
          </div>
        </div>

        {/* LOCKED vs UNLOCKED STATE */}
        {!isDec31stUnlocked ? (
          <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Download Snapshot & Reset System Locked
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              The reset button will automatically activate on <strong>31st December {selectedYear}</strong> when the 1-year countdown reaches 100%.
            </p>
          </div>
        ) : (
          /* UNLOCKED ACTION CARD */
          <div className="p-6 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-emerald-500/10 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-emerald-950/40 border-2 border-emerald-500/60 rounded-3xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  31st December Year-End Snapshot Ready!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Clicking below will download a complete offline version of the entire company portal (interactive HTML + database JSONs) and reset the transactions history for {selectedYear + 1}. All inventory, products, staff, and settings will be preserved.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-slate-700 dark:text-slate-300 space-y-1">
              <strong className="block font-bold text-emerald-700 dark:text-emerald-400">
                What happens when you click:
              </strong>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                <li>Downloads a complete standalone offline web application (`index.html`) + JSON files.</li>
                <li>Allows offline searching, filtering, and receipt inspection across all intervals.</li>
                <li>Resets <strong>ONLY the transactions page</strong> (`orders` database).</li>
                <li>Keeps products, inventory, staff accounts, and store settings intact.</li>
              </ul>
            </div>

            <button
              onClick={handleDownloadAndReset}
              disabled={isProcessing}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Compiling Offline Application & Resetting System...</span>
                </>
              ) : (
                <>
                  <DownloadCloud className="w-5 h-5" />
                  <span>Download Snapshot and Reset System</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* SUCCESS MODAL / MESSAGE */}
        {downloadCompleted && (
          <div className="p-4 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-300 font-bold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Snapshot archive downloaded successfully! Transactions page has been reset.</span>
            </div>
            <button
              onClick={() => setDownloadCompleted(false)}
              className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
