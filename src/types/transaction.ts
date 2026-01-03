export interface Transaction {
  id: string;
  date: string;
  description: string;
  descriptionOverride?: string;
  amount: number;
  category: string;
  categoryOverride?: string;
  account: string;
  type: "income" | "expense";
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ChartData {
  period: string;
  income: number;
  expenses: number;
  net: number;
}

export type TimeGranularity = 'day' | 'week' | 'month';

// Keep MonthlyData as alias for backwards compatibility
export type MonthlyData = ChartData;

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}
