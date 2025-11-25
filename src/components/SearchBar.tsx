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

  return (
    <div ref={wrapperRef} className="w-full max-w-2xl mx-auto relative group">
      <div className="relative z-30">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input
          type="text"
          className={`block w-full pl-11 pr-12 py-4 bg-white border border-gray-200 shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:shadow-lg transition-all duration-200 text-lg
            ${suggestions.length > 0 && showSuggestions ? 'rounded-t-3xl rounded-b-none border-b-gray-100' : 'rounded-full'}`}
          placeholder="Enter Account Name or Account No."
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
        />
        {value && (
          <button
            onClick={onClear}
            className="absolute inset-y-0 right-14 pr-2 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        <div className="absolute inset-y-0 right-2 flex items-center">
           <button 
             onClick={() => { setShowSuggestions(false); onSearch(); }}
             className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
           >
             <Search className="h-5 w-5" />
           </button>
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-t-0 border-gray-200 rounded-b-3xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <ul>
            {suggestions.map((item) => (
              <li 
                key={item.id}
                onClick={() => handleSelect(item)}
                className="px-5 py-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between group/item border-b border-gray-50 last:border-0 transition-colors"
              >
                <div className="flex items-center">
                  <div className="bg-gray-100 p-2 rounded-full mr-3 group-hover/item:bg-blue-100 transition-colors">
                    <User className="h-4 w-4 text-gray-500 group-hover/item:text-blue-600" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-medium text-gray-900">{item.accountName}</span>
                    <span className="text-xs text-gray-400">#{item.accountNumber}</span>
                  </div>
                </div>
                <div className="text-xs text-blue-600 font-medium opacity-0 group-hover/item:opacity-100 transition-opacity">
                  Select
                </div>
              </li>
            ))}
          </ul>
          <div className="px-4 py-2 bg-gray-50 text-xs text-center text-gray-400 border-t border-gray-100">
             Press Enter to see all matches
          </div>
        </div>
      )}
    </div>
  );
};