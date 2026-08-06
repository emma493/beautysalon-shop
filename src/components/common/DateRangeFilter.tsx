import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronDown, Filter, X } from 'lucide-react';
import { CustomDatePicker } from './CustomDatePicker';

export type DateFilterPreset = 'all' | 'yesterday' | 'today' | 'specific' | 'range';

export interface DateFilterValue {
  preset: DateFilterPreset;
  specificDate: string; // YYYY-MM-DD
  startDate: string;    // YYYY-MM-DD
  endDate: string;      // YYYY-MM-DD
}

interface DateRangeFilterProps {
  value: DateFilterValue;
  onChange: (value: DateFilterValue) => void;
  className?: string;
  compact?: boolean;
}

export const matchesDateFilter = (
  dateInput: string | Date | undefined,
  filter: DateFilterValue
): boolean => {
  if (!filter || filter.preset === 'all') return true;
  if (!dateInput) return true;

  let targetDateStr = '';
  if (typeof dateInput === 'string') {
    if (dateInput.includes('T')) {
      targetDateStr = dateInput.split('T')[0];
    } else if (dateInput.match(/^\d{2}-\d{2}-\d{4}$/)) {
      // DD-MM-YYYY format
      const parts = dateInput.split('-');
      targetDateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
    } else if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
      targetDateStr = dateInput;
    } else {
      const d = new Date(dateInput);
      if (!isNaN(d.getTime())) {
        targetDateStr = d.toISOString().split('T')[0];
      }
    }
  } else if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    targetDateStr = dateInput.toISOString().split('T')[0];
  }

  if (!targetDateStr) return true;

  const todayStr = new Date().toISOString().split('T')[0];

  if (filter.preset === 'today') {
    return targetDateStr === todayStr;
  }

  if (filter.preset === 'yesterday') {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yesterdayStr = y.toISOString().split('T')[0];
    return targetDateStr === yesterdayStr;
  }

  if (filter.preset === 'specific') {
    if (!filter.specificDate) return true;
    return targetDateStr === filter.specificDate;
  }

  if (filter.preset === 'range') {
    if (filter.startDate && targetDateStr < filter.startDate) return false;
    if (filter.endDate && targetDateStr > filter.endDate) return false;
    return true;
  }

  return true;
};

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  value,
  onChange,
  className = '',
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getLabel = () => {
    switch (value.preset) {
      case 'all':
        return 'All Time';
      case 'today':
        return 'Today';
      case 'yesterday':
        return 'Yesterday';
      case 'specific':
        return value.specificDate ? `Date: ${value.specificDate}` : 'Specific Date';
      case 'range':
        if (value.startDate && value.endDate) {
          return `${value.startDate} to ${value.endDate}`;
        } else if (value.startDate) {
          return `From ${value.startDate}`;
        } else if (value.endDate) {
          return `Until ${value.endDate}`;
        }
        return 'Date Range';
      default:
        return 'Filter Date';
    }
  };

  const handlePresetSelect = (preset: DateFilterPreset) => {
    const updated: DateFilterValue = { ...value, preset };
    if (preset === 'specific' && !updated.specificDate) {
      updated.specificDate = new Date().toISOString().split('T')[0];
    }
    if (preset === 'range') {
      if (!updated.startDate) {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        updated.startDate = d.toISOString().split('T')[0];
      }
      if (!updated.endDate) {
        updated.endDate = new Date().toISOString().split('T')[0];
      }
    }
    onChange(updated);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-all shadow-2xs select-none ${
          value.preset !== 'all'
            ? 'border-brand-600 ring-2 ring-brand-600/20 text-brand-700 dark:text-brand-300 bg-brand-50/40 dark:bg-brand-950/30'
            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon className={`w-3.5 h-3.5 shrink-0 ${value.preset !== 'all' ? 'text-brand-600' : 'text-slate-400'}`} />
          <span className="truncate">{getLabel()}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 p-4 w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-brand-600" />
              <span>Select Date Filter</span>
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handlePresetSelect('all')}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition text-center ${
                value.preset === 'all'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All Time
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('today')}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition text-center ${
                value.preset === 'today'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('yesterday')}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition text-center ${
                value.preset === 'yesterday'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Yesterday
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => handlePresetSelect('specific')}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition text-center ${
                value.preset === 'specific'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Specific Date
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('range')}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition text-center ${
                value.preset === 'range'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Date Range
            </button>
          </div>

          {/* Specific Date Sub-section */}
          {value.preset === 'specific' && (
            <div className="pt-2 space-y-1.5 border-t border-slate-100 dark:border-slate-800">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Choose Specific Date (Days, Months, Years)
              </label>
              <CustomDatePicker
                value={value.specificDate}
                onChange={(d) => onChange({ ...value, preset: 'specific', specificDate: d })}
                placeholder="Pick date..."
                presetType="past"
                allowClear={false}
              />
            </div>
          )}

          {/* Date Range Sub-section */}
          {value.preset === 'range' && (
            <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                Select Date Range (From - To)
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">From Date:</span>
                  <CustomDatePicker
                    value={value.startDate}
                    onChange={(d) => onChange({ ...value, preset: 'range', startDate: d })}
                    placeholder="Start date..."
                    presetType="past"
                    allowClear={false}
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">To Date:</span>
                  <CustomDatePicker
                    value={value.endDate}
                    onChange={(d) => onChange({ ...value, preset: 'range', endDate: d })}
                    placeholder="End date..."
                    presetType="past"
                    allowClear={false}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                onChange({ preset: 'all', specificDate: '', startDate: '', endDate: '' });
                setIsOpen(false);
              }}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Reset Filter
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-brand-700"
            >
              Apply Filter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
