import { useState } from "react";
import { format, subMonths, subYears, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { useIsMobile } from "@/hooks/use-mobile";

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onRangeChange: (start: Date, end: Date) => void;
}

const presets = [
  { label: 'Este mes', getRange: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }) },
  { label: 'Mes anterior', getRange: () => ({ start: startOfMonth(subMonths(new Date(), 1)), end: endOfMonth(subMonths(new Date(), 1)) }) },
  { label: 'Últimos 3 meses', getRange: () => ({ start: startOfMonth(subMonths(new Date(), 2)), end: endOfMonth(new Date()) }) },
  { label: 'Este año', getRange: () => ({ start: startOfYear(new Date()), end: endOfYear(new Date()) }) },
  { label: 'Último año', getRange: () => ({ start: subYears(new Date(), 1), end: new Date() }) },
  { label: 'Todo', getRange: () => ({ start: new Date(2021, 0, 1), end: new Date() }) },
];

export function DateRangePicker({ startDate, endDate, onRangeChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customRange, setCustomRange] = useState<DateRange | undefined>({
    from: startDate,
    to: endDate
  });
  const isMobile = useIsMobile();

  const handlePresetClick = (preset: typeof presets[0]) => {
    const { start, end } = preset.getRange();
    onRangeChange(start, end);
    setOpen(false);
    setShowCustom(false);
  };

  const handleCustomClick = () => {
    setShowCustom(true);
    setCustomRange({ from: startDate, to: endDate });
  };

  const handleCustomApply = () => {
    if (customRange?.from && customRange?.to) {
      onRangeChange(customRange.from, customRange.to);
      setOpen(false);
      setShowCustom(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setShowCustom(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-1.5 sm:gap-2 bg-secondary/50 border-border/50 text-xs sm:text-sm px-2 sm:px-4">
          <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="font-mono">
            <span className="hidden sm:inline">{format(startDate, 'd MMM yyyy', { locale: es })} - {format(endDate, 'd MMM yyyy', { locale: es })}</span>
            <span className="sm:hidden">{format(startDate, 'd MMM', { locale: es })} - {format(endDate, 'd MMM', { locale: es })}</span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "p-2 bg-popover border-border max-h-[85vh] overflow-y-auto",
          showCustom ? "w-auto" : "w-56"
        )} 
        align="end"
      >
        {showCustom ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowCustom(false)}
                className="h-8 px-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">Seleccionar rango</span>
            </div>
            <Calendar
              mode="range"
              selected={customRange}
              onSelect={setCustomRange}
              numberOfMonths={isMobile ? 1 : 2}
              locale={es}
              className="pointer-events-auto"
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-border sticky bottom-0 bg-popover pb-1">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowCustom(false)}
              >
                Cancelar
              </Button>
              <Button 
                size="sm"
                onClick={handleCustomApply}
                disabled={!customRange?.from || !customRange?.to}
              >
                Aplicar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetClick(preset)}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                  "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {preset.label}
              </button>
            ))}
            <div className="border-t border-border my-1" />
            <button
              onClick={handleCustomClick}
              className={cn(
                "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                "hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
              )}
            >
              <CalendarIcon className="h-4 w-4" />
              Personalizado
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
