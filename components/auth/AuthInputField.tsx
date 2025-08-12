import React from 'react';

interface AuthInputFieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
}

export const AuthInputField: React.FC<AuthInputFieldProps> = ({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  disabled = false,
  required = true,
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-200 mb-1">
      {label}
    </label>
    <div className="relative">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
        {icon}
      </span>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full bg-gray-900/50 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
        disabled={disabled}
      />
    </div>
  </div>
);
