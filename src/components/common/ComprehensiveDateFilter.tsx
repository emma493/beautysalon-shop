import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Filter, X, ArrowRight, Check } from 'lucide-react';
import { CustomDatePicker } from './CustomDatePicker';

export interface DateFilterValue {
  type: 'all' | 'today' | 'yesterday' | 'specific' | 'range';
  specificDate: string; // YYYY-MM-DD
  startDate: string;    // YYYY-MM-DD
  endDate: string;      // YYYY-MM-DD
}

interface ComprehensiveDateFilterProps {
  value: DateFilterValue;
  onChange: (value: DateFilterValue) => void;
  className?: string;
  compact?: boolean;
}

export const ComprehensiveDateFilter: React.FC<ComprehensiveDateFilterProps> = ({
  value,
  onChange,
  className = '',
  compact = false,
}) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'specific' | 'range'>(
    value.type === 'specific' ? 'specific' : value.type === 'range' ? 'range' : 'preset'
  );

  const getTodayISO = () => new Date().toISOString().split('T')[0];
  const getYesterdayISO = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  const handlePresetChange = (preset: 'all' | 'today' | 'yesterday') => {
    setActiveTab('preset');
    onChange({
      type: preset,
      specificDate: preset === 'today' ? getTodayISO() : preset === 'yesterday' ? getYesterdayISO() : '',
      startDate: '',
      endDate: '',
    });
  };

  const handleSpecificDateChange = (dateStr: string) => {
    setActiveTab('specific');
    if (!dateStr) {
      handlePresetChange('all');
      return;
    }
    onChange({
      type: 'specific',
      specificDate: dateStr,
      startDate: '',
      endDate: '',
    });
  };

  const handleRangeStartDateChange = (dateStr: string) => {
    setActiveTab('range');
    onChange({
      ...value,
      type: 'range',
      startDate: dateStr,
      endDate: value.endDate || dateStr,
    });
  };

  const handleRangeEndDateChange = (dateStr: string) => {
    setActiveTab('range');
    onChange({
      ...value,
      type: 'range',
      startDate: value.startDate || dateStr,
      endDate: dateStr,
    });
  };

  const clearFilter = () => {
    handlePresetChange('all');
  };

  return (
    <div className={`flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 p-1.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl ${className}`}>
      {/* Quick Presets Pills */}
      <div className="flex items-center gap-1 overflow-x-auto p-0.5 scrollbar-none">
        <button
          type="button"
          onClick={() => handlePresetChange('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            value.type === 'all'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          All Time
        </button>

        <button
          type="button"
          onClick={() => handlePresetChange('today')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            value.type === 'today'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          Today
        </button>

        <button
          type="button"
          onClick={() => handlePresetChange('yesterday')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            value.type === 'yesterday'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          Yesterday
        </button>
      </div>

      <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700 mx-0.5" />

      {/* Specific Date Picker */}
      <div className="flex-1 min-w-[170px] max-w-xs">
        <CustomDatePicker
          value={value.type === 'specific' ? value.specificDate : ''}
          onChange={handleSpecificDateChange}
          placeholder="Select specific date..."
          presetType="past"
          allowClear={true}
        />
      </div>

      <div className="hidden lg:block w-px h-6 bg-slate-200 dark:bg-slate-700 mx-0.5" />

      {/* Custom Date Range Controls */}
      <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
        <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider hidden xl:inline">Range:</span>
        <div className="w-32 sm:w-36">
          <CustomDatePicker
            value={value.type === 'range' ? value.startDate : ''}
            onChange={handleRangeStartDateChange}
            placeholder="From Date..."
            presetType="past"
            allowClear={true}
          />
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
        <div className="w-32 sm:w-36">
          <CustomDatePicker
            value={value.type === 'range' ? value.endDate : ''}
            onChange={handleRangeEndDateChange}
            placeholder="To Date..."
            presetType="past"
            allowClear={true}
          />
        </div>
      </div>

      {/* Active Filter Clear Indicator */}
      {value.type !== 'all' && (
        <button
          type="button"
          onClick={clearFilter}
          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer shrink-0"
          title="Reset date filter"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

/**
 * Universal helper function to filter any array of objects by DateFilterValue
 */
export function filterArrayByDate<T>(
  items: T[],
  getDateString: (item: T) => string, // returns YYYY-MM-DD or ISO string
  filter: DateFilterValue
): T[] {
  if (filter.type === 'all') return items;

  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getYesterdayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  return items.filter((item) => {
    const rawDate = getDateString(item);
    if (!rawDate) return false;

    // Extract YYYY-MM-DD part if full ISO timestamp
    const itemDate = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;

    if (filter.type === 'today') {
      return itemDate === getTodayStr();
    }

    if (filter.type === 'yesterday') {
      return itemDate === getYesterdayStr();
    }

    if (filter.type === 'specific') {
      if (!filter.specificDate) return true;
      return itemDate === filter.specificDate;
    }

    if (filter.type === 'range') {
      if (!filter.startDate && !filter.endDate) return true;
      if (filter.startDate && filter.endDate) {
        return itemDate >= filter.startDate && itemDate <= filter.endDate;
      }
      if (filter.startDate) {
        return itemDate >= filter.startDate;
      }
      if (filter.endDate) {
        return itemDate <= filter.endDate;
      }
    }

    return true;
  });
}
