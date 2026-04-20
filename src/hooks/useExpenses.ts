import { useLiveQuery } from 'dexie-react-hooks';
import { db, Expense } from '../db';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export const useExpenses = () => {
  const expenses = useLiveQuery(() => db.expenses.orderBy('date').reverse().toArray()) || [];

  const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    return await db.expenses.add({
      ...expense,
      createdAt: Date.now(),
    });
  };

  const updateExpense = async (id: number, updates: Partial<Expense>) => {
    return await db.expenses.update(id, updates);
  };

  const deleteExpense = async (id: number) => {
    return await db.expenses.delete(id);
  };

  const bulkDeleteExpenses = async (ids: number[]) => {
    return await db.expenses.bulkDelete(ids);
  };

  const getExpensesForMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return expenses.filter(e => isWithinInterval(new Date(e.date), { start, end }));
  };

  return {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    bulkDeleteExpenses,
    getExpensesForMonth,
  };
};
