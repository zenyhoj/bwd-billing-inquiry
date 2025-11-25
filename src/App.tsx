import React, { useState, useEffect, useMemo } from 'react';
import { Logo } from './components/Logo';
import { SearchBar } from './components/SearchBar';
import { ResultTable } from './components/ResultTable';
import { AdminPanel } from './components/AdminPanel';
import { LoginModal } from './components/LoginModal';
import { WaterBill } from './types';
import { INITIAL_MOCK_DATA, APP_NAME } from './constants';
import { saveAllBills, getAllBills } from './utils/db';
import { parseExcelFile } from './utils/excelParser';
import { Upload, Lock, LogOut, Database, AlertCircle, Loader2 } from 'lucide-react';

export default function App() {
  // State
  const [data, setData] = useState<WaterBill[]>([]);
  const [loading, setLoading] = useState(true); // Initial loading state
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [dataSource, setDataSource] = useState<'local' | 'live' | 'mock'>('mock');
  
  // Admin & Auth State
  const [showAdmin, setShowAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [filteredResults, setFilteredResults] = useState<WaterBill[]>([]);

  // Initialize data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let loaded = false;

        // 1. Deployment Mode: Try fetching static database file from public folder
        // Add timestamp to prevent caching
        try {
          const response = await fetch(`/database.xlsx?t=${Date.now()}`);
          
          // Check content type to ensure we didn't get an HTML 404 page
          const contentType = response.headers.get('content-type');
          
          if (response.ok && contentType && !contentType.includes('text/html')) {
            const blob = await response.blob();
            // Create a File object from the blob to reuse the existing parser
            const file = new File([blob], "database.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const staticData = await parseExcelFile(file);
            
            if (staticData.length > 0) {
              // If we found a static file, use it as the source of truth
              // We do NOT save to IndexedDB here to avoid conflicts. The static file is the source.
              setData(staticData);
              setDataSource('live');
              loaded = true;
            }
          }
        } catch (fetchErr) {
          // If fetch fails (e.g. file doesn't exist yet), silently ignore and fall back
          console.debug("No static database.xlsx found or failed to parse:", fetchErr);
        }

        if (!loaded) {
          // 2. Fallback to Local IndexedDB (Previous admin uploads)
          const storedBills = await getAllBills();
          if (storedBills.length > 0) {
            setData(storedBills);
            setDataSource('local');
            loaded = true;
          }
        }

        if (!loaded) {
           // 3. Fallback to Mock Data (First time load, no file)
           setData(INITIAL_MOCK_DATA);
           setDataSource('mock');
        }

      } catch (error) {
        console.error("Failed to load data:", error);
        setData(INITIAL_MOCK_DATA);
        setDataSource('mock');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Handler for Admin File Upload
  const handleDataLoaded = async (newData: WaterBill[]) => {
    try {
      // Save to IndexedDB
      await saveAllBills(newData);
      // Update UI State
      setData(newData);
      setDataSource('local');
      // Reset search
      setQuery('');
      setHasSearched(false);
    } catch (error) {
      console.error("Failed to save data:", error);
      alert("Failed to save data to database. Please try again.");
    }
  };

  // Logic to determine matches for both Search and Suggestions
  const getMatches = (searchQuery: string) => {
    if (!searchQuery.trim()) return [];
    const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/);

    return data.filter(item => {
      const name = (item.accountName || '').toLowerCase();
      const number = (item.accountNumber || '').toLowerCase();
      // Check if EVERY search term is present in either the name or the number
      return searchTerms.every(term => name.includes(term) || number.includes(term));
    });
  };

  // Handler for Search
  const handleSearch = () => {
    const results = getMatches(query);
    setFilteredResults(results);
    setHasSearched(true);
  };

  // Handler for Selecting a Suggestion
  const handleSelectSuggestion = (bill: WaterBill) => {
    setQuery(bill.accountName);
    // When selecting a specific suggestion, we show just that one result
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

  // Derived state for suggestions
  // Show suggestions only if user hasn't executed a search yet and query is long enough
  const suggestions = useMemo(() => {
    if (hasSearched || query.length < 2) return [];
    return getMatches(query).slice(0, 5); // Limit to top 5
  }, [query, data, hasSearched]);

  // Derived state for layout transition
  const isCentered = !hasSearched;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-500" />
        <p className="font-medium text-slate-600">Loading Database...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/50 flex flex-col relative font-sans text-gray-900">
      
      {/* Top Navigation */}
      <nav className="flex justify-between items-center p-6 w-full z-10">
        <div className={`flex items-center space-x-3 transition-opacity duration-300 ${!isCentered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
           <Logo className="h-8 w-8" />
           <span className="font-bold text-gray-800 hidden sm:block tracking-tight">{APP_NAME}</span>
        </div>
        
        <div className="flex items-center space-x-4">
           {/* Admin Trigger - Only visible when logged in */}
           {isAdmin && (
             <>
               <button 
                 onClick={() => setShowAdmin(true)}
                 className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-all rounded-full shadow-sm text-sm font-medium hover:shadow-md"
               >
                 <Upload className="h-4 w-4" />
                 <span>Upload Data</span>
               </button>
               
               <button 
                 onClick={() => setIsAdmin(false)}
                 className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                 title="Sign Out"
               >
                 <LogOut className="h-5 w-5" />
               </button>
             </>
           )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className={`flex-grow flex flex-col items-center px-4 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isCentered ? 'justify-center pb-32' : 'pt-12 justify-start'}`}>
        
        {/* Brand Hero (Only visible when centered or shrinks when searched) */}
        <div className={`flex flex-col items-center mb-8 transition-all duration-500 ${isCentered ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 -translate-y-10 hidden'}`}>
          <div className="mb-6 p-4 bg-white rounded-3xl shadow-xl shadow-blue-100/50">
             <Logo className="h-20 w-20" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight text-center mb-2">
            {APP_NAME}
          </h1>
          <p className="text-gray-500 text-lg">Billing Inquiry System</p>
        </div>

        {/* Search Section */}
        <div className={`w-full max-w-2xl transition-all duration-500 z-20 ${isCentered ? 'translate-y-0' : '-translate-y-4'}`}>
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
          <div className="w-full max-w-5xl px-0 md:px-4 pb-12 z-10">
            <ResultTable results={filteredResults} />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-gray-400 text-xs sm:text-sm relative mt-auto flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
        <span>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</span>
        
        <div className="flex items-center gap-2">
          {/* Data Source Indicator */}
          <div className={`flex items-center px-2 py-0.5 rounded-full border text-[10px] uppercase font-bold tracking-wider ${
            dataSource === 'live' ? 'bg-green-50 text-green-700 border-green-200' : 
            dataSource === 'local' ? 'bg-blue-50 text-blue-700 border-blue-200' :
            'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {dataSource === 'live' && <Database className="w-3 h-3 mr-1" />}
            {dataSource === 'live' ? 'Live Database' : dataSource === 'local' ? 'Local Cache' : 'Demo Data'}
          </div>

          {/* Discreet Admin Login Trigger */}
          {!isAdmin && (
            <button 
              onClick={() => setShowLogin(true)}
              className="p-1.5 text-gray-300 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
              title="Admin Login"
            >
              <Lock className="h-3 w-3" />
            </button>
          )}
        </div>
      </footer>

      {/* Admin Modals */}
      {showLogin && (
        <LoginModal 
          onClose={() => setShowLogin(false)}
          onLogin={() => { setIsAdmin(true); setShowAdmin(true); }}
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