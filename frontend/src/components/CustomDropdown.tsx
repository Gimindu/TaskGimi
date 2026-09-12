'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  placeholder?: string;
  className?: string;
  align?: 'left' | 'right';
  size?: 'xs' | 'sm' | 'md';
  fullWidth?: boolean;
  disabled?: boolean;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  icon,
  placeholder = 'Select...',
  className = '',
  align = 'left',
  size = 'md',
  fullWidth = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sizeButtonClasses = {
    xs: 'h-6 px-2.5 py-0 rounded-full text-[10px] font-extrabold bg-[#27272a] border border-[#3f3f46]',
    sm: 'px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#09090b] border border-[#27272a]',
    md: 'px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#141417] border border-[#242429]',
  };

  const menuWidthClass = fullWidth
    ? 'w-full left-0 right-0'
    : size === 'xs'
    ? 'w-48 sm:w-52'
    : 'min-w-[180px] sm:w-56';

  return (
    <div
      className={`relative inline-flex items-center text-left shrink-0 ${fullWidth ? 'w-full flex' : ''} ${
        isOpen ? 'z-[999]' : 'z-10'
      } ${className}`}
      ref={dropdownRef}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        disabled={disabled}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={`inline-flex items-center justify-between space-x-2 transition-all shadow-sm focus:outline-none shrink-0 ${
          fullWidth ? 'w-full' : ''
        } ${sizeButtonClasses[size]} ${
          disabled
            ? 'opacity-60 cursor-not-allowed text-gray-500 border-gray-800 bg-[#0e0e10]'
            : isOpen
            ? 'border-[#ff9f1c] text-white ring-1 ring-[#ff9f1c]/40 bg-[#1a1a1e]'
            : 'hover:border-[#ff9f1c]/50 text-gray-200 hover:text-white'
        }`}
      >
        <div className="flex items-center space-x-2 truncate">
          {icon && <span className="text-[#ff9f1c] shrink-0">{icon}</span>}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform duration-200 ml-1 ${
            isOpen ? 'rotate-180 text-[#ff9f1c]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className={`absolute top-full mt-1.5 rounded-2xl bg-[#141417] border border-[#27272a] shadow-2xl z-[999] py-1.5 animate-fadeIn backdrop-blur-2xl ${menuWidthClass} ${
            !fullWidth && align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <div className="max-h-60 overflow-y-auto space-y-0.5 px-1 scrollbar-thin">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                    isSelected
                      ? 'bg-[#ff9f1c]/15 text-[#ff9f1c]'
                      : 'text-gray-300 hover:bg-[#1f1f23] hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#ff9f1c] shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
