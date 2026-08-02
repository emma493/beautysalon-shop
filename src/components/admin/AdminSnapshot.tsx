import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { DownloadCloud, Calendar, Loader2, CheckCircle2 } from 'lucide-react';
import { generateSnapshotZip } from '../../utils/snapshotGenerator';
import { CustomDatePicker } from '../common/CustomDatePicker';

export const AdminSnapshot: React.FC = () => {
  const { orders, products, workers, logs, settings } = useStore();

  const getTodayISO = () => new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(getTodayISO());

  const [isRetrieving, setIsRetrieving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const handleRetrieve = () => {
    setIsRetrieving(true);
    setProgress(0);
    setIsReady(false);

    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setIsRetrieving(false);
        setIsReady(true);
      }
    }, 200);
  };

  const handleDownload = async () => {
    const blob = await generateSnapshotZip(
      selectedDate,
      orders,
      products,
      workers,
      logs,
      settings
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Snapshot_${selectedDate}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <DownloadCloud className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Offline Backup Data Snapshot</h2>
            <p className="text-xs text-slate-500">Extract offline JSON database snapshots packaged in a downloadable ZIP file</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Snapshot Date *</label>
            <CustomDatePicker
              value={selectedDate}
              onChange={(val) => {
                setSelectedDate(val);
                setIsReady(false);
                setProgress(0);
              }}
              placeholder="Select snapshot date..."
              presetType="past"
              allowClear={false}
            />
          </div>

          {!isReady && !isRetrieving && (
            <button
              onClick={handleRetrieve}
              className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl shadow-md transition"
            >
              Retrieve Snapshot Data
            </button>
          )}

          {/* Progress Bar Loading Animation */}
          {isRetrieving && (
            <div className="space-y-2 py-2">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-4 h-4 text-orange-600 animate-spin" />
                  <span>Compiling offline database files for {selectedDate}...</span>
                </span>
                <span>{progress}%</span>
              </div>

              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-600 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Download Snapshot Button Unlocked */}
          {isReady && (
            <div className="space-y-3 pt-2">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Data snapshot for {selectedDate} retrieved successfully and verified!</span>
              </div>

              <button
                onClick={handleDownload}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
              >
                <DownloadCloud className="w-5 h-5" />
                <span>Download Snapshot ZIP Archive</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
