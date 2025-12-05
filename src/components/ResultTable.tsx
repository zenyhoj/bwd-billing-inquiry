import React from 'react';
import { WaterBill } from '../types';
import { AlertCircle, Info } from 'lucide-react';

interface ResultTableProps {
  results: WaterBill[];
}

export const ResultTable: React.FC<ResultTableProps> = ({ results }) => {
  if (results.length === 0) {
    return (
      <div className="text-center py-16 animate-in fade-in duration-500">
        <div className="inline-flex items-center justify-center mb-4 text-gray-300">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-base font-medium text-gray-900">No records found</h3>
        <p className="text-gray-400 text-sm mt-1">Check the spelling or try a different account number.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Search Results</h3>
        <span className="text-xs font-mono text-gray-400">{results.length} found</span>
      </div>
      
      {/* Desktop Table View */}
      <div className="hidden md:block w-full">
        <table className="min-w-full text-left">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Account</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Address</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Due Date</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Total Due</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Late Payment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {results.map((bill) => (
              <tr key={bill.id} className="group hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-4 align-top">
                  <div className="flex flex-col">
                    <span className="text-lg font-medium text-gray-900">{bill.accountName}</span>
                    <span className="text-xs font-mono text-gray-400 mt-1">#{bill.accountNumber}</span>
                  </div>
                </td>
                <td className="px-4 py-4 align-top text-sm text-gray-600">
                  {bill.address}
                </td>
                <td className="px-4 py-4 align-top text-sm text-gray-600 font-mono">
                  {bill.dueDate}
                </td>
                <td className="px-4 py-4 align-top text-right">
                  <div className="text-xl font-semibold text-gray-900">₱{bill.amount.toFixed(2)}</div>
                </td>
                <td className="px-4 py-4 align-top text-right">
                  <div className="text-sm font-medium text-red-600 mt-1">₱{bill.amountAfterDueDate.toFixed(2)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
         {results.map((bill) => (
           <div key={bill.id} className="p-0 border-b border-gray-100 pb-6 mb-2">
             <div className="flex justify-between items-start mb-2">
               <div>
                 <h4 className="text-lg font-medium text-gray-900">{bill.accountName}</h4>
                 <p className="text-xs text-gray-400 font-mono">#{bill.accountNumber}</p>
               </div>
             </div>

             {bill.address && (
               <div className="text-sm text-gray-500 mb-4">
                  {bill.address}
               </div>
             )}
             
             <div className="flex justify-between items-end">
               <div className="text-right flex-1 pr-4 border-r border-gray-100">
                  <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Due Date</p>
                  <p className="text-sm font-medium text-gray-900">{bill.dueDate}</p>
               </div>
               <div className="text-right flex-1 pr-4 border-r border-gray-100">
                  <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Total</p>
                  <p className="text-lg font-semibold text-gray-900">₱{bill.amount.toFixed(2)}</p>
               </div>
               <div className="text-right flex-1 pl-4">
                  <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Late</p>
                  <p className="text-base font-medium text-red-600">₱{bill.amountAfterDueDate.toFixed(2)}</p>
               </div>
             </div>
           </div>
         ))}
      </div>

      <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg shadow-sm flex gap-3 text-yellow-900 animate-in slide-in-from-bottom-2">
        <Info className="h-5 w-5 shrink-0 mt-0.5 text-yellow-600" />
        <div className="text-sm">
            <p className="font-bold text-yellow-800">Important Note</p>
            <p className="text-yellow-700 leading-relaxed">
              This billing information is for inquiry purposes only. If the account is already paid, please disregard this result.
            </p>
        </div>
      </div>
    </div>
  );
};