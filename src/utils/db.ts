import { supabase } from '../lib/supabase';
import { WaterBill } from '../types';

// Map DB snake_case to Frontend camelCase
// Added robust fallbacks to handle different column naming conventions
const mapToFrontend = (row: any): WaterBill => {
  // Helper to safely parse numbers
  const safeNumber = (val: any) => {
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  return {
    id: String(row.id || Math.random().toString(36).substr(2, 9)), // Ensure ID always exists
    accountNumber: String(row.account_number || row.account_no || ''),
    accountName: String(row.name || row.account_name || ''), 
    address: String(row.address || ''),
    amount: safeNumber(row.bill_amount ?? row.amount), 
    dueDate: String(row.due_date || ''),
    amountAfterDueDate: safeNumber(row.amount_after_due_date ?? row.amount_after_due),
  };
};

// Map Frontend camelCase to DB snake_case
const mapToDb = (bill: WaterBill) => ({
  id: bill.id,
  account_number: bill.accountNumber,
  name: bill.accountName, 
  address: bill.address,
  bill_amount: bill.amount, 
  due_date: bill.dueDate,
  amount_after_due_date: bill.amountAfterDueDate,
});

export const getAllBills = async (onProgress?: (count: number) => void): Promise<WaterBill[]> => {
  let allBills: any[] = [];
  let from = 0;
  // Limit set to 1000 for efficient fetching of large datasets
  const limit = 1000; 
  let hasMore = true;

  console.log("Starting data fetch...");

  try {
    // Loop to fetch all records in batches
    while (hasMore) {
      const { data, error } = await supabase
        .from('water_bills')
        .select('*')
        .order('id', { ascending: true }) // Critical: Must order to ensure consistent pagination
        .range(from, from + limit - 1);

      if (error) {
        console.warn('Supabase fetch error:', error);
        // If the table doesn't exist or RLS fails, stop fetching and throw
        throw error;
      }

      if (data && data.length > 0) {
        allBills = [...allBills, ...data];
        from += limit;
        
        // Notify progress
        if (onProgress) {
          onProgress(allBills.length);
        }

        // If we got fewer records than the limit, we've reached the end
        if (data.length < limit) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }
  } catch (err) {
    console.error("Error in getAllBills loop:", err);
    throw err;
  }

  console.log(`Fetch complete. Total records: ${allBills.length}`);
  return allBills.map(mapToFrontend);
};

export const saveAllBills = async (bills: WaterBill[]): Promise<void> => {
  // 1. Fetch all IDs first to efficiently delete them
  let allIdsToDelete: string[] = [];
  let from = 0;
  const limit = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('water_bills')
      .select('id')
      .order('id', { ascending: true })
      .range(from, from + limit - 1);
      
    if (error) throw error;

    if (data && data.length > 0) {
      allIdsToDelete = [...allIdsToDelete, ...data.map(r => r.id)];
      from += limit;
      if (data.length < limit) hasMore = false;
    } else {
      hasMore = false;
    }
  }

  if (allIdsToDelete.length > 0) {
     // Delete in batches to avoid URI too long or request limits
     for (let i = 0; i < allIdsToDelete.length; i += limit) {
        const batchIds = allIdsToDelete.slice(i, i + limit);
        const { error: deleteError } = await supabase
         .from('water_bills')
         .delete()
         .in('id', batchIds);
         
        if (deleteError) throw deleteError;
     }
  }

  // 2. Insert new records in batches
  const dbData = bills.map(mapToDb);
  
  // INCREASED BATCH SIZE TO 1000 TO PREVENT TIMEOUTS
  const BATCH_SIZE = 1000;
  
  for (let i = 0; i < dbData.length; i += BATCH_SIZE) {
    const batch = dbData.slice(i, i + BATCH_SIZE);
    const { error: insertError } = await supabase
      .from('water_bills')
      .insert(batch);
      
    if (insertError) {
      console.error('Error inserting batch:', insertError);
      throw insertError;
    }
  }
};