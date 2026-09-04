import React from 'react';
import { Search, X } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  variant?: 'underline' | 'glass';
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  variant = 'glass',
  error,
  helperText,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block font-mono-tech text-xs tracking-[0.16em] text-white/60 uppercase select-none"
        >
          {label}
        </label>
      )}

      {variant === 'underline' ? (
        <input
          id={inputId}
          className={`w-full bg-transparent border-none border-b border-white/25 focus:border-b-white/90 rounded-none py-2.5 px-0 font-sans-main text-base text-white placeholder:text-white/25 focus:outline-none transition-colors ${
            error ? 'border-b-red-400' : ''
          } ${className}`}
          {...props}
        />
      ) : (
        <input
          id={inputId}
          className={`w-full bg-black/40 backdrop-blur-md border border-white/14 focus:border-white/60 rounded-[3px] py-2.5 px-3.5 font-sans-main text-sm text-white placeholder:text-white/30 focus:outline-none transition-colors ${
            error ? 'border-red-400' : ''
          } ${className}`}
          {...props}
        />
      )}

      {error && (
        <div className="font-mono-tech text-xs text-red-400 tracking-wider">
          [{error}]
        </div>
      )}
      {!error && helperText && (
        <div className="font-mono-tech text-xs text-white/50 tracking-wider">
          {helperText}
        </div>
      )}
    </div>
  );
};

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onClear,
  className = '',
  ...props
}) => {
  return (
    <div className="relative w-full">
      <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={value}
        className={`w-full pl-10 pr-9 py-2.5 bg-black/40 backdrop-blur-md border border-white/15 focus:border-white/50 text-white font-mono-tech text-sm tracking-wider placeholder:text-white/30 rounded-[3px] focus:outline-none transition-colors ${className}`}
        {...props}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-0.5 focus:outline-none"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  id,
  className = '',
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block font-mono-tech text-xs tracking-[0.16em] text-white/60 uppercase select-none"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full bg-black/60 backdrop-blur-md border border-white/15 focus:border-white/60 text-white font-mono-tech text-sm tracking-wider rounded-[3px] py-2.5 px-3.5 focus:outline-none transition-colors cursor-pointer ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-neutral-900 text-white">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
