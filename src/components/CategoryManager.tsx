import React, { useState } from 'react';
import { 
  Plus, 
  Settings2, 
  Tag as TagIcon, 
  DollarSign, 
  Trash2, 
  Check, 
  X,
  Palette
} from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { useBudget } from '../hooks/useBudget';
import { formatCurrency } from '../utils/validators';
import { toast } from 'react-hot-toast';

const CategoryManager: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const { updateSetting, totalMonthlyBudget } = useBudget();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newTotalBudget, setNewTotalBudget] = useState(totalMonthlyBudget.toString());

  const handleUpdateTotalBudget = async () => {
    const val = parseFloat(newTotalBudget);
    if (!isNaN(val) && val >= 0) {
      await updateSetting('totalMonthlyBudget', val);
      toast.success('Total budget updated');
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold">Category Settings</h2>
        <p className="text-slate-500">Configure budgets and auto-categorization keywords</p>
      </div>

      <div className="glass-card p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold">Total Monthly Budget</h3>
          <p className="text-sm text-slate-500">Set your overall spending limit for the month</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="number"
              className="input-field pl-9"
              value={newTotalBudget}
              onChange={(e) => setNewTotalBudget(e.target.value)}
            />
          </div>
          <button onClick={handleUpdateTotalBudget} className="btn-primary">Update</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <CategoryCard 
            key={cat.id} 
            category={cat} 
            onUpdate={updateCategory}
            onDelete={deleteCategory}
          />
        ))}
        <button 
          onClick={() => setIsAdding(true)}
          className="h-full min-h-[200px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-primary-500 hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all group"
        >
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-all">
            <Plus size={32} />
          </div>
          <span className="font-bold">Add New Category</span>
        </button>
      </div>

      {isAdding && (
         <AddCategoryModal 
          onClose={() => setIsAdding(false)} 
          onAdd={(cat) => addCategory(cat).then(() => { toast.success('Category added'); setIsAdding(false); })}
        />
      )}
    </div>
  );
};

const CategoryCard = ({ category, onUpdate, onDelete }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: category.name,
    budget: category.budget.toString(),
    keywords: category.keywords.join(', '),
    color: category.color
  });

  const handleSave = async () => {
    await onUpdate(category.id, {
      name: editData.name,
      budget: parseFloat(editData.budget) || 0,
      keywords: editData.keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k),
      color: editData.color
    });
    setIsEditing(false);
    toast.success('Changes saved');
  };

  if (isEditing) {
    return (
      <div className="glass-card p-6 rounded-2xl space-y-4 border-2 border-primary-500/50">
        <input 
          className="input-field text-lg font-bold" 
          value={editData.name} 
          disabled={category.name === 'Other'}
          onChange={(e) => setEditData({...editData, name: e.target.value})}
        />
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Budget</label>
            <input 
              type="number" 
              className="input-field" 
              value={editData.budget} 
              onChange={(e) => setEditData({...editData, budget: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Color</label>
            <input 
              type="color" 
              className="h-10 w-full rounded-lg cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1" 
              value={editData.color} 
              onChange={(e) => setEditData({...editData, color: e.target.value})}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400">Keywords (comma separated)</label>
          <textarea 
            className="input-field h-20 text-xs" 
            value={editData.keywords} 
            onChange={(e) => setEditData({...editData, keywords: e.target.value})}
          />
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} className="btn-primary flex-1 py-1 text-sm">Save</button>
          <button onClick={() => setIsEditing(false)} className="btn-secondary flex-1 py-1 text-sm text-rose-500">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-2xl space-y-4 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: category.color }} />
      <div className="flex justify-between items-start">
        <h4 className="text-xl font-bold">{category.name}</h4>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setIsEditing(true)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary-500">
            <Settings2 size={16} />
          </button>
          {category.name !== 'Other' && (
            <button onClick={() => confirm('Delete category?') && onDelete(category.id).then(() => toast.success('Deleted'))} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-500">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-slate-500">
          <DollarSign size={14} className="text-primary-500" />
          <span className="text-sm font-medium">Budget: {formatCurrency(category.budget)}</span>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <TagIcon size={10} /> Keywords
          </span>
          <div className="flex flex-wrap gap-1">
            {category.keywords.length > 0 ? category.keywords.slice(0, 5).map((k: string, i: number) => (
              <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold">
                {k}
              </span>
            )) : <span className="text-[10px] text-slate-400 italic">No keywords</span>}
            {category.keywords.length > 5 && <span className="text-[10px] text-slate-400">+{category.keywords.length - 5} more</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

const AddCategoryModal = ({ onClose, onAdd }: any) => {
  const [data, setData] = useState({
    name: '',
    budget: '',
    keywords: '',
    color: '#0ea5e9'
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md rounded-2xl p-6 space-y-6">
        <h3 className="text-xl font-bold">Create Category</h3>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Name</label>
            <input className="input-field" placeholder="e.g. Subscriptions" value={data.name} onChange={e => setData({...data, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Budget</label>
              <input type="number" className="input-field" placeholder="0.00" value={data.budget} onChange={e => setData({...data, budget: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Color</label>
              <input type="color" className="h-10 w-full rounded-lg cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1" value={data.color} onChange={e => setData({...data, color: e.target.value})} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Keywords (comma separated)</label>
            <textarea className="input-field h-20 text-xs" placeholder="netflix, spotify, youtube..." value={data.keywords} onChange={e => setData({...data, keywords: e.target.value})} />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button 
            disabled={!data.name}
            onClick={() => onAdd({
              name: data.name,
              budget: parseFloat(data.budget) || 0,
              keywords: data.keywords.split(',').map(k => k.trim()).filter(k => k),
              color: data.color
            })} 
            className="btn-primary flex-1"
          >
            Create Category
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
