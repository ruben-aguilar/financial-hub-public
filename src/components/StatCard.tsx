import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'income' | 'expense';
  delay?: number;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  variant = 'default',
  delay = 0 
}: StatCardProps) {
  return (
    <div 
      className="stat-card animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-2 sm:mb-4">
        <div className={cn(
          "p-2 sm:p-3 rounded-lg sm:rounded-xl",
          variant === 'income' && "bg-income/10",
          variant === 'expense' && "bg-expense/10",
          variant === 'default' && "bg-primary/10"
        )}>
          <div className={cn(
            variant === 'income' && "text-income",
            variant === 'expense' && "text-expense",
            variant === 'default' && "text-primary"
          )}>
            {icon}
          </div>
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs sm:text-sm font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full",
            trend.isPositive 
              ? "bg-income/10 text-income" 
              : "bg-expense/10 text-expense"
          )}>
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value).toFixed(1)}%</span>
          </div>
        )}
      </div>
      
      <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">{title}</p>
      <p className={cn(
        "text-lg sm:text-2xl font-bold font-mono tracking-tight",
        variant === 'income' && "text-income",
        variant === 'expense' && "text-expense"
      )}>
        {value}
      </p>
      {subtitle && (
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">{subtitle}</p>
      )}
    </div>
  );
}
