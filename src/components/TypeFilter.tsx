import { cn } from "@/lib/utils";

interface TypeFilterProps {
  value: 'all' | 'income' | 'expense';
  onChange: (value: 'all' | 'income' | 'expense') => void;
}

export function TypeFilter({ value, onChange }: TypeFilterProps) {
  const options = [
    { id: 'all' as const, label: 'Todos' },
    { id: 'income' as const, label: 'Ingresos' },
    { id: 'expense' as const, label: 'Gastos' },
  ];

  return (
    <div className="inline-flex items-center bg-secondary/50 rounded-lg p-1">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
            value === option.id
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
