import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Minus } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  icon?: React.ReactNode;
  align?: 'left' | 'right';
  size?: 'sm' | 'md';
  onDeleteOption?: (value: string) => void;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  className = '',
  buttonClassName = '',
  dropdownClassName = '',
  icon,
  align = 'left',
  size = 'md',
  onDeleteOption,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const currentIndex = options.findIndex((opt) => opt.value === value);
      setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  }, [isOpen, options, value]);

  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (options.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (isOpen) {
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          e.preventDefault();
          onChange(options[highlightedIndex].value);
          setIsOpen(false);
        }
      } else {
        e.preventDefault();
        setIsOpen(true);
      }
    } else if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    } else if (e.key === 'Tab') {
      if (isOpen) {
        setIsOpen(false);
      }
    } else if (e.key === 'Home') {
      if (isOpen) {
        e.preventDefault();
        setHighlightedIndex(0);
      }
    } else if (e.key === 'End') {
      if (isOpen) {
        e.preventDefault();
        setHighlightedIndex(options.length - 1);
      }
    }
  };

  const sizeClasses =
    size === 'sm'
      ? 'px-2.5 py-1 text-[11px] font-semibold rounded-full'
      : 'px-3.5 py-2 text-xs font-bold rounded-xl';

  const alignClasses = align === 'right' ? 'right-0 left-auto' : 'left-0 right-auto';

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={`relative inline-block text-left ${className}`}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center justify-between gap-2 bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-600 cursor-pointer select-none ${sizeClasses} ${buttonClassName}`}
      >
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          {icon}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-brand-600' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className={`absolute ${alignClasses} mt-1.5 min-w-[200px] w-full max-w-[320px] max-h-56 overflow-y-auto scroll-smooth bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-900/10 dark:shadow-black/50 z-50 p-1.5 space-y-1 animate-in fade-in-80 zoom-in-95 duration-150 ease-out select-none focus:outline-none ${dropdownClassName}`}
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-400 dark:text-slate-500 italic text-center">
              No options available
            </div>
          ) : (
            options.map((option, idx) => {
              const isSelected = option.value === value;
              const isHighlighted = idx === highlightedIndex;

              return (
                <div key={option.value} className="flex items-center gap-1 w-full group/opt">
                  <button
                    ref={(el) => { optionRefs.current[idx] = el; }}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`flex items-center justify-between flex-1 min-w-0 px-3 py-2 rounded-xl text-xs transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-brand-600 text-white font-extrabold shadow-xs'
                        : isHighlighted
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 font-semibold'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="flex items-center gap-2 truncate">
                        {option.icon}
                        <span className="truncate">{option.label}</span>
                      </div>
                      {option.description && (
                        <span
                          className={`text-[10px] truncate mt-0.5 ${
                            isSelected ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {option.description}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1.5" />}
                  </button>

                  {onDeleteOption && option.value !== 'all' && (
                    <button
                      type="button"
                      title={`Delete ${option.label}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onDeleteOption(option.value);
                      }}
                      className="w-7 h-7 flex items-center justify-center bg-red-100/80 hover:bg-red-500 dark:bg-red-950/60 dark:hover:bg-red-600 text-red-600 hover:text-white dark:text-red-400 dark:hover:text-white rounded-lg transition-all cursor-pointer shrink-0"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

