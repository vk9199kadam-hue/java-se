import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { useExpenses } from './useExpenses';
import { useCategories } from './useCategories';
import { startOfMonth, endOfMonth, isWithinInterval, differenceInDays } from 'date-fns';

export const useBudget = () => {
  const { expenses } = useExpenses();
  const { categories } = useCategories();
  
  const settings = useLiveQuery(() => db.settings.toArray()) || [];
  const totalMonthlyBudget = settings.find(s => s.key === 'totalMonthlyBudget')?.value || 0;
  const alertThreshold = settings.find(s => s.key === 'alertThreshold')?.value || 90;

  const currentMonthExpenses = expenses.filter(e => 
    isWithinInterval(new Date(e.date), { 
      start: startOfMonth(new Date()), 
      end: endOfMonth(new Date()) 
    })
  );

  const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBudget = totalMonthlyBudget - totalSpent;

  const daysInMonthSoFar = differenceInDays(new Date(), startOfMonth(new Date())) + 1;
  const dailyAverage = totalSpent / daysInMonthSoFar;

  const categoryBreakdown = categories.map(cat => {
    const spent = currentMonthExpenses
      .filter(e => e.category === cat.name)
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      ...cat,
      spent,
      percentage: cat.budget > 0 ? (spent / cat.budget) * 100 : 0
    };
  });

  const getBudgetColor = (percentage: number) => {
    if (percentage < 70) return 'text-green-500 bg-green-500';
    if (percentage < 90) return 'text-yellow-500 bg-yellow-500';
    if (percentage < 100) return 'text-orange-500 bg-orange-500';
    return 'text-red-500 bg-red-500';
  };

  const updateSetting = async (key: string, value: any) => {
    return await db.settings.put({ key, value });
  };

  return {
    totalMonthlyBudget,
    alertThreshold,
    totalSpent,
    remainingBudget,
    dailyAverage,
    categoryBreakdown,
    getBudgetColor,
    updateSetting,
    settings
  };
};
