export interface WaterBill {
  id: string;
  accountNumber: string;
  accountName: string;
  address: string;
  amount: number;
  dueDate: string;
  amountAfterDueDate: number;
}

export interface SearchState {
  query: string;
  hasSearched: boolean;
}

export enum ViewState {
  HOME = 'HOME',
  ADMIN = 'ADMIN',
}