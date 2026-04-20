import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Trash2, 
  Edit2, 
  Calendar,
  Plus
} from 'lucide-react';
import { useExpenses } from '../hooks/useExpenses';
import { useCategories } from '../hooks/useCategories';
import { format, isToday, isYesterday, isWithinInterval, startOfToday, startOfWeek, endOfWeek } from 'date-fns';
import { formatCurrency } from '../utils/validators';
import ExpenseForm from './ExpenseForm';
import { toast } from 'react-hot-toast';

const ExpenseList: React.FC = () => {
  const { expenses, bulkDeleteExpenses, deleteExpense } = useExpenses();
  const { categories } = useCategories();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchTerm, selectedCategory]);

  const groupedExpenses = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    const today = startOfToday();
    const thisWeek = { start: startOfWeek(today), end: endOfWeek(today) };

    filteredExpenses.forEach(exp => {
      const date = new Date(exp.date);
      let groupName = format(date, 'MMMM d, yyyy');
      
      if (isToday(date)) groupName = 'Today';
      else if (isYesterday(date)) groupName = 'Yesterday';
      else if (isWithinInterval(date, thisWeek)) groupName = 'This Week';

      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(exp);
    });

    return groups;
  }, [filteredExpenses]);

  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (confirm(`Delete ${selectedIds.length} items?`)) {
      await bulkDeleteExpenses(selectedIds);
      setSelectedIds([]);
      toast.success('Items deleted');
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Expenses</h2>
          <p className="text-slate-500">Manage and track your spending</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="btn-primary flex items-center gap-2 justify-center"
        >
          <Plus size={20} /> Add Expense
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search description or category..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="input-field min-w-[140px]"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          {selectedIds.length > 0 && (
            <button 
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-all flex items-center gap-2"
            >
              <Trash2 size={18} /> Delete ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedExpenses).length === 0 ? (
          <div className="glass-card p-12 text-center rounded-2xl">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-slate-400" size={40} />
            </div>
            <h3 className="text-lg font-bold">No expenses found</h3>
            <p className="text-slate-500">Try adjusting your filters or add a new expense.</p>
          </div>
        ) : (
          Object.entries(groupedExpenses).map(([group, items]) => (
            <div key={group} className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">{group}</h3>
              <div className="space-y-3">
                {items.map((exp) => (
                  <div 
                    key={exp.id} 
                    className={`
                      glass-card p-4 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.01] active:scale-[0.99]
                      ${selectedIds.includes(exp.id) ? 'ring-2 ring-primary-500 bg-primary-50/50 dark:bg-primary-900/10' : ''}
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(exp.id)}
                      onChange={() => handleToggleSelect(exp.id)}
                      className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold">{exp.description}</p>
                          <p className="text-xs font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full inline-block mt-1">
                            {exp.category}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{formatCurrency(exp.amount)}</p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {format(new Date(exp.date), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 border-l dark:border-slate-800 pl-3">
                      <button 
                        onClick={() => setEditingExpense(exp)}
                        className="p-2 text-slate-400 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteExpense(exp.id).then(() => toast.success('Deleted'))}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {isFormOpen && <ExpenseForm onClose={() => setIsFormOpen(false)} />}
      {editingExpense && <ExpenseForm editExpense={editingExpense} onClose={() => setEditingExpense(null)} />}
    </div>
  );
};

export default ExpenseList;
