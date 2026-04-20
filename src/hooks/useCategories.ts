import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Category } from '../db';

export const useCategories = () => {
  const categories = useLiveQuery(() => db.categories.toArray()) || [];

  const addCategory = async (category: Omit<Category, 'id'>) => {
    return await db.categories.add(category);
  };

  const updateCategory = async (id: number, updates: Partial<Category>) => {
    return await db.categories.update(id, updates);
  };

  const deleteCategory = async (id: number) => {
    return await db.categories.delete(id);
  };

  return {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
  };
};
