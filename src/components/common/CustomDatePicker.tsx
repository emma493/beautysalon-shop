import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, X, Clock, Check } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showPresets?: boolean;
  presetType?: 'future' | 'past' | 'all';
  allowClear?: boolean;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date...',
  className = '',
  showPresets = true,
  presetType = 'future',
  allowClear = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMonthMenu, setShowMonthMenu] = useState(false);
  const [showYearMenu, setShowYearMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse YYYY-MM-DD into year, month, day
  const parseDate = (str: string): Date | null => {
    if (!str) return null;
    const parts = str.split('-');
    if (parts.length !== 3) return null;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
    return new Date(y, m, d);
  };

  const selectedDate = parseDate(value);

  // Current view month & year for calendar grid
  const today = new Date();
  const [viewYear, setViewYear] = useState(selectedDate ? selectedDate.getFullYear() : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate ? selectedDate.getMonth() : today.getMonth());

  useEffect(() => {
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [value]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowMonthMenu(false);
        setShowYearMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format date for display
  const formatDisplayDate = (str: string): string => {
    const d = parseDate(str);
    if (!d) return '';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Helper to format Date -> YYYY-MM-DD
  const formatDateString = (year: number, month: number, day: number): string => {
    const y = year.toString().padStart(4, '0');
    const m = (month + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleDaySelect = (day: number) => {
    const dateStr = formatDateString(viewYear, viewMonth, day);
    onChange(dateStr);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Calendar grid calculations
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay(); // 0 = Sun

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  // Generate presets
  const applyPresetDays = (daysFromToday: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysFromToday);
    const dateStr = formatDateString(target.getFullYear(), target.getMonth(), target.getDate());
    onChange(dateStr);
    setIsOpen(false);
  };

  const futurePresets = [
    { label: 'In 7 Days', days: 7 },
    { label: 'In 30 Days', days: 30 },
    { label: 'In 6 Months', days: 180 },
    { label: 'In 1 Year', days: 365 },
  ];

  const pastPresets = [
    { label: 'Today', days: 0 },
    { label: 'Yesterday', days: -1 },
    { label: '7 Days Ago', days: -7 },
    { label: '30 Days Ago', days: -30 },
  ];

  const presets =
    presetType === 'future'
      ? futurePresets
      : presetType === 'past'
      ? pastPresets
      : [...pastPresets.slice(0, 2), ...futurePresets.slice(0, 2)];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Check if a day is today
  const isToday = (day: number) => {
    return (
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day
    );
  };

  // Check if a day is currently selected
  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getFullYear() === viewYear &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getDate() === day
    );
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium flex items-center justify-between cursor-pointer transition-all shadow-2xs select-none ${
          isOpen
            ? 'border-brand-600 ring-2 ring-brand-600/20 bg-white dark:bg-slate-800'
            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-900 dark:text-white'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <CalendarIcon className={`w-4 h-4 shrink-0 ${value ? 'text-brand-600' : 'text-slate-400'}`} />
          <span className={value ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-400'}>
            {value ? formatDisplayDate(value) : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          {value && allowClear && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
              title="Clear date"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Calendar Popover */}
      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header: Month & Year Selector + Arrows */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setShowMonthMenu((prev) => !prev);
                  setShowYearMenu(false);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-extrabold transition cursor-pointer select-none border ${
                  showMonthMenu
                    ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white border-transparent'
                }`}
              >
                <span>{monthNames[viewMonth]}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    showMonthMenu ? 'rotate-180 text-white' : 'text-slate-400'
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowYearMenu((prev) => !prev);
                  setShowMonthMenu(false);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition cursor-pointer select-none border ${
                  showYearMenu
                    ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white border-transparent'
                }`}
              >
                <span>{viewYear}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    showYearMenu ? 'rotate-180 text-white' : 'text-slate-400'
                  }`}
                />
              </button>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* MONTH MENU VIEW */}
          {showMonthMenu ? (
            <div className="py-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Select Month
                </span>
                <button
                  type="button"
                  onClick={() => setShowMonthMenu(false)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  Close
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {monthNames.map((name, idx) => {
                  const isCurrent = idx === viewMonth;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        setViewMonth(idx);
                        setShowMonthMenu(false);
                      }}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                        isCurrent
                          ? 'bg-brand-600 text-white shadow-sm font-extrabold'
                          : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-lime-50 dark:hover:bg-lime-950/40 text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-lime-400 border border-slate-100 dark:border-slate-800'
                      }`}
                    >
                      {name.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : showYearMenu ? (
            /* YEAR MENU VIEW */
            <div className="py-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Select Year
                </span>
                <button
                  type="button"
                  onClick={() => setShowYearMenu(false)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  Close
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
                {Array.from({ length: 30 }, (_, i) => today.getFullYear() - 10 + i).map((y) => {
                  const isCurrent = y === viewYear;
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => {
                        setViewYear(y);
                        setShowYearMenu(false);
                      }}
                      className={`py-2 px-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer text-center ${
                        isCurrent
                          ? 'bg-brand-600 text-white shadow-sm font-extrabold'
                          : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-lime-50 dark:hover:bg-lime-950/40 text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-lime-400 border border-slate-100 dark:border-slate-800'
                      }`}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {/* Quick Presets */}
              {showPresets && (
                <div className="mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    <Clock className="w-3 h-3" />
                    <span>Quick Presets</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {presets.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => applyPresetDays(preset.days)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-lime-50 dark:hover:bg-lime-950/40 hover:text-brand-600 dark:hover:text-lime-400 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                    {allowClear && (
                      <button
                        type="button"
                        onClick={() => {
                          onChange('');
                          setIsOpen(false);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-[11px] font-bold transition cursor-pointer"
                      >
                        No Date
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {weekDays.map((day) => (
                  <div key={day} className="text-[11px] font-extrabold text-slate-400 py-1 select-none">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Blank cells before first day of month */}
                {Array.from({ length: firstDay }, (_, i) => (
                  <div key={`empty-${i}`} className="h-8" />
                ))}

                {/* Actual day cells */}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const selected = isSelected(day);
                  const todayFlag = isToday(day);

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDaySelect(day)}
                      className={`h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center relative cursor-pointer ${
                        selected
                          ? 'bg-brand-600 text-white shadow-sm font-extrabold'
                          : todayFlag
                          ? 'border-2 border-brand-600 text-brand-600 font-extrabold hover:bg-lime-50 dark:hover:bg-lime-950/30'
                          : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {day}
                      {selected && (
                        <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Footer: Today Shortcut */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                setViewYear(now.getFullYear());
                setViewMonth(now.getMonth());
                setShowMonthMenu(false);
                setShowYearMenu(false);
              }}
              className="text-xs font-extrabold text-brand-600 hover:underline cursor-pointer"
            >
              Go to Today
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setShowMonthMenu(false);
                setShowYearMenu(false);
              }}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
