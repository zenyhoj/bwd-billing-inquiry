import React from 'react';
import { WaterBill } from '../types';
import { AlertCircle, Calendar, MapPin, CreditCard, Info } from 'lucide-react';

interface ResultTableProps {
  results: WaterBill[];
}

export const ResultTable: React.FC<ResultTableProps> = ({ results }) => {
  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No records found</h3>
        <p className="text-gray-500 mt-1">Check the spelling or try a different account number.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="overflow-hidden bg-white shadow-xl shadow-blue-900/5 rounded-2xl border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Search Results</h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{results.length} record(s)</span>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Info</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Due</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">After Due Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((bill) => (
                <tr key={bill.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-xl font-bold text-gray-900">{bill.accountName}</span>
                      <span className="text-sm font-mono text-gray-500 mt-1">#{bill.accountNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="mr-2 h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate max-w-xs">{bill.address}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm font-medium text-gray-700">
                      <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                      {bill.dueDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-2xl font-bold text-gray-900">₱{bill.amount.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-semibold text-red-600">₱{bill.amountAfterDueDate.toFixed(2)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100">
           {results.map((bill) => (
             <div key={bill.id} className="p-5 hover:bg-gray-50">
               <div className="flex justify-between items-start mb-3">
                 <div>
                   <h4 className="text-lg font-bold text-gray-900">{bill.accountName}</h4>
                   <p className="text-xs text-gray-500 font-mono">#{bill.accountNumber}</p>
                 </div>
                 {bill.dueDate && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                      Due: {bill.dueDate}
                    </span>
                 )}
               </div>

               {bill.address && (
                 <div className="flex items-center text-sm text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                    {bill.address}
                 </div>
               )}
               
               <div className="grid grid-cols-2 gap-3 mt-2">
                 <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                    <p className="text-xs text-green-700 font-medium mb-1 flex items-center"><CreditCard className="w-3 h-3 mr-1"/> Amount Due</p>
                    <p className="text-xl font-bold text-green-900">₱{bill.amount.toFixed(2)}</p>
                 </div>
                 <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                    <p className="text-xs text-red-700 font-medium mb-1">After Due Date</p>
                    <p className="text-xl font-bold text-red-900">₱{bill.amountAfterDueDate.toFixed(2)}</p>
                 </div>
               </div>
             </div>
           ))}
        </div>
      </div>

      <div className="mt-6 mx-1 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-900 shadow-sm animate-in slide-in-from-bottom-2 fade-in duration-500">
        <Info className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm md:text-base leading-relaxed">
           <span className="font-bold">Note:</span> <span className="font-bold">This billing information is for inquiry purposes only.</span> If the account is already paid, please disregard this information.
        </div>
      </div>
    </div>
  );
};