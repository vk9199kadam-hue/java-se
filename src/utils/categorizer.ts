import type { Category } from '../db';

/**
 * Auto-categorize an expense based on its description using keyword matching.
 */
export const autoCategorize = (description: string, categories: Category[]): string => {
  if (!description) return 'Other';

  const normalizedDescription = description.toLowerCase();

  for (const category of categories) {
    if (category.name === 'Other') continue;

    for (const keyword of category.keywords) {
      try {
        const regex = new RegExp(keyword, 'i');
        if (regex.test(normalizedDescription)) {
          return category.name;
        }
      } catch (e) {
        // Fallback to simple string include if regex is invalid
        if (normalizedDescription.includes(keyword.toLowerCase())) {
          return category.name;
        }
      }
    }
  }

  return 'Other';
};
