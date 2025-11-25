import { WaterBill } from './types';

// Used to populate the app if no Excel file has been uploaded yet.
export const INITIAL_MOCK_DATA: WaterBill[] = [
  {
    id: '1',
    accountNumber: '100-001-234',
    accountName: 'Juan Dela Cruz',
    address: 'Purok 1, Poblacion',
    amount: 520.50,
    dueDate: '2023-11-15',
    amountAfterDueDate: 572.55,
  },
  {
    id: '2',
    accountNumber: '100-002-567',
    accountName: 'Maria Santos',
    address: 'Barangay San Jose',
    amount: 380.00,
    dueDate: '2023-11-15',
    amountAfterDueDate: 418.00,
  },
  {
    id: '3',
    accountNumber: '100-003-890',
    accountName: 'Buenavista Elementary School',
    address: 'Highway Road, Centro',
    amount: 3200.00,
    dueDate: '2023-11-15',
    amountAfterDueDate: 3520.00,
  },
  {
    id: '4',
    accountNumber: '100-004-111',
    accountName: 'Ricardo Dalisay',
    address: 'Sitio Kawayan',
    amount: 250.75,
    dueDate: '2023-11-15',
    amountAfterDueDate: 275.80,
  }
];

export const APP_NAME = "Buenavista Water District";