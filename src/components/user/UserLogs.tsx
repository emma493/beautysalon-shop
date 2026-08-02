import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { History, Calendar, Clock, Activity } from 'lucide-react';
import { CustomDatePicker } from '../common/CustomDatePicker';

export const UserLogs: React.FC = () => {
  const { logs, currentUser } = useStore();

  const getTodayISO = () => new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(getTodayISO());

  // Filter logs for this worker and date
  const filteredLogs = logs.filter((l) => {
    const isUserMatch = currentUser ? l.userId === currentUser.id : true;
    const isDateMatch = l.date === selectedDate || l.timestamp.startsWith(selectedDate);
    return isUserMatch && isDateMatch;
  });

  return (
    <div className="space-y-6">
      {/* Date Filter & Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-950/80 text-orange-600">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Daily Activity Logs</h2>
            <p className="text-xs text-slate-500">Track logins, logouts, and completed orders for the day</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-64">
          <CustomDatePicker
            value={selectedDate}
            onChange={setSelectedDate}
            placeholder="Select date..."
            presetType="past"
            allowClear={false}
          />
        </div>
      </div>

      {/* Logs Timeline List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-600" />
            <span>Logs for {selectedDate}</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">{filteredLogs.length} events</span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <History className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-medium">No activity logged for this date ({selectedDate}).</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLogs.map((log) => {
              const timeStr = new Date(log.timestamp).toLocaleTimeString();

              return (
                <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="font-bold text-[10px] uppercase tracking-wider text-orange-600">
                        {log.action}
                      </span>
                      <span className="text-slate-400 font-medium">{timeStr}</span>
                    </div>

                    <p className="text-sm font-medium text-slate-900 dark:text-white font-mono leading-tight">
                      {log.details}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
