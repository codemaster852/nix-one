
import React from 'react';
import { LanguageOption } from '../types';

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: LanguageOption[];
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ value, onChange, options }) => {
  return (
    <select
      id="language"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelector;
