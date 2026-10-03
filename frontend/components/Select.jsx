import React from 'react';

export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`w-full px-3 py-2 text-sm border rounded-md shadow-sm transition-colors bg-white text-slate-900
          focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500
          disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300'}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option, idx) => {
          const val = typeof option === 'object' ? option.value : option;
          const lbl = typeof option === 'object' ? option.label : option;
          return (
            <option key={idx} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}

