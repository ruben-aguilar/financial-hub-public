import { Transaction, ChartData, CategorySpending, TimeGranularity } from "@/types/transaction";
import { getCategoryColor, CATEGORIES } from "@/config/categories";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, startOfWeek, endOfWeek } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Get the effective category for a transaction
 * Returns categoryOverride if defined, otherwise returns category
 */
export function getEffectiveCategory(transaction: Transaction): string {
  return transaction.categoryOverride || transaction.category;
}

/**
 * Get the effective description for a transaction
 * Returns descriptionOverride if defined, otherwise returns description
 */
export function getEffectiveDescription(transaction: Transaction): string {
  return transaction.descriptionOverride || transaction.description;
}

export const filterTransactionsByDateRange = (
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): Transaction[] => {
  return transactions.filter(t => {
    const date = parseISO(t.date);
    return isWithinInterval(date, { start: startDate, end: endDate });
  });
};

export const filterTransactionsByCategory = (
  transactions: Transaction[],
  categoryIds: string[]
): Transaction[] => {
  if (categoryIds.length === 0) return transactions;
  return transactions.filter(t => categoryIds.includes(getEffectiveCategory(t)));
};

export const filterTransactionsByType = (
  transactions: Transaction[],
  type: 'all' | 'income' | 'expense'
): Transaction[] => {
  if (type === 'all') return transactions;
  return transactions.filter(t => t.type === type);
};

export const searchTransactions = (
  transactions: Transaction[],
  query: string
): Transaction[] => {
  if (!query.trim()) return transactions;
  const lowerQuery = query.toLowerCase();
  return transactions.filter(t => {
    const effectiveDescription = getEffectiveDescription(t);
    return (
      effectiveDescription.toLowerCase().includes(lowerQuery) ||
      getEffectiveCategory(t).toLowerCase().includes(lowerQuery)
    );
  });
};

export const calculateTotals = (transactions: Transaction[]) => {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return {
    income,
    expenses,
    net: income - expenses,
    transactionCount: transactions.length
  };
};

export const getChartData = (
  transactions: Transaction[],
  granularity: TimeGranularity
): ChartData[] => {
  const dataMap = new Map<string, { income: number; expenses: number }>();
  
  transactions.forEach(t => {
    const date = parseISO(t.date);
    let key: string;
    
    switch (granularity) {
      case 'day':
        key = format(date, 'yyyy-MM-dd');
        break;
      case 'week':
        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
        key = format(weekStart, 'yyyy-MM-dd');
        break;
      case 'month':
      default:
        key = format(date, 'yyyy-MM');
        break;
    }
    
    const existing = dataMap.get(key) || { income: 0, expenses: 0 };
    
    if (t.type === 'income') {
      existing.income += t.amount;
    } else {
      existing.expenses += t.amount;
    }
    
    dataMap.set(key, existing);
  });
  
  return Array.from(dataMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, data]) => {
      let period: string;
      
      switch (granularity) {
        case 'day':
          period = format(parseISO(key), 'd MMM', { locale: es });
          break;
        case 'week':
          const weekStart = parseISO(key);
          const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
          period = `${format(weekStart, 'd', { locale: es })}-${format(weekEnd, 'd MMM', { locale: es })}`;
          break;
        case 'month':
        default:
          period = format(parseISO(`${key}-01`), 'MMM yyyy', { locale: es });
          break;
      }
      
      return {
        period,
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses
      };
    });
};

// Keep for backwards compatibility
export const getMonthlyData = (transactions: Transaction[]): ChartData[] => {
  return getChartData(transactions, 'month');
};

export const getCategorySpending = (transactions: Transaction[]): CategorySpending[] => {
  const categoryMap = new Map<string, number>();
  
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const effectiveCategory = getEffectiveCategory(t);
      const existing = categoryMap.get(effectiveCategory) || 0;
      categoryMap.set(effectiveCategory, existing + t.amount);
    });
  
  const totalExpenses = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);
  
  return Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category: CATEGORIES.find(c => c.id === category)?.name || category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      color: getCategoryColor(category)
    }))
    .sort((a, b) => b.amount - a.amount);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatCompactCurrency = (amount: number): string => {
  if (amount >= 1000) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      notation: 'compact',
      minimumFractionDigits: 1
    }).format(amount);
  }
  return formatCurrency(amount);
};
