import { useState, useMemo } from "react";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  ArrowUpDown
} from "lucide-react";
import { TRANSACTIONS } from "@/config/transactions";
import { TimeGranularity } from "@/types/transaction";
import { 
  filterTransactionsByDateRange,
  filterTransactionsByCategory,
  filterTransactionsByType,
  searchTransactions,
  calculateTotals,
  getChartData,
  getCategorySpending,
  formatCurrency
} from "@/lib/transaction-utils";
import { StatCard } from "./StatCard";
import { TransactionList } from "./TransactionList";
import { CategoryFilter } from "./CategoryFilter";
import { SpendingChart } from "./SpendingChart";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { SearchBar } from "./SearchBar";
import { TypeFilter } from "./TypeFilter";
import { DateRangePicker } from "./DateRangePicker";
import { startOfMonth, endOfMonth } from "date-fns";

export function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [transactionType, setTransactionType] = useState<'all' | 'income' | 'expense'>('all');
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  });
  const [chartGranularity, setChartGranularity] = useState<TimeGranularity>('month');

  const filteredTransactions = useMemo(() => {
    let result = TRANSACTIONS;
    result = filterTransactionsByDateRange(result, dateRange.start, dateRange.end);
    result = filterTransactionsByCategory(result, selectedCategories);
    result = filterTransactionsByType(result, transactionType);
    result = searchTransactions(result, searchQuery);
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [dateRange, selectedCategories, transactionType, searchQuery]);

  const totalNetWorth = useMemo(() => calculateTotals(TRANSACTIONS).net, []);
  const totals = useMemo(() => calculateTotals(filteredTransactions), [filteredTransactions]);
  const chartData = useMemo(() => getChartData(filteredTransactions, chartGranularity), [filteredTransactions, chartGranularity]);
  const categorySpending = useMemo(() => getCategorySpending(filteredTransactions), [filteredTransactions]);

  const handleToggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg sm:rounded-xl">
                <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold">Panel de Finanzas</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Gestiona tus transacciones</p>
              </div>
            </div>
            <DateRangePicker 
              startDate={dateRange.start}
              endDate={dateRange.end}
              onRangeChange={(start, end) => setDateRange({ start, end })}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard
            title="Patrimonio Neto"
            value={formatCurrency(totalNetWorth)}
            subtitle="Balance total histórico"
            icon={<Wallet className="h-4 w-4 sm:h-5 sm:w-5" />}
            variant={totalNetWorth >= 0 ? 'income' : 'expense'}
            delay={0}
          />
          <StatCard
            title="Ingresos"
            value={formatCurrency(totals.income)}
            subtitle={`${filteredTransactions.filter(t => t.type === 'income').length} transacciones`}
            icon={<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />}
            variant="income"
            delay={100}
          />
          <StatCard
            title="Gastos"
            value={formatCurrency(totals.expenses)}
            subtitle={`${filteredTransactions.filter(t => t.type === 'expense').length} transacciones`}
            icon={<TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />}
            variant="expense"
            delay={200}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="lg:col-span-3">
            <SpendingChart 
              data={chartData} 
              granularity={chartGranularity}
              onGranularityChange={setChartGranularity}
            />
          </div>
          <div className="lg:col-span-2">
            <CategoryBreakdown data={categorySpending} />
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          <CategoryFilter 
            selectedCategories={selectedCategories}
            onToggleCategory={handleToggleCategory}
            onClearAll={() => setSelectedCategories([])}
          />
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
            <TypeFilter value={transactionType} onChange={setTransactionType} />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5 text-muted-foreground" />
              Transacciones Recientes
            </h2>
            <span className="text-sm text-muted-foreground">
              Mostrando {filteredTransactions.length} transacciones
            </span>
          </div>
          <TransactionList transactions={filteredTransactions} />
        </div>
      </main>
    </div>
  );
}
