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
    // Updated headers based on the user's specific list
    const headers = ['ID', 'Account Number', 'Account Name', 'Address', 'Amount', 'Due Date', 'Amount After Due Date'];
    const sample = ['1', '100-001-000', 'Juan Dela Cruz', 'Poblacion, Buenavista', 520.50, '2023-11-15', 572.55];
    
    const ws = XLSX.utils.aoa_to_sheet([headers, sample]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Template");
    XLSX.writeFile(wb, "bwd_database_template.xlsx");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden relative flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FileSpreadsheet className="mr-2 text-blue-600" />
            Database Management
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
             <h3 className="text-sm font-semibold text-blue-900 mb-2">Instructions</h3>
             <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Upload the monthly billing data to update the search results.</li>
                <li>The file must be an Excel file (.xlsx or .xls).</li>
                <li>Required Columns: <strong>ID, Account Number, Account Name, Address, Amount, Due Date, Amount After Due Date</strong>.</li>
             </ul>
             <button 
               onClick={handleDownloadTemplate}
               className="mt-3 flex items-center text-xs font-medium text-blue-700 hover:text-blue-800 hover:underline"
             >
               <FileDown className="w-4 h-4 mr-1" />
               Download Sample Template
             </button>
          </div>

          <div 
            className={`border-3 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer ${
              isDragOver 
                ? 'border-blue-500 bg-blue-50/50 scale-[0.99]' 
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
              <div className={`p-4 rounded-full shadow-sm ${loading ? 'bg-gray-100' : 'bg-white text-blue-600'}`}>
                {loading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                ) : (
                  <Upload className="h-8 w-8" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-lg font-medium text-gray-700">
                  {loading ? 'Processing Data...' : 'Drop file here'}
                </p>
                {!loading && (
                   <p className="text-sm text-gray-500">
                     or <span className="text-blue-600 font-medium hover:underline">browse computer</span>
                   </p>
                )}
              </div>
            </div>
          </div>

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
                <p className="font-semibold">Upload Successful</p>
                <p>{successMsg}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center shrink-0">
          <div className="flex items-center text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
            Database Status: <strong>{currentDataCount} records</strong>
          </div>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};