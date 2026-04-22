'use client';
import { CATEGORIES } from '@/lib/sources';

interface Props {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryFilter({ activeCategory, onCategoryChange }: Props) {
  const allCategories = ['全部', ...Object.keys(CATEGORIES)];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {allCategories.map((category, idx) => {
        const catConfig = (CATEGORIES as any)[category];
        const isActive = activeCategory === category;
        
        return (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-md)] text-xs font-medium whitespace-nowrap transition-all ${
              isActive
                ? 'bg-[var(--color-primary-500)] text-white shadow-lg shadow-[var(--color-primary-500)]/20'
                : 'bg-[var(--color-bg-surface)]/60 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]'
            }`}
          >
            {catConfig && <span>{catConfig.icon}</span>}
            <span>{category}</span>
          </button>
        );
      })}
    </div>
  );
}
