import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, X, FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';
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
      setSuccessMsg(`Successfully loaded ${data.length} records.`);
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

  const handleDownloadTemplate = () => {
    const headers = ['ID', 'Account Number', 'Account Name', 'Address', 'Amount', 'Due Date', 'Amount After Due Date'];
    const sample = ['1', '100-001-000', 'Juan Dela Cruz', 'Poblacion, Buenavista', 520.50, '2023-11-15', 572.55];
    
    const ws = XLSX.utils.aoa_to_sheet([headers, sample]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Template");
    XLSX.writeFile(wb, "bwd_database_template.xlsx");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg overflow-hidden relative flex flex-col max-h-[90vh] border border-gray-100 shadow-2xl rounded-xl">
        <div className="p-6 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            Database Management
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 pt-0 overflow-y-auto">
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
             <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Instructions</h3>
             <div className="text-sm text-gray-600 space-y-2">
               <p>Update database by dropping an Excel file below.</p>
               <p className="text-xs text-gray-500">Required: ID, Account Number, Account Name, Address, Amount, Due Date, Late Amount</p>
             </div>

             <button 
               onClick={handleDownloadTemplate}
               className="mt-4 flex items-center text-xs font-medium text-gray-900 hover:underline"
             >
               <FileDown className="w-3 h-3 mr-1" />
               Download Template
             </button>
          </div>

          <div 
            className={`border-2 border-dashed rounded-lg p-10 text-center transition-all duration-200 cursor-pointer ${
              isDragOver 
                ? 'border-gray-900 bg-gray-50' 
                : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
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
            
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="text-gray-400">
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                ) : (
                  <Upload className="h-6 w-6" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900">
                  {loading ? 'Processing...' : 'Click or Drop File'}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 text-red-600 text-sm flex items-center justify-center animate-in slide-in-from-bottom-2">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <p>{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="mt-6 text-green-600 text-sm flex items-center justify-center animate-in slide-in-from-bottom-2">
              <CheckCircle className="h-4 w-4 mr-2" />
              <p>{successMsg}</p>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center shrink-0">
          <span className="text-xs text-gray-500 font-mono">
            {currentDataCount} records loaded
          </span>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-black text-white rounded text-xs font-medium uppercase tracking-wide hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};