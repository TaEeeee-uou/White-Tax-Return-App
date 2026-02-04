import Dexie, { Table } from 'dexie';
import { UserProfile } from './UserContext';
import { IncomeEntry, ExpenseEntry, DepreciationEntry } from './types';

// Extend ExpenseEntry to include receipt image blob
export interface ExpenseEntryWithImage extends ExpenseEntry {
    receiptImage?: Blob;
}

export class WhiteReturnDatabase extends Dexie {
    profile!: Table<UserProfile, number>; // Single record, ID always 1
    incomes!: Table<IncomeEntry, string>;
    expenses!: Table<ExpenseEntryWithImage, string>;
    depreciations!: Table<DepreciationEntry, string>;

    constructor() {
        super('WhiteReturnDB');
        this.version(1).stores({
            profile: '++id', // We'll just use ID 1 for the main profile
            incomes: 'id, date, type',
            expenses: 'id, date, category',
            depreciations: 'id, acquisitionDate'
        });
    }
}

export const db = new WhiteReturnDatabase();
