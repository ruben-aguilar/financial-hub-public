import { useState } from "react";
import { ChartData, TimeGranularity } from "@/types/transaction";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { formatCompactCurrency } from "@/lib/transaction-utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar, CalendarDays, CalendarRange } from "lucide-react";

interface SpendingChartProps {
  data: ChartData[];
  onGranularityChange: (granularity: TimeGranularity) => void;
  granularity: TimeGranularity;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border border-border/50">
        <p className="text-sm font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground capitalize">{entry.name}:</span>
            <span className="font-mono font-medium">
              {formatCompactCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const granularityOptions = [
  { value: 'day' as TimeGranularity, label: 'Día', icon: Calendar },
  { value: 'week' as TimeGranularity, label: 'Semana', icon: CalendarDays },
  { value: 'month' as TimeGranularity, label: 'Mes', icon: CalendarRange },
];

export function SpendingChart({ data, onGranularityChange, granularity }: SpendingChartProps) {
  return (
    <div className="glass-card p-4 sm:p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold">Resumen</h3>
        <ToggleGroup 
          type="single" 
          value={granularity} 
          onValueChange={(value) => value && onGranularityChange(value as TimeGranularity)}
          className="bg-muted/50 p-1 rounded-lg self-start sm:self-auto"
        >
          {granularityOptions.map((option) => (
            <ToggleGroupItem 
              key={option.value} 
              value={option.value}
              className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground px-2 sm:px-3 py-1 sm:py-1.5 text-xs"
            >
              <option.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">{option.label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className="h-[220px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 5, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="period" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              tickFormatter={(value) => formatCompactCurrency(value)}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              formatter={(value) => <span className="text-foreground capitalize text-xs sm:text-sm">{value === 'income' ? 'Ingresos' : 'Gastos'}</span>}
            />
            <Bar
              dataKey="income"
              name="income"
              fill="hsl(160 84% 45%)"
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="expenses"
              name="expenses"
              fill="hsl(0 72% 60%)"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
