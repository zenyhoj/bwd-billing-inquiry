import * as XLSX from 'xlsx';
import { WaterBill } from '../types';

export const parseExcelFile = (file: File): Promise<WaterBill[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error("No data read from file"));
          return;
        }

        // Use array buffer type for more robust handling of network files
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Get data as array of arrays
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (jsonData.length < 2) {
           reject(new Error("File appears to be empty or missing header row"));
           return;
        }

        const headerRow = (jsonData[0] as any[]).map(h => String(h).toLowerCase().trim());
        
        // Helper to find column index by keywords
        const findCol = (keywords: string[]) => {
          return headerRow.findIndex(h => keywords.some(k => h.includes(k)));
        };

        // Smart Mapping based on headers
        let map = {
          id: findCol(['id', 'seq']),
          accNum: findCol(['account number', 'acct no', 'acc no', 'account no']),
          accName: findCol(['account name', 'name', 'customer']),
          address: findCol(['address', 'location', 'brgy', 'barangay']),
          amount: findCol(['amount', 'bill amount', 'current bill', 'total amount']),
          dueDate: findCol(['due date', 'deadline']),
          lateAmount: findCol(['amount after', 'late', 'penalty', 'after due']),
        };

        // Fallback to index-based if headers aren't found (assuming the prompt's specific order)
        // Order: id, accountNumber, accountName, address, amount, dueDate, amountAfterDueDate
        if (map.accNum === -1 || map.accName === -1) {
           map = {
             id: 0,
             accNum: 1,
             accName: 2,
             address: 3,
             amount: 4,
             dueDate: 5,
             lateAmount: 6
           };
        }

        const bills: WaterBill[] = [];
        
        // Helper to clean data
        const cleanStr = (val: any) => String(val || '').trim();
        const cleanNum = (val: any) => {
          if (typeof val === 'string') {
             // Remove commas and currency symbols
             val = val.replace(/[₱,]/g, '').trim();
          }
          const num = Number(val);
          return isNaN(num) ? 0 : num;
        };
        const cleanDate = (val: any) => {
          if (!val) return '';
          // If Excel parses it as a number (Excel serial date)
          if (typeof val === 'number') {
            const date = XLSX.SSF.parse_date_code(val);
            return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
          }
          return String(val).trim();
        };

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (!row || row.length === 0) continue;

          // Map data
          const bill: WaterBill = {
            id: map.id !== -1 && row[map.id] ? cleanStr(row[map.id]) : `row-${i}`,
            accountNumber: map.accNum !== -1 ? cleanStr(row[map.accNum]) : '',
            accountName: map.accName !== -1 ? cleanStr(row[map.accName]) : '',
            address: map.address !== -1 ? cleanStr(row[map.address]) : '',
            amount: map.amount !== -1 ? cleanNum(row[map.amount]) : 0,
            dueDate: map.dueDate !== -1 ? cleanDate(row[map.dueDate]) : '',
            amountAfterDueDate: map.lateAmount !== -1 ? cleanNum(row[map.lateAmount]) : 0,
          };

          // Valid record check
          if (bill.accountNumber || bill.accountName) {
            bills.push(bill);
          }
        }

        resolve(bills);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    // Change to readAsArrayBuffer for better compatibility with XLSX.read type:'array'
    reader.readAsArrayBuffer(file);
  });
};