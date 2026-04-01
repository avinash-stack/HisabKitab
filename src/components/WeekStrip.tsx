import { useState, useMemo } from "react";
import { format, addDays, subDays, startOfWeek, isSameDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeekStripProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export default function WeekStrip({ selectedDate, onSelect }: WeekStripProps) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(selectedDate, { weekStartsOn: 1 }));

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const currentMonth = format(days[3], "MMMM yyyy");

  return (
    <div className="bg-secondary/60 rounded-2xl p-4">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setWeekStart(subDays(weekStart, 7))}
          className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold">{currentMonth}</span>
        <button
          onClick={() => setWeekStart(addDays(weekStart, 7))}
          className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_LABELS.map((label, i) => (
          <div key={i} className="text-center text-[10px] font-medium text-muted-foreground uppercase">
            {label}
          </div>
        ))}
      </div>

      {/* Day Numbers */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelect(day)}
              className={`h-10 rounded-xl text-sm font-medium transition-all duration-200
                ${isSelected
                  ? "gradient-primary text-white shadow-md scale-105"
                  : isToday
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-secondary text-foreground"
                }`}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
