import { CATEGORIES } from "@/config/categories";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  selectedCategories: string[];
  onToggleCategory: (categoryId: string) => void;
  onClearAll: () => void;
}

export function CategoryFilter({ 
  selectedCategories, 
  onToggleCategory, 
  onClearAll 
}: CategoryFilterProps) {
  return (
    <div className="glass-card p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Categorías</h3>
        {selectedCategories.length > 0 && (
          <button 
            onClick={onClearAll}
            className="text-xs text-primary hover:text-primary/80 transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategories.includes(category.id);
          return (
            <button
              key={category.id}
              onClick={() => onToggleCategory(category.id)}
              className={cn(
                "category-badge flex items-center gap-1 sm:gap-1.5 cursor-pointer text-xs sm:text-sm py-1 px-2 sm:py-1.5 sm:px-2.5",
                isSelected 
                  ? "ring-2 ring-primary/50" 
                  : "opacity-70 hover:opacity-100"
              )}
              style={{ 
                backgroundColor: `${category.color}${isSelected ? '30' : '15'}`,
                color: category.color
              }}
            >
              <span className="text-sm sm:text-base">{category.icon}</span>
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
