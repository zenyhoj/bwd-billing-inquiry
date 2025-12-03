import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, X, FileDown, Cloud, Database } from 'lucide-react';
import { parseExcelFile } from '../utils/excelParser';
import { WaterBill } from '../types';

interface AdminPanelProps {
  onClose: () => void;
  onDataLoaded: (data: WaterBill[]) => void;
  currentDataCount: number;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, onDataLoaded, currentDataCount }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setSuccessMsg(null);
    
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      setError("Please upload a valid Excel file (.xlsx, .xls)");
      return;
    }

    setLoading(true);
    try {
      const data = await parseExcelFile(file);
      if (data.length === 0) {
        throw new Error("No valid data rows found.");
      }
      onDataLoaded(data);
      setSuccessMsg(`Successfully saved ${data.length} records to the cloud.`);
    } catch (err: any) {
      setError(err.message || "Failed to parse file.");
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh] border border-gray-100 shadow-2xl rounded-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Database className="mr-2 text-blue-600 h-5 w-5" />
              Admin Dashboard
            </h2>
            <p className="text-xs text-gray-500 mt-1">Manage Buenavista Water District Database</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto">
          
          {/* Status Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center">
               <div className="bg-blue-100 p-3 rounded-full mr-4 text-blue-600">
                 <Cloud className="h-6 w-6" />
               </div>
               <div>
                 <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Storage</p>
                 <p className="text-sm font-medium text-blue-900">Supabase Cloud</p>
               </div>
            </div>
            <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-center">
               <div className="bg-green-100 p-3 rounded-full mr-4 text-green-600">
                 <FileSpreadsheet className="h-6 w-6" />
               </div>
               <div>
                 <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Live Records</p>
                 <p className="text-2xl font-bold text-green-900">{currentDataCount.toLocaleString()}</p>
               </div>
            </div>
          </div>

          <div className="mb-6">
             <h3 className="text-sm font-semibold text-gray-900 mb-3">Update Database</h3>
             <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-4 flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Warning: Overwrite Action</p>
                  <p className="opacity-90">Uploading a new file will <strong>replace all existing records</strong> in the database. Ensure your Excel file contains the complete list of current bills.</p>
                </div>
             </div>
          </div>

          {/* Upload Zone */}
          <div 
            className={`border-3 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer group ${
              isDragOver 
                ? 'border-blue-500 bg-blue-50/50' 
                : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".xlsx, .xls"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className={`p-4 rounded-full transition-colors ${loading ? 'bg-gray-100' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'}`}>
                {loading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                ) : (
                  <Upload className="h-8 w-8" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-lg font-medium text-gray-900">
                  {loading ? 'Uploading & Syncing...' : 'Click to Upload Excel'}
                </p>
                {!loading && (
                   <p className="text-sm text-gray-400">
                     or drag and drop file here
                   </p>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm flex items-start animate-in slide-in-from-bottom-2">
              <AlertTriangle className="h-5 w-5 mr-3 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Upload Failed</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="mt-6 p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl text-sm flex items-start animate-in slide-in-from-bottom-2">
              <CheckCircle className="h-5 w-5 mr-3 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Sync Complete</p>
                <p>{successMsg}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};