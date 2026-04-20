
export const validateBackupData = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  if (data.version === undefined) return false;
  
  if (!Array.isArray(data.expenses) || !Array.isArray(data.categories)) return false;

  // Basic check for one expense entry if exists
  if (data.expenses.length > 0) {
    const exp = data.expenses[0];
    if (typeof exp.amount !== 'number' || !exp.category || !exp.date) return false;
  }

  return true;
};

export const formatCurrency = (amount: number, locale: string = 'en-US', currency: string = 'USD') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};
