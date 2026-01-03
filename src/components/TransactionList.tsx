import { Transaction } from "@/types/transaction";
import { getCategoryById } from "@/config/categories";
import { formatCurrency, getEffectiveCategory, getEffectiveDescription } from "@/lib/transaction-utils";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="glass-card p-6 sm:p-8 text-center">
        <p className="text-muted-foreground text-sm sm:text-base">No se encontraron transacciones</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile view - cards */}
      <div className="sm:hidden space-y-3">
        {transactions.map((transaction, index) => {
          const effectiveCategory = getEffectiveCategory(transaction);
          const effectiveDescription = getEffectiveDescription(transaction);
          const category = getCategoryById(effectiveCategory);
          return (
            <div 
              key={transaction.id}
              className="glass-card p-3 animate-fade-in"
              style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{effectiveDescription}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {format(parseISO(transaction.date), 'd MMM yyyy', { locale: es })}
                  </p>
                </div>
                <span className={cn(
                  "font-mono font-semibold text-sm whitespace-nowrap",
                  transaction.type === 'income' ? "text-income" : "text-expense"
                )}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
              <span 
                className="category-badge inline-flex items-center gap-1 text-xs"
                style={{ 
                  backgroundColor: `${category?.color}15`,
                  color: category?.color
                }}
              >
                <span>{category?.icon}</span>
                <span>{category?.name}</span>
              </span>
            </div>
          );
        })}
      </div>

      {/* Desktop view - table */}
      <div className="glass-card overflow-hidden hidden sm:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Fecha</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Descripción</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Categoría</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Importe</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => {
                const effectiveCategory = getEffectiveCategory(transaction);
                const effectiveDescription = getEffectiveDescription(transaction);
                const category = getCategoryById(effectiveCategory);
                return (
                  <tr 
                    key={transaction.id}
                    className="border-b border-border/30 hover:bg-accent/30 transition-colors animate-fade-in"
                    style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
                  >
                    <td className="p-4">
                      <span className="font-mono text-sm text-muted-foreground">
                        {format(parseISO(transaction.date), 'd MMM yyyy', { locale: es })}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium">{effectiveDescription}</span>
                    </td>
                    <td className="p-4">
                      <span 
                        className="category-badge inline-flex items-center gap-1.5"
                        style={{ 
                          backgroundColor: `${category?.color}15`,
                          color: category?.color
                        }}
                      >
                        <span>{category?.icon}</span>
                        <span>{category?.name}</span>
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className={cn(
                        "font-mono font-semibold",
                        transaction.type === 'income' ? "text-income" : "text-expense"
                      )}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
