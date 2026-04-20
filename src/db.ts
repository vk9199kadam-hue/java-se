import Dexie, { type Table } from 'dexie';

export interface Expense {
  id?: number;
  amount: number;
  date: Date;
  category: string;
  description: string;
  createdAt: number;
}

export interface Category {
  id?: number;
  name: string;
  keywords: string[]; // array of regex strings
  budget: number;
  color: string;
}

export interface Setting {
  key: string;
  value: any;
}

export class SmartExpensesDB extends Dexie {
  expenses!: Table<Expense>;
  categories!: Table<Category>;
  settings!: Table<Setting>;

  constructor() {
    super('SmartExpensesDB');
    this.version(1).stores({
      expenses: '++id, amount, date, category, description, createdAt',
      categories: '++id, name, budget',
      settings: 'key'
    });
  }
}

export const db = new SmartExpensesDB();

// Initialize default categories if they don't exist
export const initDB = async () => {
  const count = await db.categories.count();
  if (count === 0) {
    await db.categories.bulkAdd([
      { name: 'Food', keywords: ['starbucks', 'coffee', 'mcdonalds', 'restaurant', 'grocery', 'food', 'zomato', 'swiggy'], budget: 15000, color: '#ef4444' },
      { name: 'Transport', keywords: ['uber', 'taxi', 'fuel', 'gas', 'train', 'bus', 'ola', 'metro'], budget: 5000, color: '#3b82f6' },
      { name: 'Utilities', keywords: ['electricity', 'water', 'internet', 'rent', 'garbage', 'jio', 'airtel'], budget: 20000, color: '#10b981' },
      { name: 'Entertainment', keywords: ['netflix', 'cinema', 'game', 'spotify', 'concert', 'movie'], budget: 4000, color: '#f59e0b' },
      { name: 'Shopping', keywords: ['amazon', 'walmart', 'mall', 'clothing', 'shoes', 'flipkart', 'myntra'], budget: 10000, color: '#8b5cf6' },
      { name: 'Health', keywords: ['pharmacy', 'doctor', 'hospital', 'medicine', 'gym', 'apollo'], budget: 5000, color: '#ec4899' },
      { name: 'Other', keywords: [], budget: 5000, color: '#64748b' }
    ]);
  }
  
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.bulkAdd([
      { key: 'totalMonthlyBudget', value: 65000 },
      { key: 'theme', value: 'light' },
      { key: 'carryOver', value: false },
      { key: 'alertThreshold', value: 90 },
      { key: 'currency', value: 'INR' }
    ]);
  }
};
