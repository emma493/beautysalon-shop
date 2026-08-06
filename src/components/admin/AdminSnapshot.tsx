import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { useTenant } from '../../context/TenantContext';
import {
  DownloadCloud,
  Calendar,
  Loader2,
  CheckCircle2,
  Clock,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  FileCode,
  FileCheck,
} from 'lucide-react';
import { generateOfflineHTMLSnapshot, generateSnapshotZip } from '../../utils/snapshotGenerator';

export const AdminSnapshot: React.FC = () => {
  const { orders, products, workers, logs, settings, resetTransactions, showToast } = useStore();
  const { currentTenant } = useTenant();

  // Test Mode toggle to simulate Dec 31st for testing/demo
  const [isTestModeDec31, setIsTestModeDec31] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  // 1-Year Fiscal Countdown Calculations
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1).getTime();
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59).getTime();
  const nowTime = new Date().getTime();

  const totalYearMs = endOfYear - startOfYear;
  const elapsedMs = Math.max(0, nowTime - startOfYear);
  const realRemainingMs = Math.max(0, endOfYear - nowTime);

  const realProgressPercent = Math.min(100, Math.round((elapsedMs / totalYearMs) * 100));

  // If Test Mode is active, simulate 100% progress and Dec 31 date
  const isDec31Active = isTestModeDec31 || realRemainingMs === 0 || realProgressPercent >= 99;
  const displayProgress = isDec31Active ? 100 : realProgressPercent;

  const daysRemaining = Math.ceil(realRemainingMs / (1000 * 60 * 60 * 24));

  const handleDownloadAndReset = async () => {
    setIsDownloading(true);

    try {
      // 1. Generate and download standalone Offline HTML Snapshot application
      const htmlContent = generateOfflineHTMLSnapshot(
        currentYear,
        orders,
        products,
        workers,
        logs,
        settings
      );

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const companySlug = (currentTenant?.companyName || settings.shopName || 'Company')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-');
      link.download = `Socialfunera-Snapshot-${companySlug}-${currentYear}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // 2. Also trigger ZIP backup containing JSON data
      const zipBlob = await generateSnapshotZip(
        `Dec-31-${currentYear}`,
        orders,
        products,
        workers,
        logs,
        settings
      );
      const zipUrl = URL.createObjectURL(zipBlob);
      const zipLink = document.createElement('a');
      zipLink.href = zipUrl;
      zipLink.download = `Socialfunera-Data-Archive-${companySlug}-${currentYear}.zip`;
      document.body.appendChild(zipLink);
      zipLink.click();
      document.body.removeChild(zipLink);
      URL.revokeObjectURL(zipUrl);

      setDownloadComplete(true);
      showToast('Offline Snapshot HTML Application & ZIP archive downloaded!', 'success');

      // 3. Perform System Reset (Only reset transactions page / orders history)
      setIsResetting(true);
      if (resetTransactions) {
        await resetTransactions();
      }
      setIsResetting(false);
    } catch (err: any) {
      console.error('Failed to download snapshot:', err);
      showToast('Error generating snapshot download.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Annual Snapshot & System Reset
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Download complete offline system snapshots on 31st December and reset sales records for the new fiscal year
          </p>
        </div>

        {/* Test Mode Fast Forward Button */}
        <button
          onClick={() => setIsTestModeDec31((prev) => !prev)}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 border transition cursor-pointer shrink-0 ${
            isTestModeDec31
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <span>{isTestModeDec31 ? '🧪 Test Mode: Dec 31st Active' : '🧪 Fast-Forward to Dec 31st'}</span>
        </button>
      </div>

      {/* Hero 1-Year Countdown Progress Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-brand-950 p-6 sm:p-8 rounded-3xl border border-slate-800 text-white shadow-2xl relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 border border-brand-500/40 text-brand-400 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Fiscal Year {currentYear} Progress</h2>
              <p className="text-xs text-slate-400">
                1-Year countdown towards <strong className="text-emerald-400">31st December {currentYear}</strong>
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right bg-slate-900/90 px-4 py-2.5 rounded-2xl border border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-400">Countdown Status</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400">
              {isDec31Active ? '31st December Unlocked!' : `${daysRemaining} Days Remaining`}
            </div>
          </div>
        </div>

        {/* 1-Year Countdown Loading Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-300">
            <span>Fiscal Year Progress ({displayProgress}%)</span>
            <span>Target: Dec 31, {currentYear}</span>
          </div>

          <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isDec31Active
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-300 animate-pulse'
                  : 'bg-gradient-to-r from-brand-600 to-emerald-400'
              }`}
              style={{ width: `${displayProgress}%` }}
            />
          </div>
        </div>

        {/* Status Alert Banner */}
        {isDec31Active ? (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl flex items-center gap-3 text-xs text-emerald-200 font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              31st December date reached! The Download Snapshot and Reset System action is unlocked and ready.
            </span>
          </div>
        ) : (
          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center gap-3 text-xs text-slate-300 font-medium">
            <Clock className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              Snapshot download will automatically unlock on 31st December {currentYear}. You can use the test mode toggle above to fast-forward for demo testing.
            </span>
          </div>
        )}
      </div>

      {/* Main Action Panel */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <DownloadCloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Download Snapshot & Reset System
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generates a full standalone offline HTML application and resets the Transactions page for the new year.
            </p>
          </div>
        </div>

        {/* Included Snapshot Specifications */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-medium text-slate-700 dark:text-slate-300">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700 flex items-center gap-2.5">
            <FileCode className="w-4 h-4 text-brand-600 shrink-0" />
            <span>Standalone Offline HTML Portal App</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700 flex items-center gap-2.5">
            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Full Sales History ({orders.length} orders)</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
            <span>Inventory Catalog Preserved ({products.length} items)</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700 flex items-center gap-2.5">
            <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Resets ONLY Transactions Page</span>
          </div>
        </div>

        {/* Primary Download & Reset Button */}
        {isDec31Active ? (
          <div className="space-y-4 pt-2">
            <button
              onClick={handleDownloadAndReset}
              disabled={isDownloading || isResetting}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:opacity-95 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 transition transform hover:scale-[1.01] cursor-pointer disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Compiling Standalone Offline HTML Application...</span>
                </>
              ) : isResetting ? (
                <>
                  <RotateCcw className="w-5 h-5 animate-spin" />
                  <span>Resetting Transactions for Fiscal Year {currentYear + 1}...</span>
                </>
              ) : (
                <>
                  <DownloadCloud className="w-6 h-6" />
                  <span>Download Snapshot and Reset System</span>
                </>
              )}
            </button>

            {downloadComplete && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  Snapshot downloaded successfully! The Transactions page has been reset for the new fiscal year while keeping all products, staff, and settings intact.
                </span>
              </div>
            )}
          </div>
        ) : (
          <button
            disabled
            className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-sm rounded-2xl border border-slate-200 dark:border-slate-700 cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Clock className="w-5 h-5" />
            <span>Download Locked (Unlocks on 31st December or via Test Mode)</span>
          </button>
        )}
      </div>
    </div>
  );
};
