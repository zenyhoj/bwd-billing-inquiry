import React, { useState } from 'react';
import { Lock, ArrowRight, AlertCircle, X } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onLogin: () => void;
}

// Simple hardcoded password for demonstration. 
// In a real app, this should be handled securely or via a backend.
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-50 p-3 rounded-full">
              <Lock className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Admin Access</h2>
          <p className="text-center text-gray-500 text-sm mb-6">Enter your security PIN to manage the database.</p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                autoFocus
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                className={`w-full px-4 py-3 rounded-lg border ${error ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-200'} focus:outline-none focus:ring-4 focus:border-transparent transition-all text-center text-lg tracking-widest`}
                placeholder="••••••"
              />
              {error && (
                <div className="flex items-center justify-center mt-2 text-red-600 text-xs animate-in slide-in-from-top-1">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  <span>Incorrect password</span>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center group"
            >
              <span>Sign In</span>
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
