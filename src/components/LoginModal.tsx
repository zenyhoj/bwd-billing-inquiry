import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Mail, Lock, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { AppUser } from '../types';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (user: AppUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManualAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Query the custom 'allowed_users' table
      const { data, error: dbError } = await supabase
        .from('allowed_users')
        .select('*')
        .eq('email', email)
        .single();

      if (dbError || !data) {
        throw new Error("User not found");
      }

      // Check password (plain text comparison as requested)
      // Note: In production, passwords should be hashed (e.g., bcrypt)
      if (data.password !== password) {
        throw new Error("Incorrect password");
      }

      // Success
      const user: AppUser = {
        email: data.email,
        username: data.username
      };
      
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError("Invalid login credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm relative rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors z-10"
        >
          <X size={20} />
        </button>
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Administrator Access
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Enter your credentials to manage the database.
            </p>
          </div>
          
          <form onSubmit={handleManualAuth} className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-lg outline-none transition-all text-sm"
                placeholder="Email address"
              />
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-lg outline-none transition-all text-sm"
                placeholder="Password"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-start">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-gray-800 transition-all flex items-center justify-center group disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};