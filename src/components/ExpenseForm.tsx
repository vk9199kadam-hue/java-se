import React, { useState, useEffect } from 'react';
import { X, Plus, Sparkles, AlertTriangle } from 'lucide-react';
import { useExpenses } from '../hooks/useExpenses';
import { useCategories } from '../hooks/useCategories';
import { autoCategorize } from '../utils/categorizer';
import type { Expense } from '../db';
import { format, isAfter, startOfToday } from 'date-fns';
import { toast } from 'react-hot-toast';

interface ExpenseFormProps {
  onClose: () => void;
  editExpense?: Expense;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onClose, editExpense }) => {
  const { addExpense, updateExpense } = useExpenses();
  const { categories } = useCategories();

  const [formData, setFormData] = useState({
    amount: editExpense?.amount?.toString() || '',
    description: editExpense?.description || '',
    category: editExpense?.category || 'Other',
    date: editExpense ? format(new Date(editExpense.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
  });

  const [isAutoSuggesting, setIsAutoSuggesting] = useState(false);

  // Auto-categorize as user types description
  useEffect(() => {
    if (!editExpense && formData.description.length > 2) {
      const suggested = autoCategorize(formData.description, categories);
      if (suggested !== formData.category) {
        setIsAutoSuggesting(true);
        setFormData(prev => ({ ...prev, category: suggested }));
        // Reset suggesting indicator after a brief moment
        setTimeout(() => setIsAutoSuggesting(false), 2000);
      }
    }
  }, [formData.description, categories, editExpense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    const payload = {
      amount,
      description: formData.description.trim(),
      category: formData.category,
      date: new Date(formData.date),
    };

    try {
      if (editExpense?.id) {
        await updateExpense(editExpense.id, payload);
        toast.success('Expense updated successfully');
      } else {
        await addExpense(payload);
        toast.success('Expense added successfully');
      }
      onClose();
    } catch (err) {
      toast.error('Failed to save expense');
    }
  };

  const isFutureDate = isAfter(new Date(formData.date), startOfToday());

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass-card w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            {editExpense ? 'Edit Expense' : 'Add New Expense'}
            {!editExpense && <Plus size={20} className="text-primary-600" />}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-auto scrollbar-hide">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-500">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
              <input
                type="number"
                step="0.01"
                required
                autoFocus
                placeholder="0.00"
                className="input-field pl-8 text-xl font-bold"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-500">Description</label>
            <input
              type="text"
              required
              placeholder="What did you buy?"
              className="input-field"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-500">Category</label>
              {isAutoSuggesting && (
                <span className="text-[10px] uppercase tracking-wider font-bold text-primary-500 flex items-center gap-1 animate-pulse">
                  <Sparkles size={10} /> Auto-suggested
                </span>
              )}
            </div>
            <select
              className="input-field"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-500">Date</label>
            <input
              type="date"
              className="input-field"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            />
            {isFutureDate && (
              <p className="text-xs text-amber-500 flex items-center gap-1 font-medium">
                <AlertTriangle size={12} /> Note: This is a future date
              </p>
            )}
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1 shadow-lg shadow-primary-600/20">
              {editExpense ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
