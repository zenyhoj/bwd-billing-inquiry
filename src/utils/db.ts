import { supabase } from '../lib/supabase';
import { WaterBill } from '../types';

// Map DB snake_case to Frontend camelCase
const mapToFrontend = (row: any): WaterBill => ({
  id: row.id,
  accountNumber: row.account_number,
  accountName: row.account_name,
  address: row.address,
  amount: Number(row.amount),
  dueDate: row.due_date,
  amountAfterDueDate: Number(row.amount_after_due_date),
});

// Map Frontend camelCase to DB snake_case
const mapToDb = (bill: WaterBill) => ({
  id: bill.id,
  account_number: bill.accountNumber,
  account_name: bill.accountName,
  address: bill.address,
  amount: bill.amount,
  due_date: bill.dueDate,
  amount_after_due_date: bill.amountAfterDueDate,
});

export const getAllBills = async (): Promise<WaterBill[]> => {
  const { data, error } = await supabase
    .from('water_bills')
    .select('*');

  if (error) {
    console.error('Error fetching data from Supabase:', error);
    throw error;
  }

  return (data || []).map(mapToFrontend);
};

export const saveAllBills = async (bills: WaterBill[]): Promise<void> => {
  // 1. Fetch all IDs first to efficiently delete them
  // This is safer than using a 'not equals' workaround for truncate
  const { data: existingIds, error: fetchError } = await supabase
    .from('water_bills')
    .select('id');
    
  if (fetchError) throw fetchError;

  if (existingIds && existingIds.length > 0) {
     const idsToDelete = existingIds.map(r => r.id);
     
     // Delete in batches if too many, but Supabase handles reasonably large arrays
     const { error: deleteError } = await supabase
       .from('water_bills')
       .delete()
       .in('id', idsToDelete);
       
     if (deleteError) throw deleteError;
  }

  // 2. Insert new records in batches
  const dbData = bills.map(mapToDb);
  const BATCH_SIZE = 100;
  
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