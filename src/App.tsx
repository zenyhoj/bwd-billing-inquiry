import React, { useState, useEffect, useMemo } from 'react';
import { Logo } from './components/Logo';
import { SearchBar } from './components/SearchBar';
import { ResultTable } from './components/ResultTable';
import { AdminPanel } from './components/AdminPanel';
import { LoginModal } from './components/LoginModal';
import { WaterBill } from './types';
import { INITIAL_MOCK_DATA, APP_NAME } from './constants';
import { saveAllBills, getAllBills } from './utils/db';
import { Upload, Lock, LogOut, Loader2, Cloud, Database } from 'lucide-react';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

export default function App() {
  // State
  const [data, setData] = useState<WaterBill[]>([]);
  const [loading, setLoading] = useState(true); 
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [dataSource, setDataSource] = useState<'supabase' | 'mock'>('mock');
  
  // Admin & Auth State
  const [session, setSession] = useState<Session | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  
  const [filteredResults, setFilteredResults] = useState<WaterBill[]>([]);

  // Initialize data and auth on mount
  useEffect(() => {
    let isMounted = true;

    // 1. Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // 3. Load Bill Data
    const loadData = async () => {
      try {
        const supabaseData = await getAllBills();
        
        if (isMounted) {
          if (supabaseData.length > 0) {
            setData(supabaseData);
            setDataSource('supabase');
          } else {
            console.log("Supabase table is empty, falling back to mock data.");
            setData(INITIAL_MOCK_DATA);
            setDataSource('mock');
          }
        }
      } catch (error) {
        console.error("Critical error loading data from Supabase:", error);
        if (isMounted) {
          setData(INITIAL_MOCK_DATA);
          setDataSource('mock');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadData();
    return () => { 
      isMounted = false; 
      subscription.unsubscribe();
    };
  }, []);

  const handleDataLoaded = async (newData: WaterBill[]) => {
    try {
      // Keep loading state true while processing
      // We don't set loading state on UI here because AdminPanel handles its own loading UI,
      // but we update the main data immediately.
      
      // Perform the save
      await saveAllBills(newData);
      
      // Update local state to match DB
      setData(newData);
      setDataSource('supabase');
      setQuery('');
      setHasSearched(false);
      
      // AdminPanel displays the success message, so we don't need a global alert here necessarily,
      // but strictly following previous behavior or enhancing it:
      // We let the AdminPanel handle the success visual feedback.
    } catch (error) {
      console.error("Failed to save data:", error);
      alert("Failed to save data to Supabase. Please check your internet connection.");
      throw error; // Propagate error to AdminPanel
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowAdmin(false);
  };

  const getMatches = (searchQuery: string) => {
    if (!searchQuery.trim()) return [];
    const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/);

    return data.filter(item => {
      const name = (item.accountName || '').toLowerCase();
      const number = (item.accountNumber || '').toLowerCase();
      return searchTerms.every(term => name.includes(term) || number.includes(term));
    });
  };

  const handleSearch = () => {
    const results = getMatches(query);
    setFilteredResults(results);
    setHasSearched(true);
  };

  const handleSelectSuggestion = (bill: WaterBill) => {
    setQuery(bill.accountName);
    setFilteredResults([bill]);
    setHasSearched(true);
  };

  const handleClear = () => {
    setQuery('');
    setHasSearched(false);
    setFilteredResults([]);
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (hasSearched) {
      setHasSearched(false);
    }
  };

  const suggestions = useMemo(() => {
    if (hasSearched || query.length < 2) return [];
    return getMatches(query).slice(0, 5);
  }, [query, data, hasSearched]);

  const isCentered = !hasSearched;
  const isAdmin = !!session; // User is admin if logged in

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-gray-600" />
        <p className="text-sm font-medium text-gray-500 tracking-wide uppercase">Connecting to Database</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col relative font-sans text-gray-900 selection:bg-gray-100">
      
      {/* Top Navigation */}
      <nav className="flex justify-between items-center p-6 w-full z-10">
        <div className={`flex items-center space-x-3 transition-opacity duration-300 ${!isCentered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
           <Logo className="h-6 w-6" />
           <span className="font-semibold text-gray-900 hidden sm:block tracking-tight">{APP_NAME}</span>
        </div>
        
        <div className="flex items-center space-x-4">
           {isAdmin && (
             <>
               <span className="text-xs text-gray-500 hidden sm:inline-block pr-2">
                 {session?.user?.email}
               </span>
               <button 
                 onClick={() => setShowAdmin(true)}
                 className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-all rounded-full text-xs font-medium tracking-wide shadow-sm"
               >
                 <Database className="h-3 w-3" />
                 <span>Manage Database</span>
               </button>
               
               <button 
                 onClick={handleLogout}
                 className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                 title="Sign Out"
               >
                 <LogOut className="h-4 w-4" />
               </button>
             </>
           )}
           {!isAdmin && (
             <button
              onClick={() => setShowLogin(true)}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
             >
               Sign In
             </button>
           )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className={`flex-grow flex flex-col items-center px-4 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${isCentered ? 'justify-center pb-32' : 'pt-8 justify-start'}`}>
        
        {/* Brand Hero */}
        <div className={`flex flex-col items-center mb-10 transition-all duration-500 ${isCentered ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 -translate-y-8 hidden'}`}>
          <div className="mb-8">
             <Logo className="h-16 w-16" />
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight text-center mb-3">
            {APP_NAME}
          </h1>
          <p className="text-gray-500 text-base font-light">Billing Inquiry System</p>
        </div>

        {/* Search Section */}
        <div className={`w-full max-w-2xl transition-all duration-500 z-20 ${isCentered ? 'translate-y-0' : '-translate-y-2'}`}>
          <SearchBar 
            value={query}
            onChange={handleQueryChange}
            onSearch={handleSearch}
            onClear={handleClear}
            suggestions={suggestions}
            onSelectSuggestion={handleSelectSuggestion}
          />
        </div>

        {/* Results Section */}
        {hasSearched && (
          <div className="w-full max-w-4xl px-0 md:px-4 pb-12 z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ResultTable results={filteredResults} />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-gray-400 text-xs relative mt-auto flex flex-col sm:flex-row justify-center items-center gap-4">
        <span className="font-light tracking-wide">&copy; {new Date().getFullYear()} {APP_NAME}</span>
        
        <div className="flex items-center gap-3">
          <div className={`flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-semibold tracking-wider ${
            dataSource === 'supabase' ? 'text-green-600 bg-green-50' : 
            'text-amber-600 bg-amber-50'
          }`}>
            {dataSource === 'supabase' && <Cloud className="w-3 h-3 mr-1" />}
            {dataSource === 'supabase' ? 'Supabase Connected' : 'Demo Mode'}
          </div>

          {!isAdmin && (
            <button 
              onClick={() => setShowLogin(true)}
              className="p-1 text-gray-300 hover:text-gray-600 transition-colors"
              title="Admin Login"
            >
              <Lock className="h-3 w-3" />
            </button>
          )}
        </div>
      </footer>

      {showLogin && (
        <LoginModal 
          onClose={() => setShowLogin(false)}
          onLoginSuccess={() => setShowAdmin(true)}
        />
      )}

      {showAdmin && isAdmin && (
        <AdminPanel 
          onClose={() => setShowAdmin(false)} 
          onDataLoaded={handleDataLoaded}
          currentDataCount={data.length}
        />
      )}
    </div>
  );
}