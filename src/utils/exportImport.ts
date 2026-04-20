import { db, Expense, Category } from '../db';
import { validateBackupData } from './validators';
import { format } from 'date-fns';

export const exportToJSON = async () => {
  const expenses = await db.expenses.toArray();
  const categories = await db.categories.toArray();
  const settings = await db.settings.toArray();

  const data = {
    version: 1,
    exportDate: new Date().toISOString(),
    expenses,
    categories,
    settings
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `smart-expenses-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToCSV = async () => {
  const expenses = await db.expenses.orderBy('date').reverse().toArray();
  
  const headers = ['Date', 'Category', 'Description', 'Amount'];
  const rows = expenses.map(e => [
    format(new Date(e.date), 'yyyy-MM-dd'),
    e.category,
    `"${e.description.replace(/"/g, '""')}"`,
    e.amount
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importFromJSON = async (file: File, mode: 'merge' | 'replace'): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (!validateBackupData(data)) {
          throw new Error('Invalid backup file format');
        }

        if (mode === 'replace') {
          await db.expenses.clear();
          await db.categories.clear();
          await db.settings.clear();
        }

        // Dexie bulkAdd skips existing keys if we don't handle them
        // For mode replace, we cleared perfectly. 
        // For mode merge, we might want to handle duplicates, but for now simple bulkAdd
        
        // Convert ISO strings back to Date objects if needed
        const processedExpenses = data.expenses.map((exp: any) => ({
          ...exp,
          date: new Date(exp.date),
          id: mode === 'replace' ? exp.id : undefined // Let DB generate NEW IDs for merge
        }));

        await db.expenses.bulkAdd(processedExpenses);
        
        if (data.categories) {
          const processedCategories = data.categories.map((cat: any) => ({
            ...cat,
            id: mode === 'replace' ? cat.id : undefined
          }));
          
          if (mode === 'replace') {
             await db.categories.bulkAdd(processedCategories);
          } else {
            // For merge categories, typically we'd check names
            for (const cat of processedCategories) {
              const existing = await db.categories.where('name').equals(cat.name).first();
              if (!existing) {
                await db.categories.add(cat);
              }
            }
          }
        }

        if (data.settings) {
          await db.settings.bulkPut(data.settings);
        }

        resolve();
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsText(file);
  });
};
