import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User } from 'lucide-react';
import { WaterBill } from '../types';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onSearch: () => void;
  onClear: () => void;
  suggestions: WaterBill[];
  onSelectSuggestion: (bill: WaterBill) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onChange, 
  onSearch, 
  onClear, 
  suggestions,
  onSelectSuggestion
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      onSearch();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setShowSuggestions(true);
  };

  const handleSelect = (bill: WaterBill) => {
    onSelectSuggestion(bill);
    setShowSuggestions(false);
  };

  const hasSuggestions = suggestions.length > 0 && showSuggestions;

  return (
    <div ref={wrapperRef} className="w-full max-w-2xl mx-auto relative group">
      <div className="relative z-30">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-gray-900 transition-colors duration-300" />
        </div>
        <input
          type="text"
          className={`block w-full pl-12 pr-12 py-4 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-0 transition-all duration-300 text-lg font-light
            ${hasSuggestions ? 'rounded-t-2xl border-b-gray-100' : 'rounded-full hover:border-gray-300'}`}
          placeholder="Enter Account Name or Account No."
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          autoComplete="off"
          autoCorrect="off"
        />
        {value && (
          <button
            onClick={onClear}
            className="absolute inset-y-0 right-4 flex items-center text-gray-300 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {hasSuggestions && (
        <div className="absolute top-full left-0 right-0 bg-white border border-t-0 border-gray-200 rounded-b-2xl shadow-lg shadow-gray-100/50 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <ul>
            {suggestions.map((item) => (
              <li 
                key={item.id}
                onClick={() => handleSelect(item)}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between group/item border-b border-gray-50 last:border-0 transition-colors"
              >
                <div className="flex items-center">
                  <div className="mr-4 text-gray-300 group-hover/item:text-gray-900 transition-colors">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-normal text-gray-900">{item.accountName}</span>
                    <span className="text-xs text-gray-400 font-mono tracking-wide">#{item.accountNumber}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="px-4 py-2 bg-gray-50 text-[10px] uppercase tracking-wider text-center text-gray-400 border-t border-gray-100">
             Press Enter to search
          </div>
        </div>
      )}
    </div>
  );
};