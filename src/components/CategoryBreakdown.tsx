import { CategorySpending } from "@/types/transaction";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/transaction-utils";

interface CategoryBreakdownProps {
  data: CategorySpending[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-card p-3 border border-border/50">
        <p className="text-sm font-medium">{data.category}</p>
        <p className="text-sm font-mono text-muted-foreground">
          {formatCurrency(data.amount)} ({data.percentage.toFixed(1)}%)
        </p>
      </div>
    );
  }
  return null;
};

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const top6 = data.slice(0, 6);
  
  return (
    <div className="glass-card p-4 sm:p-6 animate-slide-up h-full" style={{ animationDelay: '300ms' }}>
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Gastos por Categoría</h3>
      
      <div className="flex flex-row lg:flex-col items-center gap-4 lg:gap-0">
        <div className="w-[140px] h-[140px] sm:w-[180px] sm:h-[180px] lg:w-[200px] lg:h-[200px] lg:mb-6 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={top6}
                cx="50%"
                cy="50%"
                innerRadius="45%"
                outerRadius="85%"
                paddingAngle={2}
                dataKey="amount"
              >
                {top6.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex-1 w-full space-y-2 sm:space-y-2.5">
          {top6.map((item, index) => (
            <div 
              key={item.category} 
              className="flex items-center gap-2 sm:gap-3 animate-fade-in"
              style={{ animationDelay: `${400 + index * 50}ms` }}
            >
              <div 
                className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs sm:text-sm flex-1 truncate">{item.category}</span>
              <span className="text-xs sm:text-sm font-mono text-muted-foreground whitespace-nowrap hidden sm:block">
                {formatCurrency(item.amount)}
              </span>
              <span className="text-xs font-mono text-muted-foreground w-8 sm:w-10 text-right">
                {item.percentage.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
