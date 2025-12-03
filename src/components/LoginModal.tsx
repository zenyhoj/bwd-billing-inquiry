import React, { useState } from 'react';
import { Lock, ArrowRight, AlertCircle, X } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onLogin: () => void;
}

const ADMIN_PASSWORD = "admin123";

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onLogin();
      onClose();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm relative">
        <button 
          onClick={onClose}
          className="absolute -top-10 right-0 text-gray-400 hover:text-gray-900 transition-colors"
        >
          <X size={24} />
        </button>
        
        <div className="py-8 text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Admin Access</h2>
          <p className="text-gray-400 text-xs mb-8">Enter security PIN</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                autoFocus
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                className={`w-full px-4 py-3 bg-gray-50 border-b-2 ${error ? 'border-red-500 text-red-600' : 'border-gray-200 focus:border-gray-900'} focus:outline-none transition-colors text-center text-xl tracking-[0.5em]`}
                placeholder="••••••"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded font-medium text-sm hover:bg-gray-800 transition-colors flex items-center justify-center group"
            >
              <span>Enter</span>
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};